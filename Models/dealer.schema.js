const mongoose = require("mongoose");

const dealerSchema = mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    email: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
      select: false,
    },
    gstin: {
      type: String,
      unique: true,
    },
    companyName: String,
    contactNumber: {
      type: Number,
      unique: true,
    },
    companyLogo: String,
    address: String,
    isActive: {
      type: Boolean,
      default: false,
    },
    token: String,
    tokenExpiry: Date,
  },
  { timestamps: true }
);

const DealerModel = mongoose.model("Dealer", dealerSchema);

module.exports = DealerModel;
