const nodemailer= require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,               // or 587 if not using SSL
  secure: false,
  auth: {
  
    user:"dealer@gautamsolar.com",      // your Gmail
    // pass:"khzu qpnx nmgy fftv"    // app password from Gmail settings
    pass:"ekwp yrod zyzz uzos"    // app password from Gmail settings
  }
});

const sendMail = async ({ to, subject, html }) => {
    const mailOptions = {
      from: `"IT Team" <mail>`,
      to,
      subject,
      html
    };
  
    try {
      await transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.error("Mail error:", error);
      return { success: false, error };
    }
};

(async()=>{
    const isMailing = await sendMail({
        to:"solarsubhranshu@gmail.com",
        subject:"Automated mail testing",
        html:`
        <h3>This is a test mail ✅</h3>
        <p>If you are seeing this mail then it means the service is working properly.</p>
        `
    });

    if(isMailing.success){
        console.log("Email working properly.");
    }
    else{
        console.log("Email not working properly.");
        console.log({err:isMailing.error})
    }
})()