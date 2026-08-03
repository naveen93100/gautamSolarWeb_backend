const mongoose = require("mongoose");

const galoInverterSchema = new mongoose.Schema(
    {
        inverterCapacity:{
            type: String,
            required: true,
            trim: true,
            unique:true
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true },
);

const GaloInverter = mongoose.model("GaloInverter", galoInverterSchema);
module.exports = GaloInverter;


