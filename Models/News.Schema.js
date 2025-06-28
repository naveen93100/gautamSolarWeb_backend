const mongoose = require('mongoose')
const NewsSchema = mongoose.Schema({
    UUID:{
      type:String,
      required:true
    },
    ImageURL: {
        type: String,
        trim: true, // Trim whitespac
    },
    VideoUrl: {
        type: String,
        trim: true, // Trim whitespac
    },
    Tags:{
        type: String,
         required: false
    },
    Header: {
        type: String,
        required: true
    },
    Description: {
        type: String,
        required: true
    },
    Body: {
        type: String,
        required: true
    },
    CreatedOn: {
        type: Date,
        default: Date.now, 
        immutable: true                                                                                                          
    },
    UpdatedOn: {
        type: Date,
        required: false
    },
    CreatedBy: {
        type: String,
        required: false
    },
    UpdatedBy: {
        type: String,
        required: false
    }
}, {
    versionKey: false
})

const News = mongoose.model('New', NewsSchema)

module.exports = { News }
