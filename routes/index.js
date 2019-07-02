/*
|--------------------------------------------------------------------------
| Normal Routes
|--------------------------------------------------------------------------
|
| [Method]  [Route]
| GET       /                               入口頁面
| GET       /login                          用戶登入
| GET       /register                       用戶註冊
| 
*/

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('landing');
});

router.get('/login', (req, res) => {
  res.render('users/login', { page: 'login' });
});

router.get('/register', (req, res) => {
  res.render('users/register', { page: 'register' });
});

module.exports = router;
