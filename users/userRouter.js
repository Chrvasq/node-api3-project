const express = require("express");
const User = require("./userDB");
const Post = require("../posts/postDb");

const router = express.Router();

// POST new user and return new user obj
router.post("/", validateUser, (req, res) => {
  const newUser = { name: req.name };

  User.insert(newUser)
    .then(user => {
      res.status(201).json(user);
    })
    .catch(err => {
      console.log("Error: ", err);
      res.status(500).json({ message: "Excepton: ", err });
    });
});

// POST new post and return new post obj
router.post("/:id/posts", validateUserId, validatePost, (req, res) => {
  const newPost = { text: req.text, user_id: req.user.id };

  Post.insert(newPost)
    .then(post => {
      res.status(201).json(post);
    })
    .catch(err => {
      console.log("Error: ", err);
      res.status(500).json({ message: "Exception: ", err });
    });
});

// GET all users
router.get("/", (req, res) => {
  User.get()
    .then(users => {
      res.status(200).json(users);
    })
    .catch(err => {
      console.log("Error: ", err);
      res.status(500).json({ message: "Exception: ", err });
    });
});

// GET user by ID
router.get("/:id", validateUserId, (req, res) => {
  res.status(200).json(req.user);
});

// GET all posts by user ID
router.get("/:id/posts", validateUserId, (req, res) => {
  const { id } = req.user;

  User.getUserPosts(id)
    .then(posts => {
      res.status(200).json(posts);
    })
    .catch(err => {
      console.log("Error: ", err);
      res.status(500).json({ message: "Exception: ", err });
    });
});

// DELETE user and return deleted user obj
router.delete("/:id", validateUserId, (req, res) => {
  const user = req.user;
  const { id } = user;

  User.remove(id)
    .then(() => {
      res.status(200).json(user);
    })
    .catch(err => {
      console.log("Error: ", err);
      res.status(500).json({ message: "Exception: ", err });
    });
});

// PUT (UPDATE) user and return updated user obj
router.put("/:id", validateUserId, validateUser, (req, res) => {
  const changes = { name: req.name };
  const { id } = req.user;

  User.update(id, changes)
    .then(() => {
      User.getById(id)
        .then(user => {
          res.status(200).json(user);
        })
        .catch(err => {
          console.log("Error: ", err);
          res.status(500).json({ message: "Exception: ", err });
        });
    })
    .catch(err => {
      console.log("Error: ", err);
      res.status(500).json({ message: "Exception: ", err });
    });
});

//custom middleware

function validateUserId(req, res, next) {
  const { id } = req.params;

  User.getById(id)
    .then(user => {
      user
        ? ((req.user = user), next())
        : res.status(400).json({ message: "Invalid user id" });
    })
    .catch(err => {
      console.log("Error: ", err);
      res.status(500).json({ message: "Exception: ", err });
    });
}

function validateUser(req, res, next) {
  // check if body prop on req object is empty
  const body = Object.keys(req.body).length === 0 ? 0 : 1;
  const { name } = req.body;

  body
    ? // check for name prop on body object
      !name
      ? res.status(400).json({ errorMessage: "Missing required name field." })
      : ((req.name = name), next())
    : res.status(400).json({ errorMessage: "Missing user data." });
}

function validatePost(req, res, next) {
  // check if body prop on req object is empty
  const body = Object.keys(req.body).length === 0 ? 0 : 1;
  const { text } = req.body;

  body
    ? // check for text prop on body object
      !text
      ? res.status(400).json({ errorMessage: "Missing required text field." })
      : ((req.text = text), next())
    : res.status(400).json({ errorMessage: "Missing post data." });
}

module.exports = router;
