
const { News } = require("../Models/News.Schema");
const { User } = require("../Models/admin.schema");
const { v4: uuidv4 } = require("uuid");
const Path = require("path");
const fs = require("fs");
const { promisify } = require("util");
const unlinkAsync = promisify(fs.unlink);
require("dotenv").config();

const generateSitemap = async () => {
  try {
    const blogs = await News.find();
    const sitemapLinks = blogs.map((blog) => ({
      url: `/${createSlug(blog.Header)}`,
      lastmod: new Date(blog.CreatedOn).toISOString().split("T")[0], // format YYYY-MM-DD
    }));

    const { SitemapStream, streamToPromise } = require("sitemap");
    const { Readable } = require("stream");

    const stream = new SitemapStream({ hostname: "https://gautamsolar.com" });

    // Generate the sitemap XML and save it to a file
    const xmlData = await streamToPromise(
      Readable.from(sitemapLinks).pipe(stream)
    );
    fs.writeFileSync(Path.join(__dirname, "sitemap.xml"), xmlData);
    console.log("Sitemap generated and saved");
  } catch (error) {
    console.error("Error generating sitemap:", error);
  }
};

// Function to create URL slugs
const createSlug = (header) => {
  return header
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Remove consecutive hyphens
    .trim();
};

/** ################################################################### */
const create = async (req, res) => {

  try {
    const UUID = req.body.UUID || uuidv4(); // Use provided UUID or generate a new one
    const { Header, Description, Body, tags } = req.body;

    if (!Header)
      return res
        .status(401)
        .json({ success: false, message: "Header is required" });
    if (!Description)
      return res
        .status(401)
        .json({ success: false, message: "Description is required" });

    /** Get the file buffer and the file format , because file is store in buffer data **/
    let fileBuffer = req.files?.buffer;

    let videoFileName;
    let imageFileName;
    if (req.files?.BlogImage) {
      /** Define the folder path **/
      const folderPath = Path.join("Blog_Images");

      /** Create the folder if it doesn't exist **/
      if (!fs.existsSync(folderPath)) {
        console.log(folderPath);
        fs.mkdirSync(folderPath, { recursive: true });
      }

      /** Define the file path, including the desired file name and format */
      imageFileName = `${req.files?.BlogImage[0]?.filename}`;

      const filePath = Path.join(folderPath, imageFileName);

      /** Save the file buffer to the specified file path */
      if (fileBuffer) {
        fs.writeFileSync(filePath, fileBuffer);
      }
    }

    // for checking we have video or not
    if (req.files?.BlogVideo) {
      // video folder
      const folderPath1 = Path.join("Blog_Video");
      /** Create the folder if it doesn't exist **/
      if (!fs.existsSync(folderPath1)) {
        console.log(folderPath1);
        fs.mkdirSync(folderPath1, { recursive: true });
      }
      /** Define the file path, including the desired file name and format */
      videoFileName = `${req.files?.BlogVideo[0]?.filename}`;
      const filePath1 = Path.join(folderPath1, videoFileName);

      /** Save the file buffer to the specified file path */
      if (fileBuffer) {
        fs.writeFileSync(filePath1, fileBuffer);
      }
    }  

    const videofilePath = videoFileName ? `https://gautamsolar.us/admin/blogVideo/${videoFileName}` : null;
    
    const imagefilePath = imageFileName ? `https://gautamsolar.us/admin/blogImage/${imageFileName}` : null;

    /** Prepare data for insertion or update */
    const data = {
      UUID: UUID,
      ImageURL: imagefilePath,
      VideoUrl: videofilePath,
      Header: Header,
      Description: Description,
      Body: Body,
      Tags: tags,
    };

    await generateSitemap();
    /** Check if document with UUID exists */
    const existingDocument = await News.findOne({ UUID });

    if (existingDocument) {
      // Update the existing document
      await News.updateOne({ UUID }, { $set: data });

      return res.status(200).json({
        success: true,
        message: "Data inserted successfully!",
        data: {
          insertedData,
          ImageURL: data.ImageURL,
          VideoUrl: data.VideoUrl,
        },
      });
    } else {
      // Insert a new document
      let insertedData = await News.create(data);
      return res.status(200).json({
        success: true,
        message: "Data inserted successfully!",
        data: {
          insertedData,
          ImageURL: data.ImageURL,
          VideoUrl: data.VideoUrl,
        },
      });
    }
  } catch (err) {
    console.log(err.message);
    return res.status(401).json({
      success: false,
      message: "Something went wrong..",
      error: err,
    });
  }
};

// get blog Image
const GetBlogImage = async (req, res) => {
  const filename = req.params?.filename;
  /** Define the absolute path to the IPQC-Pdf-Folder directory */
  const pdfFolderPath = Path.resolve("Blog_Images");

  /** Construct the full file path to the requested file */
  const filePath = Path.join(pdfFolderPath, filename);

  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  } else {
    return res.status(404).send({
      success: false,
      message: "File not found",
    });
  }
};
//get blog Video
const GetBlogVideo = (req, res) => {
  const filename = req.params?.filename;
  const pdfFolderPath = Path.resolve("Blog_Video");
  const filePath = Path.join(pdfFolderPath, filename);

  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  } else {
    return res.status(404).send({
      success: false,
      message: "File not found",
    });
  }
};

/** ################################################################### */

// get news
const getNews = async (req, res) => {
  const { NoOfNews, Page } = req.query;

  try {
    // here News is a collection
    let total = await News.aggregate([
      { $group: { _id: null, total: { $sum: 1 } } },
      {
        $project: {
          _id: 0, 
          total: 1,
          totalPages: { $ceil: { $divide: ["$total", Number(NoOfNews)] } },
        },
      },
    ]);

    if(!NoOfNews || ! Page || isNaN(Number.parseInt(NoOfNews)) || isNaN(Number.parseInt(Page))){
      throw new Error("Please Provide page and noOfNews as integers")
    }

    const correctSize = Number.parseInt(NoOfNews);
    const correctPage = Number.parseInt(Page);

    const totalNewsCount = await News.countDocument();

    const totalPages = Math.ceil(totalNewsCount/correctSize) ||1;
    const safePage = Math.min(Math.max(correctSize,1),1);

    const data = await News.find().$skip((correctPage-1)*correctSize).$limit(correctSize);

    if(!data){
      return res.status(500).json(
        {
          message:"Error while fetching from DB"
        })
    }

    return res.status(200).send(data);

    // if (total.length>0&&total[0]["totalPages"] < Number(Page)) {
    //  return res.status(404).send({ msg: `there is no ${Page} Page` });
    // } else {
    //   let data = await News.aggregate([
    //     { $sort: { CreatedOn: -1 } },
    //     { $skip: (Number(Page) - 1) * Number(NoOfNews) },
    //     { $limit: Number(NoOfNews) },
    //   ]);
    //  return res.send({ data});
    // }
  } catch (error) {
    
    res
      .status(500)
      .send({ message: "Error fetching news items from the database" });
  }
};

/**************************************delete document by _id******************************************************** */
const deleteNews = async (req, res) => {
  const { _id, uuid } = req.query;

  try {
    /************************************** here also should delete S3 Object, also have to implement that function************************************************/

    // Find the document by its _id and delete it
    const find = await News.findOne({ UUID: uuid });
    let imageDir = find.ImageURL?.split("/blogImage/")[1];

    let videoDir = find.VideoUrl?.split("/blogVideo/")[1];

    const filePath = [
      imageDir&&`Blog_Images/${imageDir}`,
      videoDir&&`Blog_Video/${videoDir}`,
    ].filter(Boolean);

    Promise.all(filePath.map((file) => unlinkAsync(file)))
      .then(() => console.log("Deleted"))
      .catch((er) => console.log(er));

    const deletedDocument = await News.findOneAndDelete({ UUID: uuid });
    // console.log(deletedDocument)
    if (!deletedDocument) {
      return res.status(404).json({ message: "Document not found." });
    }

    return res
      .status(200)
      .json({ message: "Document deleted successfully.", deletedDocument });
  } catch (error) {
    console.error("Error deleting document:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

const UpdateNews = async (req, res) => {
  const { uuid } = req.params;
  const updates = req.body;

  let videoFileName;
  let imageFileName;
  let videofilePath;
  let imagefilePath;

  try {
    // Fetch existing document
    const existingDocument = await News.findOne({ UUID: uuid });
    if (!existingDocument) {
      return res.status(404).json({ message: "Document not found." });
    }

    // Ensure req.files exists
    if (req.files && Object.keys(req.files).length > 0) {
      const fileBuffer = req.files?.buffer;

      if (req.files?.BlogImage) {
        /** define the folder path **/
        const folderPath = Path.join("Blog_Images");

        /** create the folder if it doesn't exist **/
        if (!fs.existsSync(folderPath)) {
          console.log(folderPath);
          fs.mkdirSync(folderPath, { recursive: true });
        }

        /** Define the file path, including the desired file name and format */
        imageFileName = `${req.files?.BlogImage[0]?.filename}`;
        const filePath = Path.join(folderPath, imageFileName);

        /** Save the file buffer to the specified file path */
        if (fileBuffer) {
          fs.writeFileSync(filePath, fileBuffer);
        }
        imagefilePath = imageFileName
          ? `https://gautamsolar.us/admin/blogImage/${imageFileName}`
          : //    `http://localhost:1008/admin/blogImage/${imageFileName}`
            null;
        updates.ImageURL = imagefilePath;
      }

      // for checking we have video or not
      if (req.files?.BlogVideo) {
        // video folder
        const folderPath1 = Path.join("Blog_Video");
        /** Create the folder if it doesn't exist **/
        if (!fs.existsSync(folderPath1)) {
          console.log(folderPath1);
          fs.mkdirSync(folderPath1, { recursive: true });
        }

        /** Define the file path, including the desired file name and format */
        videoFileName = `${req.files?.BlogVideo[0]?.filename}`;
        const filePath1 = Path.join(folderPath1, videoFileName);

        /** Save the file buffer to the specified file path */
        if (fileBuffer) {
          fs.writeFileSync(filePath1, fileBuffer);
        }
        videofilePath = videoFileName
          ? `https://gautamsolar.us/admin/blogVideo/${videoFileName}`
          : //   `http://localhost:1008/admin/blogVideo/${videoFileName}`
            null;
        updates.VideoUrl = videofilePath;
      }
    } else {
      // No files uploaded, keep existing URLs
      updates.ImageURL = existingDocument.ImageURL;
      updates.VideoUrl = existingDocument.VideoUrl;
    }

    // Update document in database
    const updatedDocument = await News.updateOne({ UUID: uuid }, updates);

    res
      .status(200)
      .json({ message: "News updated successfully", updatedDocument });

    await generateSitemap();
  } catch (error) {
    console.error("Error updating document:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getNewsByUUID = async (req, res) => {
  const { uuid } = req.body;

  try {
    // Find the document by its UUID
    const newsItem = await News.findOne({ UUID: uuid });

    // If no document is found, return a 404 error
    if (!newsItem) {
      return res.status(404).json({ message: "News item not found." });
    }

    // Send the found document as the response
    res
      .status(200)
      .json({ message: "News item fetched successfully", data: newsItem });
  } catch (error) {
    console.error("Error fetching news item:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  create,
  getNews,
  deleteNews,
  UpdateNews,
  GetBlogImage,
  getNewsByUUID,
  GetBlogVideo,
};
