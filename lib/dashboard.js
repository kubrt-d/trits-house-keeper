/**
 * Created by marekt on 27.10.17.
 */

var TritsGame = require('trits-core');

const TRITS_GAME_TTL = 86400000; // Games only last one day
const TRITS_NASHS_FAV_PRIME = 23; // John Forbes Nash Jr's favourite prime number

class TritsDashboard {

    /**
     * @constructor
     * The optional board parameter is the name of the boeard this game is played on
     */
    constructor() {
        this.cities = [
                'SHANGHAI', 'BEIJING', 'DELHI', 'LAGOS', 'TIANJIN', 'KARACHI', 'ISTANBUL', 'TOKYO',
                'GUANGZHOU', 'MUMBAI', 'MOSCOW', 'SAOPAULO', 'LAHORE', 'SHENZHEN', 'JAKARTA', 'SEOUL',
                'WUHAN', 'KINSHASA', 'CAIRO', 'DHAKA', 'MEXICOCITY', 'LIMA', 'LONDON'
        ];
        this.boards = [];
        this.addresses = [];
        var i = 0;
        var dashboard = this;
        this.cities.forEach(function (board){
            dashboard.boards[i] = new TritsGame(board);
            dashboard.addresses[i] = 'null'; // addresses assigned when a new game starts
            i++;
        });
    }

    /**
     * @method getTableName(i)
     * Returns i-th table name
     */

    getTableName(i) {
        return this.cities[i];
    }

    /**
     * @method restoreFrom(i)
     * Restores game i from data
     */

    restoreFrom(i,data) {
        this.boards[i].restoreSaved(data);
    }

    /**
     * @method resetGame(i)
     * Resets the i-th game
     */
    resetGame(i, new_address){
        this.boards[i] = new TritsGame(this.cities[i]);
        this.addresses[i] = new_address;
    }

    /**
     * @method getExpiredGames(now,ttl)
     * Returns the list of indexes of expired games
     */

    getExpiredGames(){
        var out = [];
        var i;
        for (i = 0; i < TRITS_NASHS_FAV_PRIME; i++) {
            if (this.boards[i].getAge() > TRITS_GAME_TTL && this[i].boards.getLastUpdated() > TRITS_GAME_TTL) {
                out.push(i);
            }
        };
        return out;
    }
}
module.exports = TritsDashboard;