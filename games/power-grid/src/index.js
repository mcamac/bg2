"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
exports.__esModule = true;
var shuffle_seed_1 = require("shuffle-seed");
var STAGES = ['AUCTION', 'RESOURCES', 'CITIES', 'POWER', 'REPLENISH'];
var STATES = [
    'AUCTION_CHOOSE',
    'AUCTION_BID',
    'RESOURCES_CHOOSE',
    'CITIES_CHOOSE',
    'POWER_CHOOSE',
    'REPLENISH',
];
var PowerGrid = /** @class */ (function () {
    function PowerGrid(state) {
        // this._state = state
    }
    return PowerGrid;
}());
var RESOURCES = ['coal', 'gas', 'oil'];
exports.CARDS = [
    [3, '2C', 1],
    [4, '2C', 1],
    [5, '2G', 1],
    [6, '1O', 1],
    [7, '1C', 1],
    [8, '3GO', 2],
    [9, '3C', 2],
    [10, '2O', 2],
    [11, '0W', 1],
    [12, '2C', 2],
    [13, '1U', 2],
    [14, '1G', 2],
    [15, '1C', 2],
    [16, '2G', 3],
    [17, '0W', 2],
    [18, '2O', 3],
    [19, 'G', 3],
    [20, '3C', 4],
    [21, '1U', 3],
    [22, '3GO', 5],
    [23, '2O', 4],
    [24, '0W', 3],
    [25, '2C', 5],
    [26, '1G', 4],
    [27, '1C', 4],
    [28, '0W', 3],
    [29, '2C', 5],
    [30, '2O', 5],
    [31, '0W', 4],
    [32, '2U', 5],
    [33, '3C', 6],
    [34, '3G', 6],
    [35, '2GO', 6],
    [36, '0W', 5],
    [37, '2U', 6],
    [38, '3O', 6],
    [39, '2G', 6],
    [40, '2C', 6],
    [42, '2O', 6],
    [44, '0W', 6],
    [46, '2G', 7],
    [50, '2U', 7],
];
var MONEY_FOR_CITY_POWER = [];
var RESOURCES_PER_PHASE = [
    {
        coal: 4,
        gas: 2,
        oil: 4
    },
    {
        coal: 4,
        gas: 2,
        oil: 4
    },
    {
        coal: 4,
        gas: 2,
        oil: 4
    },
];
var getInitialDeck = function () {
    var darkCards = exports.CARDS.slice(0, 13);
    var setAsideIndex = Math.floor(Math.random() * 13);
    var setAside = darkCards[setAsideIndex];
    darkCards.splice(setAsideIndex, 1);
    var deck = shuffle_seed_1["default"](darkCards, 'k').concat(shuffle_seed_1["default"](exports.CARDS.slice(13), 'k'));
    return deck;
};
exports.getInitialState = function (players) {
    var playerState = {};
    players.forEach(function (player) {
        playerState[player] = {
            money: 50,
            plants: [],
            cities: []
        };
    });
    return {
        numPlayers: players.length,
        player: players[0],
        players: players,
        playerOrder: players,
        turn: 1,
        phase: 1,
        stage: 'AUCTION_CHOOSE',
        stageState: {
            hasPurchasedOrPassed: {}
        },
        map: {},
        resourceAvailable: {
            coal: 23,
            gas: 18,
            oil: 14,
            uranium: 2
        },
        resourcePool: {
            coal: 4,
            gas: 6,
            oil: 6,
            uranium: 10
        },
        auctioningPlants: exports.CARDS.slice(0, 8),
        playerState: playerState
    };
};
var check = function (predicate, message) {
    if (!predicate) {
        throw new Error(message);
    }
};
exports.handlers = {
    AUCTION_CHOOSE: function (state, action) {
        var next = state;
        var nextPlayer = next.playerOrder[next.playerOrder.indexOf(next.player) + 1];
        if (action.pass) {
            // Remove player
            if (!nextPlayer) {
                return __assign({}, next, { stage: 'RESOURCES_BUY', player: next.playerOrder[next.players.length - 1] });
            }
            return __assign({}, next, { player: nextPlayer });
        }
        // Player chose a plant to bid on.
        var newStageState = __assign({}, next.stageState, { auctioningPlayer: next.player });
        return __assign({}, next, { stage: 'AUCTION_BID', stageState: newStageState });
    },
    AUCTION_BID: function (state, action) {
        // pass
    },
    RESOURCES_BUY: function (state, action) {
        var player = state.playerState[action.player];
        // Check valid purchase.
        // Update player resources and resource pool.
        // let newState = set(lensPath([]))
        var totalCost = 0;
        check(totalCost <= player.money, 'Not enough money');
        RESOURCES.forEach(function (resource) {
            check(action.resources[resource] <= state.resourceAvailable[resource], 'Not enough resources');
        });
        RESOURCES.forEach(function (resource) {
            state.resourceAvailable[resource] -= action.resources[resource];
        });
        player.money -= totalCost;
        state.stageState.playersGone++;
        if (state.stageState.playersGone === state.numPlayers) {
            // Next stage.
            state.stage = 'CITIES';
            state.stageState = {
                playersGone: 0
            };
            return;
        }
    },
    CITIES: function (state, action) {
        // Check valid purchase - compute costs.
        // Modify map
        action.purchases.forEach(function (_a) {
            var city = _a[0], index = _a[1];
            state.map[city].plants[index] = action.player;
        });
        // Update stage
        state.stageState.playersGone++;
        if (state.stageState.playersGone === state.numPlayers) {
            // Next stage.
            state.stage = 'POWER';
            state.stageState.playersGone = 0;
            return;
        }
    },
    POWER: function (state, action) {
        var player = action.player;
        // Choose how many cities to power and which plants to use.
        state.stageState.playerChoice[action.player] = {
            citiesToPower: action.citiesToPower,
            resourcesToUse: action.resourcesToUse
        };
        state.stageState.playersGone++;
        state.playerState[player].money +=
            MONEY_FOR_CITY_POWER[state.stageState.playerChoice[player].citiesToPower];
        if (state.stageState.playersGone === state.numPlayers) {
            // Next stage.
        }
    },
    BUREAUCRACY: function (state) {
        var shouldReplenish = RESOURCES_PER_PHASE[state.phase];
        RESOURCES.forEach(function (resource) {
            var toReplenish = Math.min(state.resourcePool[resource], shouldReplenish[resource]);
            state.resourceAvailable[resource] += toReplenish;
            state.resourcePool[resource] -= toReplenish;
        });
        // Turn end.
        state.turn++;
    }
};
exports.handleAction = function (state, action) {
    var stage = state.stage, stageState = state.stageState;
    return exports.handlers[action.type](state, action);
};
exports["default"] = exports.handlers;
//# sourceMappingURL=index.js.map