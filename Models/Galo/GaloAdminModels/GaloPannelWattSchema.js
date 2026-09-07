const mongoose = require("mongoose");

const galoPanelWatt = new mongoose.Schema(
    {
        panelId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Panel",
        },
        technologyId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Technology",
        },
        constructiveId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Constructive",
        },
        watt: {
            type: Number,
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true },
);

const PanelWatt = mongoose.model("GaloPanelWatt", galoPanelWatt);

module.exports = PanelWatt;
