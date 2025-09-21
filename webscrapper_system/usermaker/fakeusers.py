import asyncio
import random
import string
from typing import Dict, List
import aiohttp
from faker import Faker

BASE_URL      = "http://localhost:3000"
API_PATH      = "/api/users"
COUNT         = 100
CONCURRENCY   = 2
EMAIL_DOMAIN  = "example.com"
DEFAULT_PASS  = "password"  # your API hashes it
TIMEOUT_S     = 20
RETRY_DUP     = 3

# Match the browser-like headers in your sample
BROWSER_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:143.0) Gecko/20100101 Firefox/143.0",
    "Accept": "*/*",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate, br, zstd",
    "Origin": "http://localhost:3000",
    "Referer": "http://localhost:3000/auth/register",
    "Connection": "keep-alive",
    "Content-Type": "application/json",
    # You generally don't need cookies for this API, but you can add them here if your route enforces CSRF.
    # "Cookie": "next-auth.csrf-token=...; next-auth.callback-url=...",
}


# base case for just NYC
US_STATES = [
  "California", "New York"
]

# US_STATES = [
#   "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware",
#   "Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky",
#   "Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi",
#   "Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico",
#   "New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania",
#   "Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont",
#   "Virginia","Washington","West Virginia","Wisconsin","Wyoming"
# ]

INDUSTRIES = [
  "Technology & IT","Healthcare & Life Sciences","Finance & Banking","Education & Academia",
  "Engineering & Manufacturing","Marketing & Advertising","Legal & Compliance",
  "Consulting & Professional Services","Energy & Environment","Government & Public Sector",
  "Hospitality & Tourism","Arts, Entertainment & Media","Retail & Consumer Goods",
  "Real Estate & Construction","Nonprofit & Social Impact","Other"
]

SKILLS: List[str] = [
  ".NET","AI Algorithms","AI/ML","Accessibility","Agile Coaching","Agile Project Management",
  "Algorithms","Android Development","Application Security","Applied Math","Architecture",
  "Artificial Intelligence","Artificial Intelligence Applications",
  "Artificial Intelligence Machine Learning Robotics","B2B Networking","Banking","Big Data",
  "Biology","Blockchain","Bootcamps","Brand Strategy","Branding","Business","Business Agility",
  "Business Analytics","Business Connections","Business Development","Business Funding",
  "Business Intelligence","Business Intelligence in Cloud","Business Planning",
  "Business Process Automation","Business Referral Networking","Business Strategy",
  "Business and Executive Coaching","C#","Career","Career Coaching","Career Network",
  "Career Services","Career Transition","Cloud Computing","Cloud Integration","Cloud Native",
  "Cloud Security","Co-Founder","Coders","Cognitive Science","Collaboration",
  "Communication Skills","Complex Systems / Complexity","Computer Graphics",
  "Computer Programming","Computer Science","Computer Security","Computers","Contracting Opportunities",
  "Courses and Workshops","Creative Coding","Critical Thinking","Cryptocurrency","Cybersecurity","Data",
  "Data Analytics","Data Management","Data Science","Data Science using Python","Data Structures",
  "Database Development","Database Professionals","Deep Learning","DevOps","Distributed Systems",
  "Diversity & Inclusion","Education","Education & Technology","Employee Wellness",
  "English as a Second Language","Entrepreneur Mindset","Entrepreneur Networking","Entrepreneurship",
  "Event Planning","Finance","Financial Engineering","Financial Planning","Freelance",
  "Functional Programming","Game Design","Government","Government Contracting","Grant Writing",
  "Graphic Design","Hackathons","Healthcare IT","Healthcare Innovation","Healthcare Professionals",
  "HR Professionals","Information Science","Information Technology","Infrastructure as Code",
  "Interaction Design","International Affairs","International Politics","Internet Professionals",
  "Internet Startups","IOT Hacking","Interview Skills","Investing","Java","JavaScript",
  "Job Interview Prep","Job Search","Knowledge Management / Sharing","Law","Law & Technology",
  "Lawyers","Leadership","Leadership Development","Learn to Code","Learning","Linux",
  "Machine Intelligence","Machine Learning","Machine Learning in Cloud","Machine Learning with Python",
  "Mathematics","Mobile App Development","Mobile Development","Mobile Technology","Motivation & Success",
  "Network Security","Neuroscience","New Career","NoSQL","SQL","OWASP","Online Education",
  "Online Marketing","Open Data","Open Source","Penetration Testing","Personal Branding",
  "Personal Development / Growth / Transformation","Philosophy & Ethics","Physics","PMP Certification",
  "Predictive Analytics","PostgreSQL","Political Activism","Product Design","Product Development",
  "Product Management","Productivity","Professional Development","Professional Networking",
  "Programming Languages","Project Management","Project Management Office",
  "Project Management Professional","Python","Real Estate Investing / Networking / Education",
  "Regulatory Compliance","Remote Workers","Resume Writing / Interview Help","SaaS (Software as a Service)",
  "Scholarly Research","Security Industry","Self Employment","Sound Design","Software Architecture",
  "Software Craftsmanship","Software Development","Software Engineering","Software Product Management",
  "Software QA and Testing","Software Security","Spanish","Strategic HR","System Administration",
  "Tech Talks","Technology","Trading Education","Technology Innovation","Technology Professionals",
  "Technology Startups","Typescript","UI/UX Design","User Experience","Visual Effects",
  "Virtual Reality (VR)","Video Game Development","Video Editing","Venture Capital","Web 3.0",
  "Web Accessibility","Web Design","Web Development","Web Security","Web Technology",
  "Women Entrepreneurs","Women in Technology","WordPress","Workforce Development","Workplace",
  "Writing","Writing / Writing Workshops"
]

fake = Faker()

def slugify(s: str) -> str:
    return "".join(ch for ch in s.lower() if ch.isalnum() or ch == "-")

def random_skills(min_k=3, max_k=8) -> List[str]:
    k = random.randint(min_k, max_k)
    return random.sample(SKILLS, k=k)

def make_payload(i: int) -> Dict:
    first = fake.first_name()
    last  = fake.last_name()
    handle = f"{slugify(first)}-{slugify(last)}"
    tail   = "".join(random.choices(string.ascii_lowercase + string.digits, k=6))
    email  = f"{handle}-{tail}@{EMAIL_DOMAIN}".lower()

    # EXACT keys/types your API sees from the form:
    return {
        "firstname": first,                              # string
        "lastname": last,                               # string
        "linkedin": f"https://www.linkedin.com/in/{handle}-{tail}",  # string
        "email": email,                                 # string
        "password": DEFAULT_PASS,                       # string
        "bio": fake.sentence(nb_words=12),              # string
        "state": random.choice(US_STATES),              # full state name
        "school": random.choice([
            "University of Central Florida", "Florida State University", "Georgia Tech",
            "NYU", "Columbia University", "UC Berkeley", "MIT", "Stanford", "Caltech", "Carnegie Mellon", "school"
        ]),
        "major": random.choice([
            "Computer Science", "Information Technology", "Electrical Engineering", "Data Science",
            "Business Administration", "Marketing", "Mathematics", "major"
        ]),
        "experienceyears": str(random.randint(0, 20)),  # string (zod expects string)
        "industry": random.choice(INDUSTRIES),          # string
        "skills": random_skills(),                      # array of strings (randomized)
        "resume": "resumeLink",                         # string or "" if you prefer
        "photo": "pfpLink"                              # string or "" if you prefer
    }

async def create_user(session: aiohttp.ClientSession, payload: Dict) -> Dict:
    url = f"{BASE_URL.rstrip('/')}/{API_PATH.lstrip('/')}"
    for _ in range(RETRY_DUP):
        try:
            async with session.post(url, json=payload, headers=BROWSER_HEADERS, timeout=TIMEOUT_S) as resp:
                txt = await resp.text()
                if resp.status in (200, 201):
                    return {"ok": True, "status": resp.status, "body": txt}
                if resp.status == 400 and "exists" in txt.lower():
                    # adjust email to avoid duplicate
                    at = payload["email"].find("@")
                    suffix = "".join(random.choices(string.ascii_lowercase + string.digits, k=4))
                    payload["email"] = payload["email"][:at] + f"+{suffix}" + payload["email"][at:]
                    continue
                return {"ok": False, "status": resp.status, "body": txt[:250]}
        except asyncio.TimeoutError:
            return {"ok": False, "status": "timeout", "body": "request timed out"}
        except Exception as e:
            return {"ok": False, "status": "error", "body": repr(e)}
    return {"ok": False, "status": 400, "body": "exhausted duplicate retries"}

async def worker(sem: asyncio.Semaphore, session: aiohttp.ClientSession, batch: List[int], results: Dict[int, Dict]):
    for i in batch:
        async with sem:
            res = await create_user(session, make_payload(i))
            results[i] = res
            print(f"[{i:04d}] {'✅' if res['ok'] else '❌'} {res['status']}")

async def main():
    idxs = list(range(COUNT))
    chunk = max(1, COUNT // CONCURRENCY)
    batches = [idxs[i:i+chunk] for i in range(0, len(idxs), chunk)]

    results: Dict[int, Dict] = {}
    sem = asyncio.Semaphore(CONCURRENCY)
    timeout = aiohttp.ClientTimeout(total=None, connect=TIMEOUT_S)
    connector = aiohttp.TCPConnector(limit=None, ttl_dns_cache=300)

    async with aiohttp.ClientSession(timeout=timeout, connector=connector) as session:
        await asyncio.gather(*[
            asyncio.create_task(worker(sem, session, b, results)) for b in batches
        ])

    ok = sum(1 for r in results.values() if r.get("ok"))
    print("\n==== Summary ====")
    print(f"Total attempted: {COUNT}")
    print(f"Created:         {ok}")
    print(f"Failed:          {COUNT - ok}")

if __name__ == "__main__":
    asyncio.run(main())
