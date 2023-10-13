const express = require('express');
const app = express();
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const port = 3001;
const cors = require('cors');

app.use(cors());
app.use(express.json());

const url = "https://wsa-test.vercel.app/";

app.get('', async (req, res) => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 });
    const content = await page.content();
    const $ = cheerio.load(content);
    const jsonData = [];

    $('a > span').each((index, element) => {
      const titleDiv = $(element).parent('a');
      if (titleDiv) {
        const title = titleDiv.text().trim();
        const parentDiv = titleDiv.parent().parent();
        const siblingDiv = parentDiv.find('div').eq(1);
        const short_description = siblingDiv.text().trim();

        let sentiment = "";
        const description = short_description.toLowerCase();

        if (description.includes("coping") || description.includes("critic")) {
          sentiment = "negative";
        } else if (description.includes("unbias") || description.includes("opinion")) {
          sentiment = "neutral";
        } else if (description.includes("joyful") || description.includes("positive")) {
          sentiment = "positive";
        }
        jsonData.push({ title, short_description, sentiment });
      }
    });

    async function getWordCountOnSite(href) {
      const newPage = await browser.newPage();
      try {
        await newPage.goto(href, { waitUntil: 'domcontentloaded'});
        await newPage.waitForSelector('body');
        const siteContent = await newPage.content();
        const wordCount = siteContent.split(/\s+/).length;
        return wordCount;
      } catch (error) {
        console.error("Error counting words on site:", error);
        return 0;
      } finally {
        await newPage.close();
      }
    }

    await Promise.all(
      $('a > img').map(async (index, element) => {
        const img = $(element);
        if (img) {
          const src = `https://wsa-test.vercel.app${img.attr('src')}`;
          const imageHref = img.closest('a');
          if (imageHref) {
            const href = `https://wsa-test.vercel.app${imageHref.attr('href')}`;
            imageHref.attr('href', href);
            const wordCount = await getWordCountOnSite(href);
            jsonData[index].image = src;
            jsonData[index].href = href;
            jsonData[index].words = wordCount;
          }
        }
      }).get()
    );

    $('time').each((index, element) => {
      const time = $(element).attr('datetime');
      const parentDiv = $(element).parent();

      const siblingDivs = parentDiv.find('div');
      let area = '';

      siblingDivs.each((index, sibling) => {
        if ($(sibling).text().trim().length > 0) {
          area = $(sibling).text().trim();
        }
      });

      jsonData[index].area = area;
      jsonData[index].time = time;
    });

    const filteredjsonData = jsonData.filter(item => item.title);

    res.json(filteredjsonData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching data' });
  } finally {
    await browser.close();
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
