// index.js
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import csv from 'csv-parser';
import axios from 'axios';
//import {URL} from 'url';

//import './findEvents.js';

const csvFilePath = './meetup_events.csv';
const filePath = './events.csv';
const masterCsvPath = './master_events.csv';
const results = [];

// future plan: debug map api system to give location link:

const URL = "https://www.meetup.com/find/?location=us--ny--new-york&categoryId=405&source=EVENTS"; // basically  which url we want to scrape from, I figure we set 2 main ones  

const categories = [405, 436, 546, 652]
//https://www.meetup.com/find/?location=us--ny--new-york&categoryId=652&source=EVENTS

//import { fileURLToPath } from "url";
import { time } from "console";
import { setSourceMapsSupport } from "module";


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
  await page.setViewport({ width: 1920, height: 1080 });
//   await page.setViewport({
//   width: 430,
//   height: 932,
//   isMobile: true,
//   hasTouch: true
// });
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
  );
  // use wide viewporta
  
  //await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 1 });
    const get_new_events = false;
    const analysis_events = true;

    // this downloads th base event IDs and information neccesssary to build the proper schemas for the mongo DB
    if(get_new_events)
    {
        for (let index = 0; index <= categories.length; index++) 
        {
            //`${BASE}${chapter_number}${SUFFIX}
            const category_id = categories[index];
            const url = `https://www.meetup.com/find/?location=us--ny--new-york&categoryId=${category_id}&source=EVENTS`;
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
            
        }
    }



  
    // this is where we start grabbing more information per event, including tags etc.
    // now that it is done, we can start rebuilding the full schema
    // have it go to the new link to grab more base information, including tags etc

    if(analysis_events)
    {
        const masterTags = new Set(); // Use a Set to automatically handle unique tags
        const errorIds = new Set();
        const existingIds = await getExistingIds(masterCsvPath);

        try 
        {
            await processCsvFile(csvFilePath, page, masterTags, existingIds, errorIds);
        } catch (error) {
            console.error("An error occurred:", error);
        } finally {
            //await browser.close();
            console.log('\n--- All events processed. Browser closed. ---');
            
            // Convert the Set to an array and print the master list of unique tags
            const uniqueTagList = Array.from(masterTags).sort();
            console.log(`\nMaster Tag List (${uniqueTagList.length} unique tags):`);
            console.log(uniqueTagList);

            // Save the collected unique tags to a separate CSV file.
            saveTagsToCsv(masterTags);

            console.log("Error IDs");
            console.log(errorIds);
        }
    }

    const masterTagList = await generateTagsFromMasterCsv(masterCsvPath);

    if (masterTagList.length > 0) {
        console.log(`\n--- Master Tag List (${masterTagList.length} unique tags) ---`);
        console.log(masterTagList);
        
        // Optionally, save this list to a new, clean CSV
        const tagCsvContent = 'tag\n' + masterTagList.join('\n');
        fs.writeFileSync('./unique_tags.csv', tagCsvContent);
        console.log('\nSaved unique tags to unique_tags.csv');
    } else {
        console.log('No tags found in the master CSV file.');
    }



    //await browser.close();

  console.log("\nAll done.");
    
})();


function generateTagsFromMasterCsv(filePath) {
  const uniqueTags = new Set();

  return new Promise((resolve, reject) => {
    // Check if the master file exists first
    if (!fs.existsSync(filePath)) {
      console.error(`Error: Master CSV file not found at ${filePath}`);
      return resolve([]); // Return an empty array if no file
    }

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        // Check if the 'tags' column exists and is not empty
        if (row.tags && row.tags.trim() !== '') {
          // The tags are stored as a " | " separated string, so we split them back into an array
          const tagsArray = row.tags.split(' | ');
          
          // Add each individual tag to our Set to handle uniqueness
          tagsArray.forEach(tag => {
            const cleanedTag = tag.trim();
            if (cleanedTag) { // Ensure we don't add empty strings
              uniqueTags.add(cleanedTag);
            }
          });
        }
      })
      .on('end', () => {
        // Convert the Set to an array and sort it alphabetically
        const sortedTagList = Array.from(uniqueTags).sort();
        resolve(sortedTagList);
      })
      .on('error', reject);
  });
}



/**
 * Reads a CSV file and returns a Set of all IDs found in the 'id' column.
 * @param {string} filePath The path to the CSV file.
 * @returns {Promise<Set<string>>} A Set containing the existing event IDs.
 */
function getExistingIds(filePath) {
  const existingIds = new Set();
  return new Promise((resolve, reject) => {
    // If the file doesn't exist, return an empty set.
    if (!fs.existsSync(filePath)) {
      return resolve(existingIds);
    }
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        if (row.id) {
          existingIds.add(row.id);
        }
      })
      .on('end', () => {
        console.log(`Found ${existingIds.size} existing event IDs in the master CSV.`);
        resolve(existingIds);
      })
      .on('error', reject);
  });
}

/**
 * Saves a Set of unique tags to a one-column CSV file.
 * @param {Set<string>} tagsSet The Set containing all unique tags.
 */
function saveTagsToCsv(tagsSet) {
  const filePath = './tags.csv';
  
  // Convert the Set to a sorted array for consistent output
  const sortedTags = Array.from(tagsSet).sort();
  
  // Create the CSV content with a header row
  const csvHeader = 'tag\n';
  const csvRows = sortedTags.join('\n');
  const csvContent = csvHeader + csvRows;

  fs.writeFileSync(filePath, csvContent);
  console.log(`\nMaster list of ${sortedTags.length} unique tags saved to: ${filePath}`);
}



/**
 * Downloads an image from a URL and saves it locally.
 * @param {string} imageUrl The URL of the image to download.
 * @param {string} eventId The ID of the event, used for the filename.
 * @returns {Promise<string|null>} The local file path of the saved image, or null on failure.
 */
async function downloadImage(imageUrl, eventId) {
  if (!imageUrl || imageUrl.toLowerCase().includes('not found') || !eventId) {
    console.log('Skipping download: Invalid image URL or event ID provided.');
    return null;
  }

  const dirPath = path.join(process.cwd(), 'Meetup', 'NYC', 'Event_Flyers');
  fs.mkdirSync(dirPath, { recursive: true });

  try {
    const response = await axios({
      url: imageUrl,
      method: 'GET',
      responseType: 'stream'
    });

    // **NEW LOGIC**: Determine the extension from the response header
    const contentType = response.headers['content-type'];
    let extension = '';
    if (contentType) {
      if (contentType.includes('avif')) extension = '.avif';
      else if (contentType.includes('webp')) extension = '.webp';
      else if (contentType.includes('jpeg')) extension = '.jpg';
      else if (contentType.includes('png')) extension = '.png';
      else if (contentType.includes('gif')) extension = '.gif';
    }
    
    // If we couldn't determine the type, fall back to the URL's extension
    if (!extension) {
      console.log("Could not determine Content-Type, falling back to URL extension.");
      extension = path.extname(new URL(imageUrl).pathname);
    }

    const filePath = path.join(dirPath, `${eventId}${extension}`);
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        //console.log(`Successfully saved image to: ${filePath}`);
        resolve(filePath);
      });
      writer.on('error', (err) => {
        console.error('Error writing image file.', err);
        reject(null);
      });
    });
  } catch (error) {
    console.error(`Failed to download image from ${imageUrl}: ${error.message}`);
    return null;
  }
}

async function processCsvFile(filePath, page, masterTags, existingIds, errorIds) {
  const rows = [];
  await new Promise((resolve, reject) => {
    fs.createReadStream(filePath).pipe(csv())
      .on('data', (row) => rows.push(row))
      .on('end', resolve)
      .on('error', reject);
  });

  for (const row of rows)   
  {
    try{

            if (!row || !row.url) {
            console.warn('Skipping a malformed or empty row in the CSV:', row);
            continue; // Jumps to the next row in the loop
            }
            
            // If the Set of existing IDs already has this row's ID, skip it.
            if (existingIds.has(row.id)) {
            console.log(`Skipping event ID: ${row.id} (already processed).`);
            continue; // Jumps to the next row in the loop
            }

            const url = row.url;
            const match = url.match(/^(.*\/events\/\d+\/)/);
            const cleaned_url = match ? match[0] : url;
            console.log(cleaned_url);

            console.log(`\nProcessing event ID: ${row.id}`);
            await page.goto(cleaned_url, { waitUntil: 'domcontentloaded' });
            
            const scrapedData = await scrapeEventDetails(page);
            scrapedData.cleaned_url = cleaned_url; // Add the cleaned URL to the object

            // do image downlaod
            const localImagePath = await downloadImage(scrapedData.imageUrl, row.id);

            // You can now add the local path to your final data object
            if (localImagePath) {
                scrapedData.localImagePath = localImagePath;
            }

            // --- Perform the 3 tasks for each event ---
            // 1. Save full details to a text file
            saveDetailsAsTxt(row.id, scrapedData.details);
            

            // 2. Append the main data to the master CSV
            appendToMasterCsv(scrapedData, row);

            // 3. Add the event's tags to our master list 🏷️
            if (scrapedData.tags && scrapedData.tags.length > 0) {
            scrapedData.tags.forEach(tag => masterTags.add(tag));
            }
    }
    catch(error)
    {
        console.error(`Error on ${row.id}`)
        errorIds.add(row.id);
        

    }
  }
}


// --- Helper Function 1: Save details to a .txt file 📝 ---
function saveDetailsAsTxt(eventId, details) {

    //console.log("details saving?");
  if (!eventId || !details || details === 'Details not found') return;

  const dirPath = path.join(process.cwd(), 'Meetup', 'NYC', 'event_details');
  fs.mkdirSync(dirPath, { recursive: true });
  const filePath = path.join(dirPath, `${eventId}.txt`);
  
  fs.writeFileSync(filePath, details);
  //console.log(`Saved details for event ${eventId} to ${filePath}`);
}


//
//
//
// --- Helper Function 2: Append structured data to the master CSV 📊 ---
function appendToMasterCsv(data, row) {
  const filePath = './master_events.csv';
  const headers = ['id', 'name', 'time', 'host','venue', 'address', 'cleaned_url', 'image_url', 'map_url', 'tags'];
  
    const id = row.id;
    const name = row.name;
    const time = row.time;
    //const location = row.location;
    const host = row.host;
    const url = row.url;

    // parse out trackers
    const match = url.match(/^(.*\/events\/\d+\/)/)
    const cleaned_url = match ? match[0] : url;


  // Flatten the location object and format the tags array for the CSV
  const location = data.location || {};
  const rowData = {
    id: id,
    name: name,
    time: time,
    host: host,
    venue: location.venue,
    address: location.address,
    cleaned_url: data.cleaned_url,
    image_url: data.imageUrl,
    map_url: data.mapUrl,
    tags: data.tags.join(' | ') // Join tags with a pipe separator
  };

  const csvLine = headers.map(header => `"${rowData[header]}"`).join(',') + '\n';

  if (!fs.existsSync(filePath)) {
    // If file doesn't exist, write the header first
    fs.writeFileSync(filePath, headers.join(',') + '\n');
  }

  fs.appendFileSync(filePath, csvLine);
  //console.log(`Appended data for event ${data.id} to ${filePath}`);
  
  console.log(`Appended data for event ${row.id}\n\n`);
}



/**
 * FINAL ADAPTIVE SCRAPER: Detects the page layout and uses the correct selectors.
 * @param {object} page - The Puppeteer page object.
 * @returns {Promise<object>} - An object containing the scraped data.
 */
// this one works entirely on layout A, minus the mapURL system. which can be figured out later
async function scrapeEventDetails(page) {
  const eventData = await page.evaluate(() => {
    // --- Default values ---
    let details = 'Details not found';
    let tags = [];
    let imageUrl = 'Image not found';
    let mapUrl = 'Map link not found';

    // --- 1. Layout Detection ---
    // The presence of '#event-details' is our key to identifying the older layout (Layout A).
    const isLayoutA = document.querySelector('#event-details') !== null;
    

    // --- 2. Scrape Based on Detected Layout ---
    if (isLayoutA) {
      // --- LAYOUT A LOGIC ---
      details = document.querySelector('#event-details')?.innerText || 'Details not found';
      
      // Use the new selector you found for Layout A's tags
      const tagElements = document.querySelectorAll('a.tag--topic');
      tags = Array.from(tagElements).map(el => el.innerText.trim());

    } else {
      // --- LAYOUT B LOGIC ---
      //details = document.querySelector('[data-testid="event-details"]')?.innerText || 'Details not found';
      ///details = document.querySelector('[data-testid="event-details"]')?.innerText || 'Details not found';
      details = document.querySelector('div[class*="line-clamp"]')?.innerText || 'Details not found';
      
      
      // Use the selector for Layout B's tags
      const tagsContainer = document.querySelector('div.flex.flex-wrap.gap-ds2-8');
      if (tagsContainer) {
      const tagElements = tagsContainer.querySelectorAll('span.truncate.px-ds2-2');
      tags = Array.from(tagElements).map(el => el.innerText.trim());
      }
    
      //details = "b";
      //tags = "b";
    }

    // --- 3. Scrape Common Elements (Image and Map) ---
    // This image logic works for both layouts
    const titleElement = document.querySelector('h1');
    if (titleElement) {
      const titleText = titleElement.innerText.trim();
      const escapedTitleText = titleText.replace(/"/g, '\\"');
      const imageSelector = `img[alt="${escapedTitleText}"]`;
      const imageElement = document.querySelector(imageSelector);
      if (imageElement) {
        imageUrl = imageElement.src;
      }
    }
    
    // This map logic is generic enough to try on both
    const mapElement = document.querySelector('a[href*="maps.google.com"]');
    if (mapElement) {
      mapUrl = mapElement.href;
    }

    return {
      details,
      tags,
      imageUrl,
      mapUrl,
    };
  });

  return eventData;
}



async function debugDetailsContainer(page) {
  const containerHTML = await page.evaluate(() => {
    // 1. Find the first paragraph of the event details.
    // We search within '#main' to be more specific.
    const firstParagraph = document.querySelector('#main p.mb-4');

    if (firstParagraph) {
      // 2. Get its direct parent element and return the parent's full HTML.
      return firstParagraph.parentElement.outerHTML;
    }

    return 'Could not find a <p class="mb-4"> tag inside the #main container.';
  });
  return containerHTML;
}

async function debugMapInteraction(page) {
  // --- Part 1: Get the HTML around the button ---
  const buttonContainerHTML = await page.evaluate(() => {
    // Find the button by looking for its unique SVG icon inside
    const button = document.querySelector('svg path[d^="M13.083"]').closest('button');
    return button ? button.parentElement.outerHTML : 'Could not find button container.';
  });
  
  console.log('\n--- HTML of the Button Container ---');
  console.log(buttonContainerHTML);
  console.log('------------------------------------\n');

  // --- Part 2: Click the button and get the page's new HTML ---
  try {
    const buttonSelector = 'svg path[d^="M13.083"]';
    await page.click(buttonSelector);
    console.log('Successfully clicked the directions button.');
    
    // Wait for a moment for the map/modal to appear
    await new Promise(r => setTimeout(r, 2000)); 

    const pageHtmlAfterClick = await page.content();
    console.log('\n--- Full Page HTML After Click ---');
    console.log(pageHtmlAfterClick);
    console.log('----------------------------------\n');

  } catch (error) {
    console.log('Could not click the button. The selector may be incorrect or element not visible.');
  }
}
















/// done stuff

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



// 
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

/**
 * A debugging function to get the HTML of the header area.
 * @param {object} page - The Puppeteer page object.
 * @returns {Promise<string>} - The outerHTML of the title's parent container.
 */
async function debugHeaderArea(page) {
  const headerHTML = await page.evaluate(() => {
    // 1. Find the most reliable landmark: the main title.
    const titleElement = document.querySelector('h1');

    if (titleElement) {
      // 2. Get its direct parent element and return the parent's full HTML.
      return titleElement.parentElement.outerHTML;
    }

    return 'Could not find the <h1> title element.';
  });
  return headerHTML;
}




// unused stuff


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