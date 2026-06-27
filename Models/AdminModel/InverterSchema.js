const mongoose = require('mongoose');

const inverterSchema = new mongoose.Schema({
    phase: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    capacities: [{
        type: Number,
        required: true
    }],
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
    }
}, { timestamps: true });

const Inverter = mongoose.model('Inverter', inverterSchema);
module.exports = Inverter