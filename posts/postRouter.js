const express = require("express");
const Post = require("./postDb");

const router = express.Router();

// GET all posts
router.get("/", (req, res) => {
  Post.get()
    .then(posts => {
      res.status(200).json(posts);
    })
    .catch(err => {
      console.log("Error", err);
      res.status(500).json({ message: "Exception:", err });
    });
});

// GET post by ID
router.get("/:id", validatePostId, (req, res) => {
  res.status(200).json(req.post);
});

// DELETE post and return deleted post obj
router.delete("/:id", validatePostId, (req, res) => {
  const post = req.post;
  const { id } = post;

  Post.remove(id)
    .then(() => {
      res.status(200).json(post);
    })
    .catch(err => {
      console.log("Error: ", err);
      res.status(500).json({ message: "Exception: ", err });
    });
});

// PUT (UPDATE) post and return updated post obj
router.put("/:id", validatePostId, (req, res) => {
  const { id } = req.post;
  const changes = req.body;
  const { text } = changes;

  text
    ? Post.update(id, changes)
        .then(() => {
          Post.getById(id)
            .then(post => {
              res.status(200).json(post);
            })
            .catch(err => {
              console.log("Error:", err);
              res.status(500).json({ message: "Exception: ", err });
            });
        })
        .catch(err => {
          console.log("Error: ", err);
          res.status(500).json({ message: "Exception: ", err });
        })
    : res.status(400).json({ errorMessage: "Must provide text." });
});

// custom middleware

function validatePostId(req, res, next) {
  const { id } = req.params;

  Post.getById(id)
    .then(post => {
      post
        ? ((req.post = post), next())
        : res.status(404).json({ message: "Post does not exist." });
    })
    .catch(err => {
      console.log("Error: ", err);
      res.status(500).json({ message: "Exception:", err });
    });
}

module.exports = router;
