const express = require("express");
const Todo = require("../models/todo");
const { authMiddleware, authorize } = require("../middlewares/auth");
const router = express.Router();

router.post( "/", authMiddleware, authorize(["user", "admin"]),
    async (req,res) => {
        try {
        const { title, description } = req.body;
        if (!title) {
            return res.status(400).json({ message: "Title is required" });
        }
        const todo = await Todo.create({
            title,
            description,
            user: req.user.userId
        });
        res.status(201).json(todo);
        } catch (error) {
        res.status(500).json({ message: "Server error" });
        }
    }
);

router.get("/", authMiddleware, authorize(["user", "admin"]), async (req, res) =>{
    try {
        let todos;
        if (req.user.role === "admin") {
        todos = await Todo.find();
        } else {
        todos = await Todo.find({ user: req.user.userId });
        }
        res.json(todos);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

router.put("/mark-all-completed", authMiddleware, authorize(["user", "admin"]), async (req, res) => {
  try {
    if (req.user.role === "admin") {
      await Todo.updateMany({}, { isCompleted: true });
    } else {
      await Todo.updateMany({ user: req.user.userId }, { isCompleted: true });
    }
    res.json({ message: "All todos marked as completed" });
  } catch (err) {
    res.status(500).json({ message: "Failed to update todos" });
  }
});


router.put("/:id", authMiddleware, authorize(["user","admin"]), async (req,res)=>{
    try{
        const todo = await Todo.findById(req.params.id);

        if (!todo) return res.status(404).json({ message: "Todo not found" });

        if (req.user.role === "user" && todo.user.toString() !== req.user.userId){
        return res.status(403).json({ message: "Not allowed" });
        }
        const {title, description, isCompleted} = req.body;

        if (title !== undefined) todo.title = title;
        if (description !== undefined) todo.description = description;
        if (isCompleted !== undefined) todo.isCompleted = isCompleted;
        await todo.save();
        res.json(todo);
    }catch(error){
        res.status(500).json({ message: "Server error" });
    }
});
router.delete("/:id", authMiddleware, authorize(["user","admin"]), async (req,res) => {
    try {
        const todo = await Todo.findById(req.params.id);
        if (!todo) return res.status(404).json({ message: "Todo not found" });
        if (req.user.role === "user" && todo.user.toString() !== req.user.userId) {
        return res.status(403).json({ message: "Not allowed" });
        }
        await todo.deleteOne();
        res.json({ message: "Todo deleted"});
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
});




module.exports = router;
