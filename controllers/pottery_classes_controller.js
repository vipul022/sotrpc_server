const {
  addClassToDB,
  getClassFromDB,
  deleteClassFromDB,
  getClassesFromDB,
  editClassFromDB,
} = require("../utils/pottery_classes_utilities");

// Add a new pottery class to the DB
const addClass = function (req, res) {
  addClassToDB(req).save((err, pottery_class) => {
    if (err) {
      res.status(500).send();
    } else {
      res.status(201);
      res.send(pottery_class);
    }
  });
};

// Get all Classes from the DB
function getClasses(req, res) {
  getClassesFromDB().exec((err, classes) => {
    if (err) {
      res.status(404).send();
    } else {
      res.status(200);
      res.send(classes);
    }
  });
}

// Delete one class from the DB
function deleteClass(req, res) {
  deleteClassFromDB(req.params.id).exec((err) => {
    if (err) {
      res.status(500).send();
    } else {
      res.sendStatus(204);
    }
  });
}

// Get a single class from the DB
function getClass(req, res) {
  getClassFromDB(req.params.id).exec((err, pottery_class) => {
    if (err) {
      res.status(404).send();
    } else {
      res.status(200);
      res.send(pottery_class);
    }
  });
}

// Update a single class from the DB
function editClass(req, res) {
  editClassFromDB(req).exec((err, pottery_class) => {
    if (err) {
      res.status(500).send();
    } else {
      res.status(200);
      res.send(pottery_class);
    }
  });
}

module.exports = {
  getClasses,
  addClass,
  deleteClass,
  getClass,
  editClass,
};
