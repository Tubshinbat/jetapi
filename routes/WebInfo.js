const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  createWebInfo,
  getWebinfo,
  updateWebInfo,
  updateInfo,
} = require("../controller/WebInfo");

router
  .route("/")
  .post(protect, authorize("admin"), createWebInfo)
  .get(getWebinfo)
  .put(protect, authorize("admin"), updateInfo);

router
  .route("/:id")
  .put(protect, authorize("admin", "operator"), updateWebInfo);

module.exports = router;
