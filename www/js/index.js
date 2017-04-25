var datawedge = {
    //  Original DataWedge 6.x API Actions
    ACTION_SOFTSCANTRIGGER : "com.symbol.datawedge.api.ACTION_SOFTSCANTRIGGER",
    ACTION_SCANNERINPUTPLUGIN : "com.symbol.datawedge.api.ACTION_SCANNERINPUTPLUGIN",
    ACTION_ENUMERATESCANNERS : "com.symbol.datawedge.api.ACTION_ENUMERATESCANNERS",
    ACTION_SETDEFAULTPROFILE : "com.symbol.datawedge.api.ACTION_SETDEFAULTPROFILE",
    ACTION_RESETDEFAULTPROFILE : "com.symbol.datawedge.api.ACTION_RESETDEFAULTPROFILE",
    ACTION_SWITCHTOPROFILE : "com.symbol.datawedge.api.ACTION_SWITCHTOPROFILE",
    //  Original DataWedge 6.x API Extras
    EXTRA_PARAMETER : "com.symbol.datawedge.api.EXTRA_PARAMETER",
    EXTRA_PROFILENAME : "com.symbol.datawedge.api.EXTRA_PROFILENAME",
    //  Original DataWedge 6.x Enumerated Scanner receiver
    ACTION_ENUMERATEDLIST : "com.symbol.datawedge.api.ACTION_ENUMERATEDSCANNERLIST",
    KEY_ENUMERATEDSCANNERLIST : "DWAPI_KEY_ENUMERATEDSCANNERLIST",

    //  DataWedge 6.2 API Actions
    ACTION_DATAWEDGE : "com.symbol.datawedge.api.ACTION",
    ACTION_RESULT_DATAWEDGE : "com.symbol.datawedge.api.RESULT_ACTION",
    //  DataWedge 6.2 API Extras
    EXTRA_GET_ACTIVE_PROFILE : "com.symbol.datawedge.api.GET_ACTIVE_PROFILE",
    EXTRA_GET_PROFILES_LIST : "com.symbol.datawedge.api.GET_PROFILES_LIST",
    EXTRA_EMPTY : "",
    EXTRA_DELETE_PROFILE : "com.symbol.datawedge.api.DELETE_PROFILE",
    EXTRA_CLONE_PROFILE : "com.symbol.datawedge.api.CLONE_PROFILE",
    EXTRA_RENAME_PROFILE : "com.symbol.datawedge.api.RENAME_PROFILE",
    EXTRA_ENABLE_DATAWEDGE : "com.symbol.datawedge.api.ENABLE_DATAWEDGE",
    //  DataWedge 6.2 API Return types
    EXTRA_RESULT_GET_PROFILE_LIST : "com.symbol.datawedge.api.RESULT_GET_PROFILES_LIST",
    EXTRA_RESULT_GET_ACTIVE_PROFILE : "com.symbol.datawedge.api.RESULT_GET_ACTIVE_PROFILE"
}

var app = {
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
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        document.getElementById("scanButton").addEventListener("click", startSoftTrigger);
        document.getElementById("disableScanningButton").addEventListener("click", disableEnableScanning);
        document.getElementById("setProfileButton").addEventListener("click", setProfile);
        document.getElementById("renameProfileButton").addEventListener("click", renameProfile);
        document.getElementById('disableDataWedge').addEventListener("click", disableDataWedge);
        registerBroadcastReceiver();
        populateProfilesList();
        updateActiveProfile();
    },
    onPause: function()
    {
        console.log('Paused');
        unregisterBroadcastReceiver();
    },
    onResume: function()
    {
        console.log('Resumed');
        registerBroadcastReceiver();
        populateProfilesList();
        updateActiveProfile();
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        console.log('Received Event: ' + id);
    }
};

app.initialize();

function startSoftTrigger()
{
    var broadcastExtras = {};
    broadcastExtras[datawedge.EXTRA_PARAMETER] = 'TOGGLE_SCANNING';
    window.plugins.intentShim.sendBroadcast({
        action: datawedge.ACTION_SOFTSCANTRIGGER, 
        extras: broadcastExtras
        }, 
        function() {}, 
        function() {}
    );
}

function disableEnableScanning()
{
    var button = document.getElementById("disableScanningButton");
    var broadcastExtras = {};
    if (button.innerHTML == "Disable Scanning")
    {
        console.log("Disabling scanning");
        broadcastExtras[datawedge.EXTRA_PARAMETER] = 'DISABLE_PLUGIN';
        window.plugins.intentShim.sendBroadcast({
            action: datawedge.ACTION_SCANNERINPUTPLUGIN, 
            extras: broadcastExtras
            }, 
            function() {}, 
            function() {}
        );
        button.innerHTML = "Enable Scanning";
    }
    else
    {
        console.log("Enabling scanning");
        broadcastExtras[datawedge.EXTRA_PARAMETER] = 'ENABLE_PLUGIN';
        window.plugins.intentShim.sendBroadcast({
            action: datawedge.ACTION_SCANNERINPUTPLUGIN, 
            extras: broadcastExtras
            }, 
            function() {}, 
            function() {}
        );
        button.innerHTML = "Disable Scanning";
    }
}

function setProfile()
{
    var profile = document.getElementById('profileName').value;
    console.log("Seting profile to : " + profile);
    var broadcastExtras = {};
    broadcastExtras[datawedge.EXTRA_PROFILENAME] = profile;
    window.plugins.intentShim.sendBroadcast({
        action: datawedge.ACTION_SWITCHTOPROFILE, 
        extras: broadcastExtras
        }, 
        function() {}, 
        function() {}
    );
}

function renameProfile()
{
    var profileSelect = document.getElementById('profilesSelect');
    var selectedProfile = profileSelect.options[profileSelect.selectedIndex].value;
    var newProfileName = document.getElementById('newProfileName').value;
    console.log('Renaming profile ' + selectedProfile + ' to ' + newProfileName);
    var broadcastExtras = {};
    broadcastExtras[datawedge.EXTRA_RENAME_PROFILE] = [selectedProfile, newProfileName];
    window.plugins.intentShim.sendBroadcast({
            action: datawedge.ACTION_DATAWEDGE,
            extras: broadcastExtras
        },
        function() {},
        function() {}
    );


    //  Update the dropdown UI
    populateProfilesList();
}

function disableDataWedge()
{
    var button = document.getElementById("disableDataWedge");
    var broadcastExtras = {};
    if (button.innerHTML == "Disable DataWedge")
    {
        console.log("Disabling DataWedge");
        broadcastExtras[datawedge.EXTRA_ENABLE_DATAWEDGE] = false;
        window.plugins.intentShim.sendBroadcast({
            action: datawedge.ACTION_DATAWEDGE, 
            extras: broadcastExtras
            }, 
            function() {}, 
            function() {}
        );
        button.innerHTML = "Enable DataWedge";
    }
    else
    {
        console.log("Enabling DataWedge");
        broadcastExtras[datawedge.EXTRA_ENABLE_DATAWEDGE] = true;
        window.plugins.intentShim.sendBroadcast({
            action: datawedge.ACTION_DATAWEDGE, 
            extras: broadcastExtras
            }, 
            function() {}, 
            function() {}
        );
        button.innerHTML = "Disable DataWedge";
    }
}

function registerBroadcastReceiver()
{
    window.plugins.intentShim.registerBroadcastReceiver({
        filterActions: [
            'com.zebra.datawedgecordova.ACTION',
            datawedge.ACTION_RESULT_DATAWEDGE
            ],
        filterCategories: [
            'com.android.intent.category.DEFAULT'
            ]
        },
        function(intent) {
            //  Broadcast received
            console.log('Received Intent: ' + JSON.stringify(intent.extras));
            if (intent.extras[datawedge.EXTRA_RESULT_GET_PROFILE_LIST] != null)
            {
                console.log('Received profile list');
                var supportedProfiles = intent.extras[datawedge.EXTRA_RESULT_GET_PROFILE_LIST];
                document.getElementById('profilesSelect').options.length = 0;
                for (var i = 0; i < supportedProfiles.length; i++)
                {
                    var option = document.createElement("option");
                    option.text = supportedProfiles[i];
                    document.getElementById('profilesSelect').add(option);
                }
            }
            else if (intent.extras[datawedge.EXTRA_RESULT_GET_ACTIVE_PROFILE] != null)
            {
                console.log('Received active profile');
                document.getElementById('activeProfileData').innerHTML = "Active Profile: " + intent.extras[datawedge.EXTRA_RESULT_GET_ACTIVE_PROFILE];
            }
            else if (intent.extras["com.symbol.datawedge.data_string"] != null)
            {
                var parentElement = document.getElementById('broadcastData');
                parentElement.innerHTML = "Scan: " + intent.extras["com.symbol.datawedge.data_string"];

            }
        }
    );
}

function unregisterBroadcastReceiver()
{
    window.plugins.intentShim.unregisterBroadcastReceiver();
}

function populateProfilesList()
{
    //  Populate the list of profiles using Datawedge 6.2 API
    var broadcastExtras = {};
    broadcastExtras[datawedge.EXTRA_GET_PROFILES_LIST] = datawedge.EXTRA_EMPTY;
    window.plugins.intentShim.sendBroadcast({
            action: datawedge.ACTION_DATAWEDGE,
            extras: broadcastExtras
        },
        function() {},
        function() {}
    );
}

function updateActiveProfile()
{
    //  Populate the list of profiles using Datawedge 6.2 API
    var broadcastExtras = {};
    broadcastExtras[datawedge.EXTRA_GET_ACTIVE_PROFILE] = datawedge.EXTRA_EMPTY;
    window.plugins.intentShim.sendBroadcast({
            action: datawedge.ACTION_DATAWEDGE,
            extras: broadcastExtras
        },
        function() {},
        function() {}
    );
}