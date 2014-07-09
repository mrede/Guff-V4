angular.module('starter.services', [])

.factory('MessageService', ['$q', '$window', '$http',
    function($q, $window, $http) {
        // Might use a resource here that returns a JSON array

        // Some fake testing data
        var errors = [{
            id: 0,
            message: "You don't appear to have an internet connection"
        }, {
            id: 1,
            message: "There has been a problem retrieving messages"
        }, {
            id: 2,
            message: "There has been a problem sending your message"
        }];

        var environment = "http://dev.guff.me.uk/message/";

        return {
            all: function(loc, token) {

                var deferred = $q.defer();
                console.log("Function:", loc, token);
                var endpoint = environment + loc.lat + "/" + loc.long + "/" + token; //app.token_id

                if ($window.navigator.onLine) {

                    //needs timeout
                    $http({
                        method: 'GET',
                        url: endpoint
                    }).
                    success(function(data, status, headers, config) {
                        deferred.resolve(data);
                    }).
                    error(function(data, status, headers, config) {
                        deferred.reject(errors[1]);
                    });

                } else {
                    deferred.reject(errors[0]);
                }
                return deferred.promise;
            },
            send: function(message, token) {
                var deferred = $q.defer();
                var endpoint = "http://dev.guff.me.uk/message.json"
                var data = "message=" + message.message + "&accuracy=" + message.accuracy + "&latitude=" + message.latitude + "&longitude=" + message.longitude + "&token=" + token;
                if ($window.navigator.onLine) {
                    $http({
                        method: 'POST',
                        url: endpoint,
                        data: data,
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        }
                    }).
                    success(function(data, status, headers, config) {
                        deferred.resolve(status);
                    }).
                    error(function(data, status, headers, config) {
                        deferred.reject(errors[2]);
                    });

                } else {
                    deferred.reject(errors[0]);
                }
                return deferred.promise;
            }
        }
    }
])

.factory('GetLocationService', ['$q', '$window',
    function($q, $window) {
        // Might use a resource here that returns a JSON array

        var errors = [{
            id: 0,
            message: "Sorry looks like your phone doesn't support location tracking" // unsupported device
        }, {
            id: 1,
            message: "Did you give us permission to track your location?" // rejected permission to track
        }, {
            id: 2,
            message: "Have you got location tracking enabled on your phone?" // tracking not enabled on device
        }, {
            id: 3,
            message: "We are having trouble getting your location" // timeout getting location
        }];

        var geo;

        return {
            getLocation: function(opts) {

                var deferred = $q.defer();
                //could pass them in using opts var
                var options = {
                    enableHighAccuracy: false,
                    timeout: 30000, // more than ten minutes old
                    maximumAge: 0
                };

                if ($window.navigator && $window.navigator.geolocation) {
                    $window.navigator.geolocation.getCurrentPosition(function(position) {
                        geo = position;
                        deferred.resolve(position);
                    }, function(error) {
                        switch (error.code) {
                            case 1:
                                deferred.reject(errors[1]);
                                break;
                            case 2:
                                deferred.reject(errors[2]);
                                break;
                            case 3:
                                deferred.reject(errors[3]);
                                break;
                        }
                    }, options);
                } else {
                    deferred.reject(errors[0]);
                }
                return deferred.promise;
            },
            getLoc: function() {
                return geo;
            },
            getCoords: function() {
                return geo.coords;
            },
            getLatitude: function() {
                return geo.coords.latitude;
            },
            getLongitude: function() {
                return geo.coords.longitude;
            },
            getAccuracy: function() {
                return geo.coords.accuracy;
            }

        }
    }
])

/**
 * A simple example service that returns some data.
 */
.factory('PushService', ['$http', 
    function($http) {


        var pushNotification = false;
        console.log("window.plugins: " + window.plugins)
        if (window.plugins) {
            pushNotification = window.plugins.pushNotification;
        }

        if (pushNotification) {


            var app = {
                token_id: null,
                http: $http,

                // Update DOM on a Received Event
                register: function(id) {

                    var pushNotification = window.plugins.pushNotification;

                    if (device.platform == 'android' || device.platform == 'Android') {
                        console.log("Registering Android")
                        pushNotification.register(
                            app.pushRegisterSuccessHandler,
                            app.pushRegisterErrorHandler, {
                                "senderID": "507474617924",
                                "ecb": 'angular.element(document.querySelector("#home")).scope().handleGcmPushNotification'
                            }
                        );
                    } else {
                        //IOS
                        console.log("Registering IOS")
                        pushNotification.register(
                            app.pushRegisterSuccessIosHandler,
                            app.pushRegisterErrorIosHandler, {
                                "badge": "true",
                                "sound": "true",
                                "alert": "true",
                                "ecb": 'angular.element(document.querySelector("#home")).scope().handleApnPushNotification'
                            });

                    }
                },

                pushRegisterSuccessHandler: function(result) {
                    //alert('Callback Success! Result = '+result)
                    console.log("Android Registered OK", result)
                },

                pushRegisterErrorHandler: function(error) {
                    alert('Error = ' + error)
                },

                onNotificationGCM: function($http, e) {
                    this.http = $http;
                    console.log("GCM", e, this.http);
                    switch (e.event) {
                        case 'registered':
                            if (e.regid.length > 0) {
                                console.log("Regid " + e.regid);


                                //alert('registration id = '+e.regid);
                                app.token_id = e.regid;
                                app.sendRegistration(e.regid, 'android')
                            }
                            break;

                        case 'message':
                            // this is the actual push notification. its format depends on the data model from the push server
                            //alert('message = ' + e.message + ' msgcnt = ' + e.msgcnt);
                            break;

                        case 'error':
                            alert('GCM error = ' + e.msg);
                            break;

                        default:
                            alert('An unknown GCM event has occurred');
                            break;
                    }
                },

                sendRegistration: function(id, platform) {

                    app.http({
                        method: 'GET',
                        url: 'http://dev.guff.me.uk/register/' + platform + '.json?token=' + id,
                    }).
                    success(function(data, status, headers, config) {
                        console.log("REgister success");
                    }).
                    error(function(data, status, headers, config) {
                        console.log("ERROR registering")
                    });

                    //alert("Sending reg to"+'http://dev.guff.me.uk/register/'+platform+'.json?token='+id);
                    // $.ajax({
                    //   type: 'get',
                    //   url: 'http://dev.guff.me.uk/register/'+platform+'.json?token='+id,
                    //   dataType: 'json',
                    //   timeout: 8000,

                    //   success: app.registerSuccessHandler,
                    //   error: function(xhr, type){ alert("Error sending Reg"+xhr+", "+type)}
                    // });
                },

                registerSuccessHandler: function(e) {
                    console.log("REgister success");
                },

                pushRegisterSuccessIosHandler: function(result) {
                    //alert('IOS Callback Success! Result = '+result);
                    app.token_id = result;
                    app.sendRegistration(result, 'ios');
                },

                pushRegisterErrorIosHandler: function(error) {
                    alert('IOS Callback Error! Error = ' + error)
                },

                onNotificationAPN: function(event) {
                    console.log("onNotificationAPN", event);
                    if (event.alert) {
                        //alert(event.alert);
                        
                    }

                    if (event.sound) {
                        console.log("Sound");
                        //var snd = new Media(event.sound);
                        //snd.play();
                        console.log("Sound end")
                    }

                    if (event.badge) {
                        pushNotification.setApplicationIconBadgeNumber(successHandler, errorHandler, event.badge);
                    }
                }

            };

            return app;
        } else {
            return {
                register: function() {
                    console.log("DUMMY")
                },
                sendRegistration: function(id, platform) {

                },

            };
        }

    }
]);

function fail_bounce(e) {
  alert("IOS Fail bounce");
}
