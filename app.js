require("dotenv").config();

const express = require("express");
const rateLimiter = require("express-rate-limit");
const { connect } = require("./db.config");
const { UserRouter } = require("./Routes/admin.routes");
const MediaRouter = require("./Routes/media.routes.js");
const DealerRouter = require("./Routes/dealer.routes.js");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const cors = require("cors");
const url = require("url");
const cookieParser = require("cookie-parser");


const limiter = rateLimiter.rateLimit({
    windowMs: 2000, // 1 second
    limit: 10, // Limit each IP to 10 requests per second
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    ipv6Subnet: 56,
});

const app = express();
app.use(express.json());
app.use(cors({
  origin: true,
  credentials: true
}));
 app.set("trust proxy",1)
app.use(limiter);
app.use(bodyParser.json());
app.use(cookieParser());

function extractWebsiteName(domain) {
  const domainParts = domain.split(".");
  if (domainParts.length > 2) {
    domainParts.splice(0, domainParts.length - 2);
  }
  return domainParts.join(".");
}
const path = require("path");
const { GaloRouter } = require("./Routes/galo.routes");
const Supplier = require("./Models/Supplier.schema.js");
const multer = require("multer");
const { rejects } = require("assert");
const panelRouter = require("./Routes/Admin panel/adminPanel.routes.js");
// const seedData = require("./seed.js");

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use((req, res, next) => {
  const now = new Date();
  const istTime = new Date(now.getTime() + 5.5 * 60 * 60 * 1000) // Convert to IST
    .toISOString()
    .replace("T", " ") // Replace "T" with space for readability
    .replace("Z", " IST"); // Add "IST" at the end

  console.log(`[${istTime}] ${req.method} ${req.url}`);

  // -----------
  let reqUrl = req.query.utm_source || null;
  if (reqUrl !== null) {
    res.cookie("utm_source", reqUrl, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 2 * 60 * 1000,
    });
  }
  next();
});

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

app.use("/dealer_logo", express.static(path.join(__dirname, "Dealer_Logo")));

app.use('/proposal_images', express.static(path.join(__dirname, 'Proposal_Images')));

app.use("/media_image", express.static(path.join(__dirname, "Media")));

app.use(
  "/admin/blogImage",
  express.static(path.join(__dirname, "Blog_Images"))
);
app.use("/admin/blogVideo", express.static(path.join(__dirname, "Blog_Video")));

app.use(
  "/galo_admin/blogImage",
  express.static(path.join(__dirname, "Galo_Blog_Images"))
);
app.use(
  "/galo_admin/blogVideo",
  express.static(path.join(__dirname, "Galo_Blog_Video"))
);




// Nodemailer configuration for SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "gautamsolar.vidoes01@gmail.com",
    pass: "uyej onej uabb sxva",
    // pass: "cxmxypwbaupolgqo",
    // pass: "nwwghwyxmfmtwtlb",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// galo solar transporter
const transporter1 = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "galoenergy55@gmail.com",
    pass: "ugch ujzg dkyc rgjd",
  },
  tls: {
    rejectUnauthorized: false,
  },
});


app.post("/submit-contactus", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      companyName,
      businessType,
      remark,
      utm,
      city,
      isSupplier,
    } = req.body;

    const referrerUrl = req.headers.referer || "Unknown";
    const referrerDomain = url.parse(referrerUrl).hostname;
    const referrerWebsite = extractWebsiteName(referrerDomain);

    let Utm = JSON.parse(utm);
    let showUtmData =
      Utm?.utm_source && Utm?.utm_medium
        ? `${Utm?.utm_source}-${Utm?.utm_medium}`
        : "Direct";

    const checkboxValues = Object.keys(req.body).filter(
      (key) => req.body[key] === "Yes"
    );
    const checkboxList = checkboxValues
      .map((key) => `<li>${key}: Yes</li>`)
      .join("");

    let mail;

    if (isSupplier === "true") {
      let findSupplier = await Supplier.findOne({
        $or: [{ email }, { phoneNo: phone }],
      });

      if (findSupplier)
        return res.status(400).json({
          success: false,
          message: "Email or PhoneNumber exist! Please use different One",
        });

      await Supplier.create({
        supplierName: name,
        phoneNo: phone,
        companyName,
        email,
        businessType,
        remark,
      });

      mail = {
        from: "gautamsolar.vidoes01@gmail.com",
        to: "info@gautamsolar.com",
        subject: "Supplier Form Submission",
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
          <h2 style="color: #a20000;">Supplier Form Submission</h2>
          <p style="margin-bottom: 10px;"><strong>Name:</strong> ${name}</p>
          <p style="margin-bottom: 10px;"><strong>Email:</strong> ${email}</p>
          <p style="margin-bottom: 10px;"><strong>Phone:</strong> ${phone}</p>
          <p style="margin-bottom: 10px;"><strong>City:</strong> ${city}</p>
          <p style="margin-bottom: 10px;"><strong>Company:</strong> ${companyName}</p>
          <p style="margin-bottom: 10px;"><strong>BusinessType:</strong> ${businessType}</p>
          <p style="margin-bottom: 10px;"><strong>Remarks:</strong> ${remark}</p>
          <p style="margin-bottom: 10px;"><strong>UTM Source:</strong> ${showUtmData}</p>
        </div>
      `,
      };
    } else {
      mail = {
        from: "gautamsolar.vidoes01@gmail.com",
        to: "info@gautamsolar.com",
        subject: "New Contact Us Form Submission",
        html: `
      <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
      <h2 style="color: #a20000;">New Contact Us Form Submission</h2>
      <p style="margin-bottom: 10px;"><strong>Name:</strong> ${name}</p>
      <p style="margin-bottom: 10px;"><strong>Email:</strong> ${email}</p>
      <p style="margin-bottom: 10px;"><strong>Phone:</strong> ${phone}</p>
      <p style="margin-bottom: 10px;"><strong>City:</strong> ${city}</p>
      <p style="margin-bottom: 10px;"><strong>Remarks:</strong> ${remark}</p>
      <p style="margin-bottom: 10px;"><strong>MWp Requird:</strong></p>
      <ul style="list-style-type: none; padding: 0;">
        ${checkboxList}
      </ul>
      <p style="margin-bottom: 10px;"><strong>Source:</strong> ${referrerWebsite}</p>
      <p style="margin-bottom: 10px;"><strong>UTM Source:</strong> ${showUtmData}</p>
    </div>
      `,
      };
    }

    await transporter.sendMail(mail);

    res
      .status(200)
      .json({ success: true, message: "Form submitted successfully" });
  } catch (error) {
    console.error("Error submitting Contact Us form:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Endpoint for submitting the Contact Box form
app.post("/submit-contactbox", async (req, res) => {
  try {
    const formData = req.body;
    const referrerUrl = req.headers.referer || "Unknown"; // Get the referrer URL
    const referrerDomain = url.parse(referrerUrl).hostname; // Extract the domain name from the URL
    const referrerWebsite = extractWebsiteName(referrerDomain); // Extract the website

    let utm = JSON.parse(formData.utm);

    let showUtmData =
      utm?.utm_source && utm?.utm_medium
        ? `${utm?.utm_source}-${utm?.utm_medium}`
        : "Direct";

    const mailOptions = {
      from: "gautamsolar.vidoes01@gmail.com", // sender email
      to: "info@gautamsolar.com", // another destination email
      subject: "New Contact Box Form Submission",
      html: `
      <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
      <h2 style="color: #a20000;">Enquiry Box Form Submission</h2>
      <p style="margin-bottom: 10px;"><strong>Name:</strong> ${formData.name}</p>
      <p style="margin-bottom: 10px;"><strong>Email:</strong> ${formData.email}</p>
      <p style="margin-bottom: 10px;"><strong>Mobile No:</strong> ${formData.phone}</p>
      <p style="margin-bottom: 10px;"><strong>State:</strong> ${formData.state}</p>
      <p style="margin-bottom: 10px;"><strong>Willing to invest:</strong> ${formData.option}</p>
      <p style="margin-bottom: 10px;"><strong>Remarks:</strong> ${formData.message}</p>
      <p style="margin-bottom: 10px;"><strong>Source:</strong> ${referrerWebsite}</p>
        <p style="margin-bottom: 10px;"><strong>UTM Source:</strong> ${showUtmData}</p>
    </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res
      .status(200)
      .json({ success: true, message: "Form submitted successfully" });
  } catch (error) {
    console.error("Error submitting Contact Box form:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});
// end point for solar plant form
app.post("/submit-solarplant", async (req, res) => {
  try {
    const formData = req.body;
    const referrerUrl = req.headers.referer || "Unknown"; // Get the referrer URL
    const referrerDomain = url.parse(referrerUrl).hostname; // Extract the domain name from the URL
    const referrerWebsite = extractWebsiteName(referrerDomain); // Extract the website name from the domain name

    let utm = JSON.parse(formData.utm);
    let showUtmData =
      utm?.utm_source && utm?.utm_medium
        ? `${utm?.utm_source}-${utm?.utm_medium}`
        : "Direct";

    const mailOptions = {
      from: "gautamsolar.vidoes01@gmail.com", // sender email
      to: "info@gautamsolar.com", // another destination email
      subject: "solar plant Box Form Submission",
      html: `
      <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
      <h2 style="color: #a20000;">solar plant Box Form Submission</h2>
      <p style="margin-bottom: 10px;"><strong>Name:</strong> ${formData.name}</p>
      <p style="margin-bottom: 10px;"><strong>Email:</strong> ${formData.email}</p>
      <p style="margin-bottom: 10px;"><strong>Mobile No:</strong> ${formData.phone}</p>
      <p style="margin-bottom: 10px;"><strong>Company Name:</strong> ${formData.company}</p>
      <p style="margin-bottom: 10px;"><strong>Wants to put up:</strong> ${formData.option}</p>
      <p style="margin-bottom: 10px;"><strong>Project Size:</strong> ${formData.sizeoption}</p>
      <p style="margin-bottom: 10px;"><strong>Source:</strong> ${referrerWebsite}</p>
        <p style="margin-bottom: 10px;"><strong>UTM Source:</strong> ${showUtmData}</p>
    </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res
      .status(200)
      .json({ success: true, message: "Form submitted successfully" });
  } catch (error) {
    console.error("Error submitting Contact Box form:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.post("/submit-pmkusum", async (req, res) => {
  try {
    const formData = req.body;
    const referrerUrl = req.headers.referer || "Unknown"; // Get the referrer URL
    const referrerDomain = url.parse(referrerUrl).hostname; // Extract the domain name from the URL
    const referrerWebsite = extractWebsiteName(referrerDomain); // Extract the website name from the domain name

    let utm = JSON.parse(formData.utm);
    let showUtmData =
      utm?.utm_source && utm?.utm_medium
        ? `${utm?.utm_source}-${utm?.utm_medium}`
        : "Direct";

    const mailOptions = {
      from: "gautamsolar.vidoes01@gmail.com", // sender email
      to: "info@gautamsolar.com", // another destination email
      subject: "PM Kusum Yojna Form Submission",
      html: `
      <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
      <h2 style="color: #a20000;">solar plant Box Form Submission</h2>
      <p style="margin-bottom: 10px;"><strong>Name:</strong> ${formData.name}</p>
      <p style="margin-bottom: 10px;"><strong>Mobile No:</strong> ${formData.phone}</p>
      <p style="margin-bottom: 10px;"><strong>Company Name:</strong> ${formData.city}</p>
      <p style="margin-bottom: 10px;"><strong>Wants to put up:</strong> ${formData.projectSize}</p>
      <p style="margin-bottom: 10px;"><strong>Project Size:</strong> ${formData.selectedOption}</p>
      <p style="margin-bottom: 10px;"><strong>Source:</strong> ${referrerWebsite}</p>
        <p style="margin-bottom: 10px;"><strong>UTM Source:</strong> ${showUtmData}</p>
    </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res
      .status(200)
      .json({ success: true, message: "Form submitted successfully" });
  } catch (error) {
    console.error("Error submitting PM-Kusum Yojna Form:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Endpoint for submitting  galo
app.post("/submit-delhi", async (req, res) => {
  try {
    const formData = req.body;
    const referrerUrl = req.headers.referer || "Unknown"; // Get the referrer URL
    const referrerDomain = url.parse(referrerUrl).hostname; // Extract the domain name from the URL
    const referrerWebsite = extractWebsiteName(referrerDomain); // Extract the website name from the domain name

    // ... (Any additional validation or processing for Contact Box form data)
    // const utmSource =req.body.utm_source || req.query.utm_source || "Not provided";

    const mailOptions = {
      from: "galoenergy55@gmail.com", // sender email
      to: "info@galo.co.in", // another destination email
      subject: "Galo Form Submission",
      html: `
      <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
      <h2 style="color: #a20000;"> Galo Solar Form Submission</h2>
      <p style="margin-bottom: 10px;"><strong>Name:</strong> ${formData.Name}</p>
      <p style="margin-bottom: 10px;"><strong>Mobile No:</strong> ${formData.Phone}</p>
      <p style="margin-bottom: 10px;"><strong>Pin Code:</strong> ${formData.Pincode}</p>
      <p style="margin-bottom: 10px;"><strong>City:</strong> ${formData.City}</p>
      <p style="margin-bottom: 10px;"><strong>Solar For:</strong> ${formData.SolarFor}</p>
      <p style="margin-bottom: 10px;"><strong>State:</strong> ${formData.State}</p>
           <p style="margin-bottom: 10px;"><strong>Country:</strong> ${formData.Country}</p>
      <p style="margin-bottom: 10px;"><strong>Remark:</strong> ${formData.Remark}</p>
    </div>
      `,
    };

    await transporter1.sendMail(mailOptions);

    res
      .status(200)
      .json({ success: true, message: "Form submitted successfully" });
  } catch (error) {
    console.error("Error submitting Delhi Contact Form:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.get("/", (req, res) => {
  res.send({ msg: "Welcome Solar News App" });
});

app.use("/api/dealer", DealerRouter);

app.use("/admin", UserRouter);
app.use("/media", MediaRouter);

app.use("/galo_admin", GaloRouter);

app.use("/adminPanel", panelRouter)



app.listen(process.env.PORT, async () => {
  try {
    await connect;
    console.log(
      `App is running on PORT ${process.env.PORT}, ${process.env.MONGO_URI}`
    );
    // await seedData();
  } catch (err) {
    console.log(err);
  }
});
