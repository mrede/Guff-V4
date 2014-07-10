angular.module('starter.controllers', [])

// A simple controller that fetches a list of data from a service
.controller('HomeCtrl', function($rootScope, $scope, $http, PushService, $ionicModal, $ionicLoading, $ionicPopup, GetLocationService, MessageService) {
    $rootScope.token_id = '12345'; //default

    $scope.getLoc = function() {

        // show loading screen
        if($scope.classes != "shown") {
            $scope.loading = $ionicLoading.show({
                templateUrl: 'templates/modals/checkin.html',
                animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 250
            });
        }
        $scope.classes = "shown"; // TBD: this might need to be hooked into the phone gap onload


        var compassInterval = setInterval(function(){
            document.getElementById("icon-explore").classList.toggle("on");
        }, 1000);

        // location service call
        GetLocationService.getLocation().then(function(data) {
            console.log("Got location: ", data);
            $scope.coordinates = {
                lat: data.coords.latitude,
                long: data.coords.longitude
            };
            $scope.getMessages();
            clearInterval(compassInterval);
            $ionicLoading.hide();

        }, function(error) {

            var alertPopup = $ionicPopup.alert({
              title: 'Problem getting your location',
              template: error.message,
              buttons: [{
                text: 'Retry',
                type: 'button-calm',
                onTap: function(e) {
                  // try again
                  $scope.getLoc();
                }
              }]
            });

            $ionicLoading.hide();
        });

    };
    $scope.getLoc(); // get location



    $scope.getMessages = function() {
        MessageService.all($scope.coordinates, PushService.token_id).then(function(data) {
            data.map(function(i) { 

                 when_ago = 7200 - i.t;
                 minutes = Math.round(when_ago/60);
                 if(minutes<=0) {
                   i.t = "Just now";
                 } else {
                   i.t = minutes + " min";
                 }
                 
            });
            $scope.messages = data;
            $scope.$broadcast('scroll.refreshComplete');
        }, function(error) {

            $scope.showAlert = function() {
                var alertPopup = $ionicPopup.alert({
                  title: 'Don\'t eat that!',
                  template: 'It might taste good'
                });
                alertPopup.then(function(res) {
                  console.log('Thank you for not eating my delicious ice cream cone');
                });
            };
            console.log(error);

        });
    }; // get messages

    $rootScope.$on("addMessage", function(event, message) {
        var message = {
            d: 0,
            m: message.message,
            t: 'Just now'
        }
        $scope.messages.unshift(message);
        $scope.modal.hide();
    }); // add message to existing list

    // send message modal  
    $ionicModal.fromTemplateUrl('templates/modal.html', function(modal) {
        $scope.modal = modal;
    }, {
        animation: 'slide-in-up',
        focusFirstInput: true
    });

    // push
    var storage = window.localStorage;
    var push_token = false;

    if (!storage) {
        push_token = storage.getItem('push_token');
    }

    if (!push_token) {
        console.log("Calling register")
        PushService.register();
    }

    $rootScope.handleGcmPushNotification = function(e) {
        //alert("GCM Push Notification Received");
        console.log("GCM Push Notification Received")

        PushService.onNotificationGCM($http, e);

        $scope.getMessages();

        console.log("Token ID: ", PushService.token_id);
    }

    $rootScope.handleApnPushNotification = function(e) {
        //alert("iOS Push Notification Received");
        console.log("iOS Push Notification Received")

        $scope.getMessages();
        PushService.onNotificationAPN(e);

        

        console.log("FINISHED: iOS Push Notification Received")

    }


})

.controller('ModalCtrl', function($rootScope, $scope, $ionicModal, MessageService, GetLocationService, PushService) {

    $scope.messageWatcher = function() {

        console.log(141-sendMessageForm.message.value.length);

        $scope.charLeft = 141-sendMessageForm.message.value.length;

        if(sendMessageForm.message.value.length<=0 || $scope.charLeft < 0) {
            document.getElementById("send").classList.add("disabled");
        } else {
            document.getElementById("send").classList.remove("disabled");
        }

        if ($scope.charLeft < 0) {
            sendMessageForm.message.style.color = 'red';
        } else {
            sendMessageForm.message.style.color = '#444';
        }
    };

    $scope.sendMessage = function(message) {

        message.accuracy = GetLocationService.getAccuracy();
        message.latitude = GetLocationService.getLatitude();
        message.longitude = GetLocationService.getLongitude();

        var coords = {
            lat: message.latitude,
            long: message.longitude
        };

        if ($scope.sendMessageForm.$valid) {
            
            document.getElementById("send").classList.add("disabled");

            MessageService.send(message, PushService.token_id).then(function(data) {

                sendMessageForm.reset();
                $scope.messageWatcher();
                $rootScope.$emit("addMessage", message);

            }, function(error) {
                console.log(error);
            });

        }
    };

});