# quick_one.py
import asyncio, aiohttp
from fakeusers import make_payload, BROWSER_HEADERS, BASE_URL, API_PATH

async def one():
    async with aiohttp.ClientSession() as s:
        p = make_payload(0)
        async with s.post(f"{BASE_URL}{API_PATH}", json=p, headers=BROWSER_HEADERS) as r:
            print(r.status, await r.text())

asyncio.run(one())