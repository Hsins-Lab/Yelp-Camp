/*
|--------------------------------------------------------------------------
| Campgrounds Route
|--------------------------------------------------------------------------
|
| [Method]  [Route]
| GET       /campgrounds            列出所有營地
| POST      /campgrounds            創建一個營地
| GET       /campgrounds/new        創建一個營地（頁面）
| GET       /campgrounds/:id        獲取某個營地
| PUT       /campgrounds/:id        更新某個營地（全部）
| PATCH     /campgrounds/:id        更新某個營地（部分）
| DELETE    /campgrounds/:id        刪除某個營地
| GET       /campgrounds/:id/edit   編輯某個營地（頁面）
| POST      /campgrounds/:id/likes  點讚某個營地
| 
*/

const path = require('path');
const multer = require('multer');
const express = require('express');
const cloudinary = require('cloudinary');
const Datauri = require('datauri');
const NodeGeocoder = require('node-geocoder');
const keys = require('../configs/keys');
const Comment = require('../models/comment');
const Campground = require('../models/campground');
const isLoggedIn = require('../middleware/isLoggedIn');
const checkCampgroundOwenership = require('../middleware/checkCampgroundOwenership');
const router = express.Router();

// multer Settings
const storage = multer.memoryStorage();
const upload = multer({ storage });
const dUri = new Datauri();

// cloudinary Settingsonfig
const CLOUDNAME = keys.cloudinaryNAME;
const CLOUDAPIKEY = keys.cloudinaryAPIKEY;
const CLOUDAPISECRET = keys.cloudinaryAPISECRET;

cloudinary.config({
  cloud_name: CLOUDNAME,
  api_key: CLOUDAPIKEY,
  api_secret: CLOUDAPISECRET
});

// node-geocoder Settings
const MAPQUESTAPIKEY = keys.mapquestAPIKEY;

const geocoder = NodeGeocoder({
  provider: 'mapquest',
  httpAdapter: 'https',
  apiKey: MAPQUESTAPIKEY,
  formatter: null
});

// Define escapeRegex function for search feature
const escapeRegex = text => {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

// METHOD  : GET
// ROUTE   : /campgrounds
// FUNCTION: List all campgrounds
router.get('/', async (req, res) => {
  try {
    if (req.query.search) {
      // Search Campgrounds in text
      const regex = new RegExp(escapeRegex(req.query.search), 'gi');
      const campgrounds = await Campground.find({ name: regex });

      if (req.xhr) {
        res.json(campgrounds);
      } else {
        res.render('campgrounds/index', {
          campgrounds: campgrounds,
          page: 'campgrounds',
          noMatch: null
        });
      }
    } else {
      // Get All Campgrounds
      const campgrounds = await Campground.find({});

      if (req.xhr) {
        res.json(campgrounds);
      } else {
        res.render('campgrounds/index', {
          campgrounds: campgrounds,
          page: 'campgrounds',
          noMatch: null
        });
      }
    }
  } catch (err) {
    req.flash('error', err.message);
  }
});

// METHOD  : POST
// ROUTE   : /campgrounds
// FUNCTION: Create a new campground
router.post('/', isLoggedIn, upload.single('image'), async (req, res) => {
  try {
    const geoData = await geocoder.geocode(req.body.location);
    const dataUri = req =>
      dUri.format(
        path.extname(req.file.originalname).toString(),
        req.file.buffer
      );
    const file = dataUri(req).content;
    const uploadImage = await cloudinary.uploader.upload(file);

    const newCampground = await new Campground({
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      location: req.body.location,
      lat: geoData[0].latitude,
      lng: geoData[0].longitude,
      author: {
        id: req.user._id,
        username: req.user.username
      },
      image: {
        id: uploadImage.public_id,
        url: uploadImage.secure_url
      }
    });

    const newlyCreated = await Campground.create(newCampground);
    res.redirect('/campgrounds/' + newlyCreated._id);
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('back');
  }
});

// METHOD  : GET
// ROUTE   : /campgrounds/new
// FUNCTION: Render the page to create new campground
router.get('/new', isLoggedIn, async (req, res) => {
  try {
    res.render('campgrounds/new', { page: 'new' });
  } catch (err) {
    res.send(err.message);
  }
});

// METHOD  : GET
// ROUTE   : /campgrounds/:id
// FUNCTION: Get the information about certain campground
router.get('/:id', async (req, res) => {
  try {
    const foundCampground = await Campground.findById(req.params.id).populate('comments likes').exec();
    res.render('campgrounds/info', { campground: foundCampground });
  } catch (err) {
    res.redirect('back');
  }
});

// METHOD  : PATCH
// ROUTE   : /campgrounds/:id
// FUNCTION: Update certain campgrain
router.patch(
  '/:id',
  checkCampgroundOwenership,
  upload.single('image'),
  async (req, res) => {
    try {
      let newData = {};
      const updateCampground = await Campground.findById(req.params.id);
      const geoData = await geocoder.geocode(req.body.location);

      if (!req.file) {
        newData = {
          name: req.body.name,
          price: req.body.price,
          description: req.body.description,
          location: req.body.location,
          lat: geoData[0].latitude,
          lng: geoData[0].longitude
        };
      } else {
        const dataUri = req =>
          dUri.format(
            path.extname(req.file.originalname).toString(),
            req.file.buffer
          );
        const file = dataUri(req).content;
        const uploadImage = await cloudinary.uploader.upload(file);
        await cloudinary.v2.uploader.destroy(updateCampground.image.id);

        newData = {
          name: req.body.name,
          price: req.body.price,
          description: req.body.description,
          location: req.body.location,
          lat: geoData[0].latitude,
          lng: geoData[0].longitude,
          image: {
            id: uploadImage.public_id,
            url: uploadImage.secure_url
          }
        };
      }
      await updateCampground.update({ $set: newData }).exec();

      req.flash('success', 'Successfully Updated!');
      res.redirect('/campgrounds/' + updateCampground._id);
    } catch (err) {
      req.flash('error', err.message);
      res.redirect('back');
    }
  }
);

// METHOD  : DELETE
// ROUTE   : /campgrounds/:id
// FUNCTION: Delete certain campground
router.delete('/:id', async (req, res) => {
  try {
    const deleteCampground = await Campground.findById(req.params.id).exec();
    await cloudinary.v2.uploader.destroy(deleteCampground.image.id);
    await deleteCampground.deleteOne();

    deleteCampground.comments.forEach(async id => { await Comment.findById(id).deleteOne(); });

    req.flash('success', 'Campground deleted successfully!');
    res.redirect('/campgrounds');
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('back');
  }
});

// METHOD  : GET
// ROUTE   : /campgrounds/:id/edit
// FUNCTION: Get the page to edit certain campground
router.get('/:id/edit', checkCampgroundOwenership, async (req, res) => {
  try {
    const foundCampground = await Campground.findById(req.params.id).exec();
    res.render('campgrounds/edit', { campground: foundCampground });
  } catch (err) {
    res.redirect('/campgrounds');
  }
});

// METHOD  : POST
// ROUTE   : /campgrounds/:id/likes
// FUNCTION: Like/Unlike a campground
router.post('/:id/likes', isLoggedIn, async (req, res) => {
  try {
    const foundCampground = await Campground.findById(req.params.id);
    const foundUserLike = await foundCampground.likes.some(like => like.equals(req.user._id));

    await foundUserLike ? foundCampground.likes.pull(req.user._id) : foundCampground.likes.push(req.user);
    await foundCampground.save();
    res.redirect('back');
  } catch (err) {
    console.log(err);
    res.redirect('/campgrounds');
  }
});

module.exports = router;
