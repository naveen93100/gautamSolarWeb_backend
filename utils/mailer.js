const nodemailer = require("nodemailer");

const dealerTransporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.DEALER_MAIL,
    pass: process.env.DEALER_PASS,
  },
});

module.exports=dealerTransporter;