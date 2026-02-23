const mongoose = require("mongoose");

const panelTechnology = new mongoose.Schema({
    panelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Panel",
        required: true
    },
    technologyPanel: {
        type: String,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true })


const Technology = mongoose.model("Technology", panelTechnology);

module.exports = Technology;