let User = require("../models/user");

// Check to see if user has paid membership
const checkPaid = function (paid) {
  return paid === "Paid" || paid === "Awaiting";
};

// Returns true if the user is an admin
const checkAdmin = function (role) {
  return role === "Admin";
};

// Check to see if the user is a paid up member
const isMember = function (req, res, next) {
  if (req.user.role === "member" && checkPaid(req.user.paid)) return next();
  else res.sendStatus(403);
};

// Check to see if the user is an admin
const isAdmin = function (req, res, next) {
  if (checkAdmin(req.user.role)) return next();
  else res.send(403, { error: "Only Admin allowed." });
};

// Check to see if the user is an admin or if they are accessing their own account
const isOwnUserOrAdmin = function (req, res, next) {
  if (req.user._id == req.params.id || checkAdmin(req.user.role)) return next();
  else res.send(403, { error: "Only Admin or own users allowed" });
};

// Check to see if user is logged in
const userAuthenticated = function (req, res, next) {
  // const isAuthenticated = req.isAuthenticated();
  // if (req.isAuthenticated()) {
  if (req.user) {
    next();
  } else {
    res.send(403, { error: "Not authorised." });
  }
};

// Check to see if an email address doesn't already exist in the DB
const emailNotExist = async function (req, res, next) {
  const isUser = await User.exists({ email: req.body.email });
  if (isUser) {
    res.send(403, { error: "Email already exists." });
  } else {
    next();
  }
};

module.exports = {
  emailNotExist,
  isAdmin,
  isMember,
  userAuthenticated,
  isOwnUserOrAdmin,
};
