const mongoose = require("mongoose");

const propsalSchema = mongoose.Schema(
  {
    dealerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dealer",
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },
    rate: {
      type: Number,
    },
    tax:Number,
    orderCapacity: Number,
    price: Number,
    finalPrice: Number,
    gstAmt: Number,
    proposalDate: {
      type: Date,
      default: Date.now,
    },
    termsAndConditions: String,
    material: [
      {
        _id:false,
        mId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Material",
        },
        quantity: {
          type: Number,
          default: 0,
        },
        isActive: {
          type: Boolean,
          default: false,
        },
      },
    ]
  },
  { timestamps: true }
);

// propsalSchema.pre("save", function (next) {
//   const price = this.orderCapacity * this.rate;
//   const gstAmt = (price * 5) / 100;
//   const finalAmt = price + gstAmt;
//   this.price = price;
//   this.finalPrice = finalAmt;
//   this.gstAmt = gstAmt;
//   next();
// });

const ProposalModel = mongoose.model("Proposal", propsalSchema);
module.exports = ProposalModel;
