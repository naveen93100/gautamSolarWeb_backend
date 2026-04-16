const mongoose = require("mongoose");

const customerSchema = mongoose.Schema(
  {
    dealerId: {
      type: mongoose.Types.ObjectId,
      ref: "Dealer",
    },
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
