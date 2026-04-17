const upload = require("../middleware/upload");

router.post(
  "/blogs",
  upload.array("images", 5),
  async (req, res) => {
    console.log("FILES:", req.files); // DEBUG

    const images = req.files.map(file => "uploads/" + file.filename);

    const blog = new Blog({
      title: req.body.title,
      content: req.body.content,
      images,
      author: req.user._id
    });

    await blog.save();
    res.redirect("/");
  }
);
