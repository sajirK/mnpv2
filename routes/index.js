var request = require('request');
var express = require('express');
var router = express.Router();
var cheerio = require('cheerio');
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
  password: String,
  job: String,
  linkedin:String,
  twitter:String,
  Discord:String,
  bio: String
});
var UserModel = mongoose.model('users', userSchema);

// ad formulaire
var AdSchema = mongoose.Schema({
  posterName: String,
  posterId: String,
  crypto: String,
  cryptoP:String,
  title: String,
  roi: String,
  required: String,
  MnWorth: String,
  NbSeat: Number,
  message: String,
  dateAnnonce: Date
});
var AdModel = mongoose.model('annonce', AdSchema);

// ad comments
var commentSchema = mongoose.Schema({
  userId: String,
  userName: String,
  adId: String,
  message: String,
  dateComment: Date
});
var commentModel = mongoose.model('comments', commentSchema);

// Request
var reqSchema = mongoose.Schema({
  adId: String,
  adTitle: String,
  adCrypto: String,
  posterName: String,
  posterId: String,
  userReqName: String,
  userReqId: String,
  dateRequest: Date
});
var reqModel = mongoose.model('request', reqSchema);


var reqAccSchema = mongoose.Schema({
  adId: String,
  posterName: String,
  posterId: String,
  userReqName: String,
  userReqId: String,
  dateAccReq: Date
});
var reqAccModel = mongoose.model('AcceptedRequest', reqAccSchema);
/* GET home page. */

// var counterGetCrypto = 0;
// function getCryptoPrice(req, i, res) {
//   request("https://min-api.cryptocompare.com/data/price?fsym="+req.session.dataAd.crypto+"&tsyms=USD", function(error, response, body) {
//      body = JSON.parse(body);
//      console.log(i);
//      req.session.dataAd[i].cryptoPrice = body.USD;
//
//      counterGetCrypto++;
//      if(counterGetCrypto == req.session.dataAd.length){
//        counterGetCrypto = 0;
//        res.render('index', {dataAd: req.session.dataAd, IsLog: req.session.IsLog, user: req.session.user});
//      }
//    });
// }

router.get('/', function(req, res, next) {

  AdModel.find(function(error, dataAd){
  req.session.dataAd = dataAd;
  //req.session.cryptoP = [];
  // for (var i = 0; i < req.session.dataAd.length; i++) {
  //   getCryptoPrice(req, i, res);
  //   var price = body.USD;
  //   req.session.cryptoP.push(body.USD);
  //   console.log(req.session.cryptoP);
  //   console.log(req.session.cryptoP.length);
  //   console.log(req.session.dataAd.length);
  //   if (req.session.cryptoP.length == req.session.dataAd.length) {
  // }

  var scrapData = [];
  request("https://masternodes.online/", function(error, response, body) {
    var $ = cheerio.load(body);
      // console.log(body);
    $('tr').each(function(){
      var coin = {};
      $(this).find('td').each(function(i){
      if(i == 2){
      coin.name = $(this).text();
      }
      if(i == 3){
      coin.price = $(this).text();
      }
      if(i == 7){
      coin.roi = $(this).text();
      }
      if(i == 9){
      coin.required = $(this).text();
      }
      if(i == 10){
      coin.MnWorth = $(this).text();
      }
      })
      scrapData.push(coin);
    })
    req.session.scrapData = scrapData;


    if (scrapData.length == req.session.scrapData.length) {
        for (var i = 0; i < req.session.dataAd.length; i++) {
          for (var j = 0; j < req.session.scrapData.length; j++) {
          if (req.session.dataAd[i].crypto == req.session.scrapData[j].name) {
            req.session.dataAd[i].cryptoP = req.session.scrapData[j].price;
            req.session.dataAd[i].roi = req.session.scrapData[j].roi;
            req.session.dataAd[i].required = req.session.scrapData[j].required;
            req.session.dataAd[i].MnWorth = req.session.scrapData[j].MnWorth;
            console.log(i);
            }
          }
          if (req.session.dataAd.length == i+1) {
          console.log(req.session.dataAd);
        res.render('index', {dataAd: req.session.dataAd, IsLog: req.session.IsLog, user: req.session.user});
      }
      }
    }
  });

  });
  })

// GET Signup page
router.get('/signUp', function(req, res, next) {
  res.render('signUp');
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
        newUser.save(
          function(error, user) {
            req.session.user = user;

            req.session.IsLog = true;

                res.render('index', {dataAd: req.session.dataAd, IsLog: req.session.IsLog, user : req.session.user});

                        }
                      )
                        } else {
                      req.session.IsLog = false;
                      res.render('signUp',{});
                    }
                  }
                )
              } else {
                req.session.IsLog = false;
                res.render('signUp');

              }
              }
              );


//**************************** Get new ad page ****************************
router.get('/postAds', function(req, res, next) {
  console.log(req.session.scrapData);
  res.render('postAds', {scrap: req.session.scrapData});
});

// **************************** add new ad ****************************

router.post('/ad', function(req, res, next) {
 //  request("https://min-api.cryptocompare.com/data/price?fsym="+req.body.crypto+"&tsyms=USD", function(error, response, body) {
 //
 //   body = JSON.parse(body);
 //   console.log(body.usd);
 // var price = body.USD;

  // body = JSON.parse(body);
  var newAd = new AdModel({
    posterName: req.session.user.name,
    posterId: req.session.user._id,
    crypto: req.body.crypto,
    // cryptoP: req.session.dataAd.cryptoP,
    title: req.body.title,
    NbSeat: req.body.NbSeat,
    message: req.body.message,
    dateAnnonce: new Date()
  });
  newAd.save(
    function(error, annonce) {
      AdModel.find(
        function(err, annonce) {
          req.session.dataAd = annonce;
          for (var i = 0; i < req.session.dataAd.length; i++) {
            for (var j = 0; j < req.session.scrapData.length; j++) {
            if (req.session.dataAd[i].crypto == req.session.scrapData[j].name) {
              req.session.dataAd[i].cryptoP = req.session.scrapData[j].price;
              req.session.dataAd[i].roi = req.session.scrapData[j].roi;
              req.session.dataAd[i].required = req.session.scrapData[j].required;
              req.session.dataAd[i].MnWorth = req.session.scrapData[j].MnWorth;
              console.log(i);
              }
            }
            if (req.session.dataAd.length == i+1) {
            console.log(req.session.dataAd);
          res.render('index', {dataAd: req.session.dataAd, IsLog: req.session.IsLog, user: req.session.user});
        }
        }
        }
      )
  });
    });


router.get('/cardAds', function(req, res, next) {
  AdModel.find(
    {_id : req.query.id},
    function(err, oneAd){
      req.session.oneAd = oneAd[0];
      commentModel.find(
        {adId : req.session.oneAd._id},
        function(err, comments){
          req.session.comments = comments;
          reqAccModel.find(
            {adId : req.query.id},
            function(err, acceptReq){

              req.session.acceptReq = acceptReq;
              for (var i = 0; i < req.session.dataAd.length; i++) {
               if (req.session.dataAd[i]._id == req.session.oneAd._id) {
                 req.session.oneAd = req.session.dataAd[i];
                 res.render('Ads', {dataAd: req.session.oneAd, IsLog: req.session.IsLog, comments: req.session.comments, acceptReq: req.session.acceptReq});
               }
              }

            })
        })
    })
});



//**************************** login ****************************
router.post('/login', function(req, res, next) {
  UserModel.find(
      {name: req.body.name, password: req.body.password} ,
      function (err, users) {
        if(users.length > 0) {
          req.session.user = users[0];
          req.session.IsLog = true;
          AdModel.find(
               // {user_id: req.session.user._id},
               function (error,annonce) {
                 res.render('index', {dataAd: req.session.dataAd, IsLog: req.session.IsLog, annonce, user : req.session.user });
               }
           )
        } else {
          req.session.IsLog = false;
          res.render('index', {dataAd: req.session.dataAd, IsLog: req.session.IsLog});
        }
  });
});

//**************************** Logout ****************************
router.get('/logout', function(req, res, next) {
  req.session.IsLog = false;
  console.log(req.session.dataAd);

  res.render('index', {dataAd: req.session.dataAd, IsLog: req.session.IsLog});
})


 // ************************** file upload ****************************
 router.post('/upload', function(req, res) {
  if (!req.files) {
    return res.status(400).send('No files were uploaded.');
  }
  let avatar = req.files.avatar;

  console.log(req.session.user._id);
  let idUser =req.session.user._id;

  // Use the mv() method to place the file somewhere on your server
  avatar.mv('./public/images/' + idUser + '.png', function(err) {
  // avatar.mv('./public/images/avatar.png', function(err) {
    if (err) {
      console.log(idUser);
      return res.status(500).send(err);
    }

  res.render('myprofile',{user: req.session.user, idUser: req.session.user._id, reqR:req.session.myReqR, dataAd: req.session.myAds});
  });
});
    // ************************** Get My Profile page ****************************
  router.get('/profile', function(req, res, next) {
    AdModel.find(
      {posterId: req.session.user._id},
      function(err, myAds){
        req.session.myAds = myAds
      })
        reqModel.find(
          {posterId: req.session.user._id},
          function(err, myReqR){
            req.session.myReqR = myReqR
          res.render('myprofile',{user: req.session.user, idUser: req.session.user._id, dataAd: req.session.myAds, reqR:req.session.myReqR});
          }
    )
});


// **************************** Get Edit My Profile page ****************************

router.get('/Editprofile', function(req, res, next) {
  res.render('Editprofile',{user: req.session.user});
});
     // **************************** Save Profile Changes ****************************


     router.post('/SaveChange', function(req, res, next) {
       if(req.body.email.length > 0 &&
          req.body.name.length > 0 &&
           req.body.password.length > 0 &&
            req.body.password == req.body.confirm){
       UserModel.update({_id: req.session.user._id},
         {email: req.body.email,
         name: req.body.name,
         password: req.body.password,
         job: req.body.job,
         twitter: req.body.twitter,
         Discord:req.body.Discord,
         linkedin: req.body.linkedin,
         bio: req.body.bio},
           function(err, user){
             var userIdTmp = req.session.user._id;
             req.session.user = req.body;
              req.session.user._id = userIdTmp;
                res.render('myprofile', {user: req.body, idUser: req.session.user._id, dataAd: req.session.myAds, reqR:req.session.myReqR});
       }
       );
      } else{
        res.render('Editprofile', {user: req.session.user});
      }
  });

// **************************** search annonce ****************************
router.post('/search', function(req, res){
  var adSearch = [];
  var search = req.body.search;
      search = search.toUpperCase();
     for (var i = 0; i < req.session.dataAd.length; i++) {
      var title = JSON.stringify(req.session.dataAd[i].title)
          title = title.toUpperCase();
      var message = JSON.stringify(req.session.dataAd[i].message)
          message = message.toUpperCase();
      var crypto = JSON.stringify(req.session.dataAd[i].crypto)
          crypto = crypto.toUpperCase();
      var NbSeat = JSON.stringify(req.session.dataAd[i].NbSeat)
      if (title.includes(search) ||
       message.includes(search) ||
       crypto.includes(search) ||
       NbSeat.includes(search)) {
        adSearch.push(req.session.dataAd[i]);
      }
      }
      res.render('index', {search,dataAd: adSearch, IsLog: req.session.IsLog, user : req.session.user });
});

  // **************************** Get ad commentaire ****************************
router.get('/adComment', function(req, res, next) {
  res.render('comment', {dataAd: req.session.oneAd, IsLog: req.session.IsLog, user : req.session.user});
});
// **************************** ajouter un commentaire ****************************

router.post('/postComment', function(req, res, next) {

  var newComment = new commentModel({
    userId: req.session.user._id,
    userName: req.session.user.name,
    adId: req.session.oneAd._id,
    message: req.body.comment,
    dateComment: new Date()
  });
  newComment.save(
    function(error, comments) {
      commentModel.find(
          {adId: req.session.oneAd._id},
        function(err, comments) {


          res.render('Ads', {dataAd: req.session.oneAd, IsLog: req.session.IsLog, user : req.session.user, comments, acceptReq: req.session.acceptReq});

        }
      )

    });

});

// **************************** Request ****************************
router.get('/sendReq', function(req, res, next) {

AdModel.find(
  {_id: req.query.id},
  function(err, ad) {

    var newRequest = new reqModel({
       adId: req.query.id,
       adTitle: ad[0].title,
       adCrypto: ad[0].crypto,
       posterName: ad[0].posterName,
       posterId: ad[0].posterId,
       userReqName: req.session.user.name,
       userReqId: req.session.user._id,
    });
    newRequest.save(
      function(error, request) {
        console.log(request);
res.render('index', {dataAd: req.session.dataAd, IsLog: req.session.IsLog, user : req.session.user});
      });
  });
  }
)

// **************************** Supprimer la Request ****************************
router.get('/delReq', function(req, res, next){
    reqModel.remove(
    {_id: req.query.id},
    function(err) {});
    reqModel.find(
      {posterId: req.session.user._id},
      function(err, myReqR){
        req.session.myReqR = myReqR
      res.render('myprofile',{user: req.session.user, idUser: req.session.user._id, dataAd: req.session.myAds, reqR:req.session.myReqR});
      }
)
})
// **************************** Acceptation request ****************************
router.get('/acceptReq', function(req, res, next){
  reqModel.find(
    {_id: req.query.id},
    function(err, accReq) {
      var newRequestAcc = new reqAccModel({
         adId: accReq[0].adId,
         posterName: accReq[0].posterName,
         posterId: accReq[0].posterId,
         userReqName: accReq[0].userReqName,
         userReqId: accReq[0].userReqId,
      });
      newRequestAcc.save(
        function(error, requestAcc) {
          reqModel.remove(
          {_id: req.query.id},
          function(err) {
          reqModel.find(
            {posterId: req.session.user._id},
            function(err, myReqR){
              req.session.myReqR = myReqR
            res.render('myprofile',{user: req.session.user, idUser: req.session.user._id, dataAd: req.session.myAds, reqR:req.session.myReqR});
              });
            }
          )
        });
    });

    }
  )


module.exports = router;
