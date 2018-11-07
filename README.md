# Zebra Cordova Demo

## Update - March 2018
This application has received an overhaul in March 2018 to update the APIs being used, the assumption being that most current devices will have a version of Datawedge above 6.3 however this app will continue to work on older devices - see Setup section below.

# Integrating DataWedge into your Cordova application
This application shows how DataWedge functionality can be seamlessly integrated into your new or existing Cordova / Phonegap applications using a 3rd party plugin.  Compare with the [official Zebra application](https://github.com/Zebra/ZebraIonicDemo) for demonstrating Ionic on Zebra devices.

![Application](https://raw.githubusercontent.com/darryncampbell/DataWedgeCordova/master/screens/application01.png)

## DataWedge Intent Interface
DataWedge is a value-add of all Zebra Technologies devices (formally Symbol and Motorola Solutions) that allows barcode capture and configuration without the need to write any code.  This application will demonstrate how to use Android intents to add DataWedge scanning functionality to your application

## Quick Start - Getting this Demo running
* `git clone https://github.com/darryncampbell/DataWedgeCordova.git`
* `cd DataWedgeCordova`
* `cordova platform add android`
* Plug in Zebra device
* `cordova run android --device`

## Setup
Any Zebra mobile computer running Android which supports Datawedge should work with this sample but the complexity of setup will depend on your Datawedge version 

---
If your device is running Datawedge 6.4 or higher you will see no warning messages and can safely skip this step
---
You will see this message if you are running a version of Datawedge prior to 6.3:

![Pre-6.3 warning message](https://raw.githubusercontent.com/darryncampbell/DataWedgeCordova/master/screens/pre-6.3_message.png)

And this message if you are running Datawedge 6.3:

![6.3 warning message](https://raw.githubusercontent.com/darryncampbell/DataWedgeCordova/master/screens/6.3_message.png)

In either case, ensure you have a Datawedge profile on the device.  You can do this by:
- Launching the Datawedge application
- (Prior to 6.3 only) Select Menu --> New Profile and name the profile `ZebraCordovaDemo`
- Configure the ZebraCordovaDemo profile to 
  - Associate the profile with com.zebra.datawedgecordova, with * Activities (Note: You need to have previously run the application on the device to complete this step)
  - Configure the intent output plugin to send broadcast intents to `com.zebra.cordovademo.ACTION` (Note: the action changed with the update made in March 2018)
  
![Profile configuration 1](https://raw.githubusercontent.com/darryncampbell/DataWedgeCordova/master/screens/associate_app.png)

![Profile configuration 2](https://raw.githubusercontent.com/darryncampbell/DataWedgeCordova/master/screens/intent_output_settings.png)

## Use
There are two sections to the UI, at the top you can configure scanning attributes such as choosing the enabled decoders.  Note that some configuration features will require a minimum version of Datawedge.  You can initiate a soft trigger scan using the yellow button.

**All** versions of Datawedge support scanning barcodes with the hardware trigger.

## Integrating into your own app
In order to interact with the Datawedge service on Zebra devices this application relies on a 3rd party component to provide the Android Intent interface.  Please be sure to add the [Cordova plugin intent](https://www.npmjs.com/package/com-darryncampbell-cordova-plugin-intent) package to your application if you are using this code as a template for your own application:

`cordova plugin add com-darryncampbell-cordova-plugin-intent`

##  Code examples
Now to hook up our logic to listen for and send intents.

### Listening for intents
Since we configured DataWedge to send barcode data to our application via an implicit broadcast intent we can use the 3rd party plugin to register a broadcast receiver::
```javascript
    window.plugins.intentShim.registerBroadcastReceiver({
        filterActions: [
            'com.zebra.cordovademo.ACTION', //  Scans
            'com.symbol.datawedge.api.RESULT_ACTION' //  Messages from service
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
                console.log("Scan: " + intent.extras["com.symbol.datawedge.data_string"]);
            }
        }
    );
```

### Sending intents
DataWedge supports an intent based API [documented here](http://techdocs.zebra.com/datawedge/6-7/guide/api/) which supports scanner configuration & control.  The below code shows how to simulate a trigger press and disable the scanner entirely:

To simulate a trigger press:
```javascript
    window.plugins.intentShim.sendBroadcast({
        action: 'com.symbol.datawedge.api.ACTION', 
        extras: {
            'com.symbol.datawedge.api.SOFT_SCAN_TRIGGER': 'TOGGLE_SCANNING'
            }
        }, 
        function() {}, 
        function() {}
    );
```

To disable the scanner:
```javascript
window.plugins.intentShim.sendBroadcast({
    action: 'com.symbol.datawedge.api.ACTION', 
    extras: {
        'com.symbol.datawedge.api.SCANNER_INPUT_PLUGIN': 'DISABLE_PLUGIN'
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

## Feedback
Please feel free to raise github issues on this repository or post comments to the [accompanying blog](https://developer.zebra.com/community/home/blog/2016/08/04/integrating-datawedge-into-your-cordova-application).
