const Faq = require("../models/Faq");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");

exports.createFaq = asyncHandler(async (req, res, next) => {
  req.body.createUser = req.userId;
  const language = req.cookies.language || "mn";
  const { question, answer } = req.body;
  ["question", "answer"].map((el) => delete req.body[el]);

  req.body[language] = {
    question,
    answer,
  };

  const faq = await Faq.create(req.body);
  res.status(200).json({
    success: true,
    data: faq,
  });
});

exports.updateFaq = asyncHandler(async (req, res) => {
  let faq = await Faq.findById(req.params.id);

  if (!faq) {
    throw new MyError("Тухайн асуулт хариулт олдсонгүй", 404);
  }

  const language = req.cookies.language || "mn";
  const { question, answer } = req.body;
  ["question", "answer"].map((el) => delete req.body[el]);

  req.body.updateAt = new Date();
  req.body.updateUser = req.userId;
  req.body[language] = {
    question,
    answer,
  };

  faq = await Faq.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: faq,
  });
});

exports.deteleFaq = asyncHandler(async (req, res) => {
  const faq = await Faq.findByIdAndDelete(req.params.id);

  if (!faq) {
    throw new MyError("Түгээмэл асуулт алга байна. ", 404);
  }

  res.status(200).json({
    success: true,
    data: faq,
  });
});

exports.getFaq = asyncHandler(async (req, res) => {
  const faq = await Faq.findById(req.params.id).populate(
    "createUser",
    "updateUser"
  );

  if (!faq) {
    throw new MyError("Өгөгдөл олдсонгүй", 404);
  }

  res.status(200).json({
    success: true,
    data: faq,
  });
});

exports.getFaqs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  let sort = req.query.sort || { createAt: -1 };
  const select = req.query.select;
  const userInput = req.query;

  //FIELDS
  let status = req.query.status || null;
  const stringLanguageFld = ["answer", "question"];
  const createUser = userInput["createUser"];
  const updateUser = userInput["updateUser"];

  const query = Faq.find();

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
  const pagination = await paginate(page, limit, Faq, result);
  query.limit(limit);
  query.skip(pagination.start - 1);
  const faqs = await query.exec();

  res.status(200).json({
    success: true,
    count: faqs.length,
    data: faqs,
    pagination,
  });
});

const getFullData = async (req, page) => {
  const limit = 25;
  const select = req.query.select;
  let sort = req.query.sort || { createAt: -1 };

  //FIELDS
  let status = req.query.status || null;
  const stringLanguageFld = ["answer", "question"];
  const createUser = userInput["createUser"];
  const updateUser = userInput["updateUser"];

  const query = Faq.find();

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

  const pagination = await paginate(page, limit, Faq, result);
  query.limit(limit);
  query.skip(pagination.start - 1);
  const faqs = await query.exec();

  return faqs;
};

exports.excelData = asyncHandler(async (req, res) => {
  const page = req.query.page || 1;
  let sort = req.query.sort || { createAt: -1 };
  const select = req.query.select;

  //FIELDS
  let status = req.query.status || null;
  const stringLanguageFld = ["answer", "question"];
  const createUser = userInput["createUser"];
  const updateUser = userInput["updateUser"];

  const query = Faq.find();

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
  const pagination = await paginate(page, limit, Faq, result);
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

exports.multDeleteFaq = asyncHandler(async (req, res) => {
  const ids = req.queryPolluted.id;
  const finds = await Faq.find({ _id: { $in: ids } });

  if (finds.length <= 0) {
    throw new MyError("Таны сонгосон өгөгдөлүүд байхгүй байна", 400);
  }

  const faqs = await Faq.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
    faqs,
  });
});
