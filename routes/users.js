/*
|--------------------------------------------------------------------------
| Users Route
|--------------------------------------------------------------------------
|
| [Method]  [Route]
| GET       /users              列出所有用戶
| POST      /users              註冊一名用戶
| GET       /users/new          註冊一名用戶（註冊頁面）
| GET       /users/:id          顯示用戶資料
| PATCH     /users/:id          更新用戶資料
| DELETE    /users/:id          刪除用戶資料
| GET       /users/:id/edit     編輯用戶資料（頁面）
| 
*/

const path = require('path');
const multer = require('multer');
const express = require('express');
const cloudinary = require('cloudinary');
const Datauri = require('datauri');
const passport = require('passport');
const keys = require('../configs/keys');
const User = require('../models/user');
const Campground = require('../models/campground');
const isLoggedIn = require('../middleware/isLoggedIn');
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

// METHOD  : GET
// ROUTE   : /users
// FUNCTION: List all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find({});

    res.render('users/index', {
      users: users,
      page: 'users'
    });
  } catch (err) {}
});

// METHOD  : POST
// ROUTE   : /users
// FUNCTION: Create a new user
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const dataUri = req =>
      dUri.format(
        path.extname(req.file.originalname).toString(),
        req.file.buffer
      );
    const file = dataUri(req).content;
    const uploadImage = await cloudinary.uploader.upload(file);

    const newUser = await new User({
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      avatar: {
        id: uploadImage.public_id,
        url: uploadImage.secure_url
      }
    });

    const user = await User.register(newUser, req.body.password);
    await passport.authenticate('local')(req, res, () => {
      req.flash('success', 'Welcome to Yelp Camp ' + user.username + '!');
      res.redirect('/campgrounds');
    });
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/register');
  }
});

// METHOD  : GET
// ROUTE   : /users/new
// FUNCTION: Show the register page
router.get('/new', async (req, res) => {
  try {
    res.redirect('/register');
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/campground');
  }
});

// METHOD  : GET
// ROUTE   : /users/:id
// FUNCTION: Show information page
router.get('/:id', async (req, res) => {
  try {
    const foundUser = await User.findById(req.params.id);
    const campgrounds = await Campground.find()
      .where('author.id')
      .equals(foundUser._id)
      .exec();

    res.render('users/info', { user: foundUser, campgrounds });
  } catch (err) {
    req.flash('error', 'Something went wrong...');
    res.redirect('/campgrounds');
  }
});

// METHOD  : PATCH
// ROUTE   : /users/:id
// FUNCTION: Modify profile
router.patch('/:id', upload.single('image'), async (req, res) => {
  try {
    let newData = {};
    const updateUser = await User.findById(req.params.id);

    if (!req.file) {
      newData = {
        password: req.body.password,
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName
      };
    } else {
      console.log('Hi');
      const dataUri = req =>
        dUri.format(
          path.extname(req.file.originalname).toString(),
          req.file.buffer
        );
      const file = dataUri(req).content;
      const uploadImage = await cloudinary.uploader.upload(file);
      await cloudinary.v2.uploader.destroy(updateUser.avatar.id);

      newData = {
        password: req.body.password,
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        avatar: {
          id: uploadImage.public_id,
          url: uploadImage.secure_url
        }
      };
    }

    await updateUser.update({ $set: newData }).exec();

    req.flash('success', 'Successfully Updated!');
    res.redirect('/users/' + updateUser._id);
  } catch (err) {
    console.log(err.message);
    req.flash('error', 'Something went wrong...');
    res.redirect('/users/' + req.params.id);
  }
});

// METHOD  : GET
// ROUTE   : /users/:id/edit
// FUNCTION: Show the edit profile page
router.get('/:id/edit', isLoggedIn, async (req, res) => {
  try {
    const foundUser = await User.findById(req.params.id).exec();
    if (foundUser._id.equals(req.user._id)) {
      res.render('users/edit', { user: foundUser });
    } else {
      req.flash('error', "You don't have permission to do that");
      res.redirect('back');
    }
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('back');
  }
});

module.exports = router;
