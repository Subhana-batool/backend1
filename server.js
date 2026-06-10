const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// ✅ MIDDLEWARE
app.use(cors());
app.use(express.json());

/* =========================
   ✅ MONGODB CONNECT
========================= */
mongoose.connect("mongodb://127.0.0.1:27017/myStoreDB")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ DB Error:", err));

/* =========================
   🟡 ORDER SCHEMA
========================= */
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

/* =========================
   🟢 USER SCHEMA
========================= */
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

const User = mongoose.model("User", userSchema);

/* =========================
   🔥 SAVE ORDER
========================= */
app.post("/order", async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    await newOrder.save();

    res.json({ success: true, message: "Order Saved ✅" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error saving order ❌" });
  }
});

/* =========================
   🔥 GET ORDERS
========================= */
app.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find().sort({ _id: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Error fetching orders ❌" });
  }
});

/* =========================
   🔥 REGISTER USER
========================= */
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // ❌ check empty
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields required" });
    }

    // ❌ check existing user
    const exist = await User.findOne({ email });
    if (exist) {
      return res.json({ success: false, message: "User already exists" });
    }

    const user = new User({ name, email, password });
    await user.save();

    res.json({ success: true, message: "User Registered ✅" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error registering user ❌" });
  }
});

/* =========================
   🔥 LOGIN USER
========================= */
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

/* =========================
   🔥 GET USERS (ADMIN)
========================= */
app.get("/users", async (req, res) => {
  try {
    const users = await User.find().sort({ _id: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Error fetching users ❌" });
  }
});

/* =========================
   🚀 SERVER START
========================= */
app.listen(5000, () =>
  console.log("🚀 Server running on http://localhost:5000")
);