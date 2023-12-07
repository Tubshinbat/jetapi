const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  createMenu,
  getMenus,
  getMenu,
  deletetMenu,
  updateMenu,
  changePosition,
  getCountMenu,
  getSlugMenu,
} = require("../controller/Menu");

router
  .route("/")
  .post(protect, authorize("admin", "operator"), createMenu)
  .get(getMenus);

router.route("/change").post(protect, authorize("admin"), changePosition);

router.route("/count").get(protect, getCountMenu);
router.route("/slug/:slug").get(getSlugMenu);
// "/api/v1/News-categories/id"
router
  .route("/:id")
  .get(getMenu)
  .delete(protect, authorize("admin"), deletetMenu)
  .put(protect, authorize("admin", "operator"), updateMenu);

module.exports = router;
