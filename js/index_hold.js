
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
    disjunctiveFacets: ['category'],
    hitsPerPage: 7,
    maxValuesPerFacet: 3
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
  template: '<ul class="facet-list">\n              <span ng-repeat="facet in facets">\n                <li \n                   ng-click="toggleFacet(facet.name)"\n                   ng-class="{active: facet.isRefined}">\n                  <label><input \n                    type="checkbox" \n                    data-val="facet.name"/> \n                  <span ng-bind-html="facet.name"></span> \n                  <span class="badge" ng-bind-html="facet.count"></span>\n                  </label>\n                </li>\n              </span>\n            </ul>',
  controller: function SearchFacetsController($scope, helper) {
    $scope.toggleFacet = function (name) {
      helper.toggleRefinement('category', name).search();
    };
    helper.on('result', function (results) {
      $scope.$apply($scope.facets = results.getFacetValues('category'));
    });
  }
}).

// Define the search-results
component('searchResult', {
  template: '\n    <div class="hit results">\n      <span ng-repeat="hit in hits">\n        <div ng-bind-html="hit._highlightResult.name.value"></div>\n      </span>\n      <span ng-if="hits.length === 0">\n        No results found 😓\n      </span>\n    </div>',
  controller: function SearchResultController($scope, helper) {
    $scope.hits = [];

    helper.on('result', function (results) {
      $scope.$apply($scope.hits = results.hits);
    });
  }
}).

// Define the search-pagination
component('searchPagination', {
  template: '<div class="pager">\n      <button class="previous">Previous</button>\n      <span class="current-page"><span ng-bind-html="page"></span></span>\n      <button class="next" ng-click="nextPage()">Next</button>\n    </div>',
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
