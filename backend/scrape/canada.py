from openai import OpenAI
client = OpenAI()

def get_study_visa_requirements(country: str, user_nationality: str = "Nigeria"):
    prompt = f"""
    Provide official study visa requirements for {user_nationality} applicants to {country}.
    Return:
    - Academic and document requirements
    - Financial proof and language tests (IELTS/TOEFL)
    - Application deadlines and official portal
    - Include bullet points and cite source links and dates.
    """

    response = client.responses.create(
        model="o3-deep-research",
        input=prompt,
        tools=[{"type": "web_search_preview"}]
    )

    return {
        "country": country,
        "visa_type": "Study Permit",
        "requirements": response.output_text
    }
