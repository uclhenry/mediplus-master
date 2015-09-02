var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require('./routes/index');
//var users = require('./routes/users');

var app = express();

// view engine setup
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
//app.use('/users', users);

// 

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost/test';


// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
    
  });
}

  app.get('/api/topusers/:day/:month/:year', function(req, res) {

      var day = req.params.day;
      var month = req.params.month;
      var year = req.params.year;

      var regexString = ".*" + month + " " + day + ".*" + year;

      MongoClient.connect(url, function(err,db) {
            assert.equal(null, err);
            var callback = function() {
              db.close();
            };

              db.collection('mediboard1').aggregate(

                [

                //{$group : { _id : '$user.id', count : {$sum : 1}}},{$sort : { count: -1}}, {$limit:10} 
                {$match:{"created_at" : new RegExp(regexString, 'i') }},{$group : { _id : '$user.screen_name', count : {$sum : 1}}},{$sort : { count: -1}}, {$limit:10} 

                ]

                ).toArray(function(err, result) {
                  assert.equal(err, null);
                  console.log(result);
                  res.send(result);
                  callback(result);
                });
                        
          });

});

app.get('/api/topusers', function(req, res) {

      var day = req.params.day;
      var month = req.params.month;
      var year = req.params.year;

      var regexString = ".*" + month + " " + day + ".*" + year;

      MongoClient.connect(url, function(err,db) {
            assert.equal(null, err);
            var callback = function() {
              db.close();
            };

              db.collection('mediboard1').aggregate(

                [

                //{$group : { _id : '$user.id', count : {$sum : 1}}},{$sort : { count: -1}}, {$limit:10} 
                {$group : { _id : '$user.screen_name', count : {$sum : 1}}},{$sort : { count: -1}}, {$limit:10} 

                ]

                ).toArray(function(err, result) {
                  assert.equal(err, null);
                  console.log(result);
                  res.send(result);
                  callback(result);
                });
                        
          });

});

/*
 app.get('api/topusers/:day/:month/:year', function(req, res, next) {

  var day = req.params.day;
  var month = req.params.month;
  var year = req.params.year;

      //make use of day month year to perform query on top user for that specific day
      MongoClient.connect(url, function(err,db) {
            assert.equal(null, err);
            var callback = function() {
              db.close();
            };

              db.collection('mediboard1').aggregate(

                [

                {$match:{"created_at" : /.*Jul 20.*2015/ }},{$group : { _id : '$user.screen_name', count : {$sum : 1}}},{$sort : { count: -1}}, {$limit:10} 

                ]

                ).toArray(function(err, result) {
                  assert.equal(err, null);
                  console.log(result);
                  res.send(result);
                  callback(result);
                });
                        
          });

      

});

 app.get('api/topusers/', function(req, res) {


      MongoClient.connect(url, function(err,db) {
            assert.equal(null, err);
            var callback = function() {
              db.close();
            };

              db.collection('mediboard1').aggregate(

                [

                {$group : { _id : '$user.id', count : {$sum : 1}}},{$sort : { count: -1}}, {$limit:10} 

                ]

                ).toArray(function(err, result) {
                  assert.equal(err, null);
                  console.log(result);
                  res.send(result);
                  callback(result);
                });
                        
          });

});*/
/*
var tweetdata = db.collection("mediboard1");


app.get('/topusers', function(req, res) {

  tweetdata.aggregate(

    [
    {$group : { _id : '$user.id', count : {$sum : 1}}},{$sort : { count: -1}}, {$limit:10} 


    ], function(err, result) {
      if (err) {
        console.log(err);
        res.send(error);
        return;
      }
      res.send(result);
    console.log(result);
  })
});


*/



//catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
