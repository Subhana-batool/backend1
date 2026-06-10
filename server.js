const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// =========================
// MongoDB CONNECT (FIXED)
// =========================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ DB Error:", err));

// =========================
// ORDER SCHEMA
// =========================
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
  status: {
    type: String,
    default: "pending",
  },
});

const Order = mongoose.model("Order", orderSchema);

// =========================
// USER SCHEMA
// =========================
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

const User = mongoose.model("User", userSchema);

// =========================
// ROUTES
// =========================

// Save Order
app.post("/order", async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    await newOrder.save();
    res.json({ success: true, message: "Order Saved ✅" });
  } catch (err) {
    res.status(500).json({ error: "Error saving order ❌" });
  }
});

// Get Orders
app.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find().sort({ _id: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Error fetching orders ❌" });
  }
});

// Register User
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields required" });
    }

    const exist = await User.findOne({ email });
    if (exist) {
      return res.json({ success: false, message: "User already exists" });
    }

    const user = new User({ name, email, password });
    await user.save();

    res.json({ success: true, message: "User Registered ✅" });
  } catch (err) {
    res.status(500).json({ error: "Error registering user ❌" });
  }
});

// Login User
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, password });

    if (user) {
      res.json({ success: true, user });
    } else {
      res.json({ success: false, message: "Invalid credentials ❌" });
    }
  } catch (err) {
    res.status(500).json({ error: "Login error ❌" });
  }
});

// Get Users
app.get("/users", async (req, res) => {
  try {
    const users = await User.find().sort({ _id: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Error fetching users ❌" });
  }
});

// =========================
// SERVER START (IMPORTANT FOR RENDER)
// =========================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
