from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
import json
import re
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app, origins=[
    "https://career-path-d5fd0.web.app",
    "https://career-path-d5fd0.firebaseapp.com"
])

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

def parse_career_recommendations(response_text):
    try:
        # First try to find pure JSON output
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group(0))
        
        # Fallback parsing if JSON not found
        recommendations = []
        major_blocks = re.split(r'\n\n|\n-', response_text)
        
        for block in major_blocks:
            if not block.strip():
                continue
                
            major_match = re.search(r'Major:\s*(.+)', block)
            score_match = re.search(r'Match Score:\s*(\d+)%', block)
            desc_match = re.search(r'Description:\s*(.+)', block)
            why_match = re.search(r'Why Match:\s*(.+)', block)
            careers_match = re.findall(r'-\s*(.+)', re.search(r'Careers:(.*?)(?=Universities:|$)', block, re.DOTALL).group(1) if re.search(r'Careers:', block) else [])
            
            if major_match:
                recommendations.append({
                    "major": major_match.group(1).strip(),
                    "matchScore": int(score_match.group(1)) if score_match else 0,
                    "description": desc_match.group(1).strip() if desc_match else "",
                    "whyMatch": why_match.group(1).strip() if why_match else "",
                    "careers": [c.strip() for c in careers_match]
                })
                
        return {"recommendations": recommendations}
    
    except Exception as e:
        print("Parsing error:", str(e))
        return {"error": "Failed to parse recommendations"}

@app.route('/recommend-career', methods=['POST'])
def recommend_career():
    data = request.get_json()
    
    # Extract parameters
    name = data.get('name')
    age = data.get('age')
    gender = data.get('gender')
    interests = data.get('interests', [])
    personality_traits = data.get('personalityTraits', [])
    learning_style = data.get('learningStyle')
    values = data.get('values', [])
    
    print("Received career recommendation request:", data)

    # Validate required parameters
    if not interests or not personality_traits or not learning_style or not values:
        return jsonify({"error": "Missing required data"}), 400

    # Construct the prompt for DeepSeek
    prompt = (
        f"Recommend 3 college majors for a {age}-year-old {gender} named {name}. "
        f"### Interests:\n{', '.join(interests)}\n"
        f"### Personality Traits:\n{', '.join(personality_traits)}\n"
        f"### Learning Style: {learning_style}\n"
        f"### Values:\n{', '.join(values)}\n\n"
        "OUTPUT FORMAT (STRICT JSON ONLY):\n"
        "{\n"
        "  \"recommendations\": [\n"
        "    {\n"
        "      \"major\": \"Major Name\",\n"
        "      \"matchScore\": 0-100,\n"
        "      \"description\": \"Brief description\",\n"
        "      \"whyMatch\": \"Why it matches the student\",\n"
        "      \"careers\": [\"Career 1\", \"Career 2\", \"Career 3\"],\n"
        "      \"advice\": \"Practical advice for the student to succeed in this major (e.g., self-learning, bootcamps, certifications)\"\n"
        "    }\n"
        "  ]\n"
        "}\n\n"
         "SPECIAL INSTRUCTIONS:\n"
        "- For each major, provide 2-3 practical pieces of advice\n"
        "- Advice should include self-learning resources, certifications, or bootcamps\n"
        "- Make advice specific to Lebanese students and local opportunities\n"
        "- Focus on actionable steps they can take while studying\n"
        "- Include Lebanese-specific resources when possible\n"
        "- Example for Computer Science: 'Start learning Python through freeCodeCamp while in university and join Beirut-based coding bootcamps like SE Factory'\n"
    )
    

    try:
        print("Sending request to OpenRouter API with DeepSeek...")
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost",
                "X-Title": "Career Path Advisor"
            },
            data=json.dumps({
                "model": "deepseek/deepseek-chat:free",
                "messages": [
                    {
                        "role": "system", 
                        "content": "You are a career advisor. OUTPUT ONLY VALID JSON. Do not include any additional text or explanations."
                    },
                    {"role": "user", "content": prompt}
                ],
                "max_tokens": 1500
            })
        )
        
        print("API Response Status:", response.status_code)
        response.raise_for_status()

        result = response.json()
        ai_content = result["choices"][0]["message"]["content"].strip()
        print("Raw AI Response:", ai_content)
        
        # Parse the response
        career_data = parse_career_recommendations(ai_content)
        return jsonify(career_data)

    except requests.exceptions.RequestException as e:
        print("API Request Error:", str(e))
        return jsonify({"error": "Failed to connect to API"}), 500
    except Exception as e:
        print("Error:", str(e))
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    import os
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, host="0.0.0.0", port=port)
