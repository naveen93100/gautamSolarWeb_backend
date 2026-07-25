const mongoose = require("mongoose");

const galosalesPanelSchema = new mongoose.Schema(
    {
        salesId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "GaloSales",
            required: true,
        },

        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "GalosalesCustomer",
            required: true,
        },

        gst: {
            type: Number,
            default: 18,
        },

        termsAndConditions: {
            type: String,
            trim: true,
        },

        selectedPanels: [
            {
                panelId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Panel",
                    required: true,
                },

                technologyId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Technology",
                    required: true,
                },

                constructiveId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Constructive",
                    required: true,
                },

                wattId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "PanelWatt",
                    required: true,
                },

                quantity: {
                    type: Number,
                    required: true,
                    default: 1,
                },

                rate: {
                    type: Number,
                    required: true,
                },

                totalPrice: {
                    type: Number,
                    required: true,
                },

                gstAmount: {
                    type: Number,
                    required: true,
                },
            },
        ],

        finalPrice: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true },
);

const GaloSalesPanel = mongoose.model("GaloSalesPanel", galosalesPanelSchema);

module.exports = GaloSalesPanel;
