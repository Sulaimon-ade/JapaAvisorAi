from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
import os
import json
from dotenv import load_dotenv

# Scraper imports
from backend.scrape.requirements import scrape_canada
from backend.scrape.requirements import scrape_uk
from backend.scrape.requirements import scrape_germany
from backend.scrape.requirements import scrape_usa

# === ENVIRONMENT SETUP ===
load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app = FastAPI()

# === CORS SETUP ===
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# === DATA MODELS ===

class UserProfile(BaseModel):
    fullName: str
    degree: str
    workExperience: str
    targetCountry: str
    goal: str

class RequestData(BaseModel):
    country: str
    nationality: str = "Nigeria"

# === ROUTE: /generate-roadmap ===
@app.get("/")
def read_root():
    return {"message": "Welcome to JapaAdvisor API!"}

@app.post("/generate-roadmap")
def generate_roadmap(profile: UserProfile):
    prompt = f"""
You are an expert immigration and education advisor. A Nigerian user has submitted the following profile:

- Name: {profile.fullName}
- Degree: {profile.degree}
- Work Experience: {profile.workExperience}
- Target Country: {profile.targetCountry}
- Career/Education Goal: {profile.goal}

Your job is to return a structured JSON object with 4 fields:

1. "roadmap": A short paragraph explaining the steps this person should take to move to {profile.targetCountry}.
2. "checklist": A JSON list of 5–7 bullet points with practical steps and documents.
3. "sop": A formal academic-style Statement of Purpose based on their background and goal.
4. "opportunities": A list of 3–5 relevant links to scholarship, visa, or university resources for {profile.targetCountry}. Each item should include:
   - "title": short name of the opportunity
   - "url": a valid link (you can use placeholders if needed)
   - "type": one of ["scholarship", "university", "visa", "other"]

Return ONLY a valid JSON object like this:
{{
  "roadmap": "...",
  "checklist": ["...", "..."],
  "sop": "...",
  "opportunities": [
    {{
      "title": "...",
      "url": "...",
      "type": "scholarship"
    }},
    ...
  ]
}}

Do not include any explanations, formatting, or markdown — only valid JSON.
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an education and immigration advisor."},
                {"role": "user", "content": prompt}
            ]
        )
        message = response.choices[0].message.content
        data = json.loads(message)
        return data

    except json.JSONDecodeError:
        return {"error": "Failed to parse GPT response", "raw": message}
    except Exception as e:
        return {"error": str(e)}

# === ROUTE: /api/requirements ===

@app.post("/api/requirements")
def fetch_requirements(request: RequestData):
    try:
        country = request.country.strip().lower()

        if country == "canada":
            return scrape_canada()
        elif country == "uk" or country == "united kingdom":
            return scrape_uk()
        elif country == "usa" or country == "united states":
            return scrape_usa()
        elif country == "germany":
            return scrape_germany()
        else:
            return {"error": f"Scraper not available for '{request.country}' yet."}

    except Exception as e:
        return {"error": str(e)}
