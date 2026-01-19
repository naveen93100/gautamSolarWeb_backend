const mongoose = require("mongoose");

const constructiveSchema = new mongoose.Schema({
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
        unqiue: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const Constructive = mongoose.model("Constructive", constructiveSchema);
module.exports = Constructive 