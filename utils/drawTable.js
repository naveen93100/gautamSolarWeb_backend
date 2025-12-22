
const { rgb } = require("pdf-lib");
const { wrapText } = require("./wraptext.js");
 function drawTable({
  page,
  startX,
  startY,
  columns,
  rows,
  font,
  fontBold,
  fontSize = 11,
  rowPadding = 6,
}) {
  let y = startY;

  let x = startX;
  for (const col of columns) {
    page.drawRectangle({
      x,
      y: y - 30,
      width: col.width,
      height: 30,
      color: rgb(0.8, 0, 0),
    });

    page.drawText(col.title, {
      x: x + 5,
      y: y - 20,
      size: 12,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    x += col.width;
  }
  y -= 30;
  
//    console.log("rows : ",rows)
  for (const row of rows) {
    const wrapped = row?.map((cell, i) =>
      wrapText(cell, font, fontSize, columns[i].width - 10)
    // console.log("row : ", row)
    );

    const rowHeight =
      Math.max(...wrapped.map(l => l.length)) * fontSize +
      rowPadding * 3;

    let cellX = startX;

    wrapped.forEach((lines, i) => {
      page.drawRectangle({
        x: cellX,
        y: y - rowHeight,
        width: columns[i].width,
        height: rowHeight,
        borderWidth: 1,
        borderColor: rgb(0, 0, 0),
      });

      let textY = y - fontSize - rowPadding;
      for (const line of lines) {
        page.drawText(line, {
          x: cellX + 5,
          y: textY,
          size: fontSize,
          font,
        });
        textY -= fontSize + 2;
      }

      cellX += columns[i].width;
    });

    y -= rowHeight;
  }

  return y;
}


 module.exports ={drawTable};
