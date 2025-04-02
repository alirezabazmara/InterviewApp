import sys
import json
import os
from dotenv import load_dotenv
from openai import OpenAI

# ✅ **لود متغیرهای محیطی**
load_dotenv()
openai = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# ✅ **بررسی آرگومان‌های ورودی**
if len(sys.argv) < 3:
    print("❌ Usage: python analyze.py '<question>' '<response>'")
    sys.exit(1)

question = sys.argv[1]
response = sys.argv[2]

# ✅ **درخواست ارزیابی از GPT-4-Turbo**
try:
    analysis = openai.chat.completions.create(
        model="gpt-4-turbo",
        messages=[
            {"role": "system", "content": "Evaluate the correctness of the answer and provide a reason."},
            {"role": "user", "content": f"Question: {question}\nAnswer: {response}\n\nResponse Format:\nScore: (0-1)\nReason: (Brief explanation)"},
        ],
        max_tokens=100
    )

    response_text = analysis.choices[0].message.content.strip()
    print(response_text)  # ✅ چاپ خروجی برای بررسی لاگ

except Exception as e:
    print(f"❌ Error analyzing response: {str(e)}")
    sys.exit(1)
