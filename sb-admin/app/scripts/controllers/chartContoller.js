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
$scope.init = function () {
    // do something on loaded
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
    
    

    $scope.line = {
	    labels: ['07','08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29'],
	    series: ['Twitter'],
	    data: [
	      [9933,6802,6290,6279,2026,0,0,0,0,197,3780,2975,2772,2985,4228,3252,3331,3712,2148,2225,3324,3952,2479]
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