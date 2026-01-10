const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  age: String,
  phone: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  address: String,
  pincode: String,
  password: { type: String, required: true },
});

module.exports = mongoose.model("User", UserSchema);
