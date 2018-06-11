import { getAccounts } from './ethereum';
import { getFixture } from './api';

/* a class which holds all required information for a generated bet */
export class Bet {
    constructor(id, proposerStake, accepterStake, belongsTo, acceptedBy, homeScore, awayScore, fixtureDetails, resolved, accepted, deleted) {
        this.id = id;
        this.proposerStake = proposerStake;
        this.accepterStake = accepterStake;

        this.belongsTo = belongsTo;
        this.acceptedBy = acceptedBy;

        this.fixtureDetails = fixtureDetails;

        this.homeScore = homeScore;
        this.awayScore = awayScore;

        this.resolved = resolved;
        this.accepted = accepted;
        this.deleted = deleted;
    }
}

// TODO: refactor the below
// function alreadyQueried(bet, ids) {
//     let found = ids.find(id => {
//         return id === bet.fixtureDetails.id;
//     });

//     return found !== undefined;
// }

// gets details of a fixture, either from the cache or if it isnt there by calling the API
async function getFixtureDetails(fixtureId, cachedFixtures) {
    // TODO: fix caching
    for (let i = 0; i < cachedFixtures.length; i++) {
        if (cachedFixtures[i].id === fixtureId) {
            console.log('alreadyQueried: true');
            return cachedFixtures[i];
        }
    }

    // otherwise fetch information about fixture
    let newFixStr = await getFixture(fixtureId);
    let newFixture = JSON.parse(newFixStr)["fixture"];

    return newFixture;
}

// convert bet array to bet object
export async function convertBet(betArr, web3, cachedFixtures) {
    let createBet = false;

    let resolved = betArr[8];
    let deleted = betArr[11];
    let accepted = betArr[3];

    let belongsTo = betArr[1];
    let acceptedBy = betArr[2];

    let accounts = await getAccounts(web3);
    let currentAccount = accounts[0];

    // TODO: see ethereum.js and refactor the logic in one place rather than duplicate it
    if (!deleted && !resolved) {
        if (!accepted) {
            createBet = true;
        } else if (currentAccount === belongsTo || currentAccount === acceptedBy) {
            createBet = true;
        }
    }

    if (createBet) {
        let amount = web3.fromWei(betArr[5].toNumber(), "ether");
        let amount2 = web3.fromWei(betArr[4].toNumber(), "ether");

        let homeScore = betArr[6].toNumber();
        let awayScore = betArr[7].toNumber();

        let fixtureId = betArr[9].toNumber();
        let fixtureDetails = await getFixtureDetails(fixtureId, cachedFixtures);

        let bet = new Bet(betArr[0], amount, amount2, belongsTo, acceptedBy, homeScore, awayScore, fixtureDetails, resolved, accepted, deleted);

        return bet;
    }

    return false;
};
