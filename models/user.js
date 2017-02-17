// Connect to database
var mongoose = require('mongoose');  
//var config = require('../config/main');
//mongoose.connect(config.database);  
//Now, in our /app/models folder, let's create a new file, user.js. In this file, we will define the schema for our users. We will also hash the users' passwords here with bcrpyt. Keep in mind, we will be using email addresses to register and log users in, not usernames. Feel free to switch that for your own app. Open the new file up and enter the following:


var bcrypt = require('bcrypt-nodejs');

// Schema defines how the user data will be stored in MongoDB
var UserSchema = new mongoose.Schema({  
  email: {
    type: String,
    lowercase: true,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  profile: {
    firstName: { type: String },
    lastName: { type: String }
  },
  role: {
    type: String,
    enum: ['Client', 'Manager', 'Admin'],
    default: 'Client'
  }
});

// Saves the user's password hashed (plain text password storage is not good)
UserSchema.pre('save', function (next) {  
  var user = this;
  if (this.isModified('password') || this.isNew) {
    bcrypt.genSalt(10, function (err, salt) {
      if (err) {
        return next(err);
      }
      bcrypt.hash(user.password, salt, null, function(err, hash) {
        if (err) {
          return next(err);
        }
        user.password = hash;
        next();
      });
    });
  } else {
    return next();
  }
});

// Create method to compare password input to password saved in database
UserSchema.methods.comparePassword = function(pw, cb) {  
  bcrypt.compare(pw, this.password, function(err, isMatch) {
    if (err) {
      return cb(err);
    }
    cb(null, isMatch);
  });
};

module.exports = mongoose.model('User', UserSchema); 