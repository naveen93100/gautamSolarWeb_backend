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
      unique:true,
    },
    phone: Number,
    address: String,
  },
  { timestamps: true }
);

const CustomerModel = mongoose.model("Customer", customerSchema);
module.exports= CustomerModel;
