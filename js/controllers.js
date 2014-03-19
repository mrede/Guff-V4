angular.module('starter.controllers', [])

// A simple controller that fetches a list of data from a service
.controller('HomeCtrl', function($rootScope, $scope, $http, PushService, $ionicModal, $ionicLoading, GetLocationService, MessageService) {

    $scope.token_id = '123'; //default

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

            $scope.coordinates = {
                lat: data.coords.latitude,
                long: data.coords.longitude
            };
            $scope.getMessages();
            $scope.loading.hide();

        }, function(error) {
            console.log(error);
        });

    };
    $scope.getLoc(); // get location



    $scope.getMessages = function() {
        MessageService.all($scope.coordinates, $scope.token_id).then(function(data) {
            $scope.messages = data;
            $scope.modal.hide();
        }, function(error) {
            console.log(error);
        });
    }; // get messages
    $rootScope.$on("getMessages", function() {
        $scope.getMessages();
    }); //

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
        alert("GCM Push Notification Received");
        console.log("GCM Push Notification Received")

        PushService.onNotificationGCM($http, e);
        $scope.token_id = PushService.token_id;
        console.log("Token ID: ", $scope.token_id);
    }

    $scope.handleApnPushNotification = function(e) {
        alert("iOS Push Notification Received");
        console.log("iOS Push Notification Received")

        PushService.onNotificationAPN($http, e);
        $scope.token_id = PushService.token_id;
        console.log("Token ID: ", $scope.token_id);
    }


})

.controller('ModalCtrl', function($rootScope, $scope, $ionicModal, MessageService, GetLocationService) {


    $scope.token_id = '123';

    $scope.sendMessage = function(message) {

        message.accuracy = GetLocationService.getAccuracy();
        message.latitude = GetLocationService.getLatitude();
        message.longitude = GetLocationService.getLongitude();

        var coords = {
            lat: message.latitude,
            long: message.longitude
        };

        MessageService.send(message, $scope.token_id).then(function(data) {
            $rootScope.$emit("getMessages");
        }, function(error) {
            console.log(error);
        });
    };

});