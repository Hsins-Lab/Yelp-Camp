/*
|--------------------------------------------------------------------------
| Comments Route
|--------------------------------------------------------------------------
|
| [Method]  [Route]
| POST      /campgrounds/:id/comments       新增一則留言
| PATCH     /campgrounds/:id/comments/:cid  更新指定留言
| DELETE    /campgrounds/:id/comments/:cid  刪除指定留言
| 
*/

const express = require('express');
const Comment = require('../models/comment');
const Campground = require('../models/campground');
const isLoggedIn = require('../middleware/isLoggedIn');
const checkCommentOwenership = require('../middleware/checkCommentOwenership');
const router = express.Router({ mergeParams: true });

// METHOD  : POST
// ROUTE   : /campgrounds/:id/comments
// FUNCTION: Create a new comment under certain post
router.post('/', isLoggedIn, async (req, res) => {
  try {
    const campground = await Campground.findById(req.params.id).exec();
    const comment = await Comment.create({
      text: req.body.comment,
      author: {
        id: req.user._id,
        username: req.user.username
      }
    });

    comment.save();
    campground.comments.push(comment);
    campground.save();
    req.flash('success', 'Successfully added comment');
    res.redirect('/campgrounds/' + campground._id);
  } catch (err) {
    req.flash('error', 'Something went wrong.');
  }
});

// METHOD  : PATCH
// ROUTE   : /campgrounds/:id/comments/comment_id
// FUNCTION: Modify comment
router.patch('/:comment_id', isLoggedIn, checkCommentOwenership, async (req, res) => {
  try {
    await Comment.findByIdAndUpdate(req.params.comment_id, { text: req.body.comment }).exec();
    res.redirect('/campgrounds/' + req.params.id);
  } catch (err) {
    res.flash(err.message);
    res.redirect('back');
  }
});

// METHOD  : DELETE
// ROUTE   : /campgrounds/:id/comments/:comment_id
// FUNCTION: Delete comment
router.delete('/:comment_id', isLoggedIn, checkCommentOwenership, async (req, res) => {
  try {
    await Comment.findByIdAndRemove(req.params.comment_id).exec();
    req.flash('success', 'Comment deleted');
    res.redirect('/campgrounds/' + req.params.id);
  } catch (err) {
    res.redirect('back');
  }
});

module.exports = router;
