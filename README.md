## Update - April 2017
This application received a major overhaul in April 2017 to transition away from the previously used 3rd party plugins and demonstrate the use of the recent DataWedge 6.2 APIs.

# Integrating DataWedge into your Cordova application
This application shows how DataWedge functionality can be seamlessly integrated into your new or existing Cordova / Ionic / Phonegap applications using 3rd party plugins

## DataWedge Intent Interface
DataWedge is a value-add of all Zebra Technologies devices (formally Symbol and Motorola Solutions) that allows barcode capture and configuration without the need to write any code.  This application will demonstrate how to use Android intents to add DataWedge scanning functionality to your application

## Quick Start - Getting this Demo running
* `git clone https://github.com/darryncampbell/DataWedgeCordova.git`
* `cd DataWedgeCordova`
* `cordova platform add android`
* Plug in Zebra device
* Follow instructions under "Configuring Datawedge" (below)
* `cordova run android`
* Scan a barcode

## Getting Started
This section walks through the steps to create a new Cordova application that utilises DataWedge for scanning.

Create a cordova application that will run on Android
* `cordova create DataWedgeCordova com.zebra.datawedgecordova DataWedgeCordova`
* `cordova platform add android`

We will use a 3rd party plugin to handle sending and receiving Intents to the DataWedge service.  Any plugin capable of sending or receiving generic intents and interpreting the extra bundle into JSON should work:

* `cordova plugin add https://github.com/darryncampbell/darryncampbell-cordova-plugin-intent.git`

Note that a previous version of this application used different 3rd party plugins which have since been deprecated.  I wrote my own generic plugin to handle intents and released it under MIT to aid customers who wish to integrate DataWedge and Cordova but this should not be considered supported software by Zebra Techologies.

## Configuring Datawedge
DataWedge can be configured to send intents whenever it scans barcodes.  More detailed help is available at the [official documentation](http://techdocs.zebra.com/datawedge/6-2/guide/setup/) but for the purposes of this demo I will include the pertinent steps.  There are more sophisticated ways to configure DataWedge but this section will cover the basics.

1. Create a new DataWedge profile (Applications --> DataWedge --> Menu --> New Profile).  This will be the profile that will be active when our Cordova application is in the foreground.  Give it a name e.g. DataWedgeCordova and click into it to configure.
2. The next step requires our Cordova application to have previously run on the device so if you have not already done so, `cordova run android`
3. Back in DataWedge configuration associate the Cordova application with our DW profile
![Associate app](https://raw.githubusercontent.com/darryncampbell/DataWedgeCordova/master/screens/associate_app.png)
4. Scroll down to the Intent Output section of DW configuration and enable intents to start our activity:
  * Intent Action: com.zebra.datawedgecordova.ACTION
  * Intent Category: leave blank
  * Intent delivery: SendBroadcast
  
![Configure Intent output](https://raw.githubusercontent.com/darryncampbell/DataWedgeCordova/master/screens/intent_output_settings.png)

##  Add Code to the Cordova application
Now to hook up our logic to listen for and send intents.

### Listening for intents
Since we configured DataWedge to send barcode data to our application via an implicit broadcast intent we can use the 3rd party plugin to register a broadcast receiver::
```javascript
    window.plugins.intentShim.registerBroadcastReceiver({
        filterActions: [
            'com.zebra.datawedgecordova.ACTION'
            ],
        filterCategories: [
            'com.android.intent.category.DEFAULT'
            ]
        },
        function(intent) {
            //  Broadcast received
            console.log('Received Intent: ' + JSON.stringify(intent.extras));
            if (intent.extras["com.symbol.datawedge.data_string"] != null)
            {
                document.getElementById('broadcastData').innerHTML = "Scan: " + intent.extras["com.symbol.datawedge.data_string"];

            }
        }
    );
```
And in index.html:
```
<div class="event" id="broadcastData"></div>
```

### Sending intents
DataWedge supports an intent based API [documented here](http://techdocs.zebra.com/datawedge/6-2/guide/api/).  The API is somewhat limited but supports initiating the scanner via software (simulating a trigger press), disabling the scanner entirely and various DataWedge profile operations.  We'll be adding features to our application to simulate a trigger press and disable / enable the scanner through that Intent interface:

To simulate a trigger press:
```javascript
    window.plugins.intentShim.sendBroadcast({
        action: 'com.symbol.datawedge.api.ACTION_SOFTSCANTRIGGER', 
        extras: {
            'com.symbol.datawedge.api.EXTRA_PARAMETER': 'TOGGLE_SCANNING'
            }
        }, 
        function() {}, 
        function() {}
    );
```

To disable the scanner:
```javascript
window.plugins.intentShim.sendBroadcast({
    action: 'com.symbol.datawedge.api.ACTION_SCANNERINPUTPLUGIN', 
    extras: {
        'com.symbol.datawedge.api.EXTRA_PARAMETER': 'DISABLE_PLUGIN'
        }
    }, 
    function() {}, 
    function() {}
);
```
And hook up our logic to the UI:
```
document.getElementById("scanButton").addEventListener("click", startSoftTrigger);
document.getElementById("disableScanningButton").addEventListener("click", disableEnableScanning);
```

Now deploy & launch your app.  You are able to scan barcodes and exercise the functionality:

![Viewing scanned output](https://raw.githubusercontent.com/darryncampbell/DataWedgeCordova/master/screens/scanned_data.png)

## DataWedge versions
As DataWedge continues to evolve its capabilities continue to be enhanced.  At the time of writing there are two different API levels for DataWedge, 6.2 and pre-6.2, as [documented here](http://techdocs.zebra.com/datawedge/6-2/guide/api/).  Future updates will continue to enhance datawedge but the same principles should apply to any updated intent API, that it can be accessed through 3rd party Cordova plugins.

## Feedback
This technique for adding scanning capabilities to a Cordova application represents the most generic possible solution.  We appreciate your developer feedback:
* Would you prefer a dedicated Cordova plugin for Javascript?
* Would you like to access EMDK profile functionality through Cordova?
* Would you rather a dedicated Javascript interface as opposed to relying on third party plugins?
* Are you interested in JavaScript development outside of Cordova e.g. ReactNative or NativeScript for your Enterprise application

Please feel free to raise github issues on this repository or post comments to the accompanying blog.
