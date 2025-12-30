// import { rgb } from "pdf-lib";
// import { rgb } from "pdf-lib";
// import { wrapText } from "./wraptext.js";

const { wrapText } = require("./wraptext");
const { rgb } = require("pdf-lib");
const path = require("path");
const sharp = require("sharp");
const fs = require("fs");
const { toCaps } = require("../cache/cap");

async function drawCompanyInfo({
  pdfDoc,
  page,
  apiData = {},
  font,
  normalFont,
  logo,
  fontSize = 12,
  maxWidth = 260,
}) {
  let imgUrl = logo;

  let y = 850;
  const x = 390;

  sharp.cache(false);

  // const imagePath = path.join(
  //   // process.cwd(),
  //   imgUrl.replace("https://gautamsolar.us", "")
  // );

  imgUrl = imgUrl.replace("dealer_logo", "Dealer_Logo");

  let imagePath = path.join(
    process.cwd(),
    imgUrl.replace("https://gautamsolar.us", "")
    // imgUrl.replace("http://localhost:1008", "")
  );


  // read + convert
  const pngBytes = await sharp(fs.readFileSync(imagePath)).png().toBuffer();

  const logoImage = await pdfDoc.embedPng(pngBytes);

  const logoDims = logoImage.scale(1); // original width & height
  const MAX_LOGO_WIDTH = 220;
  const MAX_LOGO_HEIGHT = 110;
  const scale = Math.min(
    MAX_LOGO_WIDTH / logoDims.width,
    MAX_LOGO_HEIGHT / logoDims.height
  );

  const logoWidth = logoDims.width * scale;
  const logoHeight = logoDims.height * scale;
  const pageHeight = page.getHeight();

  const logoX = 40;
  const logoY = pageHeight - logoHeight - 40;

  // page.drawImage(logoImage, {
  //   x: 40,
  //   y: 780,
  //   width: 200,
  //   height: 60,
  // });

  page.drawImage(logoImage, {
    x: logoX,
    y: logoY,
    width: logoWidth,
    height: logoHeight,
  });

  page.drawText(toCaps(apiData.company.name), {
    x,
    y,
    size: 16,
    font,
    color: rgb(0, 0, 0),
  });

  y -= 22;

  const addressLines = wrapText(
    toCaps(apiData.company.address),
    normalFont,
    fontSize,
    maxWidth
  );

  for (const line of addressLines) {
    page.drawText(line, { x, y, size: fontSize, font: normalFont });
    y -= 16;
  }

  if (apiData.company.phone) {
    page.drawText(toCaps(apiData.company.phone), {
      x,
      y,
      size: fontSize,
      font: normalFont,
    });
    y -= 16;
  }

  if (apiData.company.email) {
    page.drawText(apiData.company.email, {
      x,
      y,
      size: fontSize,
      font: normalFont,
    });
  }
}

module.exports = { drawCompanyInfo };
