#!/usr/bin/env node

"use strict";

const TRITS_DEPOSIT_ADDRESS  = 'DEPOSITXXX99999999999999999999999999999999999999999999999999999999999999999999999';
const TRITS_WITHDRAWAL_ADDRESS  = 'WIDTHDRAWALXXX9999999999999999999999999999999999999999999999999999999999999999999';
const TRITS_HK_DEFAULT_DATA_DIR = '/var/trits/data';
const TRITS_HK_DEFAULT_LOGS_DIR = '/var/trits/logs';
const TRITS_HK_DEFAULT_LOG_LEVEL = 'debug';

//BANK99999999999999999999999999999999999999999999999999999999999999999999999999999
//FEES99999999999999999999999999999999999999999999999999999999999999999999999999999

var storage = require('node-persist');
var request = require('request');
var express = require('express');
var winston = require('winston');
var bodyParser = require('body-parser');
var app = express();
var minimist = require('minimist');
var moment = require('moment');
var AsyncPolling = require('async-polling');
var tritsDashboard = require('./lib/dashboard.js');

var argv = minimist(process.argv.slice(2), {
    string: [ 'logs', 'port', 'data', 'logs', 'level', 'ftapi' ],
    alias: {
        h: 'help',
        t: 'test',
        p: 'port',
        d: 'data',
        l: 'logs',
        v: 'level',
        f: 'ftapi',
        r: 'fresh'
    }
});

// Defaults - can be modified with command line params, see processCommandLineArgs()

var port = 56242;
var host = "127.0.0.1";
var ft_api = 'http://127.0.0.1:56241/foo';
var data_dir = TRITS_HK_DEFAULT_DATA_DIR;
var storage_dir = data_dir + '/storage';
var logs_dir = TRITS_HK_DEFAULT_LOGS_DIR;
var logs_level = TRITS_HK_DEFAULT_LOG_LEVEL;
var test_mode = false;
var start_fresh = false;

processCommandLineArgs();

var trits_db = new tritsDashboard();
storage.initSync({
      dir: storage_dir,
      continuous: true, // Persist
    }
);

//TODO: Honor command line parameters
winston.configure({
    level: TRITS_HK_DEFAULT_LOG_LEVEL,
    transports: [
        new (winston.transports.File)({ filename: logs_dir + '/trits.log' })
    ]
});


// Load the stored dashboard

var trits_db = new tritsDashboard();

if (start_fresh) {
    winston.warn("Started with --fresh so creating a new dashboard.");
    for (var i in trits_db) {
        if (Number.isInteger(i)) {
            request.get(ftAPI + '/random', { json: true } , function (err, res, body) {
                //TODO: handle this situation properly
                if (err) {
                    winston.error("Can't connect to Foo Dashboard at " + ftAPI + '/random, exiting !');
                }
                if (body.address != false) {
                    var new_address = placeSignature(body.address,'TriNity');
                    winston.debug("Resetting game on table " + trits_db.resetGame(game_index) + ", new address is " + extractSignature(new_address));
                    trits_db.resetGame(i, new_address);
                }
            });
        }
    }
} else {
    var stored_db = storage.getItemSync('tdb');
    if ((typeof stored_db !== "object") || (stored_db === null)) {
        if (start_fresh) {
            winston.warn("Can't find any stored dasboard, started with --fresh so creating a new one");
        }
        var trits_db = new tritsDashboard();
    } else {
        winston.info("Reinstating stored dasboard");
        var trits_db = new tritsDashboard();
        for (var i in trits_db) {
            if (Number.isInteger(i)) {
                trits_db.restoreFrom(i, stored_db[i]);
            }
        }
    }
}

// Connect to FooTangle
winston.info("Connected to Foo Tangle at " + ft_api);
// Load the watermark
if (!test_mode) {
    var watermark = storage.getItemSync('watermark');
} else {
    var watermark = storage.getItemSync('watermark_test');
}

winston.debug("Loaded stored watermark at " +  formatTimestamp(watermark));

winston.debug("Inspecting dasboard for expired games");



var polling = AsyncPolling(function (end) {
    //updateDashboard();
    end(null);
    /*someAsynchroneProcess(function (error, response) {
        if (error) {
            // Notify the error:
            end(error)
            return;
        }

        // Do something with the result.

        // Then send it to the listeners:
        end(null, result);
    });*/
}, 3000);

polling.on('error', function (error) {
    // The polling encountered an error, handle it here.
});

polling.on('result', function (result) {
    // The polling yielded some result, process it here.
});

polling.run(); // Let's start polling.

var latest_timestamp = moment().format('x');
if (!test_mode) {
    storage.setItemSync('tdb', trits_db);
    storage.setItemSync('watermark', latest_timestamp);
    winston.debug("Saving watermark at " + formatTimestamp(latest_timestamp));
} else {
    storage.setItemSync('watermark_test', latest_timestamp);
}


// Router
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
var router = express.Router();
app.use('/thk', router);

// ROUTES FOR OUR API
// =============================================================================

// <-- route middleware and first route are here

// more routes for our API will happen here

// Welcome route
router.get('/', function(req, res) {
    res.json({ message: 'SUCCESS: Welcome to The Trits House Keeper API!' });
});

router.get('/dashboard', function(req, res) {
    res.json(dashboard);
});

if (test_mode) {
    router.route('/dashboard/inject').post(function(req, res) {
        console.log(req.body);
        res.json({ message: 'OK: DASHBOARD INJECTED' });
    });
}

app.listen(port,host);
if (test_mode) {
    console.log("Serving Trits dashboard in TEST MODE at http://" + host + ":" + port);
} else {
    console.log("Serving Trits dashboard at http://" + host + ":" + port);
}

process.on('SIGINT', function() {
    if (test_mode) {
        console.log("");
        console.log("Exiting the TEST mode");
        process.exit(0);
    } else {
        var latest_timestamp = moment().format('x');
        storage.setItemSync('tdb', trits_db);
        storage.setItemSync('watermark', latest_timestamp);
        console.log("Saving the dashboard.");
        console.log("Bye.");
        process.exit(0);
    }
});


/**
 *   prints usage and help message
 *
 **/

function printHelp()
{
    console.log("");
    console.log("Trits House Keeper - maintans the 23 games and their dashboard");
    console.log("");
    console.log("Usage:");
    console.log("trits-foo-tangle [--port=your_local_port] [--test]");
    console.log("  -t --test      = Run in test mode to allow local Mocha tests to pass");
    console.log("  -p --port      = Local server IP and port");
    console.log("  -h --help      = print this message");
    console.log("");
    console.log("Examples:");
    console.log("trits-foo-tangle -p 127.0.0.1:56241");
    console.log("trits-foo-tangle -t ");
    console.log("");
    process.exit(0);
};


// Helper functions

/**
 * PlaceSignature -  Add signature by replacing the beginning of the address with an arbitrary string for better readability
 * @param address - a valid address
 * @param sig - a string to replace the beginning with
 */

function placeSignature(address, sig ) {
    var tagged = sig.replace(' ', '9').toUpperCase() + '9' + address;
    return tagged.substr(0,81);
}

/**
 * extractSignature  -  Return the arbitrary string at the beginning of an address with signature and few real address letters
 * @param address - a valid address with signature
 */

function extractSignature(address) {
    var parts = address.split('9');
    return parts.shift() + ' (' + parts.shift().substr(0,3) + '...)';
}

/**
 * currentTimestamp  -  Return current tim in microseconds timestamp
 */

function currentTimestamp() {
    var now = moment();
    return now.format('x');
}

/**
 * formatTimestamp  -  Format timestamp for better readability
 */

function formatTimestamp(timestamp){
    if (timestamp === undefined) {
        var timestamp = currentTimestamp()
    }
    return moment.unix(timestamp/1000).format("MMM DD hh:mm:ss");
}

function processCommandLineArgs() {

    // h: 'help',

    if (argv.hasOwnProperty('help')) printHelp();

    // t: 'test',

    test_mode = argv.hasOwnProperty('test');

    // p: 'port',

    var port_test = 57242;

    if (test_mode) {
        port = port_test;
    }

    if (typeof argv.port === 'string'){
        var portArgs = argv.port.split(':');
        port = portArgs[1];
        host = portArgs[0];
    }
    else if (argv.port){
        port = argv.port;
    }

    //TODO: d: 'data'

    //TODO: l: 'logs'

    //TODO: v: 'level'

    //TODO: f: 'ftapi'

    if (test_mode) {
        var ft_api = 'http://127.0.0.1:57241/foo';
    } else {
        var ft_api = 'http://127.0.0.1:56241/foo';
    }

    //TODO: r: 'fresh'

    start_fresh = argv.hasOwnProperty('fresh');

}