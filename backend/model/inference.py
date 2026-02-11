# backend/model/inference.py

import os
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

# -----------------------------
# LOCAL MODEL PATH (IMPORTANT)
# -----------------------------
BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, "qwen-interview-merged")

_tokenizer = None
_model = None

def load_model():
    """
    Lazy-load the model so FastAPI doesn't crash on startup.
    """
    global _tokenizer, _model

    if _model is None or _tokenizer is None:
        print("🔄 Loading Qwen interview model from local path...")

        _tokenizer = AutoTokenizer.from_pretrained(
            MODEL_PATH,
            trust_remote_code=True
        )

        _model = AutoModelForCausalLM.from_pretrained(
            MODEL_PATH,
            torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
            device_map="auto",
            trust_remote_code=True
        )

        _model.eval()
        print("✅ Qwen model loaded successfully")

def _generate(prompt: str, max_new_tokens=200) -> str:
    load_model()

    inputs = _tokenizer(prompt, return_tensors="pt").to(_model.device)

    with torch.no_grad():
        outputs = _model.generate(
            **inputs,
            max_new_tokens=max_new_tokens,
            do_sample=True,              # ✅ REQUIRED
            temperature=0.3,
            top_p=0.9,
            eos_token_id=_tokenizer.eos_token_id
        )

    full_text = _tokenizer.decode(outputs[0], skip_special_tokens=True)

    # Remove prompt from output
    if full_text.startswith(prompt):
        return full_text[len(prompt):].strip()

    return full_text.strip()

# -----------------------------
# PUBLIC FUNCTIONS
# -----------------------------
def generate_correct_answer(question: str) -> str:
    prompt = f"""
You are an expert technical interviewer.

Give a clear, correct, interview-quality answer.

Question:
{question}
"""
    return _generate(prompt, max_new_tokens=200)

def generate_feedback(question: str, user_answer: str, missed_concepts: list) -> str:
    prompt = f"""
You are an expert interviewer.

Question:
{question}

User answer:
{user_answer}

Missing concepts:
{', '.join(missed_concepts)}

Explain clearly what the user missed and how to improve.
"""
    return _generate(prompt, max_new_tokens=150)