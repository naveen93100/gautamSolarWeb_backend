const mongoose = require("mongoose");

const panelSchema = new mongoose.Schema({
    salerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Sales"
    },
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SalesCustomer"
    },
    gst: Number,
    termsAndConditions: String,

    selectedPanels: [
        {
            panelId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Panel",
                required: true
            },
            technologyId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Technology",
                required: true
            },
            constructiveId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Constructive",
                required: true
            },
            wattId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "PanelWatt",
                required: true
            },
            quantity: {
                type: Number,
                default: 1
            },
            rate: {
                type: Number
            },
            // tax: Number,
            totalPrice: {
                type: Number
            },
            gstAmount: {
                type: Number,
                required: true
            },
            
        }
    ],

    finalPrice: {
        type: Number,
        required: true
    }

}, { timestamps: true });

const PanelModel = mongoose.model("PanelModel", panelSchema);
module.exports = PanelModel;