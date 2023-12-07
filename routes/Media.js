const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  createMedia,
  getMedias,
  multDeleteMedia,
  getMedia,
  updateMedia,
  excelData,
  getSlugMedia,
} = require("../controller/Media");

router
  .route("/")
  .post(protect, authorize("admin", "operator"), createMedia)
  .get(getMedias);

router.route("/excel").get(excelData);
router.route("/s/:slug").get(getSlugMedia);

router.route("/delete").delete(protect, authorize("admin"), multDeleteMedia);
router
  .route("/:id")
  .get(getMedia)
  .put(protect, authorize("admin", "operator"), updateMedia);

module.exports = router;
