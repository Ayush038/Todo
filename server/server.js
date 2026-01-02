const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

app.use(cors({
  origin: "https://todoproject-pink.vercel.app",
}));

app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error(err);
    process.exit(1);
});

app.use("/api/auth", require("./routes/auth"));
app.use("/api/todos", require("./routes/todos"));

app.get("/", (req, res) => {
  res.send("API running");
});
app.get("/ping", (req, res) => res.json({ status: "alive" }));

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
