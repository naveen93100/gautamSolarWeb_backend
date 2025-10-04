const mongoose=require('mongoose');


const mediaSchema= new mongoose.Schema({
    mediaTitle:{
        type:String
    },
    mediaLink:{
        type:String
    },
    mediaImg:{
        type:String
    },
    isActive:{
        type:Boolean,
        default:true,
    }
},{timestamps:true});

const Media=mongoose.model('Media',mediaSchema);
module.exports=Media;