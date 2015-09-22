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
      labels: ['Jun 09', 'Jul 09', 'Aug 09', 'Sept 09', 'Oct 09', 'Nov 09', 'Dec 09'],
        series: ['Twitter','News','Influenzanet'],
        data: [
          [296096,354997,321454,311021,744499,554976,228535],
          [8076,7746,8712,6763,9653,7871,2873],
          [0,864,6968,5010,5374,3267,1141]
        ],
        options: [{
          scaleUse2Y: true
        }]

    }

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