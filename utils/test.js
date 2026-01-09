const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587, // or 587 if not using SSL
  secure: false,
  auth: {
    user: "dealer@gautamsolar.com", // your Gmail
    // pass:"khzu qpnx nmgy fftv"    // app password from Gmail settings
    pass: "ekwp yrod zyzz uzos", // app password from Gmail settings
  },
});

const sendMail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: `"IT Team" <mail>`,
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Mail error:", error);
    return { success: false, error };
  }
};

(async () => {
  const isMailing = await sendMail({
    to: "udamandi82@gmail.com",
    subject: "Your Dealer Portal Login Credentials",
    html: `
        <!DOCTYPE html>
    <html lang="en">
      <body style="margin:0; padding:0; background:#fafafa; font-family:Arial, sans-serif;">
        <div style="max-width:480px; margin:40px auto; background:#ffffff; border-radius:8px; padding:28px;">
          <h2 style="margin:0 0 10px; color:#111; font-size:20px; text-align:center;">
            Dealer Account Created
          </h2>

          <p style="margin:0 0 20px; font-size:14px; color:#444; line-height:1.6;">
            Your account has been successfully created on the
            <strong>Gautam Solar Dealer Portal</strong>. Please use the
            credentials below to log in.
          </p>

          <div style="background:#f6f6f6; padding:16px; border-radius:6px; font-size:14px; color:#333;">
            <p style="margin:0 0 8px;">
              <strong>Email:</strong> ${'asdf'}
            </p>
            <p style="margin:0;">
              <strong>Password:</strong> ${'stPass'}
            </p>
          </div>

          <div style="text-align:center; margin:25px 0;">
            <a
              href="https://dealer.gautamsolar.com"
              target="_blank"
              style="background:#a20000; color:#fff; font-weight:bold; text-decoration:none;
                padding:12px 26px; border-radius:6px; font-size:14px; display:inline-block;"
            >
              Login to Dealer Portal
            </a>
          </div>

          <p style="font-size:12px; color:#666; line-height:1.5; text-align:center;">
            For security reasons, please change your password after logging in.
          </p>

          <hr style="border:none; border-top:1px solid #eee; margin:25px 0;" />

          <p style="text-align:center; font-size:11px; color:#999; margin:0;">
            © ${new Date().getFullYear()} Gautam Solar. All rights reserved.
          </p>
        </div>
      </body>
    </html>;
    `,
  });

  if (isMailing.success) {
    console.log("Email working properly.");
  } else {
    console.log("Email not working properly.");
    console.log({ err: isMailing.error });
  }
})();
