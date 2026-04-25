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
    },
    slug: {
      type: String,
      unique: true,
      index: true
    },
    metaTitle: String,
    metaDescription: String
  },
  { timestamps: true }
);

const slugify = require("slugify");

// Pre-save hook to generate slug
blogSchema.pre("save", async function() {
  if (this.isModified("title") || !this.slug) {
    let baseSlug = slugify(this.title, { lower: true, strict: true });
    
    // Check for uniqueness
    let slugExists = await mongoose.models.Blog.findOne({ slug: baseSlug, _id: { $ne: this._id } });
    let counter = 1;
    let uniqueSlug = baseSlug;
    
    while (slugExists) {
      uniqueSlug = `${baseSlug}-${counter}`;
      slugExists = await mongoose.models.Blog.findOne({ slug: uniqueSlug, _id: { $ne: this._id } });
      counter++;
    }
    
    this.slug = uniqueSlug;
  }
});

blogSchema.index({ createdAt: -1 });
blogSchema.index({ title: "text", content: "text" });
blogSchema.index({ category: 1 });
blogSchema.index({ tags: 1 });

module.exports = mongoose.model("Blog", blogSchema);
