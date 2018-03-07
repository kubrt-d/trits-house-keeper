/**
 * Created by marekt on 1.11.17.
 */
const TRITS_DEPOSIT     = 'DEPOSITXXX99999999999999999999999999999999999999999999999999999999999999999999999';
const TRITS_WITHDRAWAL  = 'WIDTHDRAWALXXX9999999999999999999999999999999999999999999999999999999999999999999';
const TRITS_NEO         = 'NEO999999999999999999999999999999999999999999999999999999999999999999999999999999';
const TRITS_TRINITY     = 'TRINITY99999999999999999999999999999999999999999999999999999999999999999999999999';
const TRITS_MORPHEUS    = 'MORPHEUS9999999999999999999999999999999999999999999999999999999999999999999999999';
const TRITS_UNKNOWN     = 'UNKNOWN99999999999999999999999999999999999999999999999999999999999999999999999999';
const TRITS_OVERSPEND   = 'OVERSPEND999999999999999999999999999999999999999999999999999999999999999999999999';
const TRITS_UNSEEN      = 'UNSEEN999999999999999999999999999999999999999999999999999999999999999999999999999';

var assert = require('assert');

var port = 56241;
var host = "127.0.0.1";

var api_root = 'http://' + host + ':' + port + '/foo';
var request = require('request');
var async = require('async');

request(api_root + '/test', { json: true }, function (err, res, body) {
    if (err || body.message == undefined) {
        console.log("Error: Can't reach " + api_root+ '/test');
        console.log("Note: You must have trits-foo-tangle service running, started with -t option on a standard port");
        console.log("Example: node index.js -t -p "+ host + ':' + port);
        process.exit(0)
    }
});
/*
describe('Trist Foo Tangle', function(){
    before(function(done) {
        request.get(api_root + '/wipe', { json: true } , function (err, res, body) {
            done();
        });
    });
    describe('Ping', function(){
        it('Should return SUCCESS: TEST OK', function (done) {
            request.get(api_root + '/test', { json: true } , function (err, res, body) {
                assert.equal(body.message,'SUCCESS: TEST OK');
                done();
            });
        });
    });

    describe('Generate Random Address', function(){
        it('Should return an address', function (done) {
            request.get(api_root + '/random', { json: true } , function (err, res, body) {
                assert.notEqual(false,body.address);
                done();
            });
        });
    });
});
*/
