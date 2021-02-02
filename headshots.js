const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const cdnUrl1 = 'https://cdn.nba.com/headshots/nba/latest/260x190/';
const cdnUrl2 = 'https://cdn.nba.com/headshots/nba/latest/1040x760/';
 
async function getHeadshots() {
    const browser = await puppeteer.launch({
        headless: true
    });
    const page = await browser.newPage();
    await page.goto('https://www.nba.com/players');
    await page.select(`select[title|='Page Number Selection Drown Down List']`, '-1');

    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = cheerio.load(html);
    const table = $('.players-list');
    const linksData = [];
    table.find('tbody > tr').each((i, element) => {
        const $element = $(element);
        const hrefData = $element.find('td > a').attr('href');
        const parts = hrefData.split('/');
        const id = parts[2];
        const name = parts[3];
        const data = {
            id: id,
            name: name
        }
        linksData.push(data);
    });
    
    await browser.close();

    return linksData;
}

async function downloadHeadshots(url) {
    const headshots = await getHeadshots();
    for(const headshot of headshots) {
        const newUrl = url + String(headshot.id + '.png');
        let Path;
        if(url.includes("260x190")) {
            Path = path.resolve(__dirname, 'public/images/headshots/260x190', `${headshot.name}.png`);
        } else if (url.includes("1040x760")) {
            Path = path.resolve(__dirname, 'public/images/headshots/1040x760', `${headshot.name}.png`);
        }

        const writer = fs.createWriteStream(Path);

        try {
            const response = await axios({
                url: newUrl,
                method: 'GET',
                responseType: 'stream'
            });
            response.data.pipe(writer);
        } catch (error) {
            console.error(error.response.status);
            console.log(headshot.id + ": " + headshot.name);
            continue;
        }

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    }
    
}

downloadHeadshots(cdnUrl2);