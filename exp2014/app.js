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
var db;



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


// view engine setup
    MongoClient.connect(url, function(err, database) {
        if(err) throw err;
        db = database;

        //Start the application after the database connection is ready
        //app.listen(3000);
        app.set('port', process.env.PORT || 3000);
        app.set('views', path.join(__dirname, 'views'));
        app.set('view engine', 'hjs');
        console.log("listening on port 3000");
    });



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

    

        for (article in obj) {
            db.collection('medisys').save(obj[article], function(err, docs) {
                if (err) {
                    console.log('err: ' + err);
                }
                //if(!err) console.log(obj[article]._id+' : data inserted successfully!\n');
            });
        }


        //[

        //{$group : { _id : '$user.id', count : {$sum : 1}}},{$sort : { count: -1}}, {$limit:10} 
        //{}
        //]
        //finalJson

        //);





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
            //callback(result);
        });




})

app.get('/topusers/summarize/:day/:month/:year', function(req, res) {

})

app.get('/topusers/summary/:day/:month/:year', function(req, res) {

})


app.get('/keywords/vaccination/get', function(req, res) {


    

        db.collection('keywords').aggregate(

            [

                //{$group : { _id : '$user.id', count : {$sum : 1}}},{$sort : { count: -1}}, {$limit:10} 
                {
                    $match: {
                        "_id": "vaccination"
                   }
                },
               {
                    $limit: 1000
                }

            ]

        ).toArray(function(err, result) {
            assert.equal(err, null);
            console.log(result);
            res.send(result);
            //callback(result);
        });


});
app.get('/keywords/vaccination/post/:value', function(req, res) {

    var keywordsArray = JSON.parse(req.params.value).split(/[ ,]+/);
    var insert = {};
    insert._id = "vaccination";
    insert.value = [];
    for(keyword in keywordsArray){
        insert.value.push(keywordsArray[keyword]);
    }
    console.log(insert)

    


            db.collection('keywords').save(insert, function(err, docs) {
                if (err) {
                    console.log('err: ' + err);
                }else{
                    console.log("result saved!: "+docs);
                }
                //if(!err) console.log(obj[article]._id+' : data inserted successfully!\n');
            });
            


        //[

        //{$group : { _id : '$user.id', count : {$sum : 1}}},{$sort : { count: -1}}, {$limit:10} 
        //{}
        //]
        //finalJson

        //);

    //console.log("result: "+keywordsArray[0]);
    //res.send("OK");
    ////callback("OK");
});



app.get('/topusers/:day/:month/:year', function(req, res) {

    var day = req.params.day;
    var month = req.params.month;
    var year = req.params.year;

    var regexString = ".*" + month + " " + day + ".*" + year;

    

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
                    //callback(result);
                });


});

app.get('/twittercount/:day/:month', function(req, res) {

    //var days = ['06','06','06','06','06','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','29','29'];
    //var day = "06";
    var month = req.params.month;
    var year = "2015";
    var day = req.params.day;
    
    var regexString = ".*" + month + " " + day + ".*" + year;

    

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
                        if(result[0]){
                            result[0]._id = day;
                        }else{
                            result[0] = "undefined"
                        }
                        console.log(result[0]);
                        res.send(result[0]);
                        ////callback(result[0]);
                //days[0] = JSON.stringify(result[0].count);
                //requestsmade++;
            });


});

app.get('/newscount/:day/:month', function(req, res) {
    var month = req.params.month;
    var year = "2015";
    var day = req.params.day;
    
    var regexString = year + "-" + month + "-" + day + ".*";

    

        db.collection('medisys').aggregate(

            [

                    //{$group : { _id : '$user.id', count : {$sum : 1}}},{$sort : { count: -1}}, {$limit:10} 
                    {
                        $match: {
                            "pubDate": new RegExp(regexString, 'i')
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
                        if(result[0]){
                            result[0]._id = day;
                        }else{
                            result[0] = "undefined"
                        }
                        console.log(result[0]);
                        res.send(result[0]);
                        //callback(result[0]);
                //days[0] = JSON.stringify(result[0].count);
                //requestsmade++;
            });



});


//app.get('/medisys', function(req, res) {




//})

app.get('/topusers', function(req, res) {


   

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
                    //callback(result);
                });


});

app.get('/networkgraph/searchbyhashtag/:hashtag', function(req, res) {

    var regexString = ".*" + hashtag + ".*";

    
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
                                    label: "" + tweetText.substring(0,30) /*+","+tweetSegmentMap[tweetUserId]*/ ,
                                    username: "" + tweetUserName,
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
                                    label: "" + retweetText.substring(0,30) /*+","+tweetSegmentMap[retweetUserId]*/ ,
                                    username: "" + retweetUserName,
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
            ////callback(g);
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


    var stopwordsstring = "antivaccination,anti,pro,vaccin,vaccinated,vaccination,antivax,good,bad,vaccinations,problem,disease,problems,diseases,vaccines,vaccine,antivax,antivaxxers,vaccination,vax,vaxx,antivaccine,a’s,able,about,above,according,accordingly,across,actually,after,afterwards,again,against,ain’t,all,allow,allows,almost,alone,along,already,also,although,always,am,among,amongst,an,and,another,any,anybody,anyhow,anyone,anything,anyway,anyways,anywhere,apart,appear,appreciate,appropriate,are,aren’t,around,as,aside,ask,asking,associated,at,available,away,awfully,be,became,because,become,becomes,becoming,been,before,beforehand,behind,being,believe,below,beside,besides,best,better,between,beyond,both,brief,but,by,c’mon,c’s,came,can,can’t,cannot,cant,cause,causes,certain,certainly,changes,clearly,co,com,come,comes,concerning,consequently,consider,considering,contain,containing,contains,corresponding,could,couldn’t,course,currently,definitely,described,despite,did,didn’t,different,do,does,doesn’t,doing,don’t,done,down,downwards,during,each,edu,eg,eight,either,else,elsewhere,enough,entirely,especially,et,etc,even,ever,every,everybody,everyone,everything,everywhere,ex,exactly,example,except,far,few,fifth,first,five,followed,following,follows,for,former,formerly,forth,four,from,further,furthermore,get,gets,getting,given,gives,go,goes,going,gone,got,gotten,greetings,had,hadn’t,happens,hardly,has,hasn’t,have,haven’t,having,he,he’s,hello,help,hence,her,here,here’s,hereafter,hereby,herein,hereupon,hers,herself,hi,him,himself,his,hither,hopefully,how,howbeit,however,i’d,i’ll,i’m,i’ve,ie,if,ignored,immediate,in,inasmuch,inc,indeed,indicate,indicated,indicates,inner,insofar,instead,into,inward,is,isn’t,it,it’d,it’ll,it’s,its,itself,just,keep,keeps,kept,know,knows,known,last,lately,later,latter,latterly,least,less,lest,let,let’s,like,liked,likely,little,look,looking,looks,ltd,mainly,many,may,maybe,me,mean,meanwhile,merely,might,more,moreover,most,mostly,much,must,my,myself,name,namely,nd,near,nearly,necessary,need,needs,neither,never,nevertheless,new,next,nine,no,nobody,non,none,noone,nor,normally,not,nothing,novel,now,nowhere,obviously,of,off,often,oh,ok,okay,old,on,once,one,ones,only,onto,or,other,others,otherwise,ought,our,ours,ourselves,out,outside,over,overall,own,particular,particularly,per,perhaps,placed,please,plus,possible,presumably,probably,provides,que,quite,qv,rather,rd,re,really,reasonably,regarding,regardless,regards,relatively,respectively,right,said,same,saw,say,saying,says,second,secondly,see,seeing,seem,seemed,seeming,seems,seen,self,selves,sensible,sent,serious,seriously,seven,several,shall,she,should,shouldn’t,since,six,so,some,somebody,somehow,someone,something,sometime,sometimes,somewhat,somewhere,soon,sorry,specified,specify,specifying,still,sub,such,sup,sure,t’s,take,taken,tell,tends,th,than,thank,thanks,thanx,that,that’s,thats,the,their,theirs,them,themselves,then,thence,there,there’s,thereafter,thereby,therefore,therein,theres,thereupon,these,they,they’d,they’ll,they’re,they’ve,think,third,this,thorough,thoroughly,those,though,three,through,throughout,thru,thus,to,together,too,took,toward,towards,tried,tries,truly,try,trying,twice,two,un,under,unfortunately,unless,unlikely,until,unto,up,upon,us,use,used,useful,uses,using,usually,value,various,very,via,viz,vs,want,wants,was,wasn’t,way,we,we’d,we’ll,we’re,we’ve,welcome,well,went,were,weren’t,what,what’s,whatever,when,whence,whenever,where,where’s,whereafter,whereas,whereby,wherein,whereupon,wherever,whether,which,while,whither,who,who’s,whoever,whole,whom,whose,why,will,willing,wish,with,within,without,won’t,wonder,would,would,wouldn’t,yes,yet,you,you’d,you’ll,you’re,you’ve,your,yours,yourself,yourselves,zero";
    var stopWordsArr = stopwordsstring.split(",");

    var stopWordsHashMap = [];
    for(word in stopWordsArr){
        stopWordsHashMap[stopWordsArr[word]] = 1;
    }

        console.log(stopWordsHashMap['where']);



    var i = 0 //,
        //N = 10,
        //E = 50,
        /*g = {
            nodes: [],
            edges: []
        }*/
        ;

        var nodeMap = new HashMap();
        var edgeMap = new HashMap();

        var segmentSizes = new HashMap();
        var tweetSegmentMap = {};
        var segmentId = 0;
        var largestSegmentSize = 0;

        function nodeFunction(node) {
            try {
                var outputstring = "";
                var text = node.text.split(" ");
                var regextoMatch = "/^[a-z0-9]+$/i";
                for(word in text){


                    if (((text[word].indexOf("@") == -1 && text[word].length > 2 && text[word].indexOf("http://") == -1)|| text[word].indexOf("#") > -1 ) && text[word].indexOf("...") == -1 && /^[ A-Za-z0-9_@./#&+-]*$/.test(text[word]) ) {
                        var punctuationless = text[word].replace(/[.,-\/!$%\^&\*;:{}=\-_`~()]/g,""); //removed #
                        var finalString = punctuationless.replace(/\s{2,}/g," ").toLowerCase();
                        if(stopWordsHashMap[finalString] != 1 && stopWordsHashMap[finalString.split('#')[1]] != 1){
                            outputstring += finalString + " ";
                        }
                    }
                }
                if(outputstring != ""){
                    //console.log(outputstring /*+ ", orig: "+ node.text*/);
                }

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
                if (nodeMap.get(tweetIdStr)) {
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
                if (nodeMap.get(retweetIdStr)) {
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
                    segmentSizes.set(parseInt(tweetSegmentMap[tweetIdStr]), valuetoset);
                    //console.log("item: " + segmentSizes.get(parseInt(tweetSegmentMap[tweetIdStr])));
                    if (largestSegmentSize < segmentSizes.get(parseInt(tweetSegmentMap[tweetIdStr]))) {
                        largestSegmentSize = segmentSizes.get(parseInt(tweetSegmentMap[tweetIdStr]));
                    }

                } else if (alreadyExists_tweet && !alreadyExists_retweet) {
                    tweetSegmentMap[retweetIdStr] = tweetSegmentMap[tweetIdStr];
                    var item = segmentSizes.get(parseInt(tweetSegmentMap[tweetIdStr]));
                    var valuetoset = item + 1;
                    //console.log(item + ",, " + valuetoset);

                    segmentSizes.set(parseInt(tweetSegmentMap[tweetIdStr]), valuetoset);
                    if (largestSegmentSize < segmentSizes.get(parseInt(tweetSegmentMap[tweetIdStr]))) {
                        largestSegmentSize = segmentSizes.get(parseInt(tweetSegmentMap[tweetIdStr]));
                    }

                }


                if (!alreadyExists_tweet) {

                    nodeMap.set(tweetIdStr, {

                        id: "" + tweetIdStr,
                        label: "" + tweetText.substring(0,30) /*+","+tweetSegmentMap[tweetUserId]*/ ,
                        username: "" + tweetUserName,
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
        label: "" + retweetText.substring(0,30) /*+","+tweetSegmentMap[retweetUserId]*/ ,
        username: "" + tweetUserName,
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
                    $limit: 50000
                }

                //general
                //{$project: {"id" : 1, "id_str" : 1, "text" : 1, "retweeted_status.text": 1, "user.id_str": 1,"user.screen_name": 1, "retweeted_status.id" : 1, "retweeted_status.id_str" : 1, "retweeted_status.user.id_str": 1, "retweeted_status.user.screen_name": 1} }, {$limit:1000}

                ]
            //console.log("query finished, now processing..");

            ).stream();


cursor.on('end', function() {
    console.log(", now processing..");
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

            tobesorted.sort(function(a, b) {
                return b - a
            });
            //console.log("sorted: "+JSON.stringify(tobesorted));

            /*var minsegsize = Number.MAX_VALUE;
            var subtotal = 0;
            for(segsize in tobesorted) {
                if (subtotal <= 1000){
                    subtotal += tobesorted[segsize];
                    minsegsize = tobesorted[segsize];
                }
            }*/
            var i = 0;
            while (i < 1000) {
                if (tobesorted[i]) {
                    i++;
                } else {
                    break;
                }
            }
            var minsegsize = tobesorted[i]
                //console.log(subtotal);

            //console.log(minsegsize);


            edgeMap.forEach(function(value, key) {
                //if(segmentSizes.get(parseInt(value.segment)) < minsegsize) {
                    if (true) {
                        if (nodeMap.get(value.source).type == "retweet") {
                            var userNameToAppend = nodeMap.get(value.source).username;
                            var node = nodeMap.get(value.target);
                            node.text += "<p>" + userNameToAppend + "</p>";
                            nodeMap.set(value.target, node);
                        } else if (nodeMap.get(value.target).type == "retweet") {
                            var userNameToAppend = nodeMap.get(value.target).username;
                            var node = nodeMap.get(value.source);
                            node.text += "<p>" + userNameToAppend + "</p>";
                            nodeMap.set(value.source, node);
                        }
                        edgeMap.remove(key);
                    //console.log("something removed...");
                }
            });

nodeMap.forEach(function(value, key) {
    if ((segmentSizes.get(parseInt(value.segment)) < minsegsize) || value.type == "retweet") {
        nodeMap.remove(key);
                    //console.log("something removed...");

                } else {
                    value.size = segmentSizes.get(parseInt(value.segment));
                    //value.text += "<p>Retweeted users:<p>";
                    nodeMap.set(key, value);
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
            nodeMap.forEach(function(value, key) {
                g.nodes.push(value);
            });
            edgeMap.forEach(function(value, key) {
                g.edges.push(value);
            })



            //TAKE DIFF APPROAACH BECAUSE ALL NODES WITH SAME ID WILL BE REMOVED THIS WAY,
            // we only want the specific node and its edge to remove, therefore remove edge first 
            //before so node can be isolated...

            //console.log("g1: "+JSON.stringify(g1));

            res.send(g);
            ////callback(g);
        });

cursor.on('data', function(doc) {

            //result.push(doc);
            //console.log(doc);
            nodeFunction(doc);
            //console.log("push");

        });





});

app.get('/networkusergraph/:category', function(req, res) {

    var category = req.params.category;
    var regexString = ".*";
    //console.log(category);
    if (category !== "generic") {
        regexString = ".*" + category + ".*";
        //console.log(category);

    }
    //var regexString = ".*"+hashtag+".*";
    //var result = [];

    var i = 0 //,
        //N = 10,
        //E = 50,
        /*g = {
            nodes: [],
            edges: []
        }*/
        ;

        var nodeMap = new HashMap();
        var edgeMap = new HashMap();

        var segmentSizes = new HashMap();
        var tweetSegmentMap = {};
        var segmentId = 0;
        var largestSegmentSize = 0;

        var tweetretweetuserarray = [];
        var duplicateSegmentMap = new HashMap();


        function clusterSegments(){

        }

        function nodeFunction(node) {
            try {

                if (node.retweeted_status.user) {
                if (true){//(node.user.id_str == "961231092" || node.retweeted_status.user.id_str == "961231092"|| node.user.id_str == "14819714" || node.retweeted_status.user.id_str == "14819714" || node.user.id_str == "218232928" || node.retweeted_status.user.id_str == "218232928" ){
                //console.log("TWEET/RETWEET READ");
                //var tweetId = result[key].id;
                var tweetIdStr = node.id_str;

                var timestamptweet = new Date(Number(node.timestamp_ms)).toDateString();




                var tweetText = node.text;

                //console.log("tweetid = "+tweetId + ", tweetText = "+ tweetText + "tweetidstr = "+ tweetIdStr);

                var retweetText = node.retweeted_status.text;

                var tweetUserId = node.user.id_str; //key.user.id_str;
                var tweetUserName = node.user.screen_name;;

                //check if node/edge already exists..

                //var alreadyExists_tweet = false;
                var alreadyExists_tweetuser = false;
                if (nodeMap.get(tweetUserId)) {
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

                //console.log(timestamptweet);
                //var timestampretweet = node.retweeted_status.

                tweetretweetuserarray.push([parseInt(tweetUserId), parseInt(retweetUserId)]);


                //var alreadyExists_retweet = false;

                var alreadyExists_retweetuser = false;
                if (nodeMap.get(retweetUserId)) {
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
                    tweetSegmentMap[tweetUserId] = segmentId;
                    tweetSegmentMap[retweetUserId] = segmentId;
                    segmentSizes.set(segmentId, 2)
                    if (largestSegmentSize < segmentSizes.get(segmentId)) {
                        largestSegmentSize = segmentSizes.get(segmentId);
                    }

                } else if (!alreadyExists_tweetuser && alreadyExists_retweetuser) {
                    tweetSegmentMap[tweetUserId] = tweetSegmentMap[retweetUserId];
                    var item = segmentSizes.get(parseInt(tweetSegmentMap[tweetUserId]));
                    var valuetoset = item + 1;
                    //console.log(item + ", " + valuetoset);
                    segmentSizes.set(parseInt(tweetSegmentMap[tweetUserId]), valuetoset);
                    //console.log("item: " + segmentSizes.get(parseInt(tweetSegmentMap[tweetIdStr])));
                    if (largestSegmentSize < segmentSizes.get(parseInt(tweetSegmentMap[tweetUserId]))) {
                        largestSegmentSize = segmentSizes.get(parseInt(tweetSegmentMap[tweetUserId]));
                    }

                } else if (alreadyExists_tweetuser && !alreadyExists_retweetuser) {
                    tweetSegmentMap[retweetUserId] = tweetSegmentMap[tweetUserId];
                    var item = segmentSizes.get(parseInt(tweetSegmentMap[tweetUserId]));
                    var valuetoset = item + 1;
                    //console.log(item + ",, " + valuetoset);

                    segmentSizes.set(parseInt(tweetSegmentMap[tweetUserId]), valuetoset);
                    if (largestSegmentSize < segmentSizes.get(parseInt(tweetSegmentMap[tweetUserId]))) {
                        largestSegmentSize = segmentSizes.get(parseInt(tweetSegmentMap[tweetUserId]));
                    }

                } else { //if both tweet user and retweet user exists already
                    if(tweetSegmentMap[tweetUserId] != tweetSegmentMap[retweetUserId]){
                        console.log("dupsegmap keys: "+duplicateSegmentMap.keys());
                        console.log("dupsegmap values: "+duplicateSegmentMap.values());

                        console.log("dup, tweetid: "+tweetUserId+", segment: "+ tweetSegmentMap[tweetUserId]);
                        console.log("dup, retweetid: "+retweetUserId+", segment: "+ tweetSegmentMap[retweetUserId]);

                        if (!duplicateSegmentMap.get(tweetSegmentMap[tweetUserId])){
                            //duplicateSegmentMap.set(tweetSegmentMap[tweetUserId], tweetSegmentMap[retweetUserId]);
                            duplicateSegmentMap.set(tweetSegmentMap[retweetUserId], tweetSegmentMap[tweetUserId]);
                        }else {
                            var segmentPointer = tweetSegmentMap[tweetUserId]; //just to initialise
                            while(duplicateSegmentMap.get(segmentPointer)){
                                if (segmentPointer == duplicateSegmentMap.get(tweetSegmentMap[tweetUserId])){
                                    break;
                                }
                                segmentPointer = duplicateSegmentMap.get(tweetSegmentMap[tweetUserId]);
                                console.log("segPointer: "+segmentPointer);

                                //duplicateSegmentMap.set(tweetSegmentMap[retweetUserId], )
                            }
                            duplicateSegmentMap.set(segmentPointer, tweetSegmentMap[retweetUserId]);
                        }
                        
                        /*if (duplicateSegmentMap.get(tweetSegmentMap[tweetUserId])){
                            var seg = duplicateSegmentMap.get(tweetSegmentMap[tweetUserId]);
                            duplicateSegmentMap.set(tweetSegmentMap[retweetUserId], seg);
                        }else{
                            duplicateSegmentMap.set(tweetSegmentMap[tweetUserId], tweetSegmentMap[retweetUserId]);

                        }*/
                        //var entered = false;
                        /*duplicateSegmentMap.forEach(function(value, key) {
                            if (value == tweetSegmentMap[tweetUserId]){
                                entered = true;
                                value = tweetSegmentMap[retweetUserId];
                                duplicateSegmentMap.set(key,value);
                            }
                        });
                        if (!entered){
                            duplicateSegmentMap.set(tweetSegmentMap[tweetUserId], tweetSegmentMap[retweetUserId]);
                            duplicateSegmentMap.set(tweetSegmentMap[retweetUserId], tweetSegmentMap[tweetUserId]);

                        }
                        if (duplicateSegmentMap.get(tweetSegmentMap[retweetUserId])){
                            var seg = duplicateSegmentMap.get(tweetSegmentMap[retweetUserId]);
                            duplicateSegmentMap.set(tweetSegmentMap[tweetUserId], seg);
                        }else{
                            duplicateSegmentMap.set(tweetSegmentMap[tweetUserId], tweetSegmentMap[retweetUserId]);
                            duplicateSegmentMap.set(tweetSegmentMap[retweetUserId], tweetSegmentMap[tweetUserId]);

                        }
                        //if(tweetSegmentMap[retweetUserId])
                        //if (duplicateSegmentMap.get(tweetSegmentMap[tweetUserId])){
                          //  duplicateSegmentMap.set()
                        //}else{
                            //}*/
                        }else{
                            console.log("node edge going to itself?: "+tweetSegmentMap[tweetUserId]+ ", "+tweetSegmentMap[retweetUserId]);
                        }
                        var item = segmentSizes.get(parseInt(tweetSegmentMap[tweetUserId]));
                        var valuetoset = item + 1;
                    //console.log(item + ", " + valuetoset);
                    segmentSizes.set(parseInt(tweetSegmentMap[tweetUserId]), valuetoset);
                    //console.log("item: " + segmentSizes.get(parseInt(tweetSegmentMap[tweetIdStr])));
                    if (largestSegmentSize < segmentSizes.get(parseInt(tweetSegmentMap[tweetUserId]))) {
                        largestSegmentSize = segmentSizes.get(parseInt(tweetSegmentMap[tweetUserId]));
                    }
                }


                if (!alreadyExists_tweetuser) {

                    nodeMap.set(tweetUserId, {

                        id: "" + tweetUserId,
                        label: "" + tweetUserName /*+","+tweetSegmentMap[tweetUserId]*/ ,
                        x: Math.random(),
                        y: Math.random(),
                        size: Math.random(),
                        color: "#000000", //+ genColor(tweetSegmentMap[tweetUserId]),
                        segment: tweetSegmentMap[tweetUserId],
                        text: tweetUserName


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




if (!alreadyExists_retweetuser) {

    nodeMap.set(retweetUserId, {

        id: "" + retweetUserId,
        label: "" + retweetUserName /*+","+tweetSegmentMap[retweetUserId]*/ ,
        x: Math.random(),
        y: Math.random(),
        size: Math.random(),
                        color: "#000000", // + genColor(tweetSegmentMap[retweetUserId]),
                        segment: tweetSegmentMap[retweetUserId],
                        text: retweetUserName

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


                //check if edgemap value already exists....

                //var alreadyExists_edge = false;
                //var uniquetweetid = tweetUserId+""+retweetUserId;
                //var key = [tweetUserId,retweetUserId];
                /*if(edgeMap.get(parseInt(tweetIdStr)-parseInt(retweetIdStr))) {
                    alreadyExists_edge = true;
                    console.log("dup tweet -> retweet edge");
                }*/
                //if(!alreadyExists_edge){
                    edgeMap.set(tweetIdStr + "" + retweetIdStr, {

                        id: 'e' + i,
                        source: "" + retweetUserId,
                        target: "" + tweetUserId,
                        sourceName: "" + retweetUserName,
                        targetName: "" + tweetUserName,
                        segment: tweetSegmentMap[tweetUserId],
                    size: 1, //Math.random(),
                    color: "#666",
                    timestamp: timestamptweet,
                    text: retweetText,
                    type: 'curvedArrow',


                });
                //}
                //console.log("keys: "+edgeMap.keys());

                /*g.edges.push({
                  id: 'e' + i,
                  source: ""+tweetId,
                  target: ""+retweetId,
                  segment: tweetSegmentMap[tweetId],
                  size: Math.random(),
                  color: "#666"
              });*/
i++;
                //console.log(edgeMap.values());
                //console.log("printing"+JSON.stringify(tweetSegmentMap)); // 80
            }



        } else {
                //node with no edges from beginning
                //console.log("else statement");
            }

        } catch (e) {
            //console.log("err: "+e);


        }
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
                        "retweeted_status.user.screen_name": 1,
                        "timestamp_ms": 1
                    }
                }, {
                    $limit: 5000
                }

                //general
                //{$project: {"id" : 1, "id_str" : 1, "text" : 1, "retweeted_status.text": 1, "user.id_str": 1,"user.screen_name": 1, "retweeted_status.id" : 1, "retweeted_status.id_str" : 1, "retweeted_status.user.id_str": 1, "retweeted_status.user.screen_name": 1} }, {$limit:1000}

                ]
            //console.log("query finished, now processing..");

            ).stream();


cursor.on('end', function() {
    console.log(", now processing..");
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


            //console.log("tweetretweetuserarray: "+JSON.stringify(tweetretweetuserarray));

            /*for (item1 in tweetretweetuserarray) {
                for(item2 in tweetretweetuserarray) {
                    if(tweetretweetuserarray[item1][0] == tweetretweetuserarray[item2][1] && tweetretweetuserarray[item1][1] == tweetretweetuserarray[item2][0]){
                        console.log("duplicate found: tweetuserid:"+ tweetretweetuserarray[item1][0] + "retweet id: "+ tweetretweetuserarray[item1][1]);
                    }
                }
            }*/


            //console.log("printing" + JSON.stringify(largestSegmentSize)); // 7 here but pretend it is 20 -> therefore remove segments of size 2... (trial first)

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

            //var splitSegmentsMap = new HashMap();
            //console.log(JSON.stringify(segmentSizes.values()));


            
            edgeMap.forEach(function(value, key) {
                var segmentNumber = nodeMap.get(value.target).segment;


                //check if duplicate segment mapping exists for duplicate:
                if(nodeMap.get(value.source).segment != nodeMap.get(value.target).segment){
                    //console.log("needs changing: -> " + nodeMap.get(value.source).segment + ", "  + nodeMap.get(value.target).segment);
                }
                var cycleCheck = new HashMap();
                var maxval = 0;

                while(duplicateSegmentMap.get(segmentNumber)){
                    if(segmentNumber == duplicateSegmentMap.get(segmentNumber) || cycleCheck.get(segmentNumber)){
                        cycleCheck.forEach(function(value, key) {
                            if(value > segmentNumber){
                                segmentNumber = value;
                            }
                        });
                        break;
                    }else{
                        segmentNumber = duplicateSegmentMap.get(segmentNumber);
                        cycleCheck.set(segmentNumber, true);

                        //var tempnode = nodeMap.get(value.target);
                        //tempnode.color = "#" + genColor(segmentNumber);
                        //nodeMap.set(value.target, tempnode);

                    }
                }
                //cycleCheck = null;
                value.segment = segmentNumber;
                edgeMap.set(key, value);

                //if(var newsegmentNumber = duplicateSegmentMap.get(originalsegment)){

                //}else{
                    //no need to change segment number for the edge...
                //}
            });

edgeMap.forEach(function(value, key) {

    var sourcenode = nodeMap.get(value.source);
    var targetnode = nodeMap.get(value.target);
    sourcenode.segment = value.segment;
    sourcenode.color = "#" + genColor(value.segment);
    targetnode.segment = value.segment;
    targetnode.color = "#" + genColor(value.segment);


    nodeMap.set(value.source, sourcenode);
    nodeMap.set(value.target, targetnode);
});







            /*edgeMap.forEach(function(value, key) {
              //  value.segment

                var sourcenode = nodeMap.get(value.source);
                var targetnode = nodeMap.get(value.target);

                //if(targetnode.segment !=  sourcenode.segment){

                    

                    if(segmentSizes.get(sourcenode.segment) > segmentSizes.get(targetnode.segment)){
                        targetnode.segment = sourcenode.segment;
                        nodeMap.set(nodeMap.get(value.target), targetnode);

                        var newsegsize = segmentSizes.get(sourcenode.segment) - 1;
                        segmentSizes.set(nodeMap.get(value.source).segment, newsegsize);
                        //console.log("opt1");
                        //console.log(newsegsize);
                          //          console.log(JSON.stringify(segmentSizes.values()));

                    }else if(segmentSizes.get(sourcenode.segment) < segmentSizes.get(targetnode.segment)){
                        sourcenode.segment = targetnode.segment;
                        nodeMap.set(nodeMap.get(value.source), sourcenode);
                        var newsegsize = segmentSizes.get(targetnode.segment) - 1;
                        segmentSizes.set(nodeMap.get(value.target).segment, newsegsize);


                        //console.log("opt2");                        console.log(newsegsize);

                                    //console.log(JSON.stringify(segmentSizes.values()));


                    }

                    

                    //splitSegmentsMap.set(nodeMap.get(value.source).segment, nodeMap.get(value.target).segment);

                    //var newsegsize = segmentSizes.get(nodeMap.get(value.source).segment) + segmentSizes.get(nodeMap.get(value.target).segment);
                    //var sourcesegment = nodeMap.get(value.source).segment;
                    //var targetsegment = nodeMap.get(value.target).segment;

                    //var sourcesegmentsize = segmentSizes.get(sourcesegment);
                    //var targetsegmentsize = segmentSizes.get(targetsegment);
                      //                  console.log(sourcesegmentsize + " " + targetsegmentsize);


                    //segmentSizes.set(sourcesegment, sourcesegmentsize+targetsegmentsize);
                    //segmentSizes.set(targetsegment, 0);

                    //console.log('segment fix');
                //}
            });*/

console.log("keys: "+JSON.stringify(duplicateSegmentMap.keys()));
console.log("values: "+JSON.stringify(duplicateSegmentMap.values()));
var totalNodes = 0;



            /*edgeMap.forEach(function(value, key) {
                var segment;
                if(tweetSegmentMap[value.source] != tweetSegmentMap[value.target]){
                    console.log("dup source: ->" + tweetSegmentMap[value.source] + "dup target: ->" + tweetSegmentMap[value.target]);

                    var segmentPointer = value.segment; //just to initialise
                            while(duplicateSegmentMap.get(segmentPointer)){
                                if (segmentPointer == duplicateSegmentMap.get(segmentPointer)){
                                    break;
                                }
                                segmentPointer = duplicateSegmentMap.get(segmentPointer);

                                //duplicateSegmentMap.set(tweetSegmentMap[retweetUserId], )
                            }


              //  if (duplicateSegmentMap.get(value.segment)) {
                    segment = duplicateSegmentMap.get(segmentPointer);
                    value.segment = segment;

                }
                console.log(duplicateSegmentMap.keys());
                console.log(duplicateSegmentMap.values());


                            
                    //edgeMap.set(key, value);
//                } else {
  //                  segment = parseInt(nodeMap.get(value.source).segment);
    //            }
                if (segmentSizes.get(segment) < minsegsize) {


                    //if(true){
                    
                    //edgeMap.remove(key);
                    //console.log("something removed edge...");
                }

            });

            nodeMap.forEach(function(value, key) {

                console.log(duplicateSegmentMap.get(tweetSegmentMap[value.id]));


                            var segmentPointer = tweetSegmentMap[value.id]; //just to initialise
                            while(duplicateSegmentMap.get(segmentPointer)){
                                if (segmentPointer == duplicateSegmentMap.get(tweetSegmentMap[value.id])){
                                    break;
                                }
                                segmentPointer = duplicateSegmentMap.get(tweetSegmentMap[value.id]);

                                //duplicateSegmentMap.set(tweetSegmentMap[retweetUserId], )
                            }
                            value.color = "#" + genColor(segmentPointer);
                            value.segment = segmentPointer;
                            nodeMap.set(key, value);


                




                        });*/













            //WHEN CLEANING CODE REMOVE old SEGMENTSIZES HASHMAP;

            var segmentSizesMap = new HashMap();

            edgeMap.forEach(function(value, key) {
                if(segmentSizesMap.get(value.segment)) {
                    var size = parseInt(segmentSizesMap.get(value.segment));
                    segmentSizesMap.set(value.segment, ++size);
                }else{
                    segmentSizesMap.set(value.segment, 1);
                }
            });

            //console.log("segment sizes map keys: "+segmentSizesMap.keys());
            //console.log("segment sizes map values: "+segmentSizesMap.values());

           /* segmentSizes.forEach(function(value, key) {
                var actualSegmentSize;
                if (duplicateSegmentMap.get(key)) {
                    //key is segment number
                    //value is current segment size 
                    var referToSegment = duplicateSegmentMap.get(key);
                    //var actualSegmentSize = segmentSizes.get(referToSegment);
                } else {

                }
            });*/
            //console.log(segmentSizes.values());
            /*segmentSizes.forEach(function(value, key) {
                totalNodes += value;
            });*/
            //console.log("total nodes: " + totalNodes);



            var tobesorted = segmentSizesMap.values();
            //console.log("usorted: " + JSON.stringify(tobesorted));


            /*splitSegmentsMap.forEach(function(value, key) {
                for(item in tobesorted){
                    if(segmentSizes.get(value) == tobesorted[item]){
                        console.log("goes into logic :)");
                        tobesorted[item] = 0;

                    }
                }
            });*/

tobesorted.sort(function(a, b) {
    return b - a
});
console.log("sorted: " + JSON.stringify(tobesorted));




var minsegsize = Number.MAX_VALUE;
var subtotal = 0;
for (segsize in tobesorted) {
    if (subtotal < 1000) {
        subtotal += tobesorted[segsize];
        minsegsize = tobesorted[segsize];
    } else {
        break;
    }
}
            /*var i=0;
            while(i<1000){
                if(tobesorted[i]){
                    i++;
                }else{
                    break;
                }
            }*/
            //var minsegsize = tobesorted[i]
            console.log(subtotal);

            console.log(minsegsize);



            

            nodeMap.forEach(function(value, key) {
                if ((segmentSizesMap.get(parseInt(value.segment)) < minsegsize) /*|| value.type == "retweet"*/ ) {
                    //nodeMap.remove(key);
                    //console.log("something removed node...");

                }
            });
            edgeMap.forEach(function(value, key) {
                if ((segmentSizesMap.get(parseInt(value.segment)) < minsegsize) /*|| value.type == "retweet"*/ ) {
                    //edgeMap.remove(key);
                    //console.log("something removed node...");

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
            nodeMap.forEach(function(value, key) {
                g.nodes.push(value);
            });
            edgeMap.forEach(function(value, key) {
                g.edges.push(value);
            })



            //TAKE DIFF APPROAACH BECAUSE ALL NODES WITH SAME ID WILL BE REMOVED THIS WAY,
            // we only want the specific node and its edge to remove, therefore remove edge first 
            //before so node can be isolated...

            //console.log("g1: "+JSON.stringify(g1));

            res.send(g);
            //////callback(g);
        });

cursor.on('data', function(doc) {

            //result.push(doc);
            //console.log(doc);
            nodeFunction(doc);
            //console.log("push");

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
            var //callback = function() {
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