const { Schema, model } = require("mongoose");

const galosalesCustomerSchema = new Schema(
    {
        galoSalesPersonId: {
            type: Schema.Types.ObjectId,
            ref: "GaloSales",
            required: true,
        },

        fullName: {
            type: String,
            trim: true,
        },

        email: {
            type: String,
            trim: true,
            lowercase: true,
        },

        phone: {
            type: String,
            required: true,
            trim: true,
        },

        address: {
            type: String,
            trim: true,
        },

        companyName: {
            type: String,
            required: false,
            trim: true,
        },

        gstin: {
            type: String,
            required: false,
            trim: true,
            uppercase: true,
        },
    },
    {
        timestamps: true,
    },
);

galosalesCustomerSchema.index(
    { galoSalesPersonId: 1, phone: 1 },
    { unique: true },
);

galosalesCustomerSchema.index(
    { galoSalesPersonId: 1, gstin: 1 },
    { unique: true },
);

const GalosalesCustomer = model("GalosalesCustomer", galosalesCustomerSchema);

module.exports = GalosalesCustomer;
