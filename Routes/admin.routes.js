const express = require('express')
const { create, getNews,deleteNews, UpdateNews, GetBlogImage,getNewsByUUID, GetBlogVideo } = require('../Controllers/admin.controller')
const multer = require('multer')
const {authentication} = require('../Middleware/authentication')
const UserRouter = express.Router()

const fs= require("fs")
const { v4: uuidv4 } = require('uuid');
const path=require('path');


//used diskStorage for saving the photo and image with the help of multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let folderPath;
        // in this we check the file is save in image folder or video folder
        if (file.mimetype.startsWith('image/')) {
            folderPath = 'Blog_Images';
        } else if (file.mimetype.startsWith('video/')) {
            folderPath = 'Blog_Video';
        }

        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }

        cb(null, folderPath);
    },
    filename: function (req, file, cb) {
        const fileName = `${Date.now()}-${file?.originalname}`;
        cb(null, fileName);
       
    }
});


// we are applying the filter to check the types of image and video
const fileFilter = (req, file, cb) => {
    // Define allowed image and video MIME types
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const allowedVideoTypes = ['video/mp4', 'video/mpeg', 'video/avi', 'video/webm', 'video/quicktime'];

    if (allowedImageTypes.includes(file.mimetype) || allowedVideoTypes.includes(file.mimetype)) {
        req.body.FileFormat = file.mimetype; // Store the file format in the request body
        cb(null, true); // Accept the file
    } else {
        cb(new Error('Invalid file type. Only images and videos are allowed.'), false); // Reject the file
    }
};

 
// here we are uploading the images and video
const upload = multer({ storage: storage, fileFilter: fileFilter,limits: { fileSize: 1024  * 1024 * 50,  fieldSize: 10 * 1024 * 1024, }  });

/** To Get All News */
UserRouter.get('/news',getNews)

/** To Get Blog Image */
UserRouter.get('/blogImage/:filename',GetBlogImage)

/** To Create News */

UserRouter.post('/createNews', upload.fields([
    { name: 'BlogImage', maxCount: 1 }, // Accepts 1 image file
    { name: 'BlogVideo', maxCount: 1 }  // Accepts 1 video file
]), create);



// to get videoBlog
 UserRouter.get("/blogVideo/:filename",GetBlogVideo);


/** To Delete News  */
UserRouter.delete('/delete', deleteNews)
UserRouter.post('/news/edit', getNewsByUUID);


/** To Update News */

UserRouter.patch('/updateNews/:uuid', upload.fields([
    { name: 'BlogImage', maxCount: 1 },
    { name: 'BlogVideo', maxCount: 1 } 
]),UpdateNews)

module.exports = { UserRouter } 
