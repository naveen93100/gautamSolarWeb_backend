const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6

    },
    token: {
        type: String,
    },
    role: {
        type: String,
        enum: ["super_admin", "admin"],
        default: "admin"
    },
}, { timestamps: true });
const Admin = mongoose.model("Admin", adminSchema);
module.exports = { Admin }