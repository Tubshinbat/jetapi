const FastLink = require("../models/FastLink");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const { imageDelete } = require("../lib/fileUpload");
const { valueRequired } = require("../lib/check");

exports.createFastLink = asyncHandler(async (req, res, next) => {
  const language = req.cookies.language || "mn";
  req.body.status = !valueRequired(req.body.status) ? true : req.body.status;
  const { name, about } = req.body;
  ["name", "about"].map((el) => delete req.body[el]);

  if (!valueRequired(req.body.picture)) {
    throw new MyError("Зураг хуулна уу", 404);
  }
  req.body[language] = {
    name,
    about,
  };

  const fastLink = await FastLink.create(req.body);

  res.status(200).json({
    success: true,
    data: fastLink,
  });
});

exports.getFastLinks = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  let sort = req.query.sort || { createAt: -1 };
  const select = req.query.select;

  // FIELDS
  const userInput = req.query;
  let status = req.query.status || null;
  const stringDtl = ["name", "about", "direct"];
  const createUser = userInput["createUser"];
  const updateUser = userInput["updateUser"];

  const query = FastLink.find();

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
  query.populate("createUser");
  query.populate("updateUser");

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();
  const pagination = await paginate(page, limit, FastLink, result);
  query.limit(limit);
  query.skip(pagination.start - 1);
  const fastLinks = await query.exec();

  res.status(200).json({
    success: true,
    count: fastLinks.length,
    data: fastLinks,
    pagination,
  });
});

exports.getFastLink = asyncHandler(async (req, res) => {
  const fastLink = await FastLink.findById(req.params.id)
    .populate("createUser")
    .populate("updateUser");

  if (!fastLink) {
    throw new MyError("Өгөгдөл олдсонгүй", 404);
  }

  res.status(200).json({
    success: true,
    data: fastLink,
  });
});

exports.updateFastLink = asyncHandler(async (req, res) => {
  let fastLink = await FastLink.findById(req.params.id);

  if (!fastLink) {
    throw new MyError("Өгөгдөл олдсонгүй", 404);
  }

  const language = req.cookies.language || "mn";
  const { name, about } = req.body;
  ["name", "about"].map((el) => delete req.body[el]);

  req.body[language] = {
    name,
    about,
  };

  req.body.updateAt = new Date();
  req.body.updateUser = req.userId;

  fastLink = await FastLink.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: fastLink,
  });
});

exports.excelData = asyncHandler(async (req, res) => {
  const page = req.query.page || 1;
  let sort = req.query.sort || { createAt: -1 };
  const select = req.query.select;

  //FIELDS
  const userInput = req.query;
  let status = req.query.status || null;
  const stringDtl = ["name", "about", "direct"];
  const createUser = userInput["createUser"];
  const updateUser = userInput["updateUser"];

  const query = FastLink.find();

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
  query.populate("createUser");
  query.populate("updateUser");

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();
  const pagination = await paginate(page, limit, Employees, result);
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
  const userInput = req.query;
  let status = req.query.status || null;
  const stringDtl = ["name", "about", "direct"];
  const createUser = userInput["createUser"];
  const updateUser = userInput["updateUser"];

  const query = FastLink.find();

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
  query.populate("createUser");
  query.populate("updateUser");

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();

  const pagination = await paginate(page, limit, FastLink, result);
  query.limit(limit);
  query.skip(pagination.start - 1);
  const fastLinks = await query.exec();

  return fastLinks;
};

exports.multDeleteFastLink = asyncHandler(async (req, res) => {
  const ids = req.queryPolluted.id;
  const finds = await FastLink.find({ _id: { $in: ids } });

  if (finds.length <= 0) {
    throw new MyError("Таны сонгосон өгөгдөлүүд байхгүй байна", 400);
  }

  finds.map(async (el) => {
    valueRequired(icon) && (await imageDelete(el.icon));
    valueRequired(picture) && (await imageDelete(el.picture));
  });

  const fastLinks = await FastLink.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
    fastLinks,
  });
});
