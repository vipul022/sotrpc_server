const express = require("express");
const router = express.Router();
const {
  sendUser,
  loginUser,
  logoutUser,
  getUsers,
  addUser,
  deleteUser,
  getUser,
  editUser,
} = require("../controllers/user_controller");
const {
  emailNotExist,
  userAuthenticated,
  isAdmin,
  isOwnUserOrAdmin,
} = require("../utils/common_utils");

//route for user login
router.post("/login", loginUser, sendUser);

//route for user logout
router.get("/logout", logoutUser);

//show all users (admin only)
// router.get("/", userAuthenticated, isAdmin, getUsers);
router.get("/", userAuthenticated, getUsers);

//add a new user
router.post("/", emailNotExist, addUser);

//delete a user
router.delete("/:id", userAuthenticated, isOwnUserOrAdmin, deleteUser);

//show one user
router.get("/:id", userAuthenticated, isOwnUserOrAdmin, getUser);

//edit a user
router.put("/:id", userAuthenticated, isOwnUserOrAdmin, editUser);

module.exports = router;
