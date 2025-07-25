# scrape/requirements.py
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium import webdriver
from webdriver_manager.chrome import ChromeDriverManager
import time
import requests
from bs4 import BeautifulSoup
import re

HEADERS = {"User-Agent": "Mozilla/5.0"}

def scrape_uk():
    url = "https://www.gov.uk/student-visa"
    response = requests.get(url, headers=HEADERS)
    soup = BeautifulSoup(response.text, "html.parser")

    KEYWORDS = [
        "passport", "confirmation", "financial", "english", "tuberculosis",
        "offer", "place", "support", "money", "funds", "pay", "course",
        "consent", "parents", "timeline", "weeks", "before", "apply",
        "fee", "switch", "extend", "graduate", "stay"
    ]

    docs = []
    for li in soup.select("main ul li"):
        text = li.get_text(strip=True)
        if any(word in text.lower() for word in KEYWORDS):
            docs.append(text)

    return {
        "country": "UK",
        "visa_type": "Student Visa",
        "documents": docs[:12],
        "language_requirements": "IELTS or equivalent required by institutions.",
        "timeline": "Apply up to 6 months before your course starts.",
        "official_links": [url]
    }

def scrape_canada():
    from datetime import datetime

    url = "https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/apply.html"

    fallback_documents = [
        "Letter of acceptance from a designated learning institution (DLI)",
        "Provincial Attestation Letter (PAL) from the province/territory",
        "Proof of financial support (minimum $20,635 for 2025)",
        "Valid passport/travel document",
        "Medical exam results (if required)",
        "Police certificate (if required)"
    ]

    documents = []
    used_fallback = False

    try:
        options = Options()
        options.add_argument('--headless')
        options.add_argument('--disable-gpu')
        options.add_argument('--no-sandbox')

        driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
        driver.get(url)
        time.sleep(8)

        soup = BeautifulSoup(driver.page_source, 'html.parser')
        driver.quit()

        section = soup.find('section', id='get-documents')
        if section:
            list_items = section.find_all('li')
            for item in list_items:
                text = item.get_text(separator=' ', strip=True)

                if 'upload your PAL' in text:
                    text = "Provincial Attestation Letter (PAL) or Territorial Attestation Letter (TAL)"
                elif 'as many of the documents needed' in text:
                    text = "All required supporting documents"

                if not any(x in text for x in ["We won't", "Waiting to submit", "upload your PAL"]):
                    documents.append(text)

        if len(documents) < 3:
            documents = fallback_documents
            used_fallback = True

    except Exception as e:
        documents = fallback_documents
        used_fallback = True
        print(f"[ERROR] Failed to scrape Canada study permit page: {e}")

    return {
        "country": "Canada",
        "visa_type": "Study Permit",
        "documents": documents[:6],
        "language_requirements": "IELTS/TOEFL/CELPIP required by institution",
        "timeline": "Apply 3-6 months before program start",
        "official_links": [
            url,
            "https://www.canada.ca/en/immigration-refugees-citizenship/services/application/application-forms-guides/guide-5269-applying-study-permit-outside-canada.html"
        ],
        "used_fallback": used_fallback,
        "last_updated": datetime.utcnow().isoformat() + "Z"
    }
def scrape_usa():
    # Official government sources
    urls = [
        "https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html",  # Primary source
        "https://www.usa.gov/student-visa"  # Secondary source
    ]
    
    options = Options()
    options.add_argument('--headless')
    options.add_argument('--disable-gpu')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36")

    try:
        driver = webdriver.Chrome(
            service=Service(ChromeDriverManager().install()),
            options=options
        )
        driver.get(urls[0])
        time.sleep(8)
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        driver.quit()

        documents = []
        core_requirements = []

        # Extract from primary source
        docs_section = soup.find('h2', string='Gather Required Documentation')
        if docs_section:
            ul = docs_section.find_next('ul')
            if ul:
                for li in ul.find_all('li'):
                    text = li.get_text(separator=' ', strip=True)
                    if len(text) > 15:
                        # Standardize key document names
                        if 'passport' in text.lower():
                            text = "Valid passport (with 6+ months validity beyond stay)"
                        elif 'form i-20' in text.lower():
                            text = "Form I-20 (Certificate of Eligibility from SEVP-approved school)"
                        elif 'ds-160' in text.lower():
                            text = "DS-160 confirmation page"
                        elif 'photo' in text.lower():
                            text = "Passport-style photograph meeting requirements"
                        core_requirements.append(text)

        # Extract fees and processing time
        timeline = "Apply 3-6 months before program start"
        fees = "$535 total ($350 SEVIS + $185 application)"
        if soup.find(string=re.compile(r'365 days before', re.IGNORECASE)):
            timeline = "Apply up to 12 months before program start (entry permitted 30 days before)"

        # Extract visa types
        visa_types = []
        table = soup.find('table')
        if table:
            for row in table.find_all('tr')[1:]:  # Skip header
                cells = row.find_all('td')
                if len(cells) >= 2:
                    visa_types.append(f"{cells[0].get_text(strip=True)}: {cells[1].get_text(strip=True)}")

        # Fallback to secondary source if needed
        if not core_requirements:
            import requests
            response = requests.get(urls[1], timeout=10)
            soup_secondary = BeautifulSoup(response.text, 'html.parser')
            requirements_section = soup_secondary.find('h2', string='Student visa requirements')
            if requirements_section:
                next_ul = requirements_section.find_next('ul')
                if next_ul:
                    core_requirements = [li.get_text(strip=True) for li in next_ul.find_all('li')]

        # Ensure essential documents are included
        essential_docs = {
            "passport": "Valid passport (with 6+ months validity)",
            "i-20": "Form I-20 from SEVP-approved school",
            "ds-160": "DS-160 confirmation page",
            "sevis": "SEVIS fee payment receipt",
            "financial": "Proof of financial support for tuition/living expenses",
            "academic": "Academic transcripts and diplomas"
        }
        
        for doc in essential_docs.values():
            if not any(keyword in d.lower() for d in core_requirements for keyword in doc.split()[:2]):
                core_requirements.append(doc)

        return {
            "country": "USA",
            "visa_types": visa_types or ["F-1 (Academic Studies)", "M-1 (Vocational Studies)", "J-1 (Exchange Programs)"],
            "documents": list(set(core_requirements))[:12],
            "fees": fees,
            "language_requirements": "TOEFL/IELTS/Duolingo required by institution",
            "timeline": timeline,
            "special_notes": [
                "New 2025: Enhanced social media screening during application",
                "Maintain full-time enrollment to keep visa status valid",
                "OPT available for 12 months post-graduation (36 months for STEM)"
            ],
            "official_links": urls
        }

    except Exception as e:
        # Verified fallback based on 2025 requirements
        return {
            "country": "USA",
            "visa_types": ["F-1 (Academic)", "M-1 (Vocational)", "J-1 (Exchange)"],
            "documents": [
                "Valid passport (6+ months validity)",
                "Form I-20 from SEVP-approved school",
                "DS-160 confirmation page",
                "SEVIS I-901 fee receipt ($350)",
                "Visa application fee payment ($185)",
                "Proof of financial support (tuition + living expenses)",
                "Academic transcripts and diplomas",
                "Standardized test scores (if required by institution)",
                "Passport-style photograph",
                "Evidence of intent to return home after studies"
            ],
            "fees": "$535 total ($350 SEVIS + $185 application)",
            "language_requirements": "TOEFL/IELTS/Duolingo required by institution",
            "timeline": "Apply 3-6 months before program start",
            "special_notes": [
                "Initial entry permitted 30 days before program start",
                "On-campus work limited to 20 hrs/week during semester",
                "OPT work authorization requires separate application"
            ],
            "official_links": urls
        }


def scrape_germany():
      # Official government sources
    urls = [
        "https://www.make-it-in-germany.com/en/visa-residence/student-visa",
        "https://www.auswaertiges-amt.de/en/visa-service/visabestimmungen-node/studium-en/606846"
    ]

    # Configure browser
    options = Options()
    options.add_argument('--headless')
    options.add_argument('--disable-gpu')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36")

    try:
        # Initialize WebDriver
        driver = webdriver.Chrome(
            service=Service(ChromeDriverManager().install()),
            options=options
        )
        driver.get(urls[0])
        time.sleep(8)  # Allow full page rendering
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        
        # Extract document section
        documents = []
        section = None
        
        # Method 1: Find by heading text
        heading = soup.find('h2', string=re.compile(r'documents.*need', re.IGNORECASE))
        if heading:
            section = heading.find_parent('section')
            if not section:
                section = heading.find_next('div', class_='rich-text')
        
        # Method 2: Find by section ID
        if not section:
            section = soup.find('section', id='documents')
        
        # Extract documents from section
        if section:
            # Handle list formats
            for ul in section.find_all('ul'):
                for li in ul.find_all('li'):
                    text = li.get_text(separator=' ', strip=True)
                    text = re.sub(r'\[\d+\]', '', text)  # Remove citations
                    if len(text) > 10:
                        documents.append(text)
            
            # Handle paragraph formats
            if not documents:
                for p in section.find_all('p'):
                    text = p.get_text(strip=True)
                    if '•' in text or ':' in text:
                        parts = re.split(r'[•:]', text)
                        documents.extend([part.strip() for part in parts if len(part.strip()) > 20])

        # If still no documents, try secondary source
        if not documents:
            driver.get(urls[1])
            time.sleep(5)
            soup = BeautifulSoup(driver.page_source, 'html.parser')
            
            # Find document section in Foreign Office site
            section = soup.find('div', id='content')
            if section:
                # Extract table rows
                for row in section.find_all('tr'):
                    cells = row.find_all('td')
                    if len(cells) >= 2:
                        doc_text = f"{cells[0].get_text(strip=True)}: {cells[1].get_text(strip=True)}"
                        documents.append(doc_text)
                
                # Extract list items
                if not documents:
                    for li in section.find_all('li'):
                        text = li.get_text(separator=' ', strip=True)
                        if len(text) > 30:
                            documents.append(text)

        driver.quit()

        # Process and standardize documents
        processed_docs = []
        doc_keywords = {
            r'passport|reisepass': "Valid passport (with 2+ blank pages)",
            r'admission|zulassung|acceptance': "University admission letter (Zulassungsbescheid)",
            r'financial|finan|blocked account': "Proof of financial resources (€11,904/year in blocked account)",
            r'insurance|krankenversicherung': "Health insurance coverage confirmation",
            r'application form|antragsformular': "Completed visa application forms (2 copies)",
            r'photo|bild|biometric': "Biometric passport photos (35x45mm)",
            r'academic|qualification|zeugnis': "Academic qualifications (certified copies)",
            r'curriculum vitae|lebenslauf|cv': "Curriculum vitae (tabular format)",
            r'motivation|motivational': "Motivational letter explaining study plans",
            r'language|sprachkenntnisse': "Language proficiency certificate",
            r'fee|gebühr': "Fee payment confirmation (€75)"
        }
        
        # Map to standardized documents
        for doc in documents:
            for pattern, standard in doc_keywords.items():
                if re.search(pattern, doc, re.IGNORECASE):
                    if standard not in processed_docs:
                        processed_docs.append(standard)
                    break
        
        # Add missing essential documents
        essentials = list(doc_keywords.values())
        for item in essentials:
            if item not in processed_docs:
                processed_docs.append(item)

        return {
            "country": "Germany",
            "visa_type": "Student Visa",
            "documents": processed_docs[:12],
            "language_requirements": "German: TestDaF/Goethe (B2-C1) or English: IELTS/TOEFL (university-specific)",
            "timeline": "Apply 3-6 months before studies begin",
            "official_links": urls
        }

    except Exception as e:
        # Minimal fallback if all else fails
        print("returning to fallback")
        return {
            "country": "Germany",
            "visa_type": "Student Visa",
            "documents": [
                "Valid passport (with 2+ blank pages)",
                "University admission letter (Zulassungsbescheid)",
                "Proof of financial resources (€11,904/year in blocked account)",
                "Health insurance coverage confirmation",
                "Completed visa application forms (2 copies)",
                "Biometric passport photos (35x45mm)"
            ],
            "language_requirements": "German: TestDaF/Goethe (B2-C1) or English: IELTS/TOEFL (university-specific)",
            "timeline": "Apply 3-6 months before studies begin",
            "official_links": urls
        }

# Dispatcher
def get_study_visa_requirements(country: str):
    country = country.lower()
    if "canada" in country:
        return scrape_canada()
    elif "uk" in country or "united kingdom" in country:
        return scrape_uk()
    elif "usa" in country or "united states" in country or "america" in country:
        return scrape_usa()
    elif "germany" in country:
        return scrape_germany()
    else:
        return {"error": "Country not yet supported. Coming soon!"}