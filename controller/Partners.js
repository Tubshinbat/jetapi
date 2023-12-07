const Partner = require("../models/Partner");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const { imageDelete } = require("../lib/fileUpload");
const { valueRequired } = require("../lib/check");

exports.createPartner = asyncHandler(async (req, res, next) => {
  req.body.createUser = req.userId;

  const partner = await Partner.create(req.body);
  res.status(200).json({
    success: true,
    data: partner,
  });
});

exports.updatePartner = asyncHandler(async (req, res) => {
  let partner = await Partner.findById(req.params.id);

  if (!partner) {
    throw new MyError("Өгөгдөл олдсонгүй ", 404);
  }

  req.body.updateAt = new Date();
  req.body.updateUser = req.userId;

  partner = await Partner.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: partner,
  });
});

exports.getPartners = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  let sort = req.query.sort || { createAt: -1 };
  const select = req.query.select;
  const userInput = req.query;

  //FIELDS
  let status = req.query.status || null;
  const stringDtl = ["name", "link"];
  const createUser = userInput["createUser"];
  const updateUser = userInput["updateUser"];

  const query = Partner.find();

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

  query.select(select);
  query.populate("createUser");
  query.populate("updateUser");

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();
  const pagination = await paginate(page, limit, Partner, result);
  query.limit(limit);
  query.skip(pagination.start - 1);
  const partners = await query.exec();

  res.status(200).json({
    success: true,
    count: partners.length,
    data: partners,
    pagination,
  });
});

exports.getPartner = asyncHandler(async (req, res) => {
  const partner = await Partner.findById(req.params.id)
    .populate("createUser")
    .populate("updateUser");

  if (!partner) {
    throw new MyError("Өгөгдөл олдсонгүй", 404);
  }

  res.status(200).json({
    success: true,
    data: partner,
  });
});

exports.excelData = asyncHandler(async (req, res) => {
  const page = req.query.page || 1;
  let sort = req.query.sort || { createAt: -1 };
  const select = req.query.select;

  //FIELDS
  let status = req.query.status || null;
  const stringDtl = ["name", "link"];
  const createUser = userInput["createUser"];
  const updateUser = userInput["updateUser"];

  const query = Partner.find();

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
  let status = req.query.status || null;
  const stringDtl = ["name", "link"];
  const createUser = userInput["createUser"];
  const updateUser = userInput["updateUser"];

  const query = Partner.find();

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

  query.select(select);
  query.populate("createUser");
  query.populate("updateUser");

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();

  const pagination = await paginate(page, limit, Partner, result);
  query.limit(limit);
  query.skip(pagination.start - 1);
  const partners = await query.exec();

  return partners;
};

exports.multDeletePartner = asyncHandler(async (req, res) => {
  const ids = req.queryPolluted.id;
  const finds = await Partner.find({ _id: { $in: ids } });

  if (finds.length <= 0) {
    throw new MyError("Таны сонгосон өгөгдөлүүд байхгүй байна", 400);
  }

  finds.map(async (el) => {
    el.logo && (await imageDelete(el.logo));
  });

  const partners = await Partner.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
    partners,
  });
});
