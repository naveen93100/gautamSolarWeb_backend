const express=require('express');
const multer = require('multer');
const { addMedia, deleteMedia,updateMedia,getMedia } = require('../Controllers/media.controller');

const storage=multer.memoryStorage();
const upload=multer({storage:storage});


const router=express.Router();

// add media 
router.get('/',getMedia);

router.post('/',upload.single('image'),addMedia);

router.patch('/:id',upload.single('image'),updateMedia);

router.delete('/:id',deleteMedia);

module.exports=router;