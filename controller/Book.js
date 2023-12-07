const Book = require("../models/Book");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const { imageDelete } = require("../lib/fileUpload");
const { valueRequired } = require("../lib/check");
const { RegexOptions } = require("../lib/searchOfterModel");

exports.createBook = asyncHandler(async (req, res) => {
  req.body.status = valueRequired(req.body.status) ? req.body.status : true;

  if (!valueRequired(req.body.picture)) {
    throw new MyError("Номны зураг оруулна уу!", 408);
  }

  const book = await Book.create(req.body);
  res.status(200).json({
    success: true,
    data: book,
  });
});

exports.getBooks = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  let sort = req.query.sort || { createAt: -1 };
  const select = req.query.select;

  // FIELDS
  const userInput = req.query;
  let status = req.query.status || null;
  const stringDtl = ["name", "about", "link"];
  const createUser = userInput["createUser"];
  const updateUser = userInput["updateUser"];

  const query = Book.find();

  stringDtl.map((el) => {
    if (valueRequired(userInput[el]))
      query.find({ [el]: RegexOptions(userInput[el]) });
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

  const pagination = await paginate(page, limit, Book, result);
  query.limit(limit);
  query.skip(pagination.start - 1);
  const books = await query.exec();

  res.status(200).json({
    success: true,
    count: books.length,
    data: books,
    pagination,
  });
});

exports.getBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    throw new MyError("Тухайн ном байхгүй байна. ", 404);
  }

  res.status(200).json({
    success: true,
    data: book,
  });
});

exports.excelData = asyncHandler(async (req, res) => {
  const page = req.query.page || 1;
  let sort = req.query.sort || { createAt: -1 };
  const select = req.query.select;

  // FIELDS
  const userInput = req.query;
  let status = req.query.status || null;
  const stringDtl = ["name", "about", "link"];
  const createUser = userInput["createUser"];
  const updateUser = userInput["updateUser"];

  const query = Book.find();

  stringDtl.map((el) => {
    query.find({ [el]: RegexOptions(userInput[el]) });
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
  const pagination = await paginate(page, limit, Book, result);
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

  // FIELDS
  const userInput = req.query;
  let status = req.query.status || null;
  const stringDtl = ["name", "about", "link"];
  const createUser = userInput["createUser"];
  const updateUser = userInput["updateUser"];

  const query = Book.find();

  stringDtl.map((el) => {
    query.find({ [el]: RegexOptions(userInput[el]) });
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

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();

  const pagination = await paginate(page, limit, Book, result);
  query.limit(limit);
  query.skip(pagination.start - 1);
  const books = await query.exec();

  return books;
};

exports.multDeleteBook = asyncHandler(async (req, res) => {
  const ids = req.queryPolluted.id;
  const findBooks = await Book.find({ _id: { $in: ids } });

  if (findBooks.length <= 0) {
    throw new MyError("Таны сонгосон номнууд байхгүй байна", 400);
  }

  findBooks.map(async (el) => {
    await imageDelete(el.picture);
  });

  const books = await Book.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
    books,
  });
});

exports.updateBook = asyncHandler(async (req, res) => {
  let book = await Book.findById(req.params.id);

  if (!book) {
    throw new MyError("Сонгосон ном олдсонгүй.", 404);
  }

  req.body.updateAt = new Date();
  req.body.updateUser = req.userId;

  book = await Book.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: book,
  });
});
