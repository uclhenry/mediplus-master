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

var HashMap = require('hashmap');



// view engine setup
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

//app.use('/app',require('./sb-admin').app).listen(9000);


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
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
//new CronJob('*/10 * * * *', function() {
new CronJob('*/15 * * * *', function() {

    // Don't worry about this. It's just a localhost file server so you can be
    // certain the "remote" feed is available when you run this example.
    server = require('http').createServer(function(req, res) {
        var stream = require('fs').createReadStream(require('path').resolve(__dirname, '../test/feeds' + req.url));
        res.setHeader('Content-Type', 'text/xml; charset=Windows-1251');
        stream.pipe(res);
    });
    server.listen(0, function() {
        //fetch('http://localhost:' + this.address().port + '/iconv.xml');
        fetch('http://medusa.jrc.it/rss?type=category&id=Vaccination&language=en');
    });



    console.log('Medisys RSS feed checked and added to mongodb (freq: every 15 mins)');
}, null, true);


function genColor(seed) {
    color = Math.floor((Math.abs(Math.tan(seed) * 16777215)) % 16777215);
    color = color.toString(16);
    // pad any colors shorter than 6 characters with leading 0s
    while (color.length < 6) {
        color = '0' + color;
    }

    return color;
}



function fetch(feed) {
    // Define our streams
    var req = request(feed, {
        timeout: 10000,
        pool: false
    });
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

function maybeTranslate(res, charset) {
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
        } catch (err) {
            res.emit('error', err);
        }
    }
    return res;
}

function getParams(str) {
    var params = str.split(';').reduce(function(params, param) {
        var parts = param.split('=').map(function(part) {
            return part.trim();
        });
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

    for (article in obj) {
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

    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        var callback = function() {
            db.close();
        };

        for (article in obj) {
            db.collection('medisys').save(obj[article], function(err, docs) {
                if (err) {
                    console.log('err: ' + err);
                }
                //if(!err) console.log(obj[article]._id+' : data inserted successfully!\n');
            });
        }
        db.close();


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

    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        var callback = function() {
            db.close();
        };


        db.collection('mediboard1').aggregate(

            [

                {
                    $match: {
                        "entities.urls.0": {
                            $exists: true
                        },
                        $and: [{
                            "entities.hashtags.0": {
                                $exists: true
                            }
                        }, {
                            $and: [{
                                "entities.urls.0.url": new RegExp(shorturl, 'i')
                            }]
                        }]
                    }
                }, {
                    $project: {
                        "entities.hashtags": 1,
                        "entities.urls": 1
                    }
                }, {
                    $limit: 10
                }

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


                    for (var key1 in result[key].entities.hashtags) {

                        console.log(result[key].entities.hashtags[key1]);

                        if (result[key].entities.hashtags.hasOwnProperty(key1)) {
                            console.log(result[key].entities.hashtags[key1].text);
                            if (!hashmap[result[key].entities.hashtags[key1].text]) {
                                hashmap[result[key].entities.hashtags[key1].text] = 1;
                            } else {
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

app.get('/topusers/summarize/:day/:month/:year', function(req, res) {

})

app.get('/topusers/summary/:day/:month/:year', function(req, res) {

})

app.get('/topusers/:day/:month/:year', function(req, res) {

    var day = req.params.day;
    var month = req.params.month;
    var year = req.params.year;

    var regexString = ".*" + month + " " + day + ".*" + year;

    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        var callback = function() {
            db.close();
        };

        db.collection('mediboard1').aggregate(

            [

                //{$group : { _id : '$user.id', count : {$sum : 1}}},{$sort : { count: -1}}, {$limit:10} 
                {
                    $match: {
                        "created_at": new RegExp(regexString, 'i')
                    }
                }, {
                    $group: {
                        _id: '$user.screen_name',
                        count: {
                            $sum: 1
                        }
                    }
                }, {
                    $sort: {
                        count: -1
                    }
                }, {
                    $limit: 10
                }

            ]

        ).toArray(function(err, result) {
            assert.equal(err, null);
            console.log(result);
            res.send(result);
            callback(result);
        });

    });

});

app.get('/twittercount/:day/:month/:year', function(req, res) {

    var day = req.params.day;
    var month = req.params.month;
    var year = req.params.year;

    var regexString = ".*" + month + " " + day + ".*" + year;

    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        var callback = function() {
            db.close();
        };

        db.collection('mediboard1').aggregate(

            [

                //{$group : { _id : '$user.id', count : {$sum : 1}}},{$sort : { count: -1}}, {$limit:10} 
                {
                    $match: {
                        "created_at": new RegExp(regexString, 'i')
                    }
                }, {
                    $group: {
                        _id: null,
                        count: {
                            $sum: 1
                        }
                    }
                }

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


    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        var callback = function() {
            db.close();
        };

        db.collection('mediboard1').aggregate(

            [

                //{$group : { _id : '$user.id', count : {$sum : 1}}},{$sort : { count: -1}}, {$limit:10} 
                {
                    $group: {
                        _id: '$user.screen_name',
                        count: {
                            $sum: 1
                        }
                    }
                }, {
                    $sort: {
                        count: -1
                    }
                }, {
                    $limit: 10
                }

            ]

        ).toArray(function(err, result) {
            assert.equal(err, null);
            console.log(result);
            res.send(result);
            callback(result);
        });

    });

});

app.get('/networkgraph/searchbyhashtag/:hashtag', function(req, res) {

    var regexString = ".*" + hashtag + ".*";

    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        var callback = function() {
            db.close();
        };

        db.collection('mediboard1').aggregate(

            [

                {
                    $match: {
                        "text": new RegExp(regexString, 'i')
                    }
                }, {
                    $project: {
                        "text": 1,
                        "retweeted_status.text": 1,
                        "user.id_str": 1,
                        "user.screen_name": 1,
                        "retweeted_status.user.id_str": 1,
                        "retweeted_status.user.screen_name": 1
                    }
                }, {
                    $limit: 100000
                }



                //{$project: {"text" : 1, "retweeted_status.text": 1, "user.id_str": 1,"user.screen_name": 1, "retweeted_status.user.id_str": 1, "retweeted_status.user.screen_name": 1} }, {$limit:1000}

            ]

        ).toArray(function(err, result) {
            assert.equal(err, null);
            //console.log(result);

            //code to convert to node edge graph

            var i = 0,
                N = 10,
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


                    

                    //REMOVE NODES/EDGES WITH LOW CONNECTIVITY.... too many nodes to send across network.
                    //do this by storing connectivity number and updating it when inputting nodes, adding new nodes with edges...

                    try {

                        if (result[key].retweeted_status.user) {

                            var tweetText = result[key].text;
                            var retweetText = result[key].retweeted_status.text;

                            var tweetUserId = result[key].user.id_str; //key.user.id_str;
                            var tweetUserName = result[key].user.screen_name;;


                            //check if node/edge already exists..

                            var alreadyExists_tweet = false;

                            for (var key1 in g.nodes) {
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

                            for (var key1 in g.nodes) {
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

                            } else if (!alreadyExists_tweet && alreadyExists_retweet) {
                                tweetSegmentMap[tweetUserId] = tweetSegmentMap[retweetUserId];
                                segmentSizes[tweetSegmentMap[tweetUserId]]++;

                            } else if (alreadyExists_tweet && !alreadyExists_retweet) {
                                tweetSegmentMap[retweetUserId] = tweetSegmentMap[tweetUserId];
                                segmentSizes[tweetSegmentMap[tweetUserId]]++;

                            }


                            if (!alreadyExists_tweet) {



                                g.nodes.push({
                                    id: "" + tweetUserId,
                                    label: "" + tweetUserName /*+","+tweetSegmentMap[tweetUserId]*/ ,
                                    x: Math.random(),
                                    y: Math.random(),
                                    size: Math.random(),
                                    color: "#" + genColor(tweetSegmentMap[tweetUserId]),
                                    segment: tweetSegmentMap[tweetUserId],
                                    text: tweetText
                                });




                            }




                            if (!alreadyExists_retweet) {


                                g.nodes.push({
                                    id: "" + retweetUserId,
                                    label: "" + retweetUserName /*+","+tweetSegmentMap[retweetUserId]*/ ,
                                    x: Math.random(),
                                    y: Math.random(),
                                    size: Math.random(),
                                    color: "#" + genColor(tweetSegmentMap[retweetUserId]),
                                    segment: tweetSegmentMap[retweetUserId],
                                    text: retweetText
                                });


                            }


                            g.edges.push({
                                id: 'e' + i,
                                source: "" + tweetUserId,
                                target: "" + retweetUserId,
                                size: Math.random(),
                                color: "#666"
                            });
                            i++;



                        }

                    } catch (e) {



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

app.get('/networktweetgraph/:category', function(req, res) {

    var category = req.params.category;
    var regexString = ".*";
    //console.log(category);
    if (category !== "generic") {
        regexString = ".*" + category + ".*";
        //console.log(category);

    }
    //var regexString = ".*"+hashtag+".*";
    //var result = [];

                var i = 0//,
                //N = 10,
                //E = 50,
                /*g = {
                    nodes: [],
                    edges: []
                }*/;

            var nodeMap = new HashMap();
            var edgeMap = new HashMap();

            var segmentSizes = new HashMap();
            var tweetSegmentMap = {};
            var segmentId = 0;
            var largestSegmentSize = 0;

    function nodeFunction(node) {
        try {

                        if (node.retweeted_status.user) {

                            //var tweetId = result[key].id;
                            var tweetIdStr = node.id_str;



                            var tweetText = node.text;

                            //console.log("tweetid = "+tweetId + ", tweetText = "+ tweetText + "tweetidstr = "+ tweetIdStr);

                            var retweetText = node.retweeted_status.text;

                            var tweetUserId = node.user.id_str; //key.user.id_str;
                            var tweetUserName = node.user.screen_name;;


                            //check if node/edge already exists..

                            //var alreadyExists_tweet = false;
                            var alreadyExists_tweet = false;
                            if(nodeMap.get(tweetIdStr)){
                                alreadyExists_tweet = true;
                            }
                            //var alreadyExists_tweet = nodeMap.has(JSON.stringify(tweetIdStr));


                            /*for(var key1 in g.nodes){
                              //console.log("id_str = "+g.nodes[key1].id_str + ", tweetstr = "+ tweetIdStr);
                              if (g.nodes.hasOwnProperty(key1) && g.nodes[key1].id == tweetId) {
                                alreadyExists_tweet = true;
                                //console.log("already exists now true" + tweetId);
                                break;
                              }
                            }*/

                            //var retweetId = result[key].retweeted_status.id;
                            var retweetIdStr = node.retweeted_status.id_str;

                            var retweetUserId = node.retweeted_status.user.id_str;
                            var retweetUserName = node.retweeted_status.user.screen_name;


                            //var alreadyExists_retweet = false;

                            var alreadyExists_retweet = false;
                            if(nodeMap.get(retweetIdStr)){
                                alreadyExists_retweet = true;
                            }

                            /*for(var key1 in g.nodes){
                                                      //console.log(g.nodes[key1].id + "here");

                              if (g.nodes.hasOwnProperty(key1) && g.nodes[key1].id == retweetId) {
                                alreadyExists_retweet = true;
                                                          //console.log("already exists now true" + retweetId);

                                break;
                              }
                            }*/

                            //console.log(tweetIdStr + ", "+ retweetIdStr);

                            //console.log(alreadyExists_tweet + ", " + alreadyExists_retweet + ", " + nodeMap.keys());
                            //console.log("");

                            if (!alreadyExists_tweet && !alreadyExists_retweet) {
                                segmentId++;
                                tweetSegmentMap[tweetIdStr] = segmentId;
                                tweetSegmentMap[retweetIdStr] = segmentId;
                                segmentSizes.set(segmentId, 2)
                                if (largestSegmentSize < segmentSizes.get(segmentId)) {
                                    largestSegmentSize = segmentSizes.get(segmentId);
                                }

                            } else if (!alreadyExists_tweet && alreadyExists_retweet) {
                                tweetSegmentMap[tweetIdStr] = tweetSegmentMap[retweetIdStr];
                                var item = segmentSizes.get(parseInt(tweetSegmentMap[tweetIdStr]));
                                var valuetoset = item + 1;
                                //console.log(item + ", " + valuetoset);
                                segmentSizes.set(parseInt(tweetSegmentMap[tweetIdStr]),valuetoset);
                                //console.log("item: " + segmentSizes.get(parseInt(tweetSegmentMap[tweetIdStr])));
                                if (largestSegmentSize < segmentSizes.get(parseInt(tweetSegmentMap[tweetIdStr]))) {
                                    largestSegmentSize = segmentSizes.get(parseInt(tweetSegmentMap[tweetIdStr]));
                                }

                            } else if (alreadyExists_tweet && !alreadyExists_retweet) {
                                tweetSegmentMap[retweetIdStr] = tweetSegmentMap[tweetIdStr];
                                var item = segmentSizes.get(parseInt(tweetSegmentMap[tweetIdStr]));
                                var valuetoset = item + 1;
                                //console.log(item + ",, " + valuetoset);

                                segmentSizes.set(parseInt(tweetSegmentMap[tweetIdStr]),valuetoset);
                                if (largestSegmentSize < segmentSizes.get(parseInt(tweetSegmentMap[tweetIdStr]))) {
                                    largestSegmentSize = segmentSizes.get(parseInt(tweetSegmentMap[tweetIdStr]));
                                }

                            }


                            if (!alreadyExists_tweet) {

                                nodeMap.set(tweetIdStr, {

                                    id: "" + tweetIdStr,
                                    label: "" + tweetUserName /*+","+tweetSegmentMap[tweetUserId]*/ ,
                                    x: Math.random(),
                                    y: Math.random(),
                                    size: Math.random(),
                                    color: "#" + genColor(tweetSegmentMap[tweetIdStr]),
                                    segment: tweetSegmentMap[tweetIdStr],
                                    text: tweetText,
                                    type: "retweet"


                                });

                                /*g.nodes.push({
                                  id: ""+tweetId,
                                  label: ""+tweetUserName//+","+tweetSegmentMap[tweetUserId],
                                  x: Math.random(),
                                  y: Math.random(),
                                  size: Math.random(),
                                  color: "#"+genColor(tweetSegmentMap[tweetId]),
                                  segment: tweetSegmentMap[tweetId],
                                  text: tweetText
                                });*/




                            }




                            if (!alreadyExists_retweet) {

                                nodeMap.set(retweetIdStr, {

                                    id: "" + retweetIdStr,
                                    label: "" + retweetUserName /*+","+tweetSegmentMap[retweetUserId]*/ ,
                                    x: Math.random(),
                                    y: Math.random(),
                                    size: Math.random(),
                                    color: "#" + genColor(tweetSegmentMap[retweetIdStr]),
                                    segment: tweetSegmentMap[retweetIdStr],
                                    text: retweetText + "<p><h5>Retweeted users:</h5></p>",
                                    type: "tweet"

                                });


                                /*g.nodes.push({
                                  id: ""+retweetId,
                                  label: ""+retweetUserName,//+","+tweetSegmentMap[retweetUserId],
                                  x: Math.random(),
                                  y: Math.random(),
                                  size: Math.random(),
                                  color: "#"+genColor(tweetSegmentMap[retweetId]),
                                  segment: tweetSegmentMap[retweetId],
                                  text: retweetText
                                });*/


                            }

                            edgeMap.set({
                                source: tweetIdStr,
                                target: retweetIdStr
                            }, {

                                id: 'e' + i,
                                source: "" + tweetIdStr,
                                target: "" + retweetIdStr,
                                segment: tweetSegmentMap[tweetIdStr],
                                size: Math.random(),
                                color: "#666"

                            });

                            /*g.edges.push({
                              id: 'e' + i,
                              source: ""+tweetId,
                              target: ""+retweetId,
                              segment: tweetSegmentMap[tweetId],
                              size: Math.random(),
                              color: "#666"
                            });*/
                            i++;
                            //console.log("printing"+JSON.stringify(tweetSegmentMap)); // 80



                        } else {
                            //node with no edges from beginning
                            //console.log("else statement");
                        }

                    } catch (e) {
                        //console.log("err: "+e);


                    }
    };

    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        var callback = function() {
            db.close();
        };

        var cursor = db.collection('mediboard1').aggregate(

            [


                //hpv

                {
                    $match: {
                        "text": new RegExp(regexString, 'i')
                    }
                }, {
                    $project: {
                        "id": 1,
                        "id_str": 1,
                        "text": 1,
                        "retweeted_status.text": 1,
                        "user.id_str": 1,
                        "user.screen_name": 1,
                        "retweeted_status.id": 1,
                        "retweeted_status.id_str": 1,
                        "retweeted_status.user.id_str": 1,
                        "retweeted_status.user.screen_name": 1
                    }
                }, {
                    $limit: 100000
                }

                //general
                //{$project: {"id" : 1, "id_str" : 1, "text" : 1, "retweeted_status.text": 1, "user.id_str": 1,"user.screen_name": 1, "retweeted_status.id" : 1, "retweeted_status.id_str" : 1, "retweeted_status.user.id_str": 1, "retweeted_status.user.screen_name": 1} }, {$limit:1000}

            ]
            //console.log("query finished, now processing..");

        ).stream();


        cursor.on('end', function() {
            console.log(", now processing..");
            db.close();
            //assert.equal(err, null);

            //console.log(result);

            //code to convert to node edge graph
            

            //var keys = [];

            //for (var key in result) {
                //console.log("goes inside");

              //  if (result.hasOwnProperty(key)) {
                    //console.log(JSON.stringify(result));
                    //break;
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




                    //REMOVE NODES/EDGES WITH LOW CONNECTIVITY.... too many nodes to send across network.
                    //do this by storing connectivity number and updating it when inputting nodes, adding new nodes with edges...

                    



                    //keys.push(g);
                    //keys.push(result[key].user.id_str);
                    //break;

             //   }
           // }

            //check number of total nodes, remove clusters of size < 10% of biggest cluster size -> if nodes left are still of size > 1000, then increase percentage until size <=1000!

            // i.e. 70000 nodes total, biggest cluster size 130
            //remove any clusters of up to size 13.
            //

            //console.log("printing"+JSON.stringify(tweetSegmentMap)); // 80
            //console.log("printing" + JSON.stringify(nodeMap)); // 80
            //console.log("printing" + JSON.stringify(segmentSizes)); // 80
            console.log("printing" + JSON.stringify(largestSegmentSize)); // 7 here but pretend it is 20 -> therefore remove segments of size 2... (trial first)

            /*var segmentsToRemove = [];
            for (segment in segmentSizes){
              if (segmentSizes[segment] <= 2) {
                segmentsToRemove.push(segment);

              }
            }*/
            //console.log(segmentsToRemove);

            /*var g1 = {
                nodes: [],
                edges: []
            };*/

            //var nodeMapReduced = new HashMap();
            //var 

            //map segmentsize to the tweet nodes/edges

            var totalNodes = 0;
            segmentSizes.forEach(function(value, key) {
                totalNodes += value;
            });
            console.log(totalNodes);



            var tobesorted = segmentSizes.values();

            tobesorted.sort(function(a, b){return b-a});
            console.log("sorted: "+JSON.stringify(tobesorted));

            /*var minsegsize = Number.MAX_VALUE;
            var subtotal = 0;
            for(segsize in tobesorted) {
                if (subtotal <= 1000){
                    subtotal += tobesorted[segsize];
                    minsegsize = tobesorted[segsize];
                }
            }*/
            var i=0;
            while(i<1000){
                if(tobesorted[i]){
                    i++;
                }
            }
            var minsegsize = tobesorted[i]
            //console.log(subtotal);

            //console.log(minsegsize);


            edgeMap.forEach(function(value, key) {
                        //if(segmentSizes.get(parseInt(value.segment)) < minsegsize) {
                            if(true){
                                if(nodeMap.get(value.source).type == "retweet" ){
                                    var userNameToAppend = nodeMap.get(value.source).label;
                                    var node = nodeMap.get(value.target);
                                    node.text += "<p>"+userNameToAppend+"</p>";
                                    nodeMap.set(value.target,node);
                                }else if(nodeMap.get(value.target).type == "retweet" ){
                                    var userNameToAppend = nodeMap.get(value.target).label;
                                    var node = nodeMap.get(value.source);
                                    node.text += "<p>"+userNameToAppend+"</p>";
                                    nodeMap.set(value.source,node);
                                }
                                edgeMap.remove(key);
                                //console.log("something removed...");
                        }
                    });

            nodeMap.forEach(function(value, key) {
                        if((segmentSizes.get(parseInt(value.segment)) < minsegsize) || value.type == "retweet") {
                            nodeMap.remove(key);
                                                        //console.log("something removed...");

                        }else{
                            value.size = segmentSizes.get(parseInt(value.segment));
                            //value.text += "<p>Retweeted users:<p>";
                            nodeMap.set(key,value);
                        }
                    });



            //for (tweet in tweetSegmentMap) {
                //console.log(segmentSizes[tweetSegmentMap[tweet]]);
              //  if (tweetSegmentMap.hasOwnProperty(tweet) && segmentSizes[tweetSegmentMap[tweet]] <= largestSegmentSize / 5) { //remove any segments less than 20% size of largest segment 
                    //remove associated node and edge

                    //console.log("line 868: " + tweet);

                    //if (edgeMap.has({source}))
                    

                //    nodeMap.remove(tweet);

                    /*for (edge in g.edges) {
                        if (g.edges.hasOwnProperty(edge) && (g.edges[edge].source == tweet || g.edges[edge].target == tweet)) {


                            var alreadyExistsInG1edge = false;
                            for (var key1 in g1.edges) {
                                if (g1.edges.hasOwnProperty(key1) && g1.edges[key1].id == g.edges[edge].id) {
                                    alreadyExistsInG1edge = true;
                                    console.log("already exists node true in g1");
                                    break;
                                }
                            }
                            if (!alreadyExistsInG1edge) {
                                g1.edges.push(g.edges[edge]);
                            }

                            //g1.edges.push(g.edges[edge]);


                            for (node in g.nodes) {
                                if (g.nodes.hasOwnProperty(node) && g.nodes[node].id == tweet) {

                                    var alreadyExistsInG1 = false;
                                    for (var key1 in g1.nodes) {
                                        if (g1.nodes.hasOwnProperty(key1) && g1.nodes[key1].id == g.nodes[node].id) {
                                            alreadyExistsInG1 = true;
                                            console.log("already exists node true in g1");
                                            break;
                                        }
                                    }
                                    if (!alreadyExistsInG1) {
                                        g1.nodes.push(g.nodes[node]);
                                    }
                                    //g1.nodes.push(g.nodes[])
                                }
                            }



                            //g1.nodes.push(g.nodes)


                            //console.log("went in : " + JSON.stringify(g.nodes[node]));
                            //g.nodes.splice(node - 1, 1);

                        }
                    }*/
                    //g.nodes.

           //     }
           // }

            var g = {
                nodes: [],
                edges: []
            };
            nodeMap.forEach(function(value,key) {
                g.nodes.push(value);
            });
            edgeMap.forEach(function(value,key) {
                g.edges.push(value);
            })

            

            //TAKE DIFF APPROAACH BECAUSE ALL NODES WITH SAME ID WILL BE REMOVED THIS WAY,
            // we only want the specific node and its edge to remove, therefore remove edge first 
            //before so node can be isolated...

            //console.log("g1: "+JSON.stringify(g1));

            res.send(g);
            callback(g);
        });

        cursor.on('data', function(doc) {
            
            //result.push(doc);
                        //console.log(doc);
                        nodeFunction(doc);
                        //console.log("push");

        });



            

    });

});

app.get('/networkusergraphnew/:category', function(req, res) {

    var category = req.params.category;
    var regexString = ".*";
    //console.log(category);
    if (category !== "generic") {
        regexString = ".*" + category + ".*";
        //console.log(category);

    }
    //var regexString = ".*"+hashtag+".*";
    //var result = [];

                var i = 0//,
                //N = 10,
                //E = 50,
                /*g = {
                    nodes: [],
                    edges: []
                }*/;

            var nodeMap = new HashMap();
            var edgeMap = new HashMap();

            var segmentSizes = new HashMap();
            var userSegmentMap = {};
            var segmentId = 0;
            var largestSegmentSize = 0;

    function nodeFunction(node) {
        try {

                        if (node.retweeted_status.user) {

                            //var tweetId = result[key].id;
                            var tweetIdStr = node.id_str;



                            var tweetText = node.text;

                            //console.log("tweetid = "+tweetId + ", tweetText = "+ tweetText + "tweetidstr = "+ tweetIdStr);

                            var retweetText = node.retweeted_status.text;

                            var tweetUserId = node.user.id_str; //key.user.id_str;
                            var tweetUserName = node.user.screen_name;;


                            //check if node/edge already exists..

                            //var alreadyExists_tweet = false;
                            var alreadyExists_tweetuser = false;
                            if(nodeMap.get(tweetUserId)){
                                alreadyExists_tweetuser = true;
                            }

                            //var alreadyExists_tweet = nodeMap.has(JSON.stringify(tweetIdStr));


                            /*for(var key1 in g.nodes){
                              //console.log("id_str = "+g.nodes[key1].id_str + ", tweetstr = "+ tweetIdStr);
                              if (g.nodes.hasOwnProperty(key1) && g.nodes[key1].id == tweetId) {
                                alreadyExists_tweet = true;
                                //console.log("already exists now true" + tweetId);
                                break;
                              }
                            }*/

                            //var retweetId = result[key].retweeted_status.id;
                            var retweetIdStr = node.retweeted_status.id_str;

                            var retweetUserId = node.retweeted_status.user.id_str;
                            var retweetUserName = node.retweeted_status.user.screen_name;


                            //var alreadyExists_retweet = false;

                            var alreadyExists_retweetuser = false;
                            if(nodeMap.get(retweetUserId)){
                                alreadyExists_retweetuser = true;
                            }

                            /*for(var key1 in g.nodes){
                                                      //console.log(g.nodes[key1].id + "here");

                              if (g.nodes.hasOwnProperty(key1) && g.nodes[key1].id == retweetId) {
                                alreadyExists_retweet = true;
                                                          //console.log("already exists now true" + retweetId);

                                break;
                              }
                            }*/

                            //console.log(tweetIdStr + ", "+ retweetIdStr);

                            //console.log(alreadyExists_tweet + ", " + alreadyExists_retweet + ", " + nodeMap.keys());
                            //console.log("");

                            if (!alreadyExists_tweetuser && !alreadyExists_retweetuser) {
                                segmentId++;
                                userSegmentMap[tweetUserId] = segmentId;
                                userSegmentMap[retweetUserId] = segmentId;
                                segmentSizes.set(segmentId, 2)
                                if (largestSegmentSize < segmentSizes.get(segmentId)) {
                                    largestSegmentSize = segmentSizes.get(segmentId);
                                }

                            } else if (!alreadyExists_tweetuser && alreadyExists_retweetuser) {
                                userSegmentMap[tweetUserId] = userSegmentMap[retweetUserId];
                                var item = segmentSizes.get(parseInt(userSegmentMap[tweetUserId]));
                                var valuetoset = item + 1;
                                //console.log(item + ", " + valuetoset);
                                segmentSizes.set(parseInt(userSegmentMap[tweetUserId]),valuetoset);
                                //console.log("item: " + segmentSizes.get(parseInt(userSegmentMap[tweetIdStr])));
                                if (largestSegmentSize < segmentSizes.get(parseInt(userSegmentMap[tweetUserId]))) {
                                    largestSegmentSize = segmentSizes.get(parseInt(userSegmentMap[tweetUserId]));
                                }

                            } else if (alreadyExists_tweetuser && !alreadyExists_retweetuser) {
                                userSegmentMap[retweetUserId] = userSegmentMap[tweetUserId];
                                var item = segmentSizes.get(parseInt(userSegmentMap[tweetUserId]));
                                var valuetoset = item + 1;
                                //console.log(item + ",, " + valuetoset);

                                segmentSizes.set(parseInt(userSegmentMap[tweetUserId]),valuetoset);
                                if (largestSegmentSize < segmentSizes.get(parseInt(userSegmentMap[tweetUserId]))) {
                                    largestSegmentSize = segmentSizes.get(parseInt(userSegmentMap[tweetUserId]));
                                }

                            }


                            if (!alreadyExists_tweetuser) {

                                nodeMap.set(tweetUserId, {

                                    id: "" + tweetUserId,
                                    label: "" + tweetUserName /*+","+userSegmentMap[tweetUserId]*/ ,
                                    x: Math.random(),
                                    y: Math.random(),
                                    size: Math.random(),
                                    color: "#" + genColor(userSegmentMap[tweetUserId]),
                                    segment: userSegmentMap[tweetUserId],
                                    text: tweetText,


                                });

                                /*g.nodes.push({
                                  id: ""+tweetId,
                                  label: ""+tweetUserName//+","+userSegmentMap[tweetUserId],
                                  x: Math.random(),
                                  y: Math.random(),
                                  size: Math.random(),
                                  color: "#"+genColor(userSegmentMap[tweetId]),
                                  segment: userSegmentMap[tweetId],
                                  text: tweetText
                                });*/




                            }




                            if (!alreadyExists_retweetuser) {

                                nodeMap.set(retweetUserId, {

                                    id: "" + retweetUserId,
                                    label: "" + retweetUserName /*+","+userSegmentMap[retweetUserId]*/ ,
                                    x: Math.random(),
                                    y: Math.random(),
                                    size: Math.random(),
                                    color: "#" + genColor(userSegmentMap[retweetUserId]),
                                    segment: userSegmentMap[retweetUserId]

                                });


                                /*g.nodes.push({
                                  id: ""+retweetId,
                                  label: ""+retweetUserName,//+","+userSegmentMap[retweetUserId],
                                  x: Math.random(),
                                  y: Math.random(),
                                  size: Math.random(),
                                  color: "#"+genColor(userSegmentMap[retweetId]),
                                  segment: userSegmentMap[retweetId],
                                  text: retweetText
                                });*/


                            }

                            edgeMap.set({
                                source: tweetUserId,
                                target: retweetUserId
                            }, {

                                id: 'e' + i,
                                source: "" + tweetUserId,
                                target: "" + retweetUserId,
                                segment: userSegmentMap[tweetIdStr],
                                size: Math.random(),
                                color: "#666"//,
                                //text: tweetText

                            });

                            /*g.edges.push({
                              id: 'e' + i,
                              source: ""+tweetId,
                              target: ""+retweetId,
                              segment: userSegmentMap[tweetId],
                              size: Math.random(),
                              color: "#666"
                            });*/
                            i++;
                            //console.log("printing"+JSON.stringify(userSegmentMap)); // 80



                        } else {
                            //node with no edges from beginning
                            //console.log("else statement");
                        }

                    } catch (e) {
                        //console.log("err: "+e);


                    }
    };

    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        var callback = function() {
            db.close();
        };

        var cursor = db.collection('mediboard1').aggregate(

            [


                //hpv

                {
                    $match: {
                        "text": new RegExp(regexString, 'i')
                    }
                }, {
                    $project: {
                        "id": 1,
                        "id_str": 1,
                        "text": 1,
                        "retweeted_status.text": 1,
                        "user.id_str": 1,
                        "user.screen_name": 1,
                        "retweeted_status.id": 1,
                        "retweeted_status.id_str": 1,
                        "retweeted_status.user.id_str": 1,
                        "retweeted_status.user.screen_name": 1
                    }
                }, {
                    $limit: 100000
                }

                //general
                //{$project: {"id" : 1, "id_str" : 1, "text" : 1, "retweeted_status.text": 1, "user.id_str": 1,"user.screen_name": 1, "retweeted_status.id" : 1, "retweeted_status.id_str" : 1, "retweeted_status.user.id_str": 1, "retweeted_status.user.screen_name": 1} }, {$limit:1000}

            ]
            //console.log("query finished, now processing..");

        ).stream();


        cursor.on('end', function() {
            console.log(", now processing..");
            db.close();
            //assert.equal(err, null);

            //console.log(result);

            //code to convert to node edge graph
            

            //var keys = [];

            //for (var key in result) {
                //console.log("goes inside");

              //  if (result.hasOwnProperty(key)) {
                    //console.log(JSON.stringify(result));
                    //break;
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




                    //REMOVE NODES/EDGES WITH LOW CONNECTIVITY.... too many nodes to send across network.
                    //do this by storing connectivity number and updating it when inputting nodes, adding new nodes with edges...

                    



                    //keys.push(g);
                    //keys.push(result[key].user.id_str);
                    //break;

             //   }
           // }

            //check number of total nodes, remove clusters of size < 10% of biggest cluster size -> if nodes left are still of size > 1000, then increase percentage until size <=1000!

            // i.e. 70000 nodes total, biggest cluster size 130
            //remove any clusters of up to size 13.
            //

            //console.log("printing"+JSON.stringify(userSegmentMap)); // 80
            //console.log("printing" + JSON.stringify(nodeMap)); // 80
            //console.log("printing" + JSON.stringify(segmentSizes)); // 80
            console.log("printing" + JSON.stringify(largestSegmentSize)); // 7 here but pretend it is 20 -> therefore remove segments of size 2... (trial first)

            /*var segmentsToRemove = [];
            for (segment in segmentSizes){
              if (segmentSizes[segment] <= 2) {
                segmentsToRemove.push(segment);

              }
            }*/
            //console.log(segmentsToRemove);

            /*var g1 = {
                nodes: [],
                edges: []
            };*/

            //var nodeMapReduced = new HashMap();
            //var 

            //map segmentsize to the tweet nodes/edges

            var totalNodes = 0;
            segmentSizes.forEach(function(value, key) {
                totalNodes += value;
            });
            console.log(totalNodes);



            var tobesorted = segmentSizes.values();

            tobesorted.sort(function(a, b){return b-a});

            var minsegsize = Number.MAX_VALUE;
            var subtotal = 0;
            for(segsize in tobesorted) {
                if (subtotal <= 1000){
                    subtotal += tobesorted[segsize];
                    minsegsize = tobesorted[segsize];
                }
            }
            console.log(subtotal);

            console.log(minsegsize);


            edgeMap.forEach(function(value, key) {
                        //if(segmentSizes.get(parseInt(value.segment)) < minsegsize) {
                            if(true){
                                if(nodeMap.get(value.source).type == "retweet" ){
                                    var userNameToAppend = nodeMap.get(value.source).label;
                                    var node = nodeMap.get(value.target);
                                    node.text += "<p>"+userNameToAppend+"</p>";
                                    nodeMap.set(value.target,node);
                                }else if(nodeMap.get(value.target).type == "retweet" ){
                                    var userNameToAppend = nodeMap.get(value.target).label;
                                    var node = nodeMap.get(value.source);
                                    node.text += "<p>"+userNameToAppend+"</p>";
                                    nodeMap.set(value.source,node);
                                }
                                edgeMap.remove(key);
                                //console.log("something removed...");
                        }
                    });

            nodeMap.forEach(function(value, key) {
                        if((segmentSizes.get(parseInt(value.segment)) < minsegsize) || value.type == "retweet") {
                            nodeMap.remove(key);
                                                        //console.log("something removed...");

                        }else{
                            value.size = segmentSizes.get(parseInt(value.segment));
                            //value.text += "<p>Retweeted users:<p>";
                            nodeMap.set(key,value);
                        }
                    });



            //for (tweet in userSegmentMap) {
                //console.log(segmentSizes[userSegmentMap[tweet]]);
              //  if (userSegmentMap.hasOwnProperty(tweet) && segmentSizes[userSegmentMap[tweet]] <= largestSegmentSize / 5) { //remove any segments less than 20% size of largest segment 
                    //remove associated node and edge

                    //console.log("line 868: " + tweet);

                    //if (edgeMap.has({source}))
                    

                //    nodeMap.remove(tweet);

                    /*for (edge in g.edges) {
                        if (g.edges.hasOwnProperty(edge) && (g.edges[edge].source == tweet || g.edges[edge].target == tweet)) {


                            var alreadyExistsInG1edge = false;
                            for (var key1 in g1.edges) {
                                if (g1.edges.hasOwnProperty(key1) && g1.edges[key1].id == g.edges[edge].id) {
                                    alreadyExistsInG1edge = true;
                                    console.log("already exists node true in g1");
                                    break;
                                }
                            }
                            if (!alreadyExistsInG1edge) {
                                g1.edges.push(g.edges[edge]);
                            }

                            //g1.edges.push(g.edges[edge]);


                            for (node in g.nodes) {
                                if (g.nodes.hasOwnProperty(node) && g.nodes[node].id == tweet) {

                                    var alreadyExistsInG1 = false;
                                    for (var key1 in g1.nodes) {
                                        if (g1.nodes.hasOwnProperty(key1) && g1.nodes[key1].id == g.nodes[node].id) {
                                            alreadyExistsInG1 = true;
                                            console.log("already exists node true in g1");
                                            break;
                                        }
                                    }
                                    if (!alreadyExistsInG1) {
                                        g1.nodes.push(g.nodes[node]);
                                    }
                                    //g1.nodes.push(g.nodes[])
                                }
                            }



                            //g1.nodes.push(g.nodes)


                            //console.log("went in : " + JSON.stringify(g.nodes[node]));
                            //g.nodes.splice(node - 1, 1);

                        }
                    }*/
                    //g.nodes.

           //     }
           // }

            var g = {
                nodes: [],
                edges: []
            };
            nodeMap.forEach(function(value,key) {
                g.nodes.push(value);
            });
            edgeMap.forEach(function(value,key) {
                g.edges.push(value);
            })

            

            //TAKE DIFF APPROAACH BECAUSE ALL NODES WITH SAME ID WILL BE REMOVED THIS WAY,
            // we only want the specific node and its edge to remove, therefore remove edge first 
            //before so node can be isolated...

            //console.log("g1: "+JSON.stringify(g1));

            res.send(g);
            callback(g);
        });

        cursor.on('data', function(doc) {
            
            //result.push(doc);
                        //console.log(doc);
                        nodeFunction(doc);
                        //console.log("push");

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