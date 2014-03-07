/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    token_id = null,
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {

        var pushNotification = window.plugins.pushNotification;

        if ( device.platform == 'android' || device.platform == 'Android' )
        {
            alert("ANDROID");
            pushNotification.register(app.pushRegisterSuccessHandler, app.pushRegisterErrorHandler,{"senderID":"507474617924","ecb":"app.onNotificationGCM"});
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
        alert("END");

    },

    pushRegisterSuccessHandler: function(result) {
        alert('Callback Success! Result = '+result)
    },

    pushRegisterErrorHandler: function(error) {
        alert('Error = '+error)
    },

    onNotificationGCM: function(e) {
        console.log("GCM", e);
        switch( e.event )
        {
            case 'registered':
                if ( e.regid.length > 0 )
                {
                    console.log("Regid " + e.regid);
                    
                    
                    alert('registration id = '+e.regid);
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

        //alert("Sending reg to"+'http://dev.guff.me.uk/register/'+platform+'.json?token='+id);
        $.ajax({
          type: 'get',
          url: 'http://dev.guff.me.uk/register/'+platform+'.json?token='+id,
          dataType: 'json',
          timeout: 8000,
          
          success: app.registerSuccessHandler,
          error: function(xhr, type){ alert("Error sending Reg"+xhr+", "+type)}
        });
    },

    registerSuccessHandler: function(e) {
        console.log("REgister success");
    },

    pushRegisterSuccessIosHandler: function(result) {
        alert('IOS Callback Success! Result = '+result)
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
