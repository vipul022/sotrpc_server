var aws = require("aws-sdk");
// Configure dotenv to load in the .env file
require("dotenv").config(); 
const S3_BUCKET = process.env.Bucket;

const {
  addPhotoToDB,
  getPhotoFromDB,
  deletePhotoFromDB,
  getPhotosFromDB,
} = require("../utils/photo_utilities");

const addPhoto = function (req, res) {
  const s3 = new aws.S3(); 
  const fileName = req.body.fileName;
  const fileType = req.body.fileType;

  // Set up the payload of what we are sending to the S3 api
  const s3Params = {
    Bucket: S3_BUCKET,
    Key: `photos/${fileName}`, // all photos to be stored in S3 photos folder
    Expires: 500,
    ContentType: fileType,
    ACL: "public-read",
  };
  // Make a request to the S3 API to get a signed URL which we can use to upload our file
  s3.getSignedUrl("putObject", s3Params, (err, data) => {
    if (err) {
      res.json({
        signedURLSuccess: false,
        error: err,
      });
    }
    // Data payload of what we are sending back, the url of the signedRequest and a URL where we can access the content after its saved.
    const returnData = {
      signedRequest: data,
      url: `https://${S3_BUCKET}.s3.amazonaws.com/photos/${fileName}`,
    };
    // save to db with URL of final image
    req.body.url = returnData.url;
    addPhotoToDB(req).save((err, photo) => {
      if (err) {
        res.status(500);
        res.json({
          savedToDBSuccess: false,
          error: err.message,
        });
      }

      // Send it all back
      res.json({
        signedURLSuccess: true,
        savedToDBSuccess: true,
        photo: photo,
        data: {
          returnData,
        },
      });
    });
  });
};

//get all photos in the DB for the Gallery
function getPhotos(req, res) {
  getPhotosFromDB().exec((err, photos) => {
    if (err) {
      res.status(500).send();
    } else {
      res.status(200);
      res.send(photos);
    }
  });
}

function deletePhoto(req, res) {
  // get the filename from the db
  getPhotoFromDB(req.params.id).exec((err, photo) => {
    if (err) {
      res.status(404).send();
    } else if (!photo) {
      res.status(404).send({
        error: "Photo for deletion not found in DB",
      });
    } else {
      const fileName = photo.fileName;

      //delete from S3
      const s3 = new aws.S3();
      //prepare correct params
      var S3params = {
        Bucket: S3_BUCKET,
        Key: `photos/${fileName}`,
      };
      //request deletion from S3
      s3.deleteObject(S3params, function (err, data) {
        if (err) {
          res.status(404);
          res.json({
            deleteFromS3Success: false,
            error: err.message,
          });
        } else {

          //finally, remove photo record from DB
          deletePhotoFromDB(req.params.id).exec((err) => {
            if (err) {
              res.status(500);
              res.json({
                deleteFromS3Success: true,
                deleteFromDBSuccess: false,
                error: err.message,
              });
            }
            res.status(204);
            res.json({
              deleteFromS3Success: true,
              deleteFromDBSuccess: true,
            });
          });
        }
      });
    }
  });
}

//get a single photo from the DB
function getPhoto(req, res) {
  getPhotoFromDB(req.params.id).exec((err, photo) => {
    if (err) {
      res.status(404);
      res.json({
        error: err.message,
      });
    } else {
      res.status(200);
      res.send(photo);
    }
  });
}

module.exports = {
  getPhoto,
  addPhoto,
  deletePhoto,
  getPhotos,
};
