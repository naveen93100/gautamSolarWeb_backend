const nodemailer = require("nodemailer");

const dealerTransporter = nodemailer.createTransport({
  service:'gmail',
  auth:{
    user:process.env.DEALER_MAIL,
    pass:process.env.DEALER_PASS
  }
});

module.exports=dealerTransporter;