// import { rgb } from "pdf-lib";
// import { rounded } from "./rounded.js";

const { rgb } = require("pdf-lib");
const { rounded } = require("./rounded");
const { toCaps } = require("../cache/cap");

 function drawCustomerInfo({
  page,
  customer,
  font,
  startX = 60,
  startY = 255,
  boxHeight = 110,
  fontSize = 15,
  lineGap = 20,
}) {
  // rounded(
  //   page,
  //   startX,
  //   startY,
  //   boxWidth,
  //   boxHeight,
  //   radius,
  //   rgb(0.95, 0.95, 0.95)
  // );

  let textX = startX + 10;
  let textY = startY + boxHeight - 25;

  const fields = [
    ["Name", customer?.name],
    ["Mobile", customer?.mobile],
    ["Email", customer?.email],
    ["Ordered Capacity", customer?.capacity],
  ];

  fields.forEach(([label, value]) => {
    if (!value) return;

    page.drawText(`${label}: ${toCaps(value)}`, {
      x: textX,
      y: textY,
      size: fontSize,
      font,
      color: rgb(0, 0, 0),
    });

    textY -= lineGap;
  });

  return textY;
}


 module.exports ={drawCustomerInfo}