const { Schema, model } = require("mongoose");

const galosalescounterSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        seq: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

const Counter = model("GaloCounter", galosalescounterSchema);

module.exports = Counter;
