const User = require("../models/User");
const MediaCategories = require("../models/MediaCategory");
const Position = require("../models/Position");
const NewsCategories = require("../models/NewsCategory");
const Menu = require("../models/Menu");
const FooterMenu = require("../models/FooterMenu");
const Page = require("../models/Page");

exports.userSearch = async (name) => {
  const userData = await User.find({
    firstName: { $regex: ".*" + name + ".*", $options: "i" },
  }).select("_id");
  return userData;
};

exports.usePageSearch = async (name) => {
  const pages = await Page.find({
    $or: [
      { "eng.name": this.RegexOptions(name) },
      {
        "mn.name": this.RegexOptions(name),
      },
    ],
  });

  return pages;
};

exports.useMenuSearch = async (name) => {
  const menus = await Menu.find({
    $or: [
      { "eng.name": this.RegexOptions(name) },
      { "mn.name": this.RegexOptions(name) },
    ],
  }).select("_id");

  return menus;
};

exports.useFooterMenuSearch = async (name) => {
  const footerMenus = await FooterMenu.find({
    $or: [
      { "eng.name": this.RegexOptions(name) },
      { "mn.name": this.RegexOptions(name) },
    ],
  }).select("_id");

  return footerMenus;
};

exports.usePositionSearch = async (name) => {
  const positions = await Position.find({
    $or: [
      { "eng.name": this.RegexOptions(name) },
      {
        "mn.name": this.RegexOptions(name),
      },
    ],
  });

  return positions;
};

exports.useNewsCategories = async (name) => {
  const newsCategories = await NewsCategories.find({
    $or: [
      { "eng.name": this.RegexOptions(name) },
      { "mn.name": this.RegexOptions(name) },
    ],
  }).select("_id");

  return newsCategories;
};

exports.useMediaSearch = async (name) => {
  const medias = await MediaCategories.find({
    $or: [
      { "eng.name": this.RegexOptions(name) },
      { "mn.name": this.RegexOptions(name) },
    ],
  }).select("_id");

  return medias;
};

exports.usePositions = async (name) => {
  const positions = await Position.find({
    $or: [
      { "eng.name": this.RegexOptions(name) },
      { "mn.name": this.RegexOptions(name) },
    ],
  }).select("_id");
  return positions;
};

exports.RegexOptions = (value) => {
  const regexNameSearch = { $regex: ".*" + value + ".*", $options: "i" };
  return regexNameSearch;
};
