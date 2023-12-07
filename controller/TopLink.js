const TopLink = require("../models/TopLink");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const { imageDelete } = require("../lib/fileUpload");
const { valueRequired } = require("../lib/check");

exports.createTopLink = asyncHandler(async (req, res) => {
  const language = req.cookies.language || "mn";
  req.body.status = !valueRequired(req.body.status) ? true : req.body.status;
  const { name, about } = req.body;
  ["name", "about"].map((el) => delete req.body[el]);

  req.body[language] = {
    name,
    about,
  };

  const topLink = await TopLink.create(req.body);

  res.status(200).json({
    success: true,
    data: topLink,
  });
});

exports.updateTopLink = asyncHandler(async (req, res) => {
  let topLink = await TopLink.findById(req.params.id);

  if (!topLink) {
    throw new MyError("Өгөгдөл олдсонгүй. ", 404);
  }

  const language = req.cookies.language || "mn";
  const { name, about } = req.body;

  ["name", "about"].map((el) => delete req.body[el]);
  language === "eng" ? delete req.body.mn : delete req.body.eng;

  req.body.updateAt = new Date();
  req.body.updateUser = req.userId;
  req.body[language] = {
    name,
    about,
  };

  topLink = await TopLink.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: topLink,
  });
});

exports.getTopLinks = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  let sort = req.query.sort || { createAt: -1 };
  const userInput = req.query;

  //FIELDS
  let status = req.query.status || null;
  const stringDtl = ["direct", "oldDirect"];
  const stringLanguageFld = ["about", "name"];
  const createUser = userInput["createUser"];
  const updateUser = userInput["updateUser"];

  const query = TopLink.find();

  stringLanguageFld.map((el) => {
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

  stringDtl.map((el) => {
    if (valueRequired(userInput[el])) {
      query.find({ [el]: RegexOptions(userInput[el]) });
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
  const pagination = await paginate(page, limit, TopLink, result);
  query.limit(limit);
  query.skip(pagination.start - 1);
  const toplinks = await query.exec();

  res.status(200).json({
    success: true,
    count: toplinks.length,
    data: toplinks,
    pagination,
  });
});

exports.getTopLink = asyncHandler(async (req, res) => {
  const topLink = await TopLink.findById(req.params.id)
    .populate("createUser")
    .populate("updateUser");

  if (!topLink) {
    throw new MyError("Өгөгдөл олдсонгүй", 404);
  }

  res.status(200).json({
    success: true,
    data: topLink,
  });
});

exports.getSlugTopLink = asyncHandler(async (req, res) => {
  const topLink = await TopLink.findOne({ slug: req.params.slug })
    .populate("createUser")
    .populate("updateUser");

  if (!topLink) {
    throw new MyError("Өгөгдөл олдсонгүй", 404);
  }

  res.status(200).json({
    success: true,
    data: topLink,
  });
});

exports.excelData = asyncHandler(async (req, res) => {
  const page = req.query.page || 1;
  let sort = req.query.sort || { createAt: -1 };
  const select = req.query.select;

  //FIELDS
  let status = req.query.status || null;
  const stringDtl = ["direct", "oldDirect"];
  const stringLanguageFld = ["about", "name"];
  const createUser = userInput["createUser"];
  const updateUser = userInput["updateUser"];

  const query = TopLink.find();

  stringLanguageFld.map((el) => {
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

  stringDtl.map((el) => {
    if (valueRequired(userInput[el])) {
      query.find({ [el]: RegexOptions(userInput[el]) });
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
  const pagination = await paginate(page, limit, TopLink, result);
  const pageCount = pagination.pageCount;
  let datas = [];

  for (let i = 1; i <= pageCount; i++) {
    const res = await getFullData(req, i);
    datas.push(...res);
  }

  res.status(200).json({
    success: true,
    data: datas,
  });
});

const getFullData = async (req, page) => {
  const limit = 25;
  const select = req.query.select;
  let sort = req.query.sort || { createAt: -1 };

  //FIELDS
  let status = req.query.status || null;
  const stringDtl = ["direct", "oldDirect"];
  const stringLanguageFld = ["about", "name"];
  const createUser = userInput["createUser"];
  const updateUser = userInput["updateUser"];

  const query = TopLink.find();

  stringLanguageFld.map((el) => {
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

  stringDtl.map((el) => {
    if (valueRequired(userInput[el])) {
      query.find({ [el]: RegexOptions(userInput[el]) });
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

  const pagination = await paginate(page, limit, TopLink, result);
  query.limit(limit);
  query.skip(pagination.start - 1);
  const toplinks = await query.exec();

  return toplinks;
};

exports.multDeleteTopLink = asyncHandler(async (req, res) => {
  const ids = req.queryPolluted.id;
  const finds = await TopLink.find({ _id: { $in: ids } });

  if (finds.length <= 0) {
    throw new MyError("Таны сонгосон өгөгдөлүүд байхгүй байна", 400);
  }

  finds.map(async (el) => {
    el.picture && (await imageDelete(el.picture));
    el.icon && (await imageDelete(el.icon));
  });

  const topLinks = await TopLink.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
    topLinks,
  });
});
