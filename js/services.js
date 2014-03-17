angular.module('starter.services', [])

.factory('MessageService', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var messages = [
    { id: 0, text: "Why can't Google and Facebook come up with a solution to Silicon Valley's pollution crisis? http://trib.al/k1Yz7lV" },
    { id: 1, text: "Think Silicon Valley' pollution can't hurt you? Think again. Join our Q&A with @CIRonline now to learn more http://trib.al/JZ9c3tO" },
    { id: 2, text: "MPs and open-data advocates slam postcode selloff http://bit.ly/1kCLsA6" },
    { id: 3, text: "CarPlay could be a very smart way to hitch a ride on in-car systems http://bit.ly/1iwiEct" }
  ];

  return {
    all: function() {
      return messages;
    },
    get: function(messageId) {
      // Simple index lookup
      return messages[messageId];
    }
  }
})

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
              pushNotification.register(app.pushRegisterSuccessHandler, app.pushRegisterErrorHandler,{"senderID":"507474617924","ecb":"fail_bounce"});
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
