from pymongo import MongoClient
from bson import ObjectId
import os
from math import sqrt
from dotenv import load_dotenv

# Load .env for MONGODB_URI
load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
DB_NAME     = "cappuconnect"
COLL_NAME   = "users_tag_spam"

# Hardcoded test user ID (replace with your ObjectId hex string)
TEST_ID = ObjectId("68cf43d576605996e6594c5b") # kai
TEST_ID = ObjectId("68cfc4760856c6c4332c55da") # alice
TEST_ID = ObjectId("68cfc4760856c6c4332c55da") # alice

print("\n")


# --- CONFIG ---
MONGODB_URI = os.getenv("MONGODB_URI")
DB_NAME     = "cappuconnect"
COLL_NAME   = "users_tag_spam"

# <<< put Alice's ObjectId here >>>
ALICE_ID = ObjectId("68cfd95e0856c6c4332c5672")

# --- helpers ---
def norm_skills(skills):
    if not skills:
        return set()
    out = []
    for s in skills:
        if isinstance(s, str):
            t = s.strip().lower()
            if t:
                out.append(t)
    return set(out)  # dedupe

def jaccard(a, b):
    if not a and not b:
        return 0.0
    inter = len(a & b)
    union = len(a | b)
    return inter / union if union else 0.0

def cosine_binary(a, b):
    if not a or not b:
        return 0.0
    inter = len(a & b)
    denom = sqrt(len(a) * len(b))
    return inter / denom if denom else 0.0

def main():
    client = MongoClient(MONGODB_URI)
    db = client[DB_NAME]
    users = db[COLL_NAME]

    # 1) Load Alice
    alice = users.find_one({"_id": ALICE_ID}, {"firstname": 1, "lastname": 1, "email": 1, "skills": 1})
    if not alice:
        print("❌ Alice not found; check ALICE_ID.")
        return

    A = norm_skills(alice.get("skills", []))
    if not A:
        print("❌ Alice has no skills after normalization.")
        return

    print(f"Test user (Alice): {alice.get('firstname','')} {alice.get('lastname','')} <{alice.get('email','')}>")
    print("Alice skills:", ", ".join(sorted(A)))

    # 2) Fetch others (simple version: pull all; uncomment prefilter to speed up)
    query = {"_id": {"$ne": ALICE_ID}, "skills": {"$exists": True, "$ne": []}}
    # Speed-up for big collections: only fetch users sharing ANY skill with Alice
    # query["skills"] = {"$in": list(A)}

    projection = {"firstname": 1, "lastname": 1, "email": 1, "skills": 1, "updatedAt": 1}
    cursor = users.find(query, projection)

    results = []
    for u in cursor:
        B = norm_skills(u.get("skills", []))
        if not B:
            continue
        inter = A & B
        if not inter:
            continue
        row = {
            "_id": str(u["_id"]),
            "firstname": u.get("firstname", ""),
            "lastname": u.get("lastname", ""),
            "email": u.get("email", ""),
            "overlap": len(inter),
            "jaccard": jaccard(A, B),
            "cosine": cosine_binary(A, B),
            "common": sorted(inter),
            "other_size": len(B),
            "updatedAt": u.get("updatedAt"),
        }
        results.append(row)

    # 3) Sort: overlap desc, then jaccard desc, then cosine desc, then most recent
    results.sort(key=lambda r: (r["overlap"], r["jaccard"], r["cosine"], r["updatedAt"] or 0), reverse=True)

    # 4) Print top 50
    if not results:
        print("\nNo overlapping users found.")
        return

    print("\nTop matches:")
    for r in results[:50]:
        name = f"{r['firstname']} {r['lastname']}".strip()
        print(f"- {name:24s} | overlap={r['overlap']:2d} | jaccard={r['jaccard']:.3f} | "
              f"cosine={r['cosine']:.3f} | common={', '.join(r['common'])}")

if __name__ == "__main__":
    main()
