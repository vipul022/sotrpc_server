const express = require("express");
const router = express.Router();
const {
  getClasses,
  addClass,
  deleteClass,
  getClass,
  editClass,
} = require("../controllers/pottery_classes_controller.js");
const {
  userAuthenticated,
  isAdmin,
} = require("../utils/common_utils");

// list all classes
router.get("/", getClasses);

//add one class
router.post("/", userAuthenticated, isAdmin, addClass);

//get one class
router.get("/:id", getClass);

//edit one class
router.put("/:id", userAuthenticated, isAdmin, editClass);

//delete one class
router.delete("/:id", userAuthenticated, isAdmin, deleteClass);

module.exports = router;
