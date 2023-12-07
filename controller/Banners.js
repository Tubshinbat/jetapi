const Banner = require("../models/Banner");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const { RegexOptions, userSearch } = require("../lib/searchOfterModel");
const { valueRequired } = require("../lib/check");
const { imageDelete } = require("../lib/fileUpload");

exports.createBanner = asyncHandler(async (req, res) => {
  const language = req.cookies.language || "mn";
  const type = req.body.type;
  const { name, details } = req.body;
  ["name", "details"].map((el) => delete req.body[el]);

  const typeBanner = await Banner.find({ type: type });

  if (typeBanner && typeBanner.length > 0 && req.body.type === "video") {
    throw new MyError(
      "Өмнө видео баннер оруулсан зөвхөн ганцхан видео баннер оруулах боломжтой",
      500
    );
  }

  req.body[language] = {
    name,
    details,
  };

  if (req.body.type === "video" && !valueRequired(req.body.video)) {
    req.body.banner = "";
    throw new MyError("Видео оруулна уу", 500);
  } else if (req.body === "photo" && !valueRequired(req.body.banner)) {
    req.body.video = "";
    throw new MyError("Зураг оруулна уу", 500);
  }

  const banner = await Banner.create(req.body);

  res.status(200).json({
    success: true,
    data: banner,
  });
});

exports.getBanners = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  let sort = req.query.sort || { createAt: -1 };

  const userInput = req.query;

  // FIELDS
  let status = req.query.status || null;
  const stringDtl = ["name", "details", "link"];
  const createUser = userInput["createUser"];
  const updateUser = userInput["updateUser"];

  const query = Banner.find();

  stringDtl.map((el) => {
    if (valueRequired(userInput[el])) {
      const engName = "eng." + el;
      const mnName = "mn." + el;
      query.find({
        $or: [
          { [engName]: RegexOptions(userInput[el]) },
          { [mnName]: RegexOptions(userInput[el]) },
        ],
      });
    }
  });

  if (valueRequired(createUser)) {
    const userData = await userSearch(createUser);
    if (userData) query.where("createUser").in(userData);
  }

  if (valueRequired(updateUser)) {
    const userData = await userSearch(updateUser);
    if (userData) query.where("updateUser").in(userData);
  }

  if (valueRequired(sort)) {
    if (typeof sort === "string") {
      const spliteSort = sort.split(":");
      let convertSort = {};
      if (spliteSort[1] === "ascend") {
        convertSort = { [spliteSort[0]]: 1 };
      } else {
        convertSort = { [spliteSort[0]]: -1 };
      }
      if (spliteSort[0] != "undefined") query.sort(convertSort);
    } else {
      query.sort(sort);
    }
  }

  if (valueRequired(status)) {
    if (status.split(",").length > 1) {
      query.where("status").in(status.split(","));
    } else query.where("status").equals(status);
  }

  query.populate("createUser");
  query.populate("updateUser");

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();

  const pagination = await paginate(page, limit, Banner, result);
  query.limit(limit);
  query.skip(pagination.start - 1);
  const banner = await query.exec();

  res.status(200).json({
    success: true,
    count: banner.length,
    data: banner,
    pagination,
  });
});

exports.getFullData = asyncHandler(async (req, res) => {
  let sort = req.query.sort || { createAt: -1 };
  const select = req.query.select;

  const userInput = req.query;

  // FIELDS
  let status = req.query.status || null;
  const stringDtl = ["name", "details", "link"];
  const createUser = userInput["createUser"];
  const updateUser = userInput["updateUser"];

  const query = Banner.find();

  stringDtl.map((el) => {
    if (valueRequired(userInput[el])) {
      const engName = "eng." + el;
      const mnName = "mn." + el;
      query.find({
        $or: [
          { [engName]: RegexOptions(userInput[el]) },
          { [mnName]: RegexOptions(userInput[el]) },
        ],
      });
    }
  });

  if (valueRequired(createUser)) {
    const userData = await userSearch(createUser);
    if (userData) query.where("createUser").in(userData);
  }

  if (valueRequired(updateUser)) {
    const userData = await userSearch(updateUser);
    if (userData) query.where("updateUser").in(userData);
  }

  if (valueRequired(sort)) {
    if (typeof sort === "string") {
      const spliteSort = sort.split(":");
      let convertSort = {};
      if (spliteSort[1] === "ascend") {
        convertSort = { [spliteSort[0]]: 1 };
      } else {
        convertSort = { [spliteSort[0]]: -1 };
      }
      if (spliteSort[0] != "undefined") query.sort(convertSort);
    } else {
      query.sort(sort);
    }
  }

  if (valueRequired(status)) {
    if (status.split(",").length > 1) {
      query.where("status").in(status.split(","));
    } else query.where("status").equals(status);
  }

  query.select(select);
  query.populate({ path: "createUser", select: "firstName -_id" });
  query.populate({ path: "updateUser", select: "firstName -_id" });

  const banners = await query.exec();

  res.status(200).json({
    success: true,
    count: banner.length,
    data: banners,
  });
});

exports.getBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id)
    .populate("createUser")
    .populate("updateUser");

  if (!Banner) {
    throw new MyError("Тухайн баннер байхгүй байна. ", 404);
  }

  res.status(200).json({
    success: true,
    data: banner,
  });
});

exports.multDeleteBanner = asyncHandler(async (req, res) => {
  const ids = req.queryPolluted.id;
  const findBanners = await Banner.find({ _id: { $in: ids } });

  if (findBanners.length <= 0) {
    throw new MyError("Таны сонгосон баннерууд байхгүй байна", 400);
  }

  findBanners.map(async (el) => {
    el.banner && (await imageDelete(el.banner));
    el.video && (await imageDelete(el.video));
  });

  const banner = await Banner.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
  });
});

exports.updateBanner = asyncHandler(async (req, res) => {
  let banner = await Banner.findById(req.params.id);

  if (!banner) {
    throw new MyError("Тухайн баннер байхгүй байна. ", 404);
  }

  const language = req.cookies.language || "mn";
  const { name, details } = req.body;
  ["name", "details"].map((el) => delete req.body[el]);

  if (req.body.type === "video" && !valueRequired(req.body.video)) {
    req.body.banner = "";
    throw new MyError("Видео оруулна уу", 500);
  } else if (req.body === "photo" && !valueRequired(req.body.banner)) {
    req.body.video = "";
    throw new MyError("Зураг оруулна уу", 500);
  }

  req.body[language] = {
    name,
    details,
  };

  req.body.updateAt = new Date();
  req.body.updateUser = req.userId;

  banner = await Banner.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: banner,
  });
});

exports.getCounBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.count();
  res.status(200).json({
    success: true,
    data: banner,
  });
});
