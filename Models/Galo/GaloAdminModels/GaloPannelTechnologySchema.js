const mongoose = require("mongoose");

const galoPanelTechnology = new mongoose.Schema({
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
}, { timestamps: true });

const Technology = mongoose.model("GaloTechnology", galoPanelTechnology);

module.exports = Technology;