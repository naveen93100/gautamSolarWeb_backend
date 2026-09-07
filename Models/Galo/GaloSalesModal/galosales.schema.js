const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");
const Counter = require("./galosalescounter.schema");

const galosalesSchema = new Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true,
        },
        userId: {
            type: String,
            uppercase: true,
            trim: true,
            unique: true,
        },
        phone: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        password: {
            type: String,
            required: true,
            select: false,
        },
    },
    { timestamps: true },
);

galosalesSchema.pre("save", async function () {
    if (this.phone) {
        this.phone = this.phone.replace(/\D/g, "");
    }

    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }

    if (!this.userId && this.name) {
        const baseName = this.name
            .trim()
            .split(/\s+/)[0]
            .replace(/[^a-zA-Z]/g, "")
            .toUpperCase();

        if (!baseName) {
            throw new Error("Invalid name for userId generation");
        }

        const counter = await Counter.findOneAndUpdate(
            { name: "galoSalesUserId" },
            { $inc: { seq: 1 } },
            { new: true, upsert: true },
        );

        const number = String(counter.seq).padStart(2, "0");

        this.userId = `${baseName}-${number}`;
    }
});

const GaloSales = model("GaloSales", galosalesSchema);

module.exports = GaloSales;
