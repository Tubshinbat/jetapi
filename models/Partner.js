const mongoose = require("mongoose");

const PartnerSchema = new mongoose.Schema({
  status: {
    type: Boolean,
    enum: [true, false],
    required: [true, "Төлөв сонгоно уу"],
    default: false,
  },

  name: {
    type: String,
    required: [true, "Нэр оруулна уу"],
  },

  link: {
    type: String,
    required: [true, "Холбоос линк оруулна уу"],
  },

  logo: {
    type: String,
    required: [true, "Лого оруулна уу"],
  },

  createAt: {
    type: Date,
    default: Date.now,
  },
  updateAt: {
    type: Date,
    default: Date.now,
  },
  createUser: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  updateUser: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Partner", PartnerSchema);
