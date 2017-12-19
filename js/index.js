
'use strict';
// First let's define the usual configuration variables for our index

var applicationId = 'CWT8RJGTF6';
var apiKey = '9176b980678d63f8ca3e47c2b6313cce';
var index = 'restaurants-cta-test';
var client = algoliasearch(applicationId, apiKey);

// Define the `AgoliaSearchHelper` module
angular.module('AlgoliaSearchHelper', ['ngSanitize']).

// Expose the helper
factory('helper', function () {
  return algoliasearchHelper(client, index, {
    disjunctiveFacets: ['food_type', 'stars_count', 'payment_options'],
    hitsPerPage: 3,
    maxValuesPerFacet: 7
  });
}).

// Define the search-box
component('searchBox', {
  template: '\n    <input type=text\n      placeholder="Search for Restaurants by Name, Cuisine, Location" \n      ng-keyup=search($evt) \n      ng-model="query"\n    />',
  controller: function SearchBoxController($scope, helper) {
    $scope.query = '';
    $scope.search = function () {
      helper.setQuery($scope.query).search();
    };

    helper.setQuery('').search();
  }
}).

// Define the search-facets
component('searchFacets', {
  template: '<ul class="facet-list"><h4>Cuisine/Food Type</h4>\n              <span ng-repeat="ftfacet in ftfacets">\n                <div class = "facet" data-val="ftfacet.name" ng-click="toggleFTFacet(ftfacet.name)" ng-class="{active: ftfacet.isRefined}">\n                  ' +
  '{{ftfacet.name}} <span class="empty alignright">{{ftfacet.count}}</span></div>\n            </span>\n            ' + 
  '<h4>Rating</h4><span ng-repeat="scfacet in scfacets"><div ng-click="toggleSCFacet(scfacet.rating, allscfacets)" ng-class="{active: scfacet.isRefined}"><label class="facet" data-val="scfacet.rating"><span ng-bind-html="scfacet.starHTML"> \n                  </label>\n </div></span>' +
  '<h4>Payment Option</h4><span ng-repeat="pofacet in pofacets"><div class="facet"data-val="pofacet.name" ng-click="togglePOFacet(pofacet.name)" ng-class="{active: pofacet.isRefined}">{{pofacet.name}} <span class="empty alignright">{{pofacet.count}}</span></div></span></ul>',
  controller: function SearchFacetsController($scope, helper) {
    $scope.toggleFTFacet = function (name) {
      helper.toggleFacetRefinement('food_type', name).search();
    };
    $scope.toggleSCFacet = function (rating, scfacets) {
      helper.toggleFacetRefinement('stars_count', rating).search();
    };
	$scope.togglePOFacet = function (name) {
      if (name === "Discover"){
        helper.toggleFacetRefinement('payment_options', name).search();
        helper.toggleFacetRefinement('payment_options', 'Diners Club').search();
        helper.toggleFacetRefinement('payment_options', 'Carte Blanche').search();
      }
      else{
        helper.toggleFacetRefinement('payment_options', name).search();
      }
    };
    helper.on('result', function (results) {
      $scope.allscfacets = results.getFacetValues('stars_count');
      $scope.scfacets = [];
      for (let i = 0; i < 6; i++){
        $scope.scfacets[i] = { 'rating' : i, 'starHTML' : starDisplay(i)};
      }
      $scope.allpofacets = results.getFacetValues('payment_options',{sortBy: ['name:desc']});
      //Not combining Diners Club and Carte Blanche with Discover counts
      //$scope.allpofacets.find(facet => facet.name === "Discover").count += ($scope.allpofacets.find(facet => facet.name === "Diners Club").count + $scope.allpofacets.find(facet => facet.name === "Carte Blanche").count);
      //Only displaying main payments
      $scope.pofacets = $scope.allpofacets.filter(facet => (facet.name === "Visa")||(facet.name === "MasterCard")||(facet.name === "AMEX")||(facet.name === "Discover"));
      $scope.$apply($scope.ftfacets = results.getFacetValues('food_type',{sortBy: ['count:desc']}), $scope.scfacets, $scope.allscfacets, $scope.pofacets);
    });
  }
}).

// Define the search-results
component('searchResult', {
template: '\n    <div class="w3-content">\n       <h4 class="miniheader">{{nbHits}} results in {{pTime}} seconds</h4><div class="w3-row w3-margin" ng-repeat="hit in hits">\n      ' +
	'<img ng-src="{{hit.image_url}}" class="smallpic">\n        <div class="resultcontainer"><h4>{{hit.name}}</h4><h5><span ng-bind-html="hit.starHTML"></span>({{hit.reviews_count}} reviews)</h5><h5>{{hit.food_type}} | {{hit.neighborhood}} | {{hit.price_range}}</h5></div>\n        </div>\n      ' + 
	'<span ng-if="hits.length === 0">\n        No results found 😓\n      </span>\n    </div>',
  controller: function SearchResultController($scope, helper) {
    //Checking geolocation
    if (navigator.geolocation) navigator.geolocation.getCurrentPosition(onPositionUpdate);
    function onPositionUpdate(position) {
        var lat = position.coords.latitude;
        var lng = position.coords.longitude;
        helper.setQueryParameter('aroundLatLngViaIP', true).search();
        //helper.setQueryParameter('getRankingInfo', true).search();
    }
    helper.on('result', function (results) {
      $scope.hits = results.hits;
      for (var key in $scope.hits){
        $scope.hits[key].starHTML = starDisplay($scope.hits[key].stars_count);
      }
      $scope.$apply($scope.nbHits = results.nbHits, $scope.pTime=results.processingTimeMS/1000, $scope.hits);
      ;
    });
  }
}).

// Define the search-pagination
component('searchPagination', {
  template: '<div class="pager">\n      <button class="pagination"  ng-click="previousPage()">Previous</button>\n      <span class="current-page"><span ng-bind-html="page"></span></span>\n      <button class="pagination" ng-click="nextPage()">Next</button>\n    </div>',
  controller: function SearchPaginationController($scope, helper) {

    helper.on('result', function (results) {
      $scope.$apply($scope.page = "" + (results.page + 1));
    });

    $scope.nextPage = function () {
      helper.nextPage().search();
    };

    $scope.previousPage = function () {
      helper.previousPage().search();
    };
  }
});


function starDisplay(rating) {
  var str = '';
  for (let i = 0; i<5; i++){
    if (rating-1>=i){
      str += '<span class="fa fa-star checked"></span>'
    }
    else if (rating-1>=i-0.5){
      str += '<span class="fa fa-star-half checked"></span><span class="fa fa-star-half mirror empty"></span>'
    }
    else{
      str += '<span class="fa fa-star empty"></span>'
    }
  }
  return str;
};
//for(var b in window) { 
  //if(window.hasOwnProperty(b)) console.log(b); 
//};
