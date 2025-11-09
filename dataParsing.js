import dotenv from "dotenv";
import puppeteer from "puppeteer";
import fs from "fs";

dotenv.config();

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: false,
  });
  const page = await browser.newPage();

  await page.goto(process.env.WEBSITE);

  const result = await page.evaluate(() => {
    const mainRows = document.querySelectorAll(".athing");
    const data = [];

    mainRows.forEach((row) => {
      // selecting all elements inside the mainRow we need to
      const elementForLink = row.querySelector(".titleline a");
      const elementForSublink = row.querySelector(".titleline .sitebit a span");
      const nextRow = row.nextElementSibling;
      const elementForAuthor = nextRow.querySelector(".hnuser");
      const elementForCommentAmount = nextRow.querySelector(
        "td.subtext > span > a:nth-child(6)"
      );

      // taking all values from that selectors
      const href = elementForLink?.href;
      const sublink = elementForSublink?.textContent;
      const author = elementForAuthor?.textContent;
      const comment = elementForCommentAmount?.innerHTML;

      // taking the first index of splited comments element and parsing it to an integer
      const commentAmount = parseInt(comment?.split("&nbsp;")[0]);

      data.push({
        link: href,
        author: author,
        comment: commentAmount,
        isVideo: sublink?.includes("youtube.come") ? true : false,
      });
    });
    return data;
  });

  // saving the result in json file
  fs.writeFile("data.json", JSON.stringify(result, null, 2), "utf-8", (error) => {
    if(error) return error;
    else console.log("File created successfully");
  });
  
  await browser.close();
})();
