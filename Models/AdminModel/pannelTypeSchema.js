const mongoose = require("mongoose");

const panelSchema = new mongoose.Schema({
    panelType: {
        type: String,
        required: true,
        unique: true
    },
    panelActive:{
        type:Boolean,
        default:true
    }
}, { timestamps: true })

const Panel = mongoose.model("Panel", panelSchema);

module.exports= Panel;