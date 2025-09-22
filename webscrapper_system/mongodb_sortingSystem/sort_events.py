#!/usr/bin/env python3
from pymongo import MongoClient
from bson import ObjectId
from math import sqrt
import os
from dotenv import load_dotenv

# Load .env for MONGODB_URI and optional names
load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
DB_NAME     = os.getenv("DB_NAME", "cappuconnect")
USERS_COLL  = os.getenv("USERS_COLLECTION", os.getenv("USER_TABLE", "users"))
EVENTS_COLL = os.getenv("EVENTS_COLLECTION", "events")

# --- config you can tweak ---
USER_ID       = ObjectId("68cf43d576605996e6594c5b")  # << replace with your viewer's _id
LIMIT         = 50
MIN_OVERLAP   = 1    # set to 2/3 to hide weak matches
PREFILTER     = True # use $in prefilter on events.tags (faster)

# --- helpers ---
def norm_list_str(values):
    """lowercase, trim, dedupe string list"""
    if not values:
        return set()
    out = []
    for v in values:
        if isinstance(v, str):
            t = v.strip().lower()
            if t:
                out.append(t)
    return set(out)

def jaccard(a, b):
    if not a and not b: return 0.0
    inter = len(a & b)
    union = len(a | b)
    return (inter / union) if union else 0.0

def cosine_binary(a, b):
    if not a or not b: return 0.0
    inter = len(a & b)
    denom = sqrt(len(a) * len(b))
    return (inter / denom) if denom else 0.0

def main():
    if not MONGODB_URI:
        print("❌ MONGODB_URI is missing. Set it in your .env")
        return

    client = MongoClient(MONGODB_URI)
    db = client[DB_NAME]
    users  = db["users_tag_spam"]
    events = db["events"]

    # 1) Load viewer and skills
    me = users.find_one(
        {"_id": USER_ID},
        {"firstname": 1, "lastname": 1, "email": 1, "skills": 1}
    )
    if not me:
        print("❌ Viewer not found; check USER_ID.")
        return

    A = norm_list_str(me.get("skills", []))
    if not A:
        print("❌ Viewer has no skills.")
        return

    print(f"\nViewer: {me.get('firstname','')} {me.get('lastname','')} <{me.get('email','')}>")
    print("Skills:", ", ".join(sorted(A)))

    # 2) Fetch events; optional prefilter on tags
    q = {"tags": {"$exists": True, "$ne": []}}
    if PREFILTER and A:
        q["tags"] = {"$in": list(A)}

    proj = {
        "id": 1, "name": 1, "time": 1, "venue": 1, "address": 1, "host": 1,
        "image_url": 1, "cleaned_url": 1, "map_url": 1,
        "tags": 1, "attendees": 1
    }

    results = []
    for ev in events.find(q, proj):
        tags = norm_list_str(ev.get("tags", []))
        if not tags:
            continue
        inter = A & tags
        if len(inter) < MIN_OVERLAP:
            continue

        row = {
            "_id": str(ev["_id"]),
            "id": ev.get("id"),
            "name": ev.get("name", ""),
            "time": ev.get("time", ""),
            "venue": ev.get("venue", ""),
            "address": ev.get("address", ""),
            "host": ev.get("host", ""),
            "image_url": ev.get("image_url", ""),
            "cleaned_url": ev.get("cleaned_url", ""),
            "map_url": ev.get("map_url", ""),
            "tags": sorted(list(tags)),
            "attendees_count": len(ev.get("attendees") or []),

            "overlap": len(inter),
            "jaccard": jaccard(A, tags),
            "cosine": cosine_binary(A, tags),
            "common": sorted(list(inter)),
        }
        results.append(row)

    if not results:
        print("\nNo matching events found.")
        return

    # 3) Sort strong matches first
    results.sort(
        key=lambda r: (r["overlap"], r["jaccard"], r["cosine"], r["attendees_count"], r.get("id") or 0),
        reverse=True
    )

    # 4) Print top N
    print(f"\nTop events (MIN_OVERLAP={MIN_OVERLAP}):")
    for r in results[:LIMIT]:
        name = (r["name"] or "").strip()
        print(
            f"- {name[:48]:48s} | overlap={r['overlap']:2d} | "
            f"jaccard={r['jaccard']:.3f} | cosine={r['cosine']:.3f} | "
            f"common={', '.join(r['common'])}"
        )

if __name__ == "__main__":
    main()


# from pymongo import MongoClient
# from bson import ObjectId
# import os
# from math import sqrt
# from dotenv import load_dotenv

# # Load .env for MONGODB_URI
# load_dotenv()

# MONGODB_URI = os.getenv("MONGODB_URI")
# DB_NAME     = "cappuconnect"
# COLL_NAME   = "users_tag_spam"

# print("\n")

# # <<< put Alice's ObjectId here >>>
# ALICE_ID = ObjectId("68cf43d576605996e6594c5b")

# # --- helpers ---
# def norm_skills(skills):
#     if not skills:
#         return set()
#     out = []
#     for s in skills:
#         if isinstance(s, str):
#             t = s.strip().lower()
#             if t:
#                 out.append(t)
#     return set(out)  # dedupe

# def jaccard(a, b):
#     if not a and not b:
#         return 0.0
#     inter = len(a & b)
#     union = len(a | b)
#     return inter / union if union else 0.0

# def cosine_binary(a, b):
#     if not a or not b:
#         return 0.0
#     inter = len(a & b)
#     denom = sqrt(len(a) * len(b))
#     return inter / denom if denom else 0.0

# def main():
#     client = MongoClient(MONGODB_URI)
#     db = client[DB_NAME]
#     users = db[COLL_NAME]

#     # 1) Load Alice
#     alice = users.find_one({"_id": ALICE_ID}, {"firstname": 1, "lastname": 1, "email": 1, "skills": 1})
#     if not alice:
#         print("❌ Alice not found; check ALICE_ID.")
#         return

#     A = norm_skills(alice.get("skills", []))
#     if not A:
#         print("❌ Alice has no skills after normalization.")
#         return

#     print(f"Test user (Alice): {alice.get('firstname','')} {alice.get('lastname','')} <{alice.get('email','')}>")
#     print("Alice skills:", ", ".join(sorted(A)))

#     # 2) Fetch others (simple version: pull all; uncomment prefilter to speed up)
#     query = {"_id": {"$ne": ALICE_ID}, "skills": {"$exists": True, "$ne": []}}
#     # Speed-up for big collections: only fetch users sharing ANY skill with Alice
#     # query["skills"] = {"$in": list(A)}

#     projection = {"name": 1, "id": 1, "cleaned_url": 1, "tags": 1}
#     cursor = users.find(query, projection)

#     results = []
#     for u in cursor:
#         B = norm_skills(u.get("tags", []))
#         if not B:
#             continue
#         inter = A & B
#         if not inter:
#             continue
#         row = {
#             "_id": str(u["_id"]),
#             "name": u.get("name", ""),
#             "id": u.get("id", ""),
#             "cleaned_url": u.get("cleaned_url", ""),
#             "overlap": len(inter),
#             "jaccard": jaccard(A, B),
#             "cosine": cosine_binary(A, B),
#             "common": sorted(inter),
#             "other_size": len(B),
#             #"updatedAt": u.get("updatedAt"),
#         }
#         results.append(row)

#     # 3) Sort: overlap desc, then jaccard desc, then cosine desc, then most recent
#     results.sort(key=lambda r: (r["overlap"], r["jaccard"], r["cosine"], r["updatedAt"] or 0), reverse=True)

#     # 4) Print top 50
#     if not results:
#         print("\nNo overlapping users found.")
#         return

#     print("\nTop matches:")
#     for r in results[:50]:
#         name = f"{r['firstname']} {r['lastname']}".strip()
#         print(f"- {name:24s} | overlap={r['overlap']:2d} | jaccard={r['jaccard']:.3f} | "
#               f"cosine={r['cosine']:.3f} ")

# if __name__ == "__main__":
#     main()
