const { v4: uuidv4 } = require("uuid");
const Path = require("path");
const fs = require("fs");
const { promisify } = require("util");
const { GaloNews } = require("../Models/Galo.News.Schema");
const { default: mongoose } = require("mongoose");
const unlinkAsync = promisify(fs.unlink);
require("dotenv").config();

const deleteBlogComment=async(req,res)=>{
  try {
    
    let {cid,UUID}=req.params;

    if(!cid||!UUID) return res.status(400).json({success:false,message:"Id not found"});

    let blog=await GaloNews.findOne({UUID});

    if(!blog) return res.status(404).json({success:false,message:"Not found"});

    blog.Comments=blog.Comments.filter(item=>!item._id.equals(cid));
    await blog.save();

    return res.status(200).json({success:true,blog})

  } catch (er) {
     return res.status(500).json({success:false,message:er.message});
  }
}

const getBlogComment=async(req,res)=>{
  try {
     
    let {UUID}=req.params;

    if(!UUID) return res.status(400).json({success:false,message:"Id not found"});

    let blog=await GaloNews.findOne({UUID}).select('Comments');

    if(!blog) return res.status(404).json({success:false,message:"Not found"});

    return res.status(200).json({success:true,blog});

  } catch (er) {
     return res.status(500).json({success:false,message:er.message});
  }
}

const addBlogComment=async(req,res)=>{
  try {
     
    let {UUID}=req.params;
    let comment=req.body;

    if(!UUID) return res.status(400).json({success:false,message:'UUID not found'});

    let blog=await GaloNews.findOne({UUID});

    if(!blog) return res.status(404).json({success:false,message:'Blog not found'});

    blog.Comments.push(comment);
    await blog.save();
              
    return res.status(200).json({success:true,blog});

  } catch (er) {
     return res.status(500).json({success:false,message:er.message});
  }
}

const likeBlog = async (req, res) => {
  try {
    let { id, isLiked } = req.params;

    if (!id)
      return res.status(400).json({ success: false, message: "Id not found" });

    isLiked = Number(isLiked);

    let updateBlogLike = await GaloNews.findOneAndUpdate(
      { UUID: id },
      { $inc: { Likes: isLiked ? -1 : 1 } },
      { new: true }
    );

    if (!updateBlogLike)
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });

    return res
      .status(200)
      .json({ success: true, message: "Blog liked", isLiked, updateBlogLike });
  } catch (er) {
    return res.status(500).json({ success: false, message: er.message });
  }
};

// function to get the news
const getGaloNews = async (req, res) => {
  const { NoOfNews, Page } = req.query;

  try {
    let total = await GaloNews.aggregate([
      { $group: { _id: null, total: { $sum: 1 } } },
      {
        $project: {
          _id: 0,
          total: 1,
          totalPages: { $ceil: { $divide: ["$total", Number(NoOfNews)] } },
        },
      },
    ]);
    // Send the retrieved news items as a response

    if (total.length > 0 && total[0]["totalPages"] < Number(Page)) {
      return res.status(404).send({ msg: `there is no ${Page} Page` });
    } else {
      let data = await GaloNews.aggregate([
        { $sort: { CreatedOn: -1 } },
        { $skip: (Number(Page) - 1) * Number(NoOfNews) },
        { $limit: Number(NoOfNews) },
      ]);
      console.log(data.length);
      return res.send({ data });
    }
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .send({ message: "Error fetching news items from the database" });
  }
};

// function to get image
const GetGaloBlogImage = async (req, res) => {
  const filename = req.params?.filename;
  const pdfFolderPath = Path.resolve("Galo_Blog_Images");

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

// funciton to get video
const GetGaloBlogVideo = async (req, res) => {
  const filename = req.params?.filename;
  const pdfFolderPath = Path.resolve("Galo_Blog_Video");
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

// function to create the blog
const createBlog = async (req, res) => {
  try {
    const UUID = req.body.UUID || uuidv4();
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
      const folderPath = Path.join("Galo_Blog_Images");

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
      const folderPath1 = Path.join("Galo_Blog_Video");
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
    // will change the url
    const videofilePath = videoFileName
      ? `https://gautamsolar.us/galo_admin/blogVideo/${videoFileName}`
      : //   `https://.us/galo_admin/blogVideo/${videoFileName}`
        null;

    const imagefilePath = imageFileName
      ? `https://gautamsolar.us/galo_admin/blogImage/${imageFileName}`
      : //    `https://.us/galo_admin/blogImage/${imageFileName}`
        null;

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

    /** Check if document with UUID exists */
    const existingDocument = await GaloNews.findOne({ UUID });

    if (existingDocument) {
      // Update the existing document
      await GaloNews.updateOne({ UUID }, { $set: data });

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
      // create a new document
      let insertedData = await GaloNews.create(data);
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
  } catch (er) {
    return res.status(500).json({ success: false, message: er });
  }
};

// function to get new by UUID
const getGaloNewsByUUID = async (req, res) => {
  const { uuid } = req.body;

  try {
    const newsItem = await GaloNews.findOne({ UUID: uuid });
    if (!newsItem) {
      return res.status(404).json({ message: "News item not found." });
    }

    return res
      .status(200)
      .json({ message: "News item fetched successfully", data: newsItem });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// function to delete new by UUID or _id
const deleteGaloNews = async (req, res) => {
  const { _id, uuid } = req.query;

  try {
    // Find the document by its _id and delete it
    const find = await GaloNews.findOne({ UUID: uuid });
    let imageDir = find.ImageURL?.split("/blogImage/")[1];

    let videoDir = find.VideoUrl?.split("/blogVideo/")[1];

    const filePath = [
      imageDir && `Galo_Blog_Images/${imageDir}`,
      videoDir && `Galo_Blog_Video/${videoDir}`,
    ].filter(Boolean);

    Promise.all(filePath.map((file) => unlinkAsync(file)))
      .then(() => console.log("Deleted"))
      .catch((er) => console.log(er));

    const deletedDocument = await GaloNews.findOneAndDelete({ UUID: uuid });
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

// functin to update the existing news
const UpdateGaloNews = async (req, res) => {
  const { uuid } = req.params;
  const updates = req.body;

  let videoFileName;
  let imageFileName;
  let videofilePath;
  let imagefilePath;

  try {
    const existingDocument = await GaloNews.findOne({ UUID: uuid });
    if (!existingDocument) {
      return res.status(404).json({ message: "Document not found." });
    }

    // Ensure req.files exists
    if (req.files && Object.keys(req.files).length > 0) {
      const fileBuffer = req.files?.buffer;

      if (req.files?.BlogImage) {
        /** define the folder path **/
        const folderPath = Path.join("Galo_Blog_Images");

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
          ? `https://gautamsolar.us/galo_admin/blogImage/${imageFileName}`
          : null;
        updates.ImageURL = imagefilePath;
      }

      // for checking we have video or not
      if (req.files?.BlogVideo) {
        // video folder
        const folderPath1 = Path.join("Galo_Blog_Video");
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
          ? `https://gautamsolar.us/galo_admin/blogVideo/${videoFileName}`
          : null;
        updates.VideoUrl = videofilePath;
      }
    } else {
      // No files uploaded, keep existing URLs
      updates.ImageURL = existingDocument.ImageURL;
      updates.VideoUrl = existingDocument.VideoUrl;
    }

    // Update document in database
    const updatedDocument = await GaloNews.updateOne({ UUID: uuid }, updates);

    res
      .status(200)
      .json({ message: "News updated successfully", updatedDocument });
  } catch (error) {
    console.error("Error updating document:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getGaloNews,
  GetGaloBlogImage,
  createBlog,
  GetGaloBlogVideo,
  getGaloNewsByUUID,
  deleteGaloNews,
  UpdateGaloNews,
  likeBlog,
  addBlogComment,
  getBlogComment,
  deleteBlogComment
};
