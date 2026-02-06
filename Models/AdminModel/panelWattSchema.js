const mongoose = require("mongoose");

const panelWatt = new mongoose.Schema({
    panelId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Panel"
    },
    technologyId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Technology"
    },
    constructiveId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Constructive"
    },
    watt: {
        type: Number,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true
    },
    imgWatt: {
        type: [String], 
        required: true
    }
}, { timestamps: true })

const PanelWatt = mongoose.model("PanelWatt", panelWatt);

module.exports = PanelWatt;