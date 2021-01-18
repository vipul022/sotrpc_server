const passport = require("passport");
const User = require("../models/user");

const {
  addUserToDB,
  getUserFromDB,
  deleteUserFromDB,
  getUsersFromDB,
  editUserFromDB,
} = require("../utils/user_utilities");

const logoutUser = function (req, res) {
  req.session.destroy(() => {
    res.sendStatus(200);
  });
};

// Helper functions
const authenticate = passport.authenticate("local");

// Login user
async function loginUser(req, res, next) {
  // passport.authenticate returns a function that we will call with req, res, and a callback function to execute on success
  const loginFunc = passport.authenticate("local");
  await loginFunc(req, res, next);
}

// Send user
function sendUser(req, res) {
  res.json({
    user: req.user,
    sessionID: req.sessionID,
  });
}

// Get all users
function getUsers(req, res) {
  getUsersFromDB(req).exec((err, users) => {
    if (err) {
      res.status(404).send();
    } else {
      res.status(200);
      res.send(users);
    }
  });
}

// Add a single user
function addUser(req, res) {
  addUserToDB(req).save((err, user) => {
    if (err) {
      res.status(500);
      return res.json({
        error: err.message,
      });
    }
    //after creating the user, login the user
    req.login(user, (err) => {
      if (err) {
        res.send(err);
      } else sendUser(req, res);
    });
  });
}

// Delete user
function deleteUser(req, res) {
  deleteUserFromDB(req.params.id).exec((err) => {
    if (err) {
      res.status(500);
      res.json({
        error: err.message,
      });
    }
    res.sendStatus(204);
  });
}

// Get a single user
function getUser(req, res) {
  getUserFromDB(req.params.id).exec((err, user) => {
    if (err) {
      res.status(404);
      res.json({
        error: err.message,
      });
    } else {
      res.status(200);
      res.send(user);
    }
  });
}

//check if changing role or paid and if so, has admin rights
const authToChange = async function (req) {
  // check if requesting user is admin
  if (req.user.role === "Admin") {
    return true;
  } else {
    // if not admin, then check if role or paid has changed
    const userToChange = await User.findById(req.params.id);
    if (
      userToChange.role != req.body.role ||
      userToChange.paid != req.body.paid
    ) {
      return false;
    } else {
      return true;
    }
  }
};

// Edit user details
async function editUser(req, res) {
  if (await authToChange(req)) {
    editUserFromDB(req).exec((err, user) => {
      if (err) {
        res.status(500);
        res.json({
          error: err.message,
        });
      } else {
        res.status(200);
        res.send(user);
      }
    });
  } else {
    res.status(404);
    res.json({
      error: "Not authorised to update role or paid status",
    });
  }
}

module.exports = {
  sendUser,
  loginUser,
  logoutUser,
  getUsers,
  addUser,
  deleteUser,
  getUser,
  editUser,
};
