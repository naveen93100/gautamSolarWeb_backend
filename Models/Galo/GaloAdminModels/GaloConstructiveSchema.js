const mongoose = require("mongoose");

const GaloConstructiveSchema = new mongoose.Schema({
    panelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Panel",
        required: true,
    },
    technologyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Technology",
        required: true
    },
    constructiveType: {
        type: String,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const Constructive = mongoose.model("GaloConstructive", GaloConstructiveSchema);
module.exports = Constructive;