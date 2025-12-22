const fs = require("fs");
const path = require("path");

const logoPath = path.join(process.cwd(), "assets", "logo.png");

const logoBytes = fs.readFileSync(logoPath);

module.exports = { logoBytes };
