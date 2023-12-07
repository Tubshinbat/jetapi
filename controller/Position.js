const Position = require("../models/Position");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const { valueRequired } = require("../lib/check");

exports.createPosition = asyncHandler(async (req, res, next) => {
  const language = req.cookies.language || "mn";
  const { name, about } = req.body;
  ["name", "about"].map((el) => delete req.body[el]);

  req.body[language] = {
    name,
    about,
  };

  req.body.createUser = req.userId;

  const position = await Position.create(req.body);
  res.status(200).json({
    success: true,
    data: position,
  });
});

exports.updatePosition = asyncHandler(async (req, res) => {
  let position = await Position.findById(req.params.id);
  const language = req.cookies.language || "mn";

  if (!position) {
    throw new MyError("Өгөгдөл олдсонгүй", 404);
  }

  const { name, about } = req.body;
  ["name", "about", "language"].map((el) => delete req.body[el]);

  req.body[language] = {
    name,
    about,
  };
  req.body.updateAt = new Date();
  req.body.updateUser = req.userId;

  position = await Position.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: position,
  });
});

exports.getPositions = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  let sort = req.query.sort || { createAt: -1 };
  const select = req.query.select;
  const userInput = req.query;

  //FIELDS
  const status = userInput["status"];
  const stringLanguageFld = ["about", "name"];
  const createUser = userInput["createUser"];
  const updateUser = userInput["updateUser"];

  const query = Position.find();

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
  const pagination = await paginate(page, limit, Position, result);
  query.limit(limit);
  query.skip(pagination.start - 1);
  const positions = await query.exec();

  res.status(200).json({
    success: true,
    count: positions.length,
    data: positions,
    pagination,
  });
});

exports.getPosition = asyncHandler(async (req, res) => {
  const position = await Position.findById(req.params.id)
    .populate("createUser")
    .populate("updateUser");

  if (!position) {
    throw new MyError("Өгөгдөл олдсонгүй", 404);
  }

  res.status(200).json({
    success: true,
    data: position,
  });
});

exports.excelData = asyncHandler(async (req, res) => {
  const page = req.query.page || 1;
  let sort = req.query.sort || { createAt: -1 };
  const select = req.query.select;

  //FIELDS
  const status = userInput["status"];
  const stringLanguageFld = ["about", "name"];
  const createUser = userInput["createUser"];
  const updateUser = userInput["updateUser"];

  const query = Position.find();

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
  const pagination = await paginate(page, limit, Position, result);
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
  const status = userInput["status"];
  const stringLanguageFld = ["about", "name"];
  const createUser = userInput["createUser"];
  const updateUser = userInput["updateUser"];

  const query = Position.find();

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

  const pagination = await paginate(page, limit, Position, result);
  query.limit(limit);
  query.skip(pagination.start - 1);
  const positions = await query.exec();

  return positions;
};

exports.multDeletePosition = asyncHandler(async (req, res) => {
  const ids = req.queryPolluted.id;
  const finds = await Position.find({ _id: { $in: ids } });

  if (finds.length <= 0) {
    throw new MyError("Таны сонгосон өгөгдөлүүд байхгүй байна", 400);
  }

  finds.map(async (el) => {
    el.picture && (await imageDelete(el.picture));
  });

  const positions = await Position.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
    positions,
  });
});

exports.deletePosition = asyncHandler(async (req, res) => {
  let position = await Position.findById(req.params.id);
  if (!position) {
    throw new MyError(req.params.id + " ангилал олдсонгүй", 404);
  }

  position.remove();

  res.status(200).json({
    success: true,
    data: position,
  });
});

exports.getCountPosition = asyncHandler(async (req, res, next) => {
  const position = await Position.count();
  res.status(200).json({
    success: true,
    data: position,
  });
});
