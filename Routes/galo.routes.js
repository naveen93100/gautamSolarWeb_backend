const express=require('express');
const GaloRouter=express.Router();
const {getGaloNews, GetGaloBlogImage, GetGaloBlogVideo, getGaloNewsByUUID, deleteGaloNews, createBlog, UpdateGaloNews,likeBlog,addBlogComment,getBlogComment,deleteBlogComment}=require('../Controllers/galo.controller')
const multer=require('multer');
const fs=require('fs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let folderPath;
        // in this we check the file is save in image folder or video folder
        if (file.mimetype.startsWith('image/')) {
            folderPath = 'Galo_Blog_Images';
        } else if (file.mimetype.startsWith('video/')) {
            folderPath = 'Galo_Blog_Video';
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

const upload = multer({ storage: storage, fileFilter: fileFilter,limits: { fileSize: 1024  * 1024 * 50,  fieldSize: 10 * 1024 * 1024, }  });

// new 
GaloRouter.patch('/like/:id/:isLiked',likeBlog);

GaloRouter.delete('/delete_blog_comment/:cid/:UUID',deleteBlogComment);
GaloRouter.get('/get_blog_comment/:UUID',getBlogComment);
GaloRouter.post('/comment/:UUID',addBlogComment);
// 


// to get all news
GaloRouter.get('/news',getGaloNews);

// to get all blogImage
GaloRouter.get('/blogImage/:filename',GetGaloBlogImage);

// to create the blog
GaloRouter.post('/createNews', upload.fields([
    { name: 'BlogImage', maxCount: 1 }, // Accepts 1 image file
    { name: 'BlogVideo', maxCount: 1 }  // Accepts 1 video file
]), createBlog);

// to get blog video
GaloRouter.get("/blogVideo/:filename",GetGaloBlogVideo);

// to get news by UUID
GaloRouter.post('/news/edit', getGaloNewsByUUID);

// to delete the news
GaloRouter.delete('/delete', deleteGaloNews);

// to update the news by UUID                
GaloRouter.patch('/updateNews/:uuid', upload.fields([
    { name: 'BlogImage', maxCount: 1 },
    { name: 'BlogVideo', maxCount: 1 } 
]),UpdateGaloNews);


module.exports={GaloRouter};