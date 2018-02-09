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
console.log(dataAd);
  req.session.dataAd = dataAd;
  console.log(req.session.dataAd);
  res.render('index', {dataAd: req.session.dataAd});
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
                res.render('index', {});
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
  res.render('postAds', {

  });
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
          res.render('index');
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

module.exports = router;
