const WebInfo = require("../models/Webinfo");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");

exports.createWebInfo = asyncHandler(async (req, res, next) => {
  const language = req.cookies.language || "mn";
  const { logo, whiteLogo, name, address, siteInfo, policy } = req.body;

  req.body[language] = {
    logo,
    whiteLogo,
    name,
    address,
    siteInfo,
    policy,
  };

  req.body.createUser = req.userId;
  const webinfo = await WebInfo.create(req.body);

  res.status(200).json({
    success: true,
    data: webinfo,
  });
});

exports.getWebinfo = asyncHandler(async (req, res) => {
  const webInfo = await WebInfo.findOne().sort({ updateAt: -1 });
  if (!webInfo) {
    throw new MyError("Хайсан мэдээлэл олдсонгүй", 400);
  }
  res.status(200).json({
    success: true,
    data: webInfo,
  });
});

exports.updateInfo = asyncHandler(async (req, res) => {
  const info = await WebInfo.findOne().sort({ updateAt: -1 });
  if (!info) {
    throw new MyError("Хайсан мэдээлэл олдсонгүй", 400);
  }
  const language = req.cookies.language || "mn";
  const { logo, whiteLogo, name, address, siteInfo, policy } = req.body;

  language === "eng" ? delete req.body.mn : delete req.body.eng;

  req.body[language] = {
    logo,
    whiteLogo,
    name,
    address,
    siteInfo,
    policy,
  };

  req.body[language].logo = logo;
  req.body[language].whiteLogo = whiteLogo || "";

  const webInfo = await WebInfo.findByIdAndUpdate(info._id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: webInfo,
  });
});

exports.updateWebInfo = asyncHandler(async (req, res, next) => {
  const language = req.cookies.language || "mn";
  const { logo, whiteLogo, name, address, siteInfo, policy } = req.body;

  language === "eng" ? delete req.body.mn : delete req.body.eng;

  req.body[language] = {
    logo,
    whiteLogo,
    name,
    address,
    siteInfo,
    policy,
  };

  req.body[language].logo = logo;
  req.body[language].whiteLogo = whiteLogo || "";

  const webInfo = await WebInfo.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: webInfo,
  });
});
