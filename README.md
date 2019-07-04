<div align="right">
  <img src="https://img.shields.io/badge/Completion-100%25-blue.svg" />
  <a href="https://github.com/Hsins/udemy_Yelp-Camp/blob/master/LICENSE" alt="License">
    <img src="https://img.shields.io/github/license/Hsins/udemy_Yelp-Camp.svg" />
  </a>
</div>

# Udemy Project: Yelp Camp

This is a hands-on project from the Udemy course - [The Web Developer Bootcamp](https://www.udemy.com/the-web-developer-bootcamp/) by Colt Steele.
  
# Demo

<div align="center">
  <img src="demo/demo.gif" />
</div>

You can see a complete working example [here](https://hsins-yelpcamp.herokuapp.com/). Or you can run the demo on your local machine, please follow the instructions in [Getting Started](#getting-started).

# Features

- Responsive web design (RWD)
- User authentication (Login/Register/Logout) and authorization (Post/Like/Edit)
- Flash messages responding to users' interaction
- Refactored with ES6 and ES7 syntax (eg: async/await)
- RESTful API

```
-------------------------------------------------------------------------
Normal Routes
-------------------------------------------------------------------------
[Method]  [Route]
GET       /                       Landing page
GET       /login                  Request the user login page
GET       /register               Request the user edit page

-------------------------------------------------------------------------
Users Route
-------------------------------------------------------------------------
[Method]  [Route]
GET       /users                  Fetch all users
POST      /users                  Create new user in database
GET       /users/new              Request the user register page
GET       /users/:id              Show the user information
PATCH     /users/:id              Update user information
DELETE    /users/:id              Delete user information
GET       /users/:id/edit         Request the user edit page

-------------------------------------------------------------------------
Sessions Route
-------------------------------------------------------------------------
[Method]  [Route]
POST      /sessions               Create a session (user login)
GET       /sessions/login         Request the user login page
DELETE    /sessions               Delete a session (user logout)

-------------------------------------------------------------------------
Campgrounds Route
-------------------------------------------------------------------------
[Method]  [Route]
GET       /campgrounds            Fetch all campgrounds
POST      /campgrounds            Create a new campground to database
GET       /campgrounds/new        Request the campground adding page
GET       /campgrounds/:id        Show the campground information
PUT       /campgrounds/:id        Update campground information (all)
PATCH     /campgrounds/:id        Update campground information (part)
DELETE    /campgrounds/:id        Delete a campground
GET       /campgrounds/:id/edit   Request the campground editing page
POST      /campgrounds/:id/likes  Like the campground

-------------------------------------------------------------------------
Comments Route
-------------------------------------------------------------------------
[Method]  [Route]
POST      /campgrounds/:id/comments       Create a new comment
PATCH     /campgrounds/:id/comments/:cid  Update comment
DELETE    /campgrounds/:id/comments/:cid  Delete comment
```

# Technologies

## Frontend

- [Bootstrap](https://getbootstrap.com/)
- [ejs](https://ejs.co/)

## Backend

- [express](https://gulpjs.com/)
- [mongodb](https://webpack.js.org/concepts/)

Check [`package.json`](https://github.com/Hsins/udemy_Yelp-Camp/blob/master/package.json) file for more information.

# Getting Started

Follow the instructions below to set up the environment and run this project on your local machine.

1. Clone this repository.

```bash
# Clone repository
$ git clone https://github.com/Hsins/udemy_Yelp-Camp.git
```

2. Install dependencies via NPM or Yarn

```bash
# Install dependencies via npm
$ npm install

# Install dependencies via yarn
$ yarn install
```

3. Run the server with [nodemon](https://nodemon.io/) and open a browser to visit [http://localhost:3000/](http://localhost:3000/).

```bash
# Run server
$ npm run dev
```

# More Information

All the notes I took in [Markdown](https://daringfireball.net/projects/markdown/syntax) (.md) format. You can find them in my [Udemy-Notes](https://github.com/Hsins/Udemy-Notes) repository. The note for this course is [here](https://hsins.github.io/Udemy-Notes/The%20Web%20Developer%20Bootcamp/).

# License

Licensed under the MIT License, Copyright © 2017-present Hsins.
