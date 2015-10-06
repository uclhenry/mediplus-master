'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */

var startDateRange = 1443657600;
var endDateRange = 1446335999;

function isInTimelineRange(timestamp){
  if(startDateRange <= timestamp && timestamp <= endDateRange){
    return true;
  }else{
    return false;
  }
}

var sbAdminApp = angular.module('sbAdminApp')
  .controller('ChartCtrl', ['$scope', '$timeout', '$q', function ($scope, $timeout, $q) {


/*
function displayloadedvalues(){

  $scope.twitterline.data[0][0] = 1;
}*/

function displayTopUsers(param){

        var $http = angular.injector(['ng']).get('$http');
                
                if (param != "") {
                    param+= "/Jul/2015";
                }


                var defer = $q.defer();



                $http.get("../api/topusers/"+param)
                .success(function (response) {
                    

                    defer.resolve(response);
                    //console.log(response.data);
                    //$scope.rows = response.data;
                    //alert("past");
                })
                .error(function(err, status) {
                    defer.reject(err);
                })

                $scope.promise = defer.promise;
                $scope.promise.then(
                    function(v){return v},
                    function(err){return err}
                    )
                .then(

                    function(v){$scope.rows = v},
                    function(err){$scope.rows = err}

                    )

}
var twittergraphvalues = 1;
var twitterdataarray = [];


/*window.setInterval(function(){
  /// call your function here
  console.log('interval');
    //$scope.labels.push('');
    //$scope.data[0].push(9);
    $scope.twitterline.data[0][0] = Math.round(Math.random() * 1000);
}, 5000);*/





function loadTwitterGraphValues(){
  $scope.twitterline = {
      labels: ['01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31'],
      series: ['Twitter'],
      data: [
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
      ],
      onClick: function (points, evt) {
        console.log(points, evt);
        console.log(twittergraphvalues);
          var selectedPoint = points[0]['label'];


          //add table refresh/update here.....

          //////////////////loadTable(JSON.stringify(points[0]['label']));
          //$scope.rows = [];

          //$http.get("http://localhost:3000/api/topusers/07/07/2015").success(funtion (response) {
        //});


            //$scope.rows = [];
            //$scope.rows.push('response');

            displayTopUsers(selectedPoint);

                
                //console.log(defer.promise);
                //$scope.rows = defer.promise.data;

            

          }

          


          //$scope.counter = 3;

          //$scope.addRow = function() {

            //////////////////////////////////$scope.rows.push('Testing');
            //$scope.counter++;

          //}


                    //angular.element(document.getElementById('lineTable-v')).append($compile("<table><tr><td>RandomUser</td><td>939</td></tr></table>")(scope));




      
    };
    //////



    



    //////
  /*var $http = angular.injector(['ng']).get('$http');
                
                var month = "Jul";
                var days = ['07','06','06','06','06','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31'];

                //var day = "10";

                return $q.all(
                for (var dayVal in days){
                  var day = days[dayVal];
                  console.log("day: "+dayVal);
                  var defer = $q.defer();



                  $http.get("../api/twittercount/"+day+"/"+month)
                  .success(function (response) {
                      
                      $scope.twitterline.data[0][Number(response._id)-1] = response.count;
                      defer.resolve(response);
                      //console.log(response);
                      //$scope.rows = response.data;
                      //alert("past");
                  })
                  .error(function(err, status) {
                      defer.reject(err);
                  })
                }).then(

                  //$scope.promise = defer.promise;
                  //$scope.promise.all.then(

                      function(){
                        //twittergraphvalues =  10;
                            //var result = v;
                            //twitterdataarray.push(result);


                            console.log(JSON.stringify(result));

                            
                            //console.log($scope.twitterline);
                            //$digest();

                        

                        
                        //console.log(twittergraphvalues);
                      }//,
                      //function(err){}

                      );*/



                //}
                

}

function getSearchData() {
    var $http = angular.injector(['ng']).get('$http');

    return {
        // returns a promise for an object like:
        // { abo: resultFromAbo, ser: resultFromSer, ... }
        loadDataFromUrls: function () {
            var month = "Jul";
            var days = ['01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31'];


            return $q.all(days.map(function (day) {
                return $http({
                    method: 'GET',
                    url: '../api/twittercount/' + day + '/' + month
                });
            }))
            .then(function (results) {
                var resultObj = {};
                results.forEach(function (val, i) {
                    resultObj[days[i]] = val.data;
                });
                console.log(resultObj);
                for (var obj in resultObj){
                  if(resultObj[obj]._id){
                    $scope.twitterline.data[0][Number(resultObj[obj]._id)-1] = resultObj[obj].count;
                  }

                }

                return resultObj;        
            });
        }
    };
};


$scope.init = function () {
    // do something on loaded
    //console.log(getSearchData()());
      loadTwitterGraphValues();

    var getSearchDataout = getSearchData().loadDataFromUrls; 
    console.log(getSearchDataout());
    displayTopUsers("");

    
  };
//displayTopUsers("");


/*

{ "_id" : "VeronicaNadan", "count" : 2735 }
{ "_id" : "RockNHot1", "count" : 1741 }
{ "_id" : "HoneyBadger253", "count" : 1622 }
{ "_id" : "itsmepanda1", "count" : 1232 }
{ "_id" : "TannersDad", "count" : 960 }
{ "_id" : "itsbaxter", "count" : 915 }
{ "_id" : "NOWinAutism", "count" : 840 }
{ "_id" : "aspiesmom", "count" : 767 }
{ "_id" : "chavaray", "count" : 681 }
{ "_id" : "doritmi", "count" : 618 }

*/
/*var executed = false;
angular.element(document).ready(function () {
            if (!executed){
                var $http = angular.injector(['ng']).get('$http');
                
                


                var defer = $q.defer();



                $http.get("../api/topusers/")
                .success(function (response) {
                    

                    defer.resolve(response);
                    //console.log(response.data);
                    //$scope.rows = response.data;
                    //alert("past");
                })
                .error(function(err, status) {
                    defer.reject(err);
                })

                $scope.promise = defer.promise;
                $scope.promise.then(
                    function(v){return v},
                    function(err){return err}
                    )
                .then(

                    function(v){$scope.rows = v},
                    function(err){$scope.rows = err}

                    )
                executed = true;
            }


    });*/
    
    

    


    // Update the dataset at 25FPS for a smoothly-animating chart
    
        //$scope.twitterline.data[0][0] = twitterdataarray[0];



    $scope.newsline = {
        labels: ['04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'],
        series: ['News'],
        data: [
          [50,22,27,87,59,73,75,48,30,41,59,53,47,179,92,35,61]
        ],
        onClick: function (points, evt) {
          console.log(points, evt);
          var selectedPoint = points[0]['label'];


          //add table refresh/update here.....

          //////////////////loadTable(JSON.stringify(points[0]['label']));
          //$scope.rows = [];

          //$http.get("http://localhost:3000/api/topusers/07/07/2015").success(funtion (response) {
        //});


            //$scope.rows = [];
            //$scope.rows.push('response');

            //displayTopUsers(selectedPoint);

                
                //console.log(defer.promise);
                //$scope.rows = defer.promise.data;

            

          }

          


          //$scope.counter = 3;

          //$scope.addRow = function() {

            //////////////////////////////////$scope.rows.push('Testing');
            //$scope.counter++;

          //}


                    //angular.element(document.getElementById('lineTable-v')).append($compile("<table><tr><td>RandomUser</td><td>939</td></tr></table>")(scope));




        
    };

    $scope.bothline = {
        labels: ['07','08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29'],
        series: ['News'],
        data: [
          [9933,6802,6290,6279,2026,0,0,0,0,197,3780,2975,2772,2985,4228,3252,3331,3712,2148,2225,3324,3952,2479],
          [50,22,27,87,59,73,75,48,30,41,59,53,47,179,92,35,61]
        ],
        onClick: function (points, evt) {
          console.log(points, evt);
          var selectedPoint = points[0]['label'];


          //add table refresh/update here.....

          //////////////////loadTable(JSON.stringify(points[0]['label']));
          //$scope.rows = [];

          //$http.get("http://localhost:3000/api/topusers/07/07/2015").success(funtion (response) {
        //});


            //$scope.rows = [];
            //$scope.rows.push('response');

            displayTopUsers(selectedPoint);

                
                //console.log(defer.promise);
                //$scope.rows = defer.promise.data;

            

          }

          


          //$scope.counter = 3;

          //$scope.addRow = function() {

            //////////////////////////////////$scope.rows.push('Testing');
            //$scope.counter++;

          //}


                    //angular.element(document.getElementById('lineTable-v')).append($compile("<table><tr><td>RandomUser</td><td>939</td></tr></table>")(scope));




        
    };

    $scope.swineline = {
      labels: ['May 09','Jun 09', 'Jul 09', 'Aug 09', 'Sep 09', 'Oct 09', 'Nov 09', 'Dec 09'],
        series: ['Twitter','News (x2)','Influenzanet (x25)'],
        data: [
          [6240,16325,25737,15424,22334,51680,27937,7822],
          [7354*2,8559*2,6991*2,9249*2,7167*2,8764*2,8230*2,2734*2],
          [19.3*25,36.5*25,636.5*25,112.8*25,67.7*25,196.7*25,191*25,118.1*25]
        ],
        colours: ['#97BBCD','#46BFBD','#F7464A']

    }

    $scope.survellianceline = {
      labels: ['May 09','Jun 09', 'Jul 09', 'Aug 09', 'Sep 09', 'Oct 09', 'Nov 09', 'Dec 09'],
        series: ['Rate of ILI episodes','Historical survelliance rate per 100,000'],
        data: [
          [50,40,401,99,48,120,193,104],
          [80,45,53,30,34,61,62,69,76]
        ],
        colours: ['#97BBCD','#46BFBD','#F7464A']

    }
    //$scope.colors = ['#FD1F5E','#1EF9A1','#7FFD1F','#68F000'];

    $scope.bar = {
	    labels: ['2006', '2007', '2008', '2009', '2010', '2011', '2012'],
		series: ['Series A', 'Series B'],

		data: [
		   [65, 59, 80, 81, 56, 55, 40],
		   [28, 48, 40, 19, 86, 27, 90]
		]
    	
    };

    $scope.donut = {
    	labels: ["Download Sales", "In-Store Sales", "Mail-Order Sales"],
    	data: [300, 500, 100]
    };

    $scope.radar = {
    	labels:["Eating", "Drinking", "Sleeping", "Designing", "Coding", "Cycling", "Running"],

    	data:[
    	    [65, 59, 90, 81, 56, 55, 40],
    	    [28, 48, 40, 19, 96, 27, 100]
    	]
    };

    $scope.pie = {
    	labels : ["Download Sales", "In-Store Sales", "Mail-Order Sales"],
    	data : [300, 500, 100]
    };

    $scope.polar = {
    	labels : ["Download Sales", "In-Store Sales", "Mail-Order Sales", "Tele Sales", "Corporate Sales"],
    	data : [300, 500, 100, 40, 120]
    };

    $scope.dynamic = {
    	labels : ["Download Sales", "In-Store Sales", "Mail-Order Sales", "Tele Sales", "Corporate Sales"],
    	data : [300, 500, 100, 40, 120],
    	type : 'PolarArea',

    	toggle : function () 
    	{
    		this.type = this.type === 'PolarArea' ?
    	    'Pie' : 'PolarArea';
		}
    };
}]);

function getRandomValue (data) {
    var l = data.length, previous = l ? data[l - 1] : 50;
    var y = previous + Math.random() * 10 - 5;
    return y < 0 ? 0 : y > 100 ? 100 : y;
  }