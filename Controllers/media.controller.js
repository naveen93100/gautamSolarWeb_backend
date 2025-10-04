const fs = require("fs").promises;
const path = require("path");
const Media = require("../Models/media.schema.js");

const getMedia=async(req,res)=>{
    try {
        let {page}=req.query;

        let limit=6;
        let total=await Media.countDocuments({isActive:true});
        let hasNext=true;

        let media=await Media.find({isActive:true})
        .sort({createdAt:-1})
        .skip((page-1)*limit)
        .limit(limit)

        if(page*limit>=total){
           hasNext=false
          }
          else{
          hasNext=true
        }
      
        return res.status(200).json({success:true,media,hasNext});
    } catch (er) {
        return res.status(500).json({success:false,message:er?.message});
    }
}

const addMedia = async (req, res) => {
  try {
    let { title, link } = req.body;

    if (!title || !link)
      return res.status(400).json({ success: false, message: "Missing field" });

    if (!req.file)
      return res
        .status(400)
        .json({ success: false, message: "Image is required" });

    let loc = path.dirname(__dirname);
    await fs.mkdir(`${loc}/Media`, { recursive: true });

    let fileName = Date.now() + "-" + req.file.originalname;
    const uploadPath = path.join(path.dirname(__dirname), "Media", fileName);
    await fs.writeFile(uploadPath, req.file.buffer);

    let imgUrl = "https://gautamsolar.us/media_image/" + fileName;

    await Media.create({
      mediaTitle: title,
      mediaImg: imgUrl,
      mediaLink: link,
    });

    return res.status(200).json({ success: true, message: 'Media added' });
  } catch (er) {
    return res.status(500).json({ success: false, message: er?.message });
  }
};

const updateMedia = async (req, res) => {
  try {
    let { id } = req.params;

    let { title, link } = req.body;

    if (!id)
      return res.status(400).json({ success: false, message: "Id not found" });

    if (!title || !link)
      return res.status(400).json({ success: false, message: "Missing field" });

    let media = await Media.findById(id);
    let imgUrl;

    if (!media)
      return res
        .status(404)
        .json({ success: false, message: "Media not found" });

    if (req.file) {
      let fileName = Date.now() + "-" + req.file.originalname;
      const uploadPath = path.join(path.dirname(__dirname), "Media", fileName);
      await fs.writeFile(uploadPath, req.file.buffer);        
      let imgName=path.basename(media.mediaImg);
      let imgPath=path.join(path.dirname(__dirname),'Media',imgName);
      await fs.unlink(imgPath)

      imgUrl = "https://gautamsolar.us/media_image/" + fileName;
    } else {
      imgUrl = media.mediaImg;
    }

    media.mediaTitle = title;
    media.mediaLink = link, 
    media.mediaImg = imgUrl;

    await media.save();

    return res.status(200).json({success:true,message:"Media updated"});
  } catch (er) {
    return res.status(500).json({ success: false, message: er?.message });
  }
};

const deleteMedia = async (req, res) => {
  try {
    let { id } = req.params;

    if (!id)
      return res
        .status(400)
        .json({ success: false, message: "Id not provided" });

    let findMedia = await Media.findOne({ _id: id });

    if (!findMedia)
      return res
        .status(404)
        .json({ success: false, message: "Media not found" });

    findMedia.isActive = false;
    findMedia.save();

    return res.status(200).json({ success: true, message: "Media Deleted" });
  } catch (er) {
    return res.status(500).json({ success: false, message: er?.message });
  }
};

module.exports = {
  addMedia,
  deleteMedia,
  updateMedia,
  getMedia
};
