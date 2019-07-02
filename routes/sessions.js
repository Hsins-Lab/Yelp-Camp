/*
|--------------------------------------------------------------------------
| Sessions Route
|--------------------------------------------------------------------------
|
| [Method]  [Route]
| POST      /sessions           建立一個會話
| GET       /sessions/login     建立一個會話（登入頁面）
| DELETE    /sessions           刪除一個會話（登出）
| 
*/

const express = require('express');
const passport = require('passport');
const router = express.Router();

// METHOD  : POST
// ROUTE   : /sessions
// FUNCTION: Make a session (Login)
router.post('/',
  passport.authenticate('local', {
    successRedirect: '/campgrounds',
    failureRedirect: '/login',
    failureFlash: true,
    successFlash: 'Welcome to YelpCamp!'
  }), (req, res) => {}
);

// METHOD  : GET
// ROUTE   : /sessions
// FUNCTION: Show the login page
router.get('/login', async (req, res) => {
  try {
    res.redirect('/login');
  } catch (err) {
    req.flash('error', 'err.message');
    res.redirect('/campgrounds');
  }
});

// METHOD  : DELETE
// ROUTE   : /sessions
// FUNCTION: Delete the session (Logout)
router.delete('/', async (req, res) => {
  try {
    req.logout();
    req.flash('success', 'See you later!');
    res.redirect('back');
  } catch (err) {
    req.flash('error', 'err.message');
    res.redirect('/campgrounds');
  }
});

module.exports = router;
