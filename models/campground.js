const mongoose = require('mongoose');

const campgroundSchema = new mongoose.Schema({
  name: String,
  price: String,
  image: {
    id: {
      type: String
    },
    url: {
      type: String,
      default: 'https://i.imgur.com/AuCzR4H.png'
    }
  },
  description: {
    type: String,
    default:
      "Just pretend you are a whisper floating across a mountain. This painting comes right out of your heart. You don't want to kill all your dark areas they are very important. Look around, look at what we have. Beauty is everywhere, you only have to look to see it. We need dark in order to show light."
  },
  location: String,
  lat: Number,
  lng: Number,
  createdAt: { type: Date, default: Date.now },
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    username: String
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment'
    }
  ],
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ]
});

module.exports = mongoose.model('Campground', campgroundSchema);
