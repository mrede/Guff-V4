// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
var theApp = angular.module('starter', ['ionic', 'starter.services', 'starter.controllers'])


.config(function($stateProvider, $urlRouterProvider, $httpProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider.state('home', {
    url: "/home",
    templateUrl: "templates/home.html",
    controller: 'HomeCtrl'
  });


  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/home');
  // Enable cross domain calls
  $httpProvider.defaults.useXDomain = true;
  // Remove the header used to identify ajax call  that would prevent CORS from working
  delete $httpProvider.defaults.headers.common['X-Requested-With'];

})

//This bit is not used at the moment, but might come in handy later - Ben
.run(function($window, $rootScope) {
      $rootScope.online = navigator.onLine;
      console.log("Default:", $rootScope.online)
      $window.addEventListener("offline", function () {
        $rootScope.$apply(function() {
          console.log("OFFLINE");
          $rootScope.online = false;
        });
      }, false);
      $window.addEventListener("online", function () {
        $rootScope.$apply(function() {
          console.log("online");
          $rootScope.online = true;
        });
      }, false);
});


