var sendCommandResults = "false";
var scans = [];

var app = {
    // Application Constructor
    initialize: function () {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function () {
        app.receivedEvent('deviceready');
        document.getElementById("scanButton").addEventListener("touchstart", startSoftTrigger);
        document.getElementById("scanButton").addEventListener("touchend", stopSoftTrigger);
        document.getElementById('scanButton').style.display = "none";
        document.getElementById('header_lastApiMessage').style.display = "none";
        document.getElementById('info_lastApiMessage').style.display = "none";
        document.getElementById('chk_ean8').disabled = true;
        document.getElementById('chk_ean13').disabled = true;
        document.getElementById('chk_code39').disabled = true;
        document.getElementById('chk_code128').disabled = true;
        registerBroadcastReceiver();
        determineVersion();
    },
    onPause: function () {
        console.log('Paused');
        unregisterBroadcastReceiver();
    },
    onResume: function () {
        console.log('Resumed');
        registerBroadcastReceiver();
    },
    // Update DOM on a Received Event
    receivedEvent: function (id) {
        console.log('Received Event: ' + id);
    }
};

app.initialize();

function startSoftTrigger() {
    sendCommand("com.symbol.datawedge.api.SOFT_SCAN_TRIGGER", 'START_SCANNING');
}

function stopSoftTrigger() {
    sendCommand("com.symbol.datawedge.api.SOFT_SCAN_TRIGGER", 'STOP_SCANNING');
}

function determineVersion() {
    sendCommand("com.symbol.datawedge.api.GET_VERSION_INFO", "");
}

function setDecoders() {
    var ean8Decoder = "" + document.getElementById('chk_ean8').checked;
    var ean13Decoder = "" + document.getElementById('chk_ean13').checked;
    var code39Decoder = "" + document.getElementById('chk_code39').checked;
    var code128Decoder = "" + document.getElementById('chk_code128').checked;
    //  Set the new configuration
    var profileConfig = {
        "PROFILE_NAME": "ZebraCordovaDemo",
        "PROFILE_ENABLED": "true",
        "CONFIG_MODE": "UPDATE",
        "PLUGIN_CONFIG": {
            "PLUGIN_NAME": "BARCODE",
            "PARAM_LIST": {
                //"current-device-id": this.selectedScannerId,
                "scanner_selection": "auto",
                "decoder_ean8": "" + ean8Decoder,
                "decoder_ean13": "" + ean13Decoder,
                "decoder_code128": "" + code128Decoder,
                "decoder_code39": "" + code39Decoder
            }
        }
    };
    sendCommand("com.symbol.datawedge.api.SET_CONFIG", profileConfig);
}

function sendCommand(extraName, extraValue) {
    console.log("Sending Command: " + extraName + ", " + JSON.stringify(extraValue));
    var broadcastExtras = {};
    broadcastExtras[extraName] = extraValue;
    broadcastExtras["SEND_RESULT"] = sendCommandResults;
    window.plugins.intentShim.sendBroadcast({
        action: "com.symbol.datawedge.api.ACTION",
        extras: broadcastExtras
    },
        function () { },
        function () { }
    );
}

function registerBroadcastReceiver() {
    window.plugins.intentShim.registerBroadcastReceiver({
        filterActions: [
            'com.zebra.cordovademo.ACTION',
            'com.symbol.datawedge.api.RESULT_ACTION'
        ],
        filterCategories: [
            'android.intent.category.DEFAULT'
        ]
    },
        function (intent) {
            //  Broadcast received
            console.log('Received Intent: ' + JSON.stringify(intent.extras));
            if (intent.extras.hasOwnProperty('RESULT_INFO')) {
                var commandResult = intent.extras.RESULT + " (" +
                    intent.extras.COMMAND.substring(intent.extras.COMMAND.lastIndexOf('.') + 1, intent.extras.COMMAND.length) + ")";// + JSON.stringify(intent.extras.RESULT_INFO);
                commandReceived(commandResult.toLowerCase());
            }

            if (intent.extras.hasOwnProperty('com.symbol.datawedge.api.RESULT_GET_VERSION_INFO')) {
                //  The version has been returned (DW 6.3 or higher).  Includes the DW version along with other subsystem versions e.g MX  
                var versionInfo = intent.extras['com.symbol.datawedge.api.RESULT_GET_VERSION_INFO'];
                console.log('Version Info: ' + JSON.stringify(versionInfo));
                var datawedgeVersion = versionInfo['DATAWEDGE'];
                datawedgeVersion = datawedgeVersion.padStart(5, "0");
                console.log("Datawedge version: " + datawedgeVersion);

                //  Fire events sequentially so the application can gracefully degrade the functionality available on earlier DW versions
                if (datawedgeVersion >= "006.3")
                    datawedge63();
                if (datawedgeVersion >= "006.4")
                    datawedge64();
                if (datawedgeVersion >= "006.5")
                    datawedge65();
            }
            else if (intent.extras.hasOwnProperty('com.symbol.datawedge.api.RESULT_ENUMERATE_SCANNERS')) {
                //  Return from our request to enumerate the available scanners
                var enumeratedScannersObj = intent.extras['com.symbol.datawedge.api.RESULT_ENUMERATE_SCANNERS'];
                enumerateScanners(enumeratedScannersObj);
            }
            else if (intent.extras.hasOwnProperty('com.symbol.datawedge.api.RESULT_GET_ACTIVE_PROFILE')) {
                //  Return from our request to obtain the active profile
                var activeProfileObj = intent.extras['com.symbol.datawedge.api.RESULT_GET_ACTIVE_PROFILE'];
                activeProfile(activeProfileObj);
            }
            else if (!intent.extras.hasOwnProperty('RESULT_INFO')) {
                //  A barcode has been scanned
                barcodeScanned(intent, new Date().toLocaleString());
            }
        }
    );
}

function unregisterBroadcastReceiver() {
    window.plugins.intentShim.unregisterBroadcastReceiver();
}

function datawedge63() {
    console.log("Datawedge 6.3 APIs are available");
    //  Create a profile for our application
    sendCommand("com.symbol.datawedge.api.CREATE_PROFILE", "ZebraCordovaDemo");
    document.getElementById('info_datawedgeVersion').innerHTML = "6.3.  Please configure profile manually.  See ReadMe for more details.";

    //  Although we created the profile we can only configure it with DW 6.4.
    sendCommand("com.symbol.datawedge.api.GET_ACTIVE_PROFILE", "");

    //  Enumerate the available scanners on the device
    sendCommand("com.symbol.datawedge.api.ENUMERATE_SCANNERS", "");

    //  Functionality of the scan button is available
    document.getElementById('scanButton').style.display = "block";
}

function datawedge64() {
    console.log("Datawedge 6.4 APIs are available");

    //  Documentation states the ability to set a profile config is only available from DW 6.4.
    //  For our purposes, this includes setting the decoders and configuring the associated app / output params of the profile.
    document.getElementById('info_datawedgeVersion').innerHTML = "6.4.";
    document.getElementById('info_datawedgeVersion').classList.remove("attention");

    //  Decoders are now available
    document.getElementById('chk_ean8').disabled = false;
    document.getElementById('chk_ean13').disabled = false;
    document.getElementById('chk_code39').disabled = false;
    document.getElementById('chk_code128').disabled = false;

    //  Configure the created profile (associated app and keyboard plugin)
    var profileConfig = {
        "PROFILE_NAME": "ZebraCordovaDemo",
        "PROFILE_ENABLED": "true",
        "CONFIG_MODE": "UPDATE",
        "PLUGIN_CONFIG": {
            "PLUGIN_NAME": "BARCODE",
            "RESET_CONFIG": "true",
            "PARAM_LIST": {}
        },
        "APP_LIST": [{
            "PACKAGE_NAME": "com.zebra.datawedgecordova",
            "ACTIVITY_LIST": ["*"]
        }]
    };
    sendCommand("com.symbol.datawedge.api.SET_CONFIG", profileConfig);

    //  Configure the created profile (intent plugin)
    var profileConfig2 = {
        "PROFILE_NAME": "ZebraCordovaDemo",
        "PROFILE_ENABLED": "true",
        "CONFIG_MODE": "UPDATE",
        "PLUGIN_CONFIG": {
            "PLUGIN_NAME": "INTENT",
            "RESET_CONFIG": "true",
            "PARAM_LIST": {
                "intent_output_enabled": "true",
                "intent_action": "com.zebra.cordovademo.ACTION",
                "intent_delivery": "2"
            }
        }
    };
    sendCommand("com.symbol.datawedge.api.SET_CONFIG", profileConfig2);

    //  Give some time for the profile to settle then query its value
    setTimeout(function () {
        sendCommand("com.symbol.datawedge.api.GET_ACTIVE_PROFILE", "");
    }, 1000);
}

function datawedge65() {
    console.log("Datawedge 6.5 APIs are available");

    document.getElementById('info_datawedgeVersion').innerHTML = "6.5 or higher.";

    //  Instruct the API to send 
    sendCommandResults = "true";
    document.getElementById('header_lastApiMessage').style.display = "block";
    document.getElementById('info_lastApiMessage').style.display = "block";
}

function commandReceived(commandText) {
    document.getElementById('info_lastApiMessage').innerHTML = commandText;
}

function enumerateScanners(enumeratedScanners) {
    var humanReadableScannerList = "";
    for (var i = 0; i < enumeratedScanners.length; i++)
    {
        console.log("Scanner found: name= " + enumeratedScanners[i].SCANNER_NAME + ", id=" + enumeratedScanners[i].SCANNER_INDEX + ", connected=" + enumeratedScanners[i].SCANNER_CONNECTION_STATE);
        humanReadableScannerList += enumeratedScanners[i].SCANNER_NAME;
        if (i < enumeratedScanners.length - 1)
            humanReadableScannerList += ", ";
    }
    document.getElementById('info_availableScanners').innerHTML = humanReadableScannerList;
}

function activeProfile(theActiveProfile) {
    document.getElementById('info_activeProfile').innerHTML = theActiveProfile;
}

function barcodeScanned(scanData, timeOfScan) {
    var scannedData = scanData.extras["com.symbol.datawedge.data_string"];
    var scannedType = scanData.extras["com.symbol.datawedge.label_type"];
    console.log("Scan: " + scannedData);
    scans.unshift({ "data": scannedData, "decoder": scannedType, "timeAtDecode": timeOfScan });
    console.log(scans);
    var scanDisplay = "";
    for (var i = 0; i < scans.length; i++)
    {
        scanDisplay += "<b><small>" + scans[i].decoder + " (" + scans[i].timeAtDecode + ")</small></b><br>" + scans[i].data + "<br><br>";
    }
    document.getElementById('scannedBarcodes').innerHTML = scanDisplay;
}
