const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

/* HOME ROUTE */
app.get("/", (req, res) => {
  res.send("Backend is working 🚀");
});

/* MONGODB CONNECT */
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/myStoreDB";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("DB Error:", err));

/* SCHEMAS */
const orderSchema = new mongoose.Schema({
  name: String,
  phone: String,
  address: String,
  city: String,
  postal: String,
  payment: String,
  items: Array,
  subtotal: Number,
  shipping: Number,
  total: Number,
  status: { type: String, default: "pending" },
});

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

const Order = mongoose.model("Order", orderSchema);
const User = mongoose.model("User", userSchema);

/* ROUTES */
app.post("/order", async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    await newOrder.save();
    res.json({ success: true, message: "Order Saved" });
  } catch (err) {
    res.status(500).json({ error: "Error saving order" });
  }
});

app.get("/orders", async (req, res) => {
  const orders = await Order.find().sort({ _id: -1 });
  res.json(orders);
});

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  const exist = await User.findOne({ email });
  if (exist) {
    return res.json({ success: false, message: "User exists" });
  }

  const user = new User({ name, email, password });
  await user.save();

  res.json({ success: true, message: "Registered" });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email, password });

  if (user) {
    res.json({ success: true, user });
  } else {
    res.json({ success: false, message: "Invalid login" });
  }
});

app.get("/users", async (req, res) => {
  const users = await User.find().sort({ _id: -1 });
  res.json(users);
});

/* SERVER */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
