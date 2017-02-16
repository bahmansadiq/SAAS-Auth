var express = require('express');
var  app = express();
var bodyParser = require('body-parser');  
var morgan = require('morgan');  
var passport = require('passport'); 
var config = require('./config/main');  
var User = require('./models/user'); 
var jwt = require('jsonwebtoken');


// Use body-parser to get POST requests for API use
// Use body-parser to get POST requests for API use
app.use(bodyParser.urlencoded({ extended: false }));  
app.use(bodyParser.json());

// Log requests to console
app.use(morgan('dev'));  
//We will add a quick home page route so I can give a quick demonstration of what morgan does. Add this next.
// Enable CORS from client-side
app.use(function(req, res, next) {  
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});
// Initialize passport for use
app.use(passport.initialize());  
//And now we can import our JWT passport strategy. Enter this below our mongoose connection:

// Bring in defined Passport Strategy
require('./config/passport')(passport);  
//Now we can start on our routes. We will start by creating the route group called apiRoutes. We will now be working down without jumping all over the place in the code. That said, this goes beneath the passport strategy import we just did:

// Create API group routes
var apiRoutes = express.Router();  
//Next, we can create our registration route:

// Home route. We'll end up changing this to our main front end index later.
app.get('/', function(req, res) {  
  res.send('Relax.... We will put the home page here later.');
});



// Register new users
apiRoutes.post('/register', function(req, res) {  
  if(!req.body.email || !req.body.password) {
    res.json({ success: false, message: 'Please enter email and password.' });
  } else {
    var newUser = new User({
      email: req.body.email,
      password: req.body.password
    });

    // Attempt to save the user
    newUser.save(function(err) {
      if (err) {
        return res.json({ success: false, message: 'That email address already exists.'});
      }
      res.json({ success: true, message: 'Successfully created new user.' });
    });
  }
});

// Authenticate the user and get a JSON Web Token to include in the header of future requests.
apiRoutes.post('/authenticate', function(req, res) {  
  User.findOne({
    email: req.body.email
  }, function(err, user) {
    if (err) throw err;

    if (!user) {
      res.send({ success: false, message: 'Authentication failed. User not found.' });
    } else {
      // Check if password matches
      user.comparePassword(req.body.password, function(err, isMatch) {
        if (isMatch && !err) {
          // Create token if the password matched and no error was thrown
          var token = jwt.sign(user, config.secret, {
            expiresIn: 10080 // in seconds
          });
          res.json({ success: true, token: 'JWT ' + token });
        } else {
          res.send({ success: false, message: 'Authentication failed. Passwords did not match.' });
        }
      });
    }
  });
});

// Protect dashboard route with JWT
apiRoutes.get('/dashboard', passport.authenticate('jwt', { session: false }), function(req, res) {  
  res.send('It worked! User id is: ' + req.user._id + '.');
});


app.listen(config.port);
// Set url for API group routes
app.use('/api', apiRoutes); 

