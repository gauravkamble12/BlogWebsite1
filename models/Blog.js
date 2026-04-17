const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, index: true },
    content: String,
    images: [String],
    category: {
      type: String,
      enum: ["Technology", "Lifestyle", "Travel", "Food", "Business", "Health", "Other"],
      default: "Other"
    },
    tags: [String],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published"
    }
  },
  { timestamps: true }
);

blogSchema.index({ createdAt: -1 });
blogSchema.index({ title: "text", content: "text" });
blogSchema.index({ category: 1 });
blogSchema.index({ tags: 1 });

module.exports = mongoose.model("Blog", blogSchema);
