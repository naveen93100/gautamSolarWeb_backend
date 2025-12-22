const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "gautamsolar.vidoes01@gmail.com",
    pass: "uyej onej uabb sxva",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

module.exports=transporter