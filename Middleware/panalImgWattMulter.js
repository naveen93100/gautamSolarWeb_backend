const multer = require("multer");
const path = require("path");
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {

        const uploadPath = path.join(__dirname, "../proposal_images/watt");
        fs.mkdir(uploadPath, { recursive: true }, (err) => {
            if (err) return cb(err);
            cb(null, uploadPath);
        });
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname)
    }
});

const fileFilter = (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const min = allowed.test(file.mimetype);

    if (ext && min) {
        cb(null, true);
    } else {
        cb(new Error("Only image file are allowed.."))
    }
}

const uploadImgPath = multer({
    storage,
    fileFilter,
    limits: {
        files: 2,
        fileSize: 4 * 1024 * 1024
    }
})

module.exports = uploadImgPath