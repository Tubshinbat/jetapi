const MediaCategory = require("../models/MediaCategory");
const asyncHandler = require("express-async-handler");
const MyError = require("../utils/myError");

exports.createMediaCategory = asyncHandler(async (req, res, next) => {
  const language = req.cookies.language || "mn";
  const name = req.body.name;
  delete req.body.language;
  delete req.body.name;

  req.body[language] = {
    name,
  };

  const category = await MediaCategory.create(req.body);

  res.status(200).json({
    success: true,
    data: category,
  });
});

exports.getMediaCategories = asyncHandler(async (req, res, next) => {
  const categories = await MediaCategory.find()
    .populate("createUser")
    .populate("updateUser");

  res.status(200).json({
    success: true,
    data: categories,
  });
});

exports.getMediaCategory = asyncHandler(async (req, res, next) => {
  const mediaCategory = await MediaCategory.findById(req.params.id);

  if (!mediaCategory) {
    throw new MyError(req.params.id + " Тус өгөгдөл олдсонгүй.", 404);
  }

  res.status(200).json({
    success: true,
    data: mediaCategory,
  });
});

exports.deletetMediaCategory = asyncHandler(async (req, res, next) => {
  const category = await MediaCategory.findById(req.params.id);
  if (!category) {
    throw new MyError(req.params.id + " ангилал байхгүй байна", 404);
  }

  category.remove();

  res.status(200).json({
    success: true,
    data: category,
  });
});

exports.updateMediaCategory = asyncHandler(async (req, res, next) => {
  let category = await MediaCategory.findById(req.params.id);

  if (!category) {
    throw new MyError("Ангилалын нэр солигдсонгүй", 400);
  }

  const language = req.cookies.language || "mn";
  const name = req.body.name;
  delete req.body.name;

  req.body[language] = {
    name,
  };

  category = await MediaCategory.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: category,
  });
});
