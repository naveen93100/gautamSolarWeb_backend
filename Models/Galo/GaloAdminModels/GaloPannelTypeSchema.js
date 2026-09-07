const mongoose = require("mongoose");

const galoPanelSchema = new mongoose.Schema({
    panelType: {
        type: String,
        required: true,
        unique: true
    },
    panelActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const Panel = mongoose.model("GaloPanel", galoPanelSchema);

module.exports = Panel;