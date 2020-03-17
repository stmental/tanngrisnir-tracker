var strava = require('strava-v3')
var open = require('open');
var fs = require('fs');
var moment = require('moment');


var config = {
    accessToken: null,
    oauthCode: null
}
var configFile = 'data/userToken';

/**
 * Type 'node index.js help' to see this help
 */
var printHelp = function(){
    if (process.argv.length === 3 && process.argv[2] === 'help'){
        console.log("------------------------------------------------------------------------------------------------------");
        console.log("Quick start:")
        console.log("To run, install node (and npm)");
        console.log("Change to this directory and run 'npm install' to install the required node modules");
        console.log("This script will attempt to log a 2 minute 240 meter walk activity for every day of the current month");
        console.log("TO RUN, 'node index.js [userToken file] [number of month to log]'")
        console.log("By default the activities will be logged for the current month unless the [number of month to log] argument is supplied (1-12)")
        console.log("------------------------------------------------------------------------------------------------------");
        console.log("userToken files should be located in the /data directory.")
        console.log("If you accidentally request a new oauth code, delete the accessToken value from your userToken file, you'll need a new one generated");
        console.log("For more info on the strava API: http://strava.github.io/api/")
        console.log("For more info on the strava javascript API: https://www.npmjs.com/package/strava-v3")
        console.log("The data/strava_config file must be populated with data for the api (should come already populated, but can be changed if you have your own Strava app)")
        console.log("Below are the basics of how this can be done with curl to help explain the transactions");
        console.log("To start oauth, use this URL to authenticate for this app and get a temporary code:");
        console.log("  https://www.strava.com/oauth/authorize?client_id=17110&redirect_uri=http%3A%2F%2Flocalhost%2Ftoken_exchange.php&response_type=code&scope=view_private%2Cwrite");
        console.log("Grab the 'code' part of the resulting URL after the query string");
        console.log("This temp code is used to further authenticate to get an access token that will then be used for future queries");
        console.log("Example to get token (you need to know the app ID, secret and user's temp code), access token is returned with athlete info: ");
        console.log("    curl -X POST https://www.strava.com/oauth/token -F client_id=17110 -F client_secret=39ff78e6a8999ce07995cb16fa18d757099099b7 -F code=387cb9e06a8ffaa98ea03d58aba3058361e6c3bc ");
        console.log("Example to post an activity using the access token:");
        console.log("    curl -X POST https://www.strava.com/api/v3/activities -H 'Authorization: Bearer 59b7a8c6ee7ac820dbbd9da883f7e3275e2a1495' -d name='Walk' -d type='Walk'  -d start_date_local='2017-05-17T12:00:00Z' -d elapsed_time=60 -d distance=50");
        console.log("------------------------------------------------------------------------------------------------------");
        return true;
    }
    return false;
}

/**
 * Save the current config data (if got an access token)
 */
var saveFile = function(){
    fs.writeFile(configFile, JSON.stringify(config, null, 4));
}

/**
 * See if we have a saved user access token or oauth code
 * 
 */
var readFile = function() {
    try {
        //console.dir(process.argv);
        // All command arguments are passed in process.argv array; first two are 'node' and [script]
        // If a third argument was passed, assume it's the file name that contains just the user access token
        if (process.argv.length >= 3 && process.argv[2]){
            configFile = process.argv[2];
            // config files are stored in the data directory, so append that if it doesn't have it
            if (!configFile.startsWith('data/'))
                configFile = 'data/' + configFile;
            if (!fs.existsSync(configFile)) {
                console.log(`ERROR: Could not find file (${configFile})`);
                return;
            }
        }
        if (!fs.existsSync(configFile)) {
            saveFile();  // If file doesn't exist, create default
            return;
        }

        //console.log(`configFile: ${configFile}`)
        var myConfig = fs.readFileSync(configFile, {encoding: 'utf-8'});
        myConfig = JSON.parse(myConfig);
        //console.dir(myConfig);
        //console.log(`accessToken: ${myConfig.accessToken}`)
        //console.log(`oauthCode: ${myConfig.oauthCode}`)
        if (myConfig){
            if(myConfig.accessToken) {
                config.accessToken = myConfig.accessToken;
                // Remove any newlines
                config.accessToken = config.accessToken.replace(/(\r\n|\n|\r)/gm,"");
            }
            if(myConfig.oauthCode) {
                config.oauthCode = myConfig.oauthCode;
                config.oauthCode = config.oauthCode.replace(/(\r\n|\n|\r)/gm,"");
            }
        }
    } catch (err) {
        console.log("Possible error reading file: "+err);
        // Config file does not exist. This may be a valid case if this
        // is the first time using this
    }
};

/**
 * Log a 2 minute 240 meter walk activity for every day of the current month
 */
var logActivity = function(){
    var monthToLogAsNumber = moment().month();
    if (process.argv.length >= 4 && process.argv[3]){
        // Log activity for the passed month (1-12).  JS Dates use zero-based months, so subtract 1
        monthToLogAsNumber = parseInt(process.argv[3]) - 1;
    }
    var monthToLog  = moment([moment().year(), monthToLogAsNumber]);
    var daysInMonth = monthToLog.daysInMonth();
    var startOfMonth = monthToLog.startOf('month').add(7, 'hours');
    var activityPromises =  [];
    for(var i = 0; i < daysInMonth; i++){
        activityPromises.push = new Promise((resolve, reject) => {
            // Compute the date
            if (i > 0)
                startOfMonth.add(1, 'days')  // original is mutated
            var args = {
                'access_token': config.accessToken,
                'name': 'Walk',
                'type': 'Walk',
                'start_date_local': startOfMonth.toDate().toISOString(),
                'elapsed_time': 120,  //seconds
                'distance': 240 // meters
            };
            //console.log(args);
            var dayNum = i;
            var day = startOfMonth.format('MM/DD/YYYY')
            strava.activities.create(args, (err, payload) => {
                if (err)
                    reject();
                console.log('Successfully logged activity for day ' + day);
                resolve();
            })
        })
    }
}

var getCode = function(){
    // Don't have a code, so open browser to run OAuth
    var url = strava.oauth.getRequestAccessURL({redirect_uri:"http://localhost/token_exchange.php", scope:"view_private,write"})
    open(url);
    console.log('A new userToken file was created in the /data directory.'), 
    console.log('Login to opened URL (or copy URL below into a browser).  If you are already logged into strava from that browser,');
    console.log('the URL will open a new "localhost" page looking something like');
    console.log('http://localhost/token_exchange.php?state=&code=5673fa03e2cace79821d78d8096e42fa5f4d7768');
    console.log('Copy the part of that URL after the "code=" to the new data/userToken file, as the value for the oauthCode node')
    console.log('You may want to rename the data/userToken file');
    console.log('Then run this code again, passing the name of the userToken file (ex: node index.js data/userToken)')
    console.log(url);
}

/**
 * Have a temporary oauth code, use it to get an access token
 */
var getToken = function(){
    strava.oauth.getToken(config.oauthCode,
        function(err,payload) {
            if (payload.hasOwnProperty('errors') && !payload.hasOwnProperty('access_token')) {
                // There was an error getting token
                console.log("ERROR: could not get token");
                console.dir(payload);
                console.dir(err);
                console.log('You may try reauthorizing the app and getting a new oauth code as follows:');
                getCode();
            }else{
                config.accessToken = payload['access_token'];
                console.log(`accessToken: ${config.accessToken}`)
                saveFile();
                logActivity();
            }
        }
    );
}


// This is where the real action starts
if (printHelp())
    return;

readFile();

if (config.accessToken){
    logActivity();
}else{
    // don't have access token
    if (config.oauthCode){
        // But do have an code, so just request the token
        getToken();

    }else{
        // Don't have a token, so open browser to run OAuth
        getCode();
    }
}
