import os
import asyncio
import aiohttp

SAVE_DIR = "images_dir"
N_PHOTOS = 100   # how many to grab (set as you like)

async def fetch_json(session, url):
    async with session.get(url, timeout=15) as r:
        r.raise_for_status()
        return await r.json()

async def download_file(session, url, path):
    async with session.get(url, timeout=15) as r:
        r.raise_for_status()
        with open(path, "wb") as f:
            while True:
                chunk = await r.content.read(8192)
                if not chunk:
                    break
                f.write(chunk)

async def main():
    os.makedirs(SAVE_DIR, exist_ok=True)

    api_url = f"https://randomuser.me/api/?results={N_PHOTOS}&inc=picture&noinfo"
    async with aiohttp.ClientSession() as session:
        data = await fetch_json(session, api_url)
        urls = [u["picture"]["large"] for u in data["results"]]

        tasks = []
        for i, url in enumerate(urls, start=1):
            filename = f"user_{i:04d}.jpg"
            path = os.path.join(SAVE_DIR, filename)
            print(f"Downloading {url} -> {path}")
            tasks.append(download_file(session, url, path))

        await asyncio.gather(*tasks)

    print(f"\n✅ Saved {len(urls)} photos into {SAVE_DIR}")

if __name__ == "__main__":
    asyncio.run(main())
