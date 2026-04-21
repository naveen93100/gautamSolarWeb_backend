const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");

const salesSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      lowercase: true,
      required: true,
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
      default: false,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },
  },
  { timestamps: true },
);

salesSchema.pre("save", async function () {
  if (this.phone) {
    this.phone = this.phone.replace(/\D/g, "");
  }

  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

const Sales = model("Sales", salesSchema);
module.exports = Sales;
