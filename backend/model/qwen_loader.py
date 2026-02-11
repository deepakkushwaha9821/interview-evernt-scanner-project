# # import torch
# import os
# from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
# from peft import PeftModel
# import torch

# # -------------------------------
# # Paths
# # -------------------------------
# BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# ADAPTER_PATH = os.path.abspath(
#     os.path.join(BASE_DIR, "..", "..", "qwen-interview-evaluator")
# )

# BASE_MODEL_NAME = "Qwen/Qwen2.5-1.5B-Instruct"

# # -------------------------------
# # Load tokenizer (from BASE model)
# # -------------------------------
# tokenizer = AutoTokenizer.from_pretrained(
#     BASE_MODEL_NAME,
#     trust_remote_code=True
# )

# # -------------------------------
# # Load BASE model
# # -------------------------------
# base_model = AutoModelForCausalLM.from_pretrained(
#     BASE_MODEL_NAME,
#     trust_remote_code=True,
#     device_map="auto",
#     torch_dtype=torch.float16
# )

# # -------------------------------
# # Load LoRA adapter on top
# # -------------------------------
# model = PeftModel.from_pretrained(
#     base_model,
#     ADAPTER_PATH
# )

# model.eval()

# # -------------------------------
# # Pipeline
# # -------------------------------
# pipe = pipeline(
#     "text-generation",
#     model=model,
#     tokenizer=tokenizer,
#     max_new_tokens=200,
#     temperature=0.2
# )

import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline

# 🔥 USE MERGED MODEL PATH
MODEL_PATH = "./model/qwen-interview-merged"

tokenizer = AutoTokenizer.from_pretrained(
    MODEL_PATH,
    trust_remote_code=True
)

model = AutoModelForCausalLM.from_pretrained(
    MODEL_PATH,
    trust_remote_code=True,
    torch_dtype=torch.float16,
    device_map="auto"
)

pipe = pipeline(
    "text-generation",
    model=model,
    tokenizer=tokenizer,
    max_new_tokens=200,
    temperature=0.2
)
