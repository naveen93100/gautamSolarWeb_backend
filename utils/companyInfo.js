// import { rgb } from "pdf-lib";
// import { rgb } from "pdf-lib";
// import { wrapText } from "./wraptext.js";

const { wrapText } = require("./wraptext");
const { rgb } = require("pdf-lib");

 async function drawCompanyInfo({
  pdfDoc,
  page,
  apiData,
  font,
  normalFont,
  logoBytes,
  fontSize = 12,
  maxWidth = 260,
}) {
  let y = 870;
  const x = 350;

  const logoImage = await pdfDoc.embedPng(logoBytes);

  page.drawImage(logoImage, {
    x: 40,
    y: 780,
    width: 200,
    height: 60,
  });

  page.drawText(apiData.company.name, {
    x,
    y,
    size: 18,
    font,
    color: rgb(0, 0, 0),
  });

  y -= 22;

  const addressLines = wrapText(
    apiData.company.address,
    normalFont,
    fontSize,
    maxWidth
  );

  for (const line of addressLines) {
    page.drawText(line, { x, y, size: fontSize, font: normalFont });
    y -= 16;
  }

  if (apiData.company.phone) {
    page.drawText(apiData.company.phone, {
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


 module.exports ={drawCompanyInfo};