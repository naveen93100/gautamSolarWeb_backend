 const {StandardFonts}= require("pdf-lib")

let cachedFonts = null;

 async function getFonts(pdfDoc) {
  if (cachedFonts) return cachedFonts;

  cachedFonts = {
    normal: await pdfDoc.embedFont(StandardFonts.Helvetica),
    bold: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
  };

  return cachedFonts;
}


module.exports={getFonts}