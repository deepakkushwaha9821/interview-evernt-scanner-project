# import torch
# from transformers import AutoTokenizer, AutoModelForCausalLM
# from peft import PeftModel

# BASE_MODEL = "Qwen/Qwen2.5-1.5B-Instruct"
# LORA_PATH = "./backend/model/qwen-interview-evaluator"
# MERGED_PATH = "./backend/model/qwen-interview-merged"

# tokenizer = AutoTokenizer.from_pretrained(
#     BASE_MODEL,
#     trust_remote_code=True
# )

# base_model = AutoModelForCausalLM.from_pretrained(
#     BASE_MODEL,
#     trust_remote_code=True,
#     torch_dtype=torch.float16,
#     device_map="auto"
# )

# model = PeftModel.from_pretrained(base_model, LORA_PATH)

# # 🔥 THIS LINE IS THE KEY
# model = model.merge_and_unload()

# model.save_pretrained(MERGED_PATH)
# tokenizer.save_pretrained(MERGED_PATH)

# print("✅ LoRA merged successfully")
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel

BASE_MODEL = "Qwen/Qwen2.5-1.5B-Instruct"
LORA_PATH = "./model/qwen-interview-evaluator"
MERGED_PATH = "./model/qwen-interview-merged"

# Load base model on CPU (safe for merge)
base_model = AutoModelForCausalLM.from_pretrained(
    BASE_MODEL,
    trust_remote_code=True,
    torch_dtype=torch.float16,
    device_map="cpu"
)

# Load tokenizer
tokenizer = AutoTokenizer.from_pretrained(
    BASE_MODEL,
    trust_remote_code=True
)

# Load LoRA adapter (THIS is your trained adapter)
model = PeftModel.from_pretrained(
    base_model,
    LORA_PATH
)

# 🔥 Merge LoRA weights into base model
model = model.merge_and_unload()

# Save merged model
model.save_pretrained(MERGED_PATH)
tokenizer.save_pretrained(MERGED_PATH)

print("✅ LoRA merged successfully!")
print(f"📦 Merged model saved at: {MERGED_PATH}")
