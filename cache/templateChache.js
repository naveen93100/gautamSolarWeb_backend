const fs = require("fs");
const path = require("path");

const templatePdfBytes = fs.readFileSync(
  path.join(process.cwd(), "Proposal", "PDFProposal.pdf")
);

module.exports = { templatePdfBytes };
