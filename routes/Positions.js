const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  createPosition,
  getPositions,
  getCountPosition,
  multDeletePosition,
  updatePosition,
  getPosition,
  deletePosition,
} = require("../controller/Position");

router
  .route("/")
  .post(protect, authorize("admin", "operator"), createPosition)
  .get(getPositions);

router
  .route("/count")
  .get(protect, authorize("admin", "operator"), getCountPosition);
router.route("/delete").delete(protect, authorize("admin"), multDeletePosition);

router
  .route("/:id")
  .get(getPosition)
  .delete(protect, authorize("admin"), deletePosition)
  .put(protect, authorize("admin", "operator"), updatePosition);

module.exports = router;
