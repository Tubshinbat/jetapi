const Contact = require("../models/Contact");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const { valueRequired } = require("../lib/check");
const { RegexOptions } = require("../lib/searchOfterModel");

exports.createContact = asyncHandler(async (req, res, next) => {
  const contact = await Contact.create(req.body);
  res.status(200).json({
    success: true,
    data: contact,
  });
});

exports.getContacts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  let sort = req.query.sort || { createAt: -1 };
  const select = req.query.select;
  const userInput = req.query;

  //FIELDS
  const stringDtl = ["name", "email", "phoneNumber", "message"];

  const query = Contact.find();

  stringDtl.map((el) => {
    if (valueRequired(userInput[el])) {
      query.find({ [el]: RegexOptions(userInput[el]) });
    }
  });

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

  query.select(select);

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();

  const pagination = await paginate(page, limit, Contact, result);
  query.limit(limit);
  query.skip(pagination.start - 1);
  const contacts = await query.exec();

  res.status(200).json({
    success: true,
    count: contacts.length,
    data: contacts,
    pagination,
  });
});

exports.getContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id);

  if (!valueRequired(contact)) {
    throw new MyError("Өгөгдөл олдсонгүй", 404);
  }

  res.status(200).json({
    success: true,
    data: contact,
  });
});

exports.excelData = asyncHandler(async (req, res) => {
  const page = req.query.page || 1;
  let sort = req.query.sort || { createAt: -1 };
  const select = req.query.select;

  //FIELDS
  const userInput = req.query;
  const stringDtl = ["name", "email", "phoneNumber", "message"];

  const query = Contact.find();

  stringDtl.map((el) => {
    if (valueRequired(userInput[el])) {
      query.find({ [el]: RegexOptions(userInput[el]) });
    }
  });

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

  query.select(select);

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
  let sort = req.query.sort || { createAt: -1 };
  const select = req.query.select;
  const userInput = req.query;

  //FIELDS
  const stringDtl = ["name", "email", "phoneNumber", "message"];

  const query = Contact.find();

  stringDtl.map((el) => {
    if (valueRequired(userInput[el])) {
      query.find({ [el]: RegexOptions(userInput[el]) });
    }
  });

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

  query.select(select);

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();

  const pagination = await paginate(page, limit, Contact, result);
  query.limit(limit);
  query.skip(pagination.start - 1);
  const contacts = await query.exec();

  return contacts;
};

exports.multDeleteContact = asyncHandler(async (req, res) => {
  const ids = req.queryPolluted.id;
  const finds = await Contact.find({ _id: { $in: ids } });

  if (finds.length <= 0) {
    throw new MyError("Таны сонгосон өгөгдөлүүд байхгүй байна", 404);
  }

  const contacts = await Contact.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
    contacts,
  });
});

exports.updateContact = asyncHandler(async (req, res) => {
  let contact = await Contact.findById(req.params.id);

  if (!contact) {
    throw new MyError("Сонгосон өгөгдөл олдсонгүй.", 404);
  }

  contact = await Contact.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: contact,
  });
});
