from flask import Flask, request, jsonify
from dotenv import load_dotenv
from google import genai
import os

load_dotenv()

app = Flask(__name__)

# Gemini client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


@app.route("/")
def home():
    return "CareGuide AI Backend is Running!"


@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.get_json()

    symptoms = data.get("symptoms", "").strip()

    if not symptoms:
        return jsonify({
            "error": "Please enter symptoms"
        }), 400

    prompt = f"""
You are CareGuide AI, a hospital department navigation assistant.

The user has entered these symptoms:
{symptoms}

Your job is NOT to diagnose the disease.

Instead:
1. Recommend the most appropriate hospital department.
2. Give a simple urgency level: Routine, Moderate, or Emergency.
3. Give 2 or 3 simple reasons based on the symptoms.
4. Give a basic recommendation for what the user should do next.

Return ONLY valid JSON in this format:

{{
    "department": "ENT",
    "urgency": "Moderate",
    "reasons": [
        "Reason 1",
        "Reason 2"
    ],
    "recommendation": "Consider consulting the recommended department.",
    "disclaimer": "This tool provides department guidance, not a medical diagnosis."
}}

Do not provide a medical diagnosis.
"""

    try:
        response = client.models.generate_content(
            model="gemini-3.5-flash-lite",
            contents=prompt
        )

        return jsonify({
            "result": response.text
        })

    except Exception as e:
        return jsonify({
            "error": "AI service error",
            "details": str(e)
        }), 500


if __name__ == "__main__":
    app.run(debug=True)