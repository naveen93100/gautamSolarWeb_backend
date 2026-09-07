const mongoose = require("mongoose");

const customerSchema = mongoose.Schema(
    {
        dealerId: {
            type: mongoose.Types.ObjectId,
            ref: "Dealer",
        },

        // ading the compnay
        // companyId: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: "Company",
        //     required: true,
        // },
        name: String,
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            // unique:true,
        },
        phone: Number,
        address: String,
    },

    { timestamps: true },
);

customerSchema.index({ dealerId: 1, email: 1 }, { unique: true });

const CustomerModel = mongoose.model("Customer", customerSchema);
module.exports = CustomerModel;
