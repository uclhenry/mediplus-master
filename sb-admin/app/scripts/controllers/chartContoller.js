'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */
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
function loadTwitterGraphValues(start, end){
  var $http = angular.injector(['ng']).get('$http');
                
                if (start != "") {
                    start+= "/Jul/2015";
                }
                if(end !="") {
                  end += "Jul/2015"
                }


                var defer = $q.defer();



                $http.get("../api/twittercount/"+start)
                .success(function (response) {
                    

                    defer.resolve(response);
                    console.log(response.data);
                    //$scope.rows = response.data;
                    //alert("past");
                })
                .error(function(err, status) {
                    defer.reject(err);
                })

                $scope.promise = defer.promise;
                $scope.promise.then(
                    function(v){
                      //console.log("loadedtwittergraphfunctonresult: "+JSON.stringify(v));
                      return v;
                    },
                    function(err){return err}
                    )
                .then(

                    function(v){
                      twittergraphvalues =  10;
                          var result = v[0].count;
                          twitterdataarray.push(result);
                      //console.log()
                      //$scope.twitterline.data[0][0] = 10;
                      //console.log("print: "+JSON.stringify($scope.twitterline));
                      //$('#twitterreload').load("m");
                      //document.getElementById('twitterreload').innerHTML = "";




//var ctx2d = canvas.getContext("2d");
//new Chart(ctx).Line($scope.twitterline);
                      //$scope.twitterline.destroy();
                      //$scope.twitterline.update();
                      //$('#twitterline').load(document.URL +  ' #twitterline');
                      //console.log($scope.twitterline);


                      //window.document.getElementById('twitterline').innerHTML ='<canvas id="twitterline customline-v" class="chart chart-line chart-xl" data="twitterline.data" labels="twitterline.labels" legend="true" click="twitterline.onClick" series="twitterline.series"></canvas>';
                      //$('#twitterline').replaceWith('testing');
                      console.log(twittergraphvalues);
                    },
                    function(err){twittergraphvalues = err}

                    )

}
$scope.init = function () {
    // do something on loaded
    displayTopUsers("");
    loadTwitterGraphValues("07");
    //twitterdataarray.push(JSON.parse(result)[0].count);
    //twitterdataarray.push(loadTwitterGraphValues("07"));
    /*twitterdataarray.push(loadTwitterGraphValues("08"));
    twitterdataarray.push(loadTwitterGraphValues("09"));
    twitterdataarray.push(loadTwitterGraphValues("10"));
    twitterdataarray.push(loadTwitterGraphValues("11"));
    twitterdataarray.push(loadTwitterGraphValues("12"));
    twitterdataarray.push(loadTwitterGraphValues("13"));
    twitterdataarray.push(loadTwitterGraphValues("14"));
    twitterdataarray.push(loadTwitterGraphValues("15"));
    twitterdataarray.push(loadTwitterGraphValues("16"));
    twitterdataarray.push(loadTwitterGraphValues("17"));
    twitterdataarray.push(loadTwitterGraphValues("18"));
    twitterdataarray.push(loadTwitterGraphValues("19"));
    twitterdataarray.push(loadTwitterGraphValues("20"));
    twitterdataarray.push(loadTwitterGraphValues("21"));
    twitterdataarray.push(loadTwitterGraphValues("22"));
    twitterdataarray.push(loadTwitterGraphValues("23"));
    twitterdataarray.push(loadTwitterGraphValues("24"));
    twitterdataarray.push(loadTwitterGraphValues("25"));
    twitterdataarray.push(loadTwitterGraphValues("26"));
    twitterdataarray.push(loadTwitterGraphValues("27"));
    twitterdataarray.push(loadTwitterGraphValues("28"));
    twitterdataarray.push(loadTwitterGraphValues("29"));*/
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
    
    

    $scope.twitterline = {
	    labels: ['07','08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29'],
	    series: ['Twitter'],
	    data: [
        [9933,6802,6290,6279,2026,0,0,0,0,197,3780,2975,2772,2985,4228,3252,3331,3712,2148,2225,3324,3952,2479]
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
          [0,0,6290,6279,2026,0,0,0,0,197,3780,2975,2772,2985,4228,3252,3331,3712,2148,2225,3324,3952,2479]
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
      labels: ['Jan 09','Feb 09','Mar 09','Apr 09','May 09','Jun 09', 'Jul 09', 'Aug 09', 'Sep 09', 'Oct 09', 'Nov 09', 'Dec 09'],
        series: ['Twitter','News (x2)','Influenzanet (x25)'],
        data: [
          [null,null,null,null,6240,16325,25737,15424,22334,51680,27937,7822],
          [null,null,null,null,7354*2,8559*2,6991*2,9249*2,7167*2,8764*2,8230*2,2734*2],
          [null,null,null,null,19.3*25,36.5*25,636.5*25,112.8*25,67.7*25,196.7*25,191*25,118.1*25]
        ],
        colours: ['#97BBCD','#46BFBD','#F7464A']

    }

    $scope.survellianceline = {
      labels: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52],
        series: ['Rate of ILI episodes','Historical survelliance rate per 100,000'],
        data: [
          [50,46,42,25,15,10,8,9,8,9,10,8,4,5,5,4,4,7,11,14,10,8,6,7,8,19,31,50,100,158,62,42,22,19,16,12,10,12,14,22,23,32,43,45,37,35,35,41,35,30,26,13],
          [21,21,18,21,20,22,35,25,32,33,36,25,21,18,17,21,11,13,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,14,18,18,12,14,19,18,18,11,8,19,18,20]
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