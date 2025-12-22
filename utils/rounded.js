const {rgb}= require("pdf-lib");

 function rounded(page, x, y, width, height, radius, color) {
    page.drawRectangle({
        x: x + radius,
        y,
        width: width - radius * 2,
        height,
        color,
    });

    page.drawRectangle({
        x,
        y: y + radius,
        width: radius,
        height: height - radius * 2,
        color,
    });

    page.drawRectangle({
        x: x + width - radius,
        y: y + radius,
        width: radius,
        height: height - radius * 2,
        color,
    });

    page.drawCircle({ x: x + radius, y: y + radius, size: radius, color });
    page.drawCircle({ x: x + width - radius, y: y + radius, size: radius, color });
    page.drawCircle({ x: x + radius, y: y + height - radius, size: radius, color });
    page.drawCircle({ x: x + width - radius, y: y + height - radius, size: radius, color });
}


module.exports={rounded}