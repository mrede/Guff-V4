angular.module('starter.controllers', [])

// A simple controller that fetches a list of data from a service
.controller('HomeCtrl', function($rootScope, $scope, $http, PushService, $ionicModal, $ionicLoading, GetLocationService, MessageService) {

    $rootScope.token_id = '123'; //default

    $scope.getLoc = function() {

        // show loading screen
        $scope.loading = $ionicLoading.show({
            content: 'Checking in',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 250
        });

        // location service call
        GetLocationService.getLocation().then(function(data) {
            console.log("Got location: ", data);
            $scope.coordinates = {
                lat: data.coords.latitude,
                long: data.coords.longitude
            };
            $scope.getMessages();
            $scope.loading.hide();

        }, function(error) {
            console.log("Error Getting Location: ", error);
        });

    };
    $scope.getLoc(); // get location



    $scope.getMessages = function() {
        MessageService.all($scope.coordinates, PushService.token_id).then(function(data) {
            $scope.messages = data;
        }, function(error) {
            console.log(error);
        });
    }; // get messages

    $rootScope.$on("addMessage", function(event, message) {
        var message = {
            d: 0,
            m: message.message,
            t: 7200
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

    $scope.handleGcmPushNotification = function(e) {
        //alert("GCM Push Notification Received");
        console.log("GCM Push Notification Received")

        PushService.onNotificationGCM($http, e);

        $scope.getMessages();

        console.log("Token ID: ", PushService.token_id);
    }

    $scope.handleApnPushNotification = function(e) {
        //alert("iOS Push Notification Received");
        console.log("iOS Push Notification Received")

        $scope.getMessages();
        PushService.onNotificationAPN(e);

        

        console.log("FINISHED: iOS Push Notification Received")

    }


})

.controller('ModalCtrl', function($rootScope, $scope, $ionicModal, MessageService, GetLocationService, PushService) {

    $scope.messageWatcher = function() {

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
            
            MessageService.send(message, PushService.token_id).then(function(data) {

                $scope.sendMessageForm.$setPristine();
                $scope.charLeft = 141;
                $scope.message = null;
                $rootScope.$emit("addMessage", message);

            }, function(error) {
                console.log(error);
            });

        }
    };

});