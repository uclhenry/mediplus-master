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

var FeedParser = require('feedparser')
var request = require('request');
var Iconv = require('iconv').Iconv;

var server;
var rssOutput = [];
//////


// view engine setup
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

//app.use('/app',require('./sb-admin').app).listen(9000);


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


var CronJob = require('cron').CronJob;
new CronJob('*/10 * * * *', function() {

  // Don't worry about this. It's just a localhost file server so you can be
    // certain the "remote" feed is available when you run this example.
    server = require('http').createServer(function (req, res) {
      var stream = require('fs').createReadStream(require('path').resolve(__dirname, '../test/feeds' + req.url));
      res.setHeader('Content-Type', 'text/xml; charset=Windows-1251');
      stream.pipe(res);
    });
    server.listen(0, function () {
      //fetch('http://localhost:' + this.address().port + '/iconv.xml');
      fetch('http://medusa.jrc.it/rss?type=category&id=Vaccination&language=en');
    });



  console.log('Medisys RSS feed checked and added to mongodb (freq: every 10 mins)');
}, null, true);



function fetch(feed) {
    // Define our streams
    var req = request(feed, {timeout: 10000, pool: false});
    req.setMaxListeners(50);
    // Some feeds do not respond without user-agent and accept headers.
    req.setHeader('user-agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36')
    req.setHeader('accept', 'text/html,application/xhtml+xml');

    var feedparser = new FeedParser();

    // Define our handlers
    req.on('error', done);
    req.on('response', function(res) {
      if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));
      var charset = getParams(res.headers['content-type'] || '').charset;
      res = maybeTranslate(res, charset);
      // And boom goes the dynamite
      res.pipe(feedparser);
    });

    feedparser.on('error', done);
    feedparser.on('end', done);
    feedparser.on('readable', function() {
      var post;
      while (post = this.read()) {
        rssOutput.push(post);
        //console.log(post);
      }
    });
  }

  function maybeTranslate (res, charset) {
    var iconv;
    // Use iconv if its not utf8 already.
    if (!iconv && charset && !/utf-*8/i.test(charset)) {
      try {
        iconv = new Iconv(charset, 'utf-8');
        console.log('Converting from charset %s to utf-8', charset);
        iconv.on('error', done);
        // If we're using iconv, stream will be the output of iconv
        // otherwise it will remain the output of request
        res = res.pipe(iconv);
      } catch(err) {
        res.emit('error', err);
      }
    }
    return res;
  }

  function getParams(str) {
    var params = str.split(';').reduce(function (params, param) {
      var parts = param.split('=').map(function (part) { return part.trim(); });
      if (parts.length === 2) {
        params[parts[0]] = parts[1];
      }
      return params;
    }, {});
    return params;
  }

  function done(err) {
    if (err) {
      console.log(err, err.stack);
      return process.exit(1);
    }
    server.close();
    //console.log(JSON.stringify(rssOutput));

    /*var json = '[{"_id":"5078c3a803ff4197dc81fbfb","email":"user1@gmail.com","image":"some_image_url","name":"Name 1"},{"_id":"5078c3a803ff4197dc81fbfc","email":"user2@gmail.com","image":"some_image_url","name":"Name 2"}]';

var obj = JSON.parse(json)[0];
obj.id = obj._id;
delete obj._id;

json = JSON.stringify([obj]);*/

    var processedJson = [];

    var json = JSON.stringify(rssOutput);
    var obj = JSON.parse(json);

    for (article in obj){
      //console.log(obj[article].guid);
      //break;
      obj[article]._id = obj[article].guid;
      delete obj[article].guid;



      //processedJson.push(JSON.stringify(article));


    }

    //'0 0/10 * 1/1 * ? *'

    //var finalJson = JSON.stringify(obj);
    //console.log(finalJson);
    //json = JSON.stringify()
    //console.log(json);
    //set up mongo such that json.stringify(output) is imported into mongo test db collection medisys.
    //such that field guid is id of collection, and skip import of elements with same id.

    MongoClient.connect(url, function(err,db) {
            assert.equal(null, err);
            var callback = function() {
              db.close();
            };

              db.collection('medisys').insert(obj, {continueOnError: true, safe: true}, function(err, docs){
                //console.log('err: ' + err);
                if(!err) console.log('data inserted successfully!\n');
              });

                //[

                //{$group : { _id : '$user.id', count : {$sum : 1}}},{$sort : { count: -1}}, {$limit:10} 
                //{}
                //]
                //finalJson

                //);
                        
          });




    //process.exit();
  }

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
  
  app.get('/tophashtags/:shortUrl', function(req, res) {

    var shorturl = ".*" + req.params.shortUrl;

    MongoClient.connect(url, function(err,db) {
            assert.equal(null, err);
            var callback = function() {
              db.close();
            };


              db.collection('mediboard1').aggregate(

                [

              {$match: { "entities.urls.0": { $exists: true }, $and: [ { "entities.hashtags.0": { $exists: true } }, { $and: [ { "entities.urls.0.url": new RegExp(shorturl, 'i') } ] } ] }},{$project: {"entities.hashtags": 1, "entities.urls": 1}  },{$limit: 10}

                ]

                ).toArray(function(err, result) {
                  assert.equal(err, null);
                  //console.log(result);

                  var hashmap = {};
                                                                                            console.log(result + "imhger");

                  for (var key in result) {
                                                                                            console.log(result[key].entities.hashtags + "imhger");

                    if (result.hasOwnProperty(key)) {
                                                                        console.log(result[key].entities.hashtags + "imhger");


                      for(var key1 in result[key].entities.hashtags) {

                                                  console.log(result[key].entities.hashtags[key1]);

                        if (result[key].entities.hashtags.hasOwnProperty(key1)) {
                          console.log(result[key].entities.hashtags[key1].text);
                          if (!hashmap[result[key].entities.hashtags[key1].text]){
                            hashmap[result[key].entities.hashtags[key1].text] = 1;
                          }else{
                            hashmap[result[key].entities.hashtags[key1].text]++;
                          }



                        }
                      }


                    }
                  }

                  result = hashmap



                  res.send(result);
                  callback(result);
                });
                        
          });



  })

  app.get('/topusers/:day/:month/:year', function(req, res) {

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

//app.get('/medisys', function(req, res) {

  
  

  

//})

app.get('/topusers', function(req, res) {


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

app.get('/networkgraph', function(req, res) {

      MongoClient.connect(url, function(err,db) {
            assert.equal(null, err);
            var callback = function() {
              db.close();
            };

              db.collection('mediboard1').aggregate(

                [

                {$project: {"text" : 1, "retweeted_status.text": 1, "user.id_str": 1,"user.screen_name": 1, "retweeted_status.user.id_str": 1, "retweeted_status.user.screen_name": 1} }, {$limit:1000}

                ]

                ).toArray(function(err, result) {
                  assert.equal(err, null);
                  //console.log(result);

                  //code to convert to node edge graph

                  var i=0,N = 10,
                  E = 50,
                  g = {
                    nodes: [],
                    edges: []
                  };

                  var segmentSizes = {};
                  var tweetSegmentMap = {};
                  var segmentId = 0;
                  //var keys = [];

                  for (var key in result) {
                    if (result.hasOwnProperty(key)) {
                      
                      /*
                      var tweetUserId = result[key].user.id_str;//key.user.id_str;


 //check if node/edge already exists..
                      
                      var alreadyExists = false;

                      for(var key1 in g.nodes){
                        console.log(g.nodes[key1].id + "her");
                        if (g.nodes.hasOwnProperty(key1) && g.nodes[key1].id == tweetUserId) {
                          alreadyExists = true;
                          console.log("already exists now true" + tweetUserId);
                          break;
                        }
                      }
                      if (!alreadyExists){
                        g.nodes.push({
                          id: ""+tweetUserId,
                          label: ""+tweetUserId,
                          x: Math.random(),
                          y: Math.random(),
                          size: Math.random(),
                          color: '#666'
                        });
                      }
                      */


                      function genColor (seed) {
                          color = Math.floor((Math.abs(Math.tan(seed) * 16777215)) % 16777215);
                          color = color.toString(16);
                          // pad any colors shorter than 6 characters with leading 0s
                          while(color.length < 6) {
                              color = '0' + color;
                          }
                          
                          return color;
                      }

                      //REMOVE NODES/EDGES WITH LOW CONNECTIVITY.... too many nodes to send across network.
                      //do this by storing connectivity number and updating it when inputting nodes, adding new nodes with edges...

                      try{

                        if (result[key].retweeted_status.user) {
                        
                          var tweetText = result[key].text;
                          var retweetText = result[key].retweeted_status.text;

                          var tweetUserId = result[key].user.id_str;//key.user.id_str;
                          var tweetUserName = result[key].user.screen_name;;


     //check if node/edge already exists..
                          
                          var alreadyExists_tweet = false;

                          for(var key1 in g.nodes){
                            //console.log(g.nodes[key1].id + "her");
                            if (g.nodes.hasOwnProperty(key1) && g.nodes[key1].id == tweetUserId) {
                              alreadyExists_tweet = true;
                              //console.log("already exists now true" + tweetUserId);
                              break;
                            }
                          }

                          var retweetUserId = result[key].retweeted_status.user.id_str;
                          var retweetUserName = result[key].retweeted_status.user.screen_name;


                          var alreadyExists_retweet = false;

                          for(var key1 in g.nodes){
                                                    //console.log(g.nodes[key1].id + "here");

                            if (g.nodes.hasOwnProperty(key1) && g.nodes[key1].id == retweetUserId) {
                              alreadyExists_retweet = true;
                                                        //console.log("already exists now true" + retweetUserId);

                              break;
                            }
                          }

                          if (!alreadyExists_tweet && !alreadyExists_retweet) {
                            segmentId++;
                            tweetSegmentMap[tweetUserId] = segmentId;
                            tweetSegmentMap[retweetUserId] = segmentId;
                            segmentSizes[segmentId] = 2;

                          }else if(!alreadyExists_tweet && alreadyExists_retweet) {
                            tweetSegmentMap[tweetUserId] = tweetSegmentMap[retweetUserId];
                            segmentSizes[tweetSegmentMap[tweetUserId]]++;

                          }else if(alreadyExists_tweet && !alreadyExists_retweet) {
                            tweetSegmentMap[retweetUserId] = tweetSegmentMap[tweetUserId];
                            segmentSizes[tweetSegmentMap[tweetUserId]]++;

                          }


                          if (!alreadyExists_tweet){

                            

                            g.nodes.push({
                              id: ""+tweetUserId,
                              label: ""+tweetUserName/*+","+tweetSegmentMap[tweetUserId]*/,
                              x: Math.random(),
                              y: Math.random(),
                              size: Math.random(),
                              color: "#"+genColor(tweetSegmentMap[tweetUserId]),
                              segment: tweetSegmentMap[tweetUserId],
                              text: tweetText
                            });




                            
                          }



                          
                          if(!alreadyExists_retweet){

                            
                            g.nodes.push({
                              id: ""+retweetUserId,
                              label: ""+retweetUserName/*+","+tweetSegmentMap[retweetUserId]*/,
                              x: Math.random(),
                              y: Math.random(),
                              size: Math.random(),
                              color: "#"+genColor(tweetSegmentMap[retweetUserId]),
                              segment: tweetSegmentMap[retweetUserId],
                              text: retweetText
                            });

                            
                          }


                            g.edges.push({
                              id: 'e' + i,
                              source: ""+tweetUserId,
                              target: ""+retweetUserId,
                              size: Math.random(),
                              color: "#666"
                            });
                            i++;
                          

                          
                        }

                      }catch(e){

                        

                      }
                      

     

                      //keys.push(g);
                      //keys.push(result[key].user.id_str);
                                          //break;

                    }
                  }


                  res.send(g);
                  callback(g);
                });
                        
          });

});

/*
 app.get('/topusers/:day/:month/:year', function(req, res, next) {

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

 app.get('/topusers/', function(req, res) {


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
