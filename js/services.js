angular.module('starter.services', [])

.factory('MessageService', [ '$q', '$window', '$http', function($q, $window, $http) {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var errors = [
    { id: 0, message: "You don't appear to have an internet connection" },
    { id: 1, message: "There has been a problem retrieving messages" },
  ];

  var environment = "http://dev.guff.me.uk/message/";  

  return {
    all: function(loc) {

      var deferred = $q.defer();
      var endpoint = environment + "/" + loc.lat + "/" + loc.long +"/123"; //app.token_id

      if($window.navigator.onLine){
        
        //needs timeout
        $http({method: 'GET', url: endpoint}).
        success(function(data, status, headers, config) {
          deferred.resolve(data);
        }).
        error(function(data, status, headers, config) {
          deferred.reject(errors[1]);
        });

      } else {
        deferred.reject(errors[0]);
      }
      
    }
    return deferred.promise;
  }
}])

.factory('GetLocationService', [ '$q', '$window', function($q, $window) {
  // Might use a resource here that returns a JSON array

  var errors = [
    { id: 0, message: "Phone does not support location services" },
    { id: 1, message: "You have rejected access to your location" },
    { id: 2, message: "Unable to determine your location" },
    { id: 3, message: "Service timeout has been reached" },
  ];

  return {
    getLocation: function(opts) {
      
      var deferred = $q.defer();
      //could pass them in using opts var
      var options = {
        enableHighAccuracy: true,
        timeout: 600000, // more than ten minutes old
        maximumAge: 0
      };

      if ($window.navigator && $window.navigator.geolocation) {
        $window.navigator.geolocation.getCurrentPosition(function(position){
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
      }
      else
      {
        deferred.reject(errors[0]);
      }
      return deferred.promise;
    }

  }
}])

/**
 * A simple example service that returns some data.
 */
.factory('PushService', function() {

  var pushNotification = false;
  console.log("window.plugins: "+window.plugins)
  if (window.plugins) {
    pushNotification = window.plugins.pushNotification;
  } 
  
  if (pushNotification) {


    var app = {
      token_id: null,
      http: null,
      
      // Update DOM on a Received Event
      register: function(id) {

          var pushNotification = window.plugins.pushNotification;

          if ( device.platform == 'android' || device.platform == 'Android' )
          {
              alert("ANDROID");
              pushNotification.register(app.pushRegisterSuccessHandler, app.pushRegisterErrorHandler,{"senderID":"507474617924","ecb":'angular.element(document.querySelector("#home")).scope().handlePushNotification(e)'});
          } else {
              //IOS
              alert("Doing IOS");
              pushNotification.register(
              app.pushRegisterSuccessIosHandler,
              app.pushRegisterErrorIosHandler, {
                  "badge":"true",
                  "sound":"true",
                  "alert":"true",
                  "ecb":"app.onNotificationAPN"
              });

          }
      },

      pushRegisterSuccessHandler: function(result) {
          //alert('Callback Success! Result = '+result)
      },

      pushRegisterErrorHandler: function(error) {
          alert('Error = '+error)
      },

      onNotificationGCM: function($http, e) {
          this.http = $http;
          console.log("GCM", e, this.http);
          switch( e.event )
          {
              case 'registered':
                  if ( e.regid.length > 0 )
                  {
                      console.log("Regid " + e.regid);
                      
                      
                      //alert('registration id = '+e.regid);
                      app.token_id = e.regid;
                      app.sendRegistration(e.regid, 'android')
                  }
              break;
   
              case 'message':
                // this is the actual push notification. its format depends on the data model from the push server
                alert('message = '+e.message+' msgcnt = '+e.msgcnt);
              break;
   
              case 'error':
                alert('GCM error = '+e.msg);
              break;
   
              default:
                alert('An unknown GCM event has occurred');
                break;
          }
      },

      sendRegistration: function(id, platform) {

        app.http({method: 'GET', url: 'http://dev.guff.me.uk/register/'+platform+'.json?token='+id,}).
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
          //alert('IOS Callback Success! Result = '+result)
          app.token_id = result;
          app.sendRegistration(result, 'ios');
      },

      pushRegisterErrorIosHandler: function(error) {
          alert('IOS Callback Error! Error = '+error)
      },

      onNotificationAPN: function(event) {
          if ( event.alert )
          {
              alert(event.alert);
              navigator.notification.alert(event.alert);
          }

          if ( event.sound )
          {
              var snd = new Media(event.sound);
              snd.play();
          }

          if ( event.badge )
          {
              pushNotification.setApplicationIconBadgeNumber(successHandler, errorHandler, event.badge);
          }
      }

    };

    return app;
  } else {
    return { 
      register: function() { console.log("DUMMY")},
      sendRegistration: function(id, platform) {

      },

    };
  }

});


function fail_bounce(e)
{
  alert("FAIL BOUNCE")
  console.log("Fail_bounce called");
  //# Get The PushTest controller and call the test on it
  angular.element(document.querySelector("#home")).scope().cheeseTest(e);

}
