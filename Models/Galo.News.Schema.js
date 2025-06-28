const mongoose = require("mongoose");

const GaloNewsSchema = mongoose.Schema(
  {
    UUID: {
      type: String,
      required: true,
    },
    ImageURL: {
      type: String,
      trim: true,
    },
    VideoUrl: {
      type: String,
      trim: true,
    },
    Tags: {
      type: String,
      required: false,
    },
    Header: {
      type: String,
      required: true,
    },
    Description: {
      type: String,
      required: true,
    },
    Body: {
      type: String,
      required: true,
    },
    CreatedOn: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
    UpdatedOn: {
      type: Date,
      required: false,
    },
    CreatedBy: {
      type: String,
      required: false,
    },
    UpdatedBy: {
      type: String,
      required: false,
    },
    Likes: {
      type: Number,
      default: 0,
    },
    Comments: [
      {
        text: {
          type: String,
        },
      },
    ],
  },
  {
    versionKey: false,
  }
);

const GaloNews = mongoose.model("GaloNew", GaloNewsSchema);

module.exports = { GaloNews };
