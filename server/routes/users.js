const express = require("express");
const User = require("../models/user");
const { authMiddleware, authorize } = require("../middlewares/auth");

const router = express.Router();


router.get( "/", authMiddleware, authorize(["admin"]), async (req, res) => {
    try {
      const { search } = req.query;

      const filter = search
        ? { name: { $regex: search, $options: "i" } }
        : {};

      const users = await User.find(filter).select("_id name");

      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
