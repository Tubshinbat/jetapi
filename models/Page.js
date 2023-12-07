const mongoose = require("mongoose");
const { slugify } = require("transliteration");

const PageSchema = new mongoose.Schema({
  status: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },

  mainLink: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },

  newsActive: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },

  listActive: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },

  pageActive: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },

  pageParentActive: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },

  listAdmissionActive: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },

  admissionActive: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },

  parentActive: {
    type: Boolean,
    enum: [true, false],
    default: true,
  },

  sideActive: {
    type: Boolean,
    enum: [true, false],
    default: true,
  },

  modalActive: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },

  choiseModal: {
    type: String,
  },

  modal: {
    type: String,
  },

  admissionLink: {
    type: String,
  },

  eng: {
    name: {
      type: String,
    },

    pageInfo: {
      type: String,
    },
  },

  mn: {
    name: {
      type: String,
    },

    pageInfo: {
      type: String,
    },
  },

  menu: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Menu",
    },
  ],

  position: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Position",
    },
  ],

  footerMenu: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "FooterMenu",
    },
  ],

  categories: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "NewsCategories",
    },
  ],

  page: {
    type: mongoose.Schema.ObjectId,
    ref: "Page",
  },

  pictures: {
    type: [String],
  },

  views: {
    type: Number,
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

module.exports = mongoose.model("Page", PageSchema);
