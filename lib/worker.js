// Not a class, assumes all sorts of global variables

/*
    updateDashboard

    - resetExpired
        - foreach expired game
            - foreach bet
                - queue async bet return
            - get a new game address
            - initialize table
    - applyTransactions
        - get all unseen transactions
        - sort them by games and by time
        - foreach game
           - apply transaction
                - queue async bet returns on finished games
           - if the game is finished
                - queue async rewards
                - reset finished games
     - applyBankStrategy
     - publish dashboard

 */


async function updateDashboard(){
    await Promise.all([resetExpired(), applyTransactions()]);
    await applyBankStrategy();
}


async function resetExpired() {
    let expired_games = trits_db.getExpiredGames();
    let resets = []
    expired_games.forEach (function (game_index) {
        resets.push(resetGame(game_index));
    });
    const resolve = await Promise.all(resets);
    return resolve;
}

async function resetGame(game_index) {
    let table_name = trits_db.getTableName(i);
    const new_address = await getNewAddress();
    let signed_address = placeSignature(new_address,table_name)
    trits_db.resetGame(i,signed_address);
    // We save all used addresses
    storage.setItem(signed_address, { table: table_name, start: moment().format('x');
    return signed_address;
}

async function getNewAddress() {
    let response;
    try {
        winston.debug("Requesting new address from " + ft_api + '/random', err);
        response = await rp.get(ft_api + '/random', {json: true});
    }
    catch (err) {
        winston.error("Error getting new address in getNewAdress connecting to " + ft_api + '/random', err);
    }
    return response;
}