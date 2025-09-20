// index.js
import puppeteer from "puppeteer";

const URL = "https://www.meetup.com/find/?location=us--ny--new-york&categoryId=405&source=EVENTS"; // basically  which url we want to scrape from, I figure we set 2 main ones  

const categories = [405, 436, 546, 652]
//https://www.meetup.com/find/?location=us--ny--new-york&categoryId=652&source=EVENTS

// [main.js] Step 1: open the page visibly
//import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";


// basic sleep function system
function sleep(ms) 
{
    return new Promise((resolve) => {setTimeout(resolve, ms);});
}

// function to ensure that the directory exists, and if not it makes it 
function ensureDir(dir) 
{
    fs.mkdirSync(dir, { recursive: true });
}


// pass 1, just load what you can
async function sweepDown(page, stepPx=900, dwellMs=250) 
{
    let y = 0;
    let { docH, viewH } = await page.evaluate(() => ({
        docH: (document.scrollingElement || document.body).scrollHeight,
        viewH: window.innerHeight
    }));
    while (y + viewH < docH) {
        await page.evaluate((_y) => window.scrollTo(0, _y), y);
        await sleep(dwellMs);
        y += stepPx;
        ({ docH, viewH } = await page.evaluate(() => ({
        docH: (document.scrollingElement || document.body).scrollHeight,
        viewH: window.innerHeight
        })));
    }
}

// Pass 2: bounce at the bottom until height stops changing (lazy-load done)
// aka double check shit
async function settleAtBottom(page, dwellMs = 500, stableRounds = 8, maxRounds = 2000) {
  let lastH = 0, same = 0, rounds = 0;
  while (same < stableRounds && rounds < maxRounds) {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await sleep(dwellMs);
    const h = await page.evaluate(() => document.body.scrollHeight);
    if (h === lastH) same++; else { same = 0; lastH = h; }
    rounds++;
  }
}

  

// 
/**
 * Extracts the ID, Name, Location, Host, and URL for each event on the page.
 * @param {object} page - The Puppeteer page object.
 * @returns {Promise<Array<object>>} - A promise that resolves to an array of event objects.
 */
/**
 * FINAL ROBUST VERSION (with Regex ID): Handles multiple layouts and gets the ID from the URL.
 * @param {object} page - The Puppeteer page object.
 * @returns {Promise<Array<object>>} - A promise that resolves to an array of event objects.
 */
async function extractEventData(page) {
  return page.evaluate(() => {
    let eventCards = document.querySelectorAll('a[data-event-label*="Event Card"]');
    if (!eventCards.length) {
      eventCards = document.querySelectorAll('div[data-event-id]');
    }

    return Array.from(eventCards).map(card => {
      const isNewLayout = card.tagName === 'A';

      // **URL LOGIC**: Get the URL first, as it's needed for the ID
      const url = isNewLayout
        ? card.href
        : card.closest('a')?.href;

      // **ID LOGIC (NEW)**: Extract the ID from the URL using regex
      const idMatch = url?.match(/events\/(\d+)\//);
      const id = idMatch ? idMatch[1] : 'N/A';

      // --- Logic for other data ---
      const name = card.querySelector('h3')?.innerText.trim() || 'N/A';
      const host = card.querySelector('div.truncate, div.flex-shrink.min-w-0.truncate')?.innerText.trim().replace(/^by\s/, '') || 'N/A';

      let time = 'N/A';
      let location = 'NYC';
      const timeEl = card.querySelector('time');
      if (timeEl) {
        const timeAndLocationText = (isNewLayout 
            ? timeEl.closest('.flex.items-center')?.innerText
            : timeEl.parentElement?.innerText) || '';
        const parts = timeAndLocationText.split('•').map(s => s.trim());
        time = parts[0] || 'N/A';
        location = 'NYC';
      }
      
      return { id, name, time, location, host, url: url || 'N/A' };
    });
  });
}
// async function extractEventData(page) {
//   return page.evaluate(() => {
//     // First, try to find cards using the NEW layout's main container.
//     // The new layout uses an <a> tag as the main wrapper.
//     let eventCards = document.querySelectorAll('a[data-event-label="Event Card"]');
    
//     // If we don't find any, fall back to the OLD layout's container.
//     // The old layout used a <div> with a data-event-id.
//     if (eventCards.length === 0) {
//       eventCards = document.querySelectorAll('div[data-event-id]');
//     }

//     return Array.from(eventCards).map(card => {
//       // Determine if the current card is from the new layout.
//       const isNewLayout = card.tagName === 'A';
      
//       let id, name, time, location, host, url;

//       if (isNewLayout) {
//         // --- Logic for the NEW Layout ---
//         id = card.querySelector('[data-eventref]')?.dataset.eventref || 'N/A';
//         url_grabbed = card.href  || 'N/A';
//         name = card.querySelector('h3')?.innerText.trim() || 'N/A';
//         host = card.querySelector('div.flex-shrink.min-w-0.truncate')?.innerText.trim().replace(/^by\s/, '') || 'N/A';
        
//         const timeAndLocationText = card.querySelector('time')?.closest('.flex.items-center')?.innerText || '';
//         const parts = timeAndLocationText.split('•').map(s => s.trim());
//         time = parts[0] || 'N/A';
//         location = parts[1] || 'N/A';


//         idMatch = url.match(/events\/(\d+)\//);

//         // The actual ID is in the first capturing group (index 1 of the result array)
//         eventId = idMatch ? idMatch[1] : "Not Found";

//         id = eventId;

//       } else {
//         // --- Logic for the OLD Layout ---
//         id = card.getAttribute('data-event-id') || 'N/A';
//         url_grabbed = card.href || 'N/A';
//         name = card.querySelector('h3')?.innerText.trim() || 'N/A';
//         host = card.querySelector('div.truncate')?.innerText.trim().replace(/^by\s/, '') || 'N/A';
        
//         const timeAndLocationText = card.querySelector('time')?.parentElement?.innerText || '';
//         const parts = timeAndLocationText.split('•').map(s => s.trim());
//         time = parts[0] || 'N/A';
//         location = parts[1] || 'N/A';
//       }


          

//       return { id, name, time, location, host, url_grabbed };
//     });
//   });
// }

/**
 * Converts an array of objects to a CSV string and saves it to a file.
 * @param {Array<object>} data - The array of event data.
 * @param {string} filePath - The path to the output CSV file.
 *//**
 * Saves data to a CSV file, appending if the file already exists.
 * @param {Array<object>} data - The array of event data.
 * @param {string} filePath - The path to the output CSV file.
 */
function saveAsCSV(data, filePath) {
  if (data.length === 0) {
    console.log("No new data to save.");
    return;
  }

  // 1. Check if the file already exists
  const fileExists = fs.existsSync(filePath);

  // 2. Convert the new data objects to CSV rows
  const headers = Object.keys(data[0]);
  const rows = data.map(obj => 
    headers.map(header => `"${obj[header]}"`).join(',')
  );

  let csvContent = '';

  // 3. If the file doesn't exist, create the header row
  if (!fileExists) {
    csvContent += headers.join(',') + '\n';
    console.log("Creating new CSV file with headers.");
  }

  // 4. Add the new rows to the content
  csvContent += rows.join('\n');

  // 5. Use appendFileSync to add the content to the file
  // This will create the file if it doesn't exist, or add to it if it does.
  // We add a newline character at the beginning for subsequent appends.
  fs.appendFileSync(filePath, (fileExists ? '\n' : '') + csvContent);
  
  console.log(`Successfully appended ${data.length} new events to ${filePath}`);
}



//  int main lmao
(async () => {
  const browser = await puppeteer.launch({
    headless: false,              // use false if you want to show the browser 
    defaultViewport: null,        // use a real window size
    args: ["--start-maximized"],
    // args: [
    //   "--no-sandbox",
    //   "--disable-setuid-sandbox",
    //   "--disable-features=Translate,site-per-process",
    //   "--disable-dev-shm-usage"
    // ]
  });

  const page = await browser.newPage();
  
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
  );
  // use wide viewporta
  
  //await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 1 });

    for (let index = 0; index <= categories.length; index++) 
    {
        //`${BASE}${chapter_number}${SUFFIX}
        const category_id = categories[index];
        const url = `https://www.meetup.com/find/?location=us--ny--new-york&categoryId=${category_id}405&source=EVENTS`;
        //console.log(`\n=== Chapter ${chapter_number} ===`);
        console.log("Navigating:", url);

        await page.goto(url, { waitUntil: "domcontentloaded" });
        
        // tiny nudge
        await page.mouse.wheel({ deltaY: 1200 });
        // ensure something image-like exists
        await page.waitForSelector('img, [data-src], [data-original]', { timeout: 15000 });
        //await sleep(2000);
        await sweepDown(page, 900, 250); 

        await settleAtBottom(page, 500, 10, 200);
       // const outDir = path.join(__dirname, `chapter_${chapter_number}_nodeshots`);

       sleep(10)


       console.log("Extracting event data...");
        const events = await extractEventData(page);
        console.log(`Found ${events.length} events.`);

        if (events.length > 0) {
            saveAsCSV(events, 'meetup_events.csv');
        }
        // --- END OF NEW PART ---

       



        // ensureDir(outDir);
        // const count = await capturePanelsAsNodeScreenshots(page, outDir, {
        //     minW: 300,      // tweak if it grabs small UI bits aka things went to shit
        //     minH: 300
        //   });
        //   console.log(`Captured ${count} node screenshots to: ${outDir}`);

    }

  console.log("\nAll done.");
    
})();
