angular.module('starter.controllers', [])

// A simple controller that fetches a list of data from a service
.controller('HomeCtrl', function($scope, $http, PushService, $ionicModal, $ionicLoading, GetLocationService, MessageService) {
  
  // Show the loading overlay and text
  $scope.loading = $ionicLoading.show({

    // The text to display in the loading indicator
    content: 'Checking in',

    // The animation to use
    animation: 'fade-in',

    // Will a dark overlay or backdrop cover the entire view
    showBackdrop: true,

    // The maximum width of the loading indicator
    // Text will be wrapped if longer than maxWidth
    maxWidth: 200,

    // The delay in showing the indicator
    showDelay: 250
  });

  GetLocationService.getLocation().then(function(data){
    
    $scope.coordinates = {lat:data.coords.latitude, long:data.coords.longitude};
    console.log($scope.coordinates);

    $scope.messages = MessageService.all();
    console.log($scope.messages);

    $scope.loading.hide();

  }, function(data) {
    console.log(data);
  });

  

  

  $ionicModal.fromTemplateUrl('templates/modal.html', function(modal) {
    $scope.modal = modal;
  }, {
    animation: 'slide-in-up',
    focusFirstInput: true
  });


  var storage = window.localStorage;
  var push_token = false;

  if (!storage) {
    push_token = storage.getItem('push_token');
  }

  if (!push_token) {
  	console.log("Calling register")
  	PushService.register();
  }

  $scope.cheeseTest= function(e) {
    alert("DHDDHHDHD")
        console.log("POOOOOOT from cheese Test", $http, "E: ",e)  

        PushService.onNotificationGCM($http, e)    
    }

    
  
})

.controller('GetLocationCtrl', function($scope) {

})

.controller('ModalCtrl', function($scope) {
  
  $scope.newUser = {};
  
  $scope.createContact = function() {
    console.log('Create Contact', $scope.newUser);
    $scope.modal.hide();
  };
  
});


