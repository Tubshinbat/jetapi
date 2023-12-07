const NewsCategory = require("../models/NewsCategory");
const asyncHandler = require("express-async-handler");
const MyError = require("../utils/myError");

exports.createNewsCategory = asyncHandler(async (req, res, next) => {
  const language = req.cookies.language || "mn";
  const name = req.body.name;
  delete req.body.language;
  delete req.body.name;

  req.body[language] = {
    name,
  };

  const category = await NewsCategory.create(req.body);

  res.status(200).json({
    success: true,
    data: category,
  });
});

exports.getNewsCategories = asyncHandler(async (req, res, next) => {
  const categories = await NewsCategory.find()
    .populate("createUser")
    .populate("updateUser");

  res.status(200).json({
    success: true,
    data: categories,
  });
});

exports.getNewsCategory = asyncHandler(async (req, res, next) => {
  const newsCategory = await NewsCategory.findById(req.params.id);

  if (!newsCategory) {
    throw new MyError(req.params.id + " Тус өгөгдөл олдсонгүй.", 404);
  }

  res.status(200).json({
    success: true,
    data: newsCategory,
  });
});

exports.deletetNewsCategory = asyncHandler(async (req, res, next) => {
  const category = await NewsCategory.findById(req.params.id);
  if (!category) {
    throw new MyError(req.params.id + " ангилал байхгүй байна", 404);
  }

  category.remove();

  res.status(200).json({
    success: true,
    data: category,
  });
});

exports.updateNewsCategory = asyncHandler(async (req, res, next) => {
  let category = await NewsCategory.findById(req.params.id);

  if (!category) {
    throw new MyError("Ангилалын нэр солигдсонгүй", 400);
  }

  const language = req.cookies.language || "mn";
  const name = req.body.name;
  delete req.body.name;

  req.body[language] = {
    name,
  };

  category = await NewsCategory.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: category,
  });
});
