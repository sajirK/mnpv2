var request = require('request');
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var options = {
  server: {
    socketOptions: {
      connectTimeoutMS: 5000
    }
  }
};
mongoose.connect('mongodb://mnp:azerty22@ds225308.mlab.com:25308/masternodepooldatabase',
  options,
  function(err) {
    console.log(err);
  }
);

   // user base de donnée
var userSchema = mongoose.Schema({
  name: String,
  email: String,
  password: String
});
var UserModel = mongoose.model('users', userSchema);

// ad formulaire
var AdSchema = mongoose.Schema({
  crypto: String,
  title: String,
  NbSeat: Number,
  message: String
});
var AdModel = mongoose.model('annonce', AdSchema);

/* GET home page. */

router.get('/', function(req, res, next) {

  AdModel.find(function(error, dataAd){
  req.session.dataAd = dataAd;
  res.render('index', {dataAd: req.session.dataAd, IsLog: req.session.IsLog});
});
  })





// GET Signup page
router.get('/signUp', function(req, res, next) {
  res.render('signUp', {title: 'Express'});
});

   // user form database
router.post('/signUp', function(req, res, next) {
if (req.body.password == req.body.confirm) {


  UserModel.find(
    {email: req.body.email},
    function(err, users) {
      if (users.length == 0) {

        var newUser = new UserModel({
          name: req.body.username,
          email: req.body.email,
          password: req.body.password
        });
        console.log(newUser);
        newUser.save(
          function(error, user) {
            req.session.user = user;

            req.session.IsLog = true;
            console.log(req.session.IsLog);
                res.render('index', {dataAd: req.session.dataAd, IsLog: req.session.IsLog});
                        }
                      )
                        }else {
                      req.session.IsLog = false;
                      console.log(req.session.IsLog);
                      res.render('signUp',{});
                    }
                  }
                )
              }else {
                req.session.IsLog = false;
                console.log(req.session.IsLog);
                res.render('signUp',{});

              }
              }
              );


// Get new ad page
router.get('/postAds', function(req, res, next) {
  res.render('postAds');
});




// add new ad

router.post('/ad', function(req, res, next) {
  // body = JSON.parse(body);
  var newAd = new AdModel({
    crypto: req.body.crypto,
    title: req.body.title,
    NbSeat: req.body.NbSeat,
    message: req.body.message
  });
  newAd.save(
    function(error, annonce) {
      console.log(annonce);
      // res.render('index');
      AdModel.find(
        function(err, annonce) {
          res.render('index',{dataAd: req.session.dataAd, IsLog: req.session.IsLog});
        }
      )

    });
});


router.get('/cardAds', function(req, res, next) {
  AdModel.find(
    {_id : req.query.id},
    function(err, oneAd){
      console.log(oneAd);
        res.render('Ads', {dataAd: oneAd[0]});
    })

});



// login
router.post('/login', function(req, res, next) {
  UserModel.find(
      { name: req.body.name, password: req.body.password} ,
      function (err, users) {
        if(users.length > 0) {
          req.session.user = users[0];
          req.session.IsLog = true;
          AdModel.find(
               // {user_id: req.session.user._id},
               function (error,annonce) {
                 console.log(annonce);
                 console.log(req.session.IsLog);
                 res.render('index', {dataAd: req.session.dataAd, IsLog: req.session.IsLog, annonce, user : req.session.user });
               }
           )
        } else {
          req.session.IsLog = false;
          console.log(req.session.IsLog);
          res.render('index', {dataAd: req.session.dataAd, IsLog: req.session.IsLog});
        }
  });
});

// Logout
router.get('/logout', function(req, res, next) {
  req.session.IsLog = false;

  res.render('index', {dataAd: req.session.dataAd, IsLog: req.session.IsLog});
})

 // Get Edit My Profile page
 router.get('/profile', function(req, res, next) {
   res.render('profile');
 })
 // file upload
 router.post('/upload', function(req, res) {
  if (!req.files) {
    return res.status(400).send('No files were uploaded.');
     }
  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let avatar = req.files.avatar;

  // Use the mv() method to place the file somewhere on your server
  avatar.mv('./img', function(err) {
    if (err) {
      return res.status(500).send(err);
         }
    res.render('profile',{IsLog: req.session.IsLog, avatar:req.files.avatar});
  });
});

module.exports = router;
