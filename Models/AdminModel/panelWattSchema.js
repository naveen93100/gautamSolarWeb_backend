const mongoose = require("mongoose");

const panelWatt = new mongoose.Schema({
    panelId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Panel"
    },
    technologId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Technology"
    },
    constructiveId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Constructive"
    },
    panelWatt: [
        {
            watt: {
                type: Number,
                required: true,
            },
            isActive:{
                type : Boolean,
                default:true
            }
        }
    ]
}, { timestamps: true })

const PanelWatt = mongoose.model("PanelWatt", panelWatt);

module.exports = PanelWatt;