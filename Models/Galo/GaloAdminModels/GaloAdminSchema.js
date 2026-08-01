const mongoose = require("mongoose");

const galoAdminSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },
        role: {
            type: String,
            enum: ["super_admin", "admin"],
            default: "admin",
        },
        isActive: {
            type: Boolean,
            default: true,
        },

        // compnayName: {
        //     type: String,
        //     required: true,
        //     trim: true,
        // },
    },
    { timestamps: true },
);

const GaloAdmin = mongoose.model("GaloAdmin", galoAdminSchema);
module.exports = GaloAdmin;
