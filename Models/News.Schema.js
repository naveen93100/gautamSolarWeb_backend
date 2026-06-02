const mongoose = require("mongoose");
const { required } = require("zod/mini");
const NewsSchema = mongoose.Schema(
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
    MetaTitle: {
      type: String,
      required: true,
      trim: true,
      maxlength: [60, "Meta Title cannot exceed 60 characters"],
    },
    MetaDescription: {
      type: String,
      required: true,
      trim: true,
      maxlength: [160, "Meta Description cannot exceed 160 characters"],
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
  },
  {
    versionKey: false,
  },
);

const News = mongoose.model("New", NewsSchema);

module.exports = { News };
