'use strict';

var express_ = require('express');
var http = require('http');
var WebSocket = require('ws');
var jwt = require('jsonwebtoken');
var lodash = require('lodash');
var handyRedis = require('handy-redis');

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */



var __assign = Object.assign || function __assign(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
    }
    return t;
};









function __awaiter(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

// const jwks = jwksClient({
//   cache: true,
//   rateLimit: true,
//   jwksRequestsPerMinute: 10, // Default value
//   jwksUri: 'https://bgz.auth0.com/.well-known/jwks.json',
// })
var publicKey = '-----BEGIN CERTIFICATE-----\nMIIC9TCCAd2gAwIBAgIJIUIi8lAitvB7MA0GCSqGSIb3DQEBCwUAMBgxFjAUBgNV\nBAMTDWJnei5hdXRoMC5jb20wHhcNMTcxMTI0MTk0ODA4WhcNMzEwODAzMTk0ODA4\nWjAYMRYwFAYDVQQDEw1iZ3ouYXV0aDAuY29tMIIBIjANBgkqhkiG9w0BAQEFAAOC\nAQ8AMIIBCgKCAQEA0t//04WrcR7wygvpS5CjGwZxTIaNlblkUO+/frEmjPFexdZE\nNPhMO22WMBl3lbHHnjiRflxbQ8dkSGs9Z65qGMwnqmG2LuJ2tWkQpib/HC49EHNx\nFl1ssdHIlzfcvlV5c6ANb4V3X2Yk7kWPfnr2BrRrrvaFLWXEJfiV8HbIIv9PW54k\nQ1ISCXcGLoHC/AUvw29tqysxjuWARN5k89OEcC5jsAQHYPg+dN7TuuhVhvESkhAT\n+pc6r8iDz6YNEnJ2fw/xDmW60fHKbtTtIoxiTTrWOz+alvzxufGw3lYUFBdFgzxH\nfVT6g8UNSkv3cQThWcWu7tIAlkO7tAWsgWSj8QIDAQABo0IwQDAPBgNVHRMBAf8E\nBTADAQH/MB0GA1UdDgQWBBRP5q2+QevyDdP78Ya6d1Qr2l+TczAOBgNVHQ8BAf8E\nBAMCAoQwDQYJKoZIhvcNAQELBQADggEBAA0QIjqGbLk3QN1RB3Ii/Rib+BaKnCLK\nR143Rc6F16hfNqtNSix1iBM8p1NcYmrb/ts9YtAzGw/QVZOhkz0kK1Y3MiLDMJeL\nFt3sigkpviKw6vcNtde2WMxLIrf6pHqVvwa/9mOZQjEt4hP2jglBsZmYJG8rRskd\nHUfeLsQtPl6egnj7nqU/QbgOuoT32YSE0g0NWKr/G78I9JI8meFWldPKBi9pU64/\np63DBEHqRH5QMdyJ72qc3aHGAQIkhARYd0cYaamtouokQcrlDK96A6+S2MeDGE+L\nlJeneacHKUDeCzSuVOs5YDuqb2SMwsGJRct1C4M5SvUaUGNUylveMQE=\n-----END CERTIFICATE-----\n';
var decodeToken = function (token) { return jwt.verify(token, publicKey, { algorithms: ['RS256'] }); };

var SocketServer = /** @class */ (function () {
    function SocketServer(server, storage) {
        this.userConnections = {};
        this.server = server;
    }
    SocketServer.prototype.setStorage = function (storage) {
        this.storage = storage;
    };
    SocketServer.prototype.start = function () {
        this.wss = new WebSocket.Server({ server: this.server });
        this.wss.on('connection', this.onConnection.bind(this));
        console.log('Started WS server.');
    };
    SocketServer.prototype.onConnection = function (ws) {
        var _this = this;
        ws.on('error', function () { return console.log('errored'); });
        ws.on('message', function (message) {
            try {
                var data = JSON.parse(message);
                _this.onData(data, ws);
            }
            catch (e) {
                console.error(e);
                return;
            }
        });
    };
    SocketServer.prototype.onData = function (data, ws) {
        if (data.type === 'token') {
            if (data.token === 'DEV') {
                ws['token'] = { email: data.email };
            }
            else {
                var decoded = decodeToken(data.token);
                ws['token'] = decoded;
            }
            ws.send(JSON.stringify({ auth: true, email: ws['token'].email }));
            this.userConnections[ws['token'].email] = ws;
            this.storage.createUser(ws['token'].email);
            console.log('Authenticated', ws['token']);
        }
        else if (ws['token']) {
            return this.onAction(data.action, data, ws);
        }
    };
    SocketServer.prototype.onAction = function (action, data, ws) {
        var room = data.room;
        var player = ws['token'].email;
        if (action === 'ROOM_JOIN') {
            this.storage.onRoomJoin(room, player);
        }
        else if (action === 'ROOM_LEAVE') {
            this.storage.onRoomLeave(room, player);
        }
        else if (action === 'ROOM_START') {
            this.storage.onRoomStart(room);
        }
        else if (action === 'ROOM_MOVE') {
            this.storage.onRoomMove(room, player, data.move);
        }
    };
    SocketServer.prototype.notifyRoom = function (room, getPlayerState) {
        var _this = this;
        console.log('room change', room.id, room.users);
        if (room && room.users) {
            room.users.filter(function (u) { return _this.userConnections[u]; }).forEach(function (u) {
                var playerRoom = __assign({}, room);
                if (room.game && getPlayerState) {
                    playerRoom.game = getPlayerState(room.game, u);
                }
                if (_this.userConnections[u].readyState === _this.userConnections[u].OPEN)
                    _this.userConnections[u].send(JSON.stringify({
                        type: 'ROOM_UPDATE',
                        room: playerRoom
                    }));
            });
        }
    };
    return SocketServer;
}());

// A library of seedable RNGs implemented in Javascript.
//
// Usage:
//
// var seedrandom = require('seedrandom');
// var random = seedrandom(1); // or any seed.
// var x = random();       // 0 <= x < 1.  Every bit is random.
// var x = random.quick(); // 0 <= x < 1.  32 bits of randomness.

// alea, a 53-bit multiply-with-carry generator by Johannes Baagøe.
// Period: ~2^116
// Reported to pass all BigCrush tests.
var alea = require('./lib/alea');

// xor128, a pure xor-shift generator by George Marsaglia.
// Period: 2^128-1.
// Reported to fail: MatrixRank and LinearComp.
var xor128 = require('./lib/xor128');

// xorwow, George Marsaglia's 160-bit xor-shift combined plus weyl.
// Period: 2^192-2^32
// Reported to fail: CollisionOver, SimpPoker, and LinearComp.
var xorwow = require('./lib/xorwow');

// xorshift7, by François Panneton and Pierre L'ecuyer, takes
// a different approach: it adds robustness by allowing more shifts
// than Marsaglia's original three.  It is a 7-shift generator
// with 256 bits, that passes BigCrush with no systmatic failures.
// Period 2^256-1.
// No systematic BigCrush failures reported.
var xorshift7 = require('./lib/xorshift7');

// xor4096, by Richard Brent, is a 4096-bit xor-shift with a
// very long period that also adds a Weyl generator. It also passes
// BigCrush with no systematic failures.  Its long period may
// be useful if you have many generators and need to avoid
// collisions.
// Period: 2^4128-2^32.
// No systematic BigCrush failures reported.
var xor4096 = require('./lib/xor4096');

// Tyche-i, by Samuel Neves and Filipe Araujo, is a bit-shifting random
// number generator derived from ChaCha, a modern stream cipher.
// https://eden.dei.uc.pt/~sneves/pubs/2011-snfa2.pdf
// Period: ~2^127
// No systematic BigCrush failures reported.
var tychei = require('./lib/tychei');

// The original ARC4-based prng included in this library.
// Period: ~2^1600
var sr = require('./seedrandom');

sr.alea = alea;
sr.xor128 = xor128;
sr.xorwow = xorwow;
sr.xorshift7 = xorshift7;
sr.xor4096 = xor4096;
sr.tychei = tychei;

module.exports = sr;


var seedrandom_ = Object.freeze({

});

var seedrandom = seedrandom_;
var seedify = function (seed) {
    if (/(number|string)/i.test(Object.prototype.toString.call(seed).match(/^\[object (.*)\]$/)[1]))
        return seed;
    if (isNaN(seed))
        return Number(String((this.strSeed = seed))
            .split('')
            .map(function (x) {
            return x.charCodeAt(0);
        })
            .join(''));
    return seed;
};
var seedRand = function (func, min, max) {
    return Math.floor(func() * (max - min + 1)) + min;
};
function shuffle(arr, seed) {
    seed = seedify(seed) || 'none';
    var size = arr.length;
    var rng = seedrandom(seed);
    var resp = [];
    var keys = [];
    for (var i = 0; i < size; i++)
        keys.push(i);
    for (var i = 0; i < size; i++) {
        var r = seedRand(rng, 0, keys.length - 1);
        var g = keys[r];
        keys.splice(r, 1);
        resp.push(arr[g]);
    }
    return resp;
}

var RESOURCE_TYPES = [
    "Money" /* Money */,
    "Steel" /* Steel */,
    "Titanium" /* Titanium */,
    "Plant" /* Plant */,
    "Energy" /* Energy */,
    "Heat" /* Heat */,
];
var GlobalType;
(function (GlobalType) {
    GlobalType["Oxygen"] = "Oxygen";
    GlobalType["Heat"] = "Heat";
    GlobalType["Oceans"] = "Oceans";
})(GlobalType || (GlobalType = {}));

var CARDS = [
    {
        name: 'Colonizer Training Camp',
        cost: 8,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Building', 'Jovian'],
        vp: 2,
        effectText: 'Oxygen must be 5% or less.',
        requires: [['MaxOxygen', 5]]
    },
    {
        name: 'Asteroid Mining Consortium',
        cost: 13,
        type: 'Automated',
        deck: 'Corporate',
        tags: ['Jovian'],
        vp: 1,
        effectText: 'Requires that you have titanium production. Decrease any titanium production 1 step and increase your own 1 step.',
        effects: [['DecreaseAnyProduction', 1, 'Titanium'], ['ChangeProduction', 1, 'Titanium']]
    },
    {
        name: 'Deep Well Heating',
        cost: 13,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Building', 'Energy'],
        effectText: 'Increase your energy production 1 step. Increase temperature 1 step.',
        effects: [['ChangeProduction', 1, "Energy" /* Energy */], ['IncreaseTemperature', 1]]
    },
    {
        name: 'Cloud Seeding',
        cost: 11,
        type: 'Automated',
        deck: 'Basic',
        effectText: 'Requires 3 ocean tiles. Decrease your MC production 1 step and any heat production 1 step.  Increase your plant production 2 steps.',
        effects: [
            ['ChangeProduction', -1, "Money" /* Money */],
            ['DecreaseAnyProduction', 1, "Heat" /* Heat */],
            ['ChangeProduction', 2, "Plant" /* Plant */],
        ],
        requires: [['MinOceans', 3]]
    },
    {
        name: 'Search For Life',
        cost: 3,
        type: 'Active',
        deck: 'Basic',
        tags: ['Science'],
        vp: ['VPIfCardHasResources', "Science" /* Science */, 1, 3],
        actionText: 'Action: Spend 1 MC to reveal and discard the top card of the draw deck. If that card has a microbe tag, add a science resource here.',
        effectText: 'Oxygen must be 6% or less. 3 VPs if you have one or more science resource here.',
        resourceHeld: "Science" /* Science */,
        requires: [['MaxOxygen', 6]],
        effects: [['SearchForLife']]
    },
    {
        name: "Inventors' Guild",
        cost: 9,
        type: 'Active',
        deck: 'Corporate',
        tags: ['Science'],
        actionText: 'Action: Look at the top card and either buy it or discard it',
        actions: [[['BuyOrDiscard']]]
    },
    {
        name: 'Martian Rail',
        cost: 13,
        type: 'Active',
        deck: 'Basic',
        tags: ['Building'],
        actionText: 'Action: Spend 1 energy to gain 1 MC for each city tile ON MARS.',
        actions: [
            [
                ['ChangeInventory', -1, "Energy" /* Energy */],
                ['ChangeInventory', ['GetCitiesOnMars'], "Money" /* Money */],
            ],
        ]
    },
    {
        name: 'Capital',
        cost: 26,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Building', 'City'],
        vp: ['CapitalCity'],
        effectText: 'Requires 4 ocean tiles. Place [the capital city] tile. Decrease your energy production 2 steps and increase your MC production 5 steps. 1 ADDITIONAL VP FOR EACH OCEAN TILE ADJACENT TO THIS CITY TILE.',
        requires: [['MinOceans', 4]],
        effects: [
            ['PlaceCapitalCity'],
            ['ChangeProduction', -2, "Energy" /* Energy */],
            ['ChangeProduction', 5, "Money" /* Money */],
        ]
    },
    {
        name: 'Asteroid',
        cost: 14,
        type: 'Event',
        deck: 'Basic',
        tags: ['Space', 'Event'],
        effectText: 'Raise temperature 1 step and gain 2 titanium. Remove up to 3 plants from any player.',
        effects: [
            ['IncreaseTemperature', 1],
            ['ChangeInventory', 2, "Titanium" /* Titanium */],
            ['DecreaseAnyInventory', 3, "Plant" /* Plant */],
        ]
    },
    {
        name: 'Comet',
        cost: 21,
        type: 'Event',
        deck: 'Basic',
        tags: ['Space', 'Event'],
        placeTiles: true,
        effectText: 'Raise temperature 1 step and place an ocean tile. Remove up to 3 plants from any player.',
        effects: [
            ['IncreaseTemperature', 1],
            ['PlaceOceans'],
            ['DecreaseAnyInventory', 3, "Plant" /* Plant */],
        ]
    },
    {
        name: 'Big Asteroid',
        cost: 27,
        type: 'Event',
        deck: 'Basic',
        tags: ['Space', 'Event'],
        effectText: 'Raise temperature 2 steps and gain 4 titanium. Remove up to 4 plants from any player.',
        effects: [
            ['IncreaseTemperature', 2],
            ['ChangeInventory', 4, "Titanium" /* Titanium */],
            ['DecreaseAnyInventory', 4, "Plant" /* Plant */],
        ]
    },
    {
        name: 'Water Import From Europa',
        cost: 25,
        type: 'Active',
        deck: 'Basic',
        tags: ['Space', 'Jovian'],
        vp: ['VPForTags', "Jovian" /* Jovian */],
        actionText: 'Action: Pay 12 MC to place an ocean tile. TITANIUM MAY BE USED as if playing a space card.',
        effectText: '1 VP for each Jovian tag you have.',
        actions: [[['MultiCost', 12, ["Titanium" /* Titanium */]], ['PlaceOceans']]]
    },
    {
        name: 'Space Elevator',
        cost: 27,
        type: 'Active',
        deck: 'Corporate',
        tags: ['Building', 'Space'],
        vp: 2,
        actionText: 'Action: Spend 1 steel to gain 5 MC',
        effectText: 'Increase your titanium production 1 step.',
        actions: [
            [['ChangeInventory', -1, "Titanium" /* Titanium */], ['ChangeInventory', 5, "Money" /* Money */]],
        ],
        effects: [['ChangeProduction', 1, "Titanium" /* Titanium */]]
    },
    {
        name: 'Development Center',
        cost: 11,
        type: 'Active',
        deck: 'Corporate',
        tags: ['Science', 'Building'],
        actionText: 'Action: Spend 1 energy to draw a card.',
        actions: [[['ChangeInventory', -1, "Energy" /* Energy */], ['Draw', 1]]]
    },
    {
        name: 'Equatorial Magnetizer',
        cost: 11,
        type: 'Active',
        deck: 'Basic',
        tags: ['Building'],
        actionText: 'Action: Decrease your energy production 1 step to increase your terraforming rating 1 step.',
        actions: [[['ChangeProduction', -1, "Energy" /* Energy */], ['IncreaseTR', 1]]]
    },
    {
        name: 'Domed Crater',
        cost: 24,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Building', 'City'],
        vp: 1,
        placeTiles: true,
        effectText: 'Oxygen must be 7% or less. Gain 3 plants and place a city tile. Decrease your energy production 1 step and increase MC production 3 steps.',
        requires: [['MaxOxygen', 7]],
        effects: [
            ['PlaceCity'],
            ['ChangeInventory', 3, "Plant" /* Plant */],
            ['ChangeProduction', -1, "Energy" /* Energy */],
            ['ChangeProduction', 3, "Money" /* Money */],
        ]
    },
    {
        name: 'Noctis City',
        cost: 18,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Building', 'City'],
        placeTiles: true,
        effectText: 'Decrease your energy production 1 step and increase your MC production 3 steps. Place a tile ON THE RESERVED AREA, disregarding normal placement restrictions.',
        effects: [
            ['ChangeProduction', -1, "Energy" /* Energy */],
            ['ChangeProduction', 3, "Money" /* Money */],
            ['PlaceNoctis'],
        ]
    },
    {
        name: 'Methane From Titan',
        cost: 28,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Space', 'Jovian'],
        vp: 2,
        effectText: 'Requires 2% oxygen. Increase your heat production 2 steps and your plant production 2 steps.',
        effects: [
            ['ChangeProduction', 2, "Heat" /* Heat */],
            ['ChangeProduction', 2, "Plant" /* Plant */],
        ],
        requires: [['MinOxygen', 2]]
    },
    {
        name: 'Imported Hydrogen',
        cost: 16,
        type: 'Event',
        deck: 'Basic',
        tags: ['Space', 'Earth', 'Event'],
        placeTiles: true,
        effectText: 'Gain 3 plants, or add 3 microbes or 2 animals to ANOTHER card. Place an ocean tile.',
        effects: [
            [
                'Choice',
                [
                    ['ChangeInventory', 3, "Plant" /* Plant */],
                    ['ChangeAnyCardResource', 3, "Microbe" /* Microbes */],
                    ['ChangeAnyCardResource', 2, 'Animals'],
                ],
            ],
            ['PlaceOceans'],
        ]
    },
    {
        name: 'Research Outpost',
        cost: 18,
        type: 'Active',
        deck: 'Basic',
        tags: ['Science', 'Building', 'City'],
        placeTiles: true,
        actionText: 'Effect: When you play a card, you pay 1 MC less for it.',
        effectText: 'Place a city tile NEXT TO NO OTHER TILE.',
        effects: [['PlaceResearchOutpost']],
        discounts: [[1]]
    },
    {
        name: 'Phobos Space Haven',
        cost: 25,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Space', 'City'],
        vp: 3,
        placeTiles: true,
        effectText: 'Increase your titanium production 1 step and place a city tile ON THE RESERVED AREA.',
        effects: [
            ['ChangeProduction', 1, "Titanium" /* Titanium */],
            ['PlaceSpecialCity', 'Phobos Space Haven'],
        ]
    },
    {
        name: 'Black Polar Dust',
        cost: 15,
        type: 'Automated',
        deck: 'Basic',
        placeTiles: true,
        effectText: 'Place an ocean tile. Decrease your MC production 2 steps and increase your heat production 3 steps.',
        effects: [
            ['PlaceOceans'],
            ['ChangeProduction', -2, "Money" /* Money */],
            ['ChangeProduction', 3, "Heat" /* Heat */],
        ]
    },
    {
        name: 'Arctic Algae',
        cost: 12,
        type: 'Active',
        deck: 'Basic',
        tags: ['Plant'],
        actionText: 'Effect: When anyone places an ocean tile, gain 2 plants.',
        effectText: 'It must be -12\u00b0C or colder to play. Gain 1 plant.',
        effects: [['ChangeInventory', 1, "Plant" /* Plant */]],
        requires: [['MaxHeat', -12]],
        afterTileTriggers: [[["ocean" /* Ocean */], [['ChangeInventory', 2, "Plant" /* Plant */]]]]
    },
    {
        name: 'Predators',
        cost: 14,
        type: 'Active',
        deck: 'Basic',
        tags: ['Animal'],
        vp: ['VPForCardResources', "Animal" /* Animals */],
        actionText: 'Action: Remove 1 animal from any card and add it to this card.',
        effectText: 'Requires 11% oxygen. 1 VP per animal on this card.',
        actions: [[['ChangeAnyCardResource', -1, "Animal" /* Animals */], ['ChangeCardResource', 1]]],
        resourceHeld: "Animal" /* Animals */,
        requires: [['MinOxygen', 11]]
    },
    {
        name: 'Space Station',
        cost: 10,
        type: 'Active',
        deck: 'Corporate',
        tags: ['Space'],
        vp: 1,
        actionText: 'Effect: When you play a space card, you pay 2 MC less for it.',
        discounts: [[2, ["Space" /* Space */]]]
    },
    {
        name: 'Eos Chasma National Park',
        cost: 16,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Building', 'Plant'],
        vp: 1,
        effectText: 'Requires -12C  or warmer. Add 1 animal TO ANY ANIMAL CARD. Gain 3 plants. Increase your MC production 2 steps.',
        effects: [
            ['ChangeAnyCardResource', 1, "Animal" /* Animals */],
            ['ChangeInventory', 3, "Plant" /* Plant */],
            ['ChangeProduction', 2, "Money" /* Money */],
        ],
        requires: [['MinHeat', -12]]
    },
    {
        name: 'Interstellar Colony Ship',
        cost: 24,
        type: 'Event',
        deck: 'Corporate',
        tags: ['Space', 'Earth', 'Event'],
        vp: 4,
        effectText: 'Requires 5 science tags.',
        requires: [['HasTags', 5, "Science" /* Science */]]
    },
    {
        name: 'Security Fleet',
        cost: 12,
        type: 'Active',
        deck: 'Corporate',
        tags: ['Space'],
        vp: ['VPForCardResources', "Fighters" /* Fighters */],
        actionText: 'Action: Spend 1 titanium to add 1 fighter resource to this card.',
        effectText: '1 VP for each fighter resource on this card.',
        actions: [[['ChangeInventory', -1, "Titanium" /* Titanium */], ['ChangeCardResource', 1]]],
        resourceHeld: "Fighters" /* Fighters */
    },
    {
        name: 'Cupola City',
        cost: 16,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Building', 'City'],
        placeTiles: true,
        effectText: 'Oxygen must be 9% or less. Place a city tile. Decrease your energy production 1 step and increase your MC production 3 steps.',
        effects: [
            ['PlaceCity'],
            ['ChangeProduction', -1, "Energy" /* Energy */],
            ['ChangeProduction', 3, "Money" /* Money */],
        ],
        requires: [['MaxOxygen', 9]]
    },
    {
        name: 'Lunar Beam',
        cost: 13,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Earth', 'Energy'],
        effectText: 'Decrease your MC production 2 steps and increase your heat production and energy production 2 steps each.',
        effects: [
            ['ChangeProduction', -2, "Money" /* Money */],
            ['ChangeProduction', 2, "Heat" /* Heat */],
            ['ChangeProduction', 2, "Energy" /* Energy */],
        ]
    },
    {
        name: 'Optimal Aerobraking',
        cost: 7,
        type: 'Active',
        deck: 'Basic',
        tags: ['Space'],
        actionText: 'Effect: When you place a space event, you gain 3 MC and 3 heat.',
        afterCardTriggers: [
            ['PlayedTagMatches', [["Space" /* Space */]]],
            [['ChangeInventory', 3, "Money" /* Money */], ['ChangeInventory', 3, "Heat" /* Heat */]],
        ]
    },
    {
        name: 'Underground City',
        cost: 18,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Building', 'City'],
        placeTiles: true,
        effectText: 'Place a city tile. Decrease your energy production 2 steps and increase your steel production 2 steps.',
        effects: [
            ['PlaceCity'],
            ['ChangeProduction', -2, "Energy" /* Energy */],
            ['ChangeProduction', 2, "Steel" /* Steel */],
        ]
    },
    {
        name: 'Regolith Eaters',
        cost: 13,
        type: 'Active',
        deck: 'Basic',
        tags: ['Science', 'Microbe'],
        actionText: 'Action: Add 1 microbe to this card, or remove 2 microbe from this card to raise oxygen level 1 step.',
        actions: [[['ChangeCardResource', 1]], [['ChangeCardResource', -2], ['RaiseOxygen', 1]]],
        resourceHeld: "Microbe" /* Microbes */
    },
    {
        name: 'GHG Producing Bacteria',
        cost: 8,
        type: 'Active',
        deck: 'Basic',
        tags: ['Science', 'Microbe'],
        actionText: 'Action: Add 1 microbe to this card, or remove 2 microbes to raise temperature 1 step.',
        actions: [
            [['ChangeCardResource', 1]],
            [['ChangeCardResource', -2], ['IncreaseTemperature', 1]],
        ],
        effectText: 'Requires 4% oxygen.',
        resourceHeld: "Microbe" /* Microbes */,
        requires: [['MinOxygen', 4]]
    },
    {
        name: 'Ants',
        cost: 9,
        type: 'Active',
        deck: 'Basic',
        tags: ['Microbe'],
        vp: ['VPForCardResources', "Microbe" /* Microbes */, 2],
        actionText: 'Action: Remove 1 microbe from any card to add 1 to this card.',
        effectText: 'Requires 4% oxygen. 1 VP per 2 microbes on this card.',
        resourceHeld: "Microbe" /* Microbes */,
        actions: [[['ChangeAnyCardResource', -1, "Microbe" /* Microbes */], ['ChangeCardResource', 1]]],
        requires: [['MinOxygen', 4]]
    },
    {
        name: 'Release of Inert Gases',
        cost: 14,
        type: 'Event',
        deck: 'Basic',
        tags: ['Event'],
        effectText: 'Raise your terraform rating 2 steps.',
        effects: [['IncreaseTR', 2]]
    },
    {
        name: 'Nitrogen-Rich Asteroid',
        cost: 31,
        type: 'Event',
        deck: 'Basic',
        tags: ['Science', 'Event'],
        effectText: 'Raise your terraforming rating 2 steps and temperature 1 step. Increase your plant production 1 step, or 4 steps if you have 3 plant tags.',
        effects: [
            ['IncreaseTR', 2],
            ['IncreaseTemperature', 1],
            [
                'Branch',
                ['HasTags', 3, "Plant" /* Plant */],
                [['ChangeProduction', 4, "Plant" /* Plant */]],
                [['ChangeProduction', 1, "Plant" /* Plant */]],
            ],
        ]
    },
    {
        name: 'Rover Construction',
        cost: 8,
        type: 'Active',
        deck: 'Basic',
        tags: ['Building'],
        vp: 1,
        actionText: 'Effect: When any city tile is placed, gain 2 MC',
        afterTileTriggers: [[["city" /* City */], [['ChangeInventory', 2, "Money" /* Money */]]]]
    },
    {
        name: 'Deimos Down',
        cost: 31,
        type: 'Event',
        deck: 'Basic',
        tags: ['Space', 'Event'],
        effectText: 'Raise temperature 3 steps and gain 4 steel. Remove up to 8 plants from any player.',
        effects: [
            ['IncreaseTemperature', 3],
            ['ChangeInventory', 4, "Steel" /* Steel */],
            ['DecreaseAnyInventory', 8, "Plant" /* Plant */],
        ]
    },
    {
        name: 'Asteroid Mining',
        cost: 30,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Space', 'Jovian'],
        vp: 2,
        effectText: 'Increase your titanium production 2 steps.',
        effects: [['ChangeProduction', 2, "Titanium" /* Titanium */]]
    },
    {
        name: 'Food Factory',
        cost: 12,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Building'],
        vp: 1,
        effectText: 'Decrease your plant production 1 step and increase your MC production 4 steps.',
        effects: [
            ['ChangeProduction', -1, "Plant" /* Plant */],
            ['ChangeProduction', 4, "Money" /* Money */],
        ]
    },
    {
        name: 'Archaebacteria',
        cost: 6,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Microbe'],
        effectText: 'It must be -18\u00b0C or colder. Increase your plant production 1 step.',
        effects: [['ChangeProduction', 1, "Plant" /* Plant */]],
        requires: [['MaxHeat', -18]]
    },
    {
        name: 'Carbonate Processing',
        cost: 6,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Building'],
        effectText: 'Decrease your energy production 1 step and increase your heat production 3 steps.',
        effects: [
            ['ChangeProduction', -1, "Energy" /* Energy */],
            ['ChangeProduction', 3, "Heat" /* Heat */],
        ]
    },
    {
        name: 'Natural Preserve',
        cost: 9,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Science', 'Building'],
        vp: 1,
        placeTiles: true,
        effectText: 'Oxygen must be 4% or less. Place this tile NEXT TO NO OTHER TILE. Increase your MC production 1 step.',
        requires: [['MaxOxygen', 4]],
        effects: [['PlaceNaturalPreserve'], ['ChangeProduction', 1, "Money" /* Money */]]
    },
    {
        name: 'Nuclear Power',
        cost: 10,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Building', 'Energy'],
        effectText: 'Decrease your MC production 2 steps and increase your energy production 3 steps.',
        effects: [
            ['ChangeProduction', -2, "Money" /* Money */],
            ['ChangeProduction', 3, "Energy" /* Energy */],
        ]
    },
    {
        name: 'Lightning Harvest',
        cost: 8,
        type: 'Automated',
        deck: 'Corporate',
        tags: ['Energy'],
        vp: 1,
        effectText: 'Requires 3 science tags. Increase your energy production and your MC production 1 step each.',
        effects: [
            ['ChangeProduction', 1, "Energy" /* Energy */],
            ['ChangeProduction', 1, "Money" /* Money */],
        ],
        requires: [['HasTags', 3, "Science" /* Science */]]
    },
    {
        name: 'Algae',
        cost: 10,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Plant'],
        effectText: 'Requires 5 ocean tiles. Gain 1 plant and increase your plant production 2 steps.',
        effects: [
            ['ChangeInventory', 1, "Plant" /* Plant */],
            ['ChangeProduction', 2, "Plant" /* Plant */],
        ],
        requires: [['MinOceans', 5]]
    },
    {
        name: 'Adapted Lichen',
        cost: 9,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Plant'],
        effectText: 'Increase your plant production 1 step.',
        effects: [['ChangeProduction', 1, "Plant" /* Plant */]]
    },
    {
        name: 'Tardigrades',
        cost: 4,
        type: 'Active',
        deck: 'Corporate',
        tags: ['Microbe'],
        vp: ['VPForCardResources', "Microbe" /* Microbes */, 4],
        actionText: 'Action: Add 1 microbe to this card.',
        effectText: '1 VP per 4 microbes on this card.',
        actions: [[['ChangeCardResource', 1]]],
        resourceHeld: "Microbe" /* Microbes */
    },
    {
        name: 'Virus',
        cost: 1,
        type: 'Event',
        deck: 'Corporate',
        tags: ['Microbe', 'Event'],
        effectText: 'Remove up to 2 animals or 5 plants from any player.',
        effects: [
            [
                'Choice',
                [
                    ['ChangeAnyCardResource', 2, "Animal" /* Animals */],
                    ['DecreaseAnyInventory', 5, "Plant" /* Plant */],
                ],
            ],
        ]
    },
    {
        name: 'Miranda Resort',
        cost: 12,
        type: 'Automated',
        deck: 'Corporate',
        tags: ['Space', 'Jovian'],
        vp: 1,
        effectText: 'Increase your MC production 1 step for each Earth tag you have.',
        effects: [['ChangeProduction', ['GetTags', "Earth" /* Earth */], "Money" /* Money */]]
    },
    {
        name: 'Fish',
        cost: 9,
        type: 'Active',
        deck: 'Basic',
        tags: ['Animal'],
        vp: ['VPForCardResources', "Animal" /* Animals */],
        actionText: 'Action: Add 1 animal to this card.',
        effectText: 'Requires 2\u00b0C or warmer. Decrease any plant production 1 step. 1 VP for each animal on this card.',
        actions: [[['ChangeCardResource', 1]]],
        effects: [['DecreaseAnyProduction', 1, "Plant" /* Plant */]],
        resourceHeld: "Animal" /* Animals */,
        requires: [['MinHeat', 2]]
    },
    {
        name: 'Lake Marineris',
        cost: 18,
        type: 'Automated',
        deck: 'Basic',
        vp: 2,
        placeTiles: true,
        effectText: 'Requires 0\u00b0C or warmer. Place 2 ocean tiles.',
        requires: [['MinHeat', 0]],
        effects: [['PlaceOceans'], ['PlaceOceans']]
    },
    {
        name: 'Small Animals',
        cost: 6,
        type: 'Active',
        deck: 'Basic',
        tags: ['Animal'],
        vp: ['VPForCardResources', "Animal" /* Animals */, 2],
        actionText: 'Action: Add 1 animal to this card.',
        effectText: 'Requires 6% oxygen. Decrease any plant production 1 step. 1 VP per 2 animals on this card.',
        actions: [[['ChangeCardResource', 1]]],
        effects: [['DecreaseAnyProduction', 1, "Plant" /* Plant */]],
        resourceHeld: "Animal" /* Animals */,
        requires: [['MinOxygen', 6]]
    },
    {
        name: 'Kelp Farming',
        cost: 17,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Plant'],
        vp: 1,
        effectText: 'Requires 6 ocean tiles. Increase your MC production 2 steps and your plant production 3 steps. Gain 2 plants.',
        effects: [
            ['ChangeProduction', 2, "Money" /* Money */],
            ['ChangeProduction', 3, "Plant" /* Plant */],
            ['ChangeInventory', 2, "Plant" /* Plant */],
        ],
        requires: [['MinOceans', 6]]
    },
    {
        name: 'Mine',
        cost: 4,
        type: 'Automated',
        deck: 'Corporate',
        tags: ['Building'],
        effectText: 'Increase your steel production 1 step.',
        effects: [['ChangeProduction', 1, "Steel" /* Steel */]]
    },
    {
        name: 'Vesta Shipyard',
        cost: 15,
        type: 'Automated',
        deck: 'Corporate',
        tags: ['Space', 'Jovian'],
        vp: 1,
        effectText: 'Increase your titanium production 1 step.',
        effects: [['ChangeProduction', 1, "Titanium" /* Titanium */]]
    },
    {
        name: 'Beam From a Thorium Asteroid',
        cost: 32,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Space', 'Jovian', 'Energy'],
        vp: 1,
        effectText: 'Requires a Jovian tag. Increase your heat production and energy production 3 steps each.',
        effects: [
            ['ChangeProduction', 3, "Heat" /* Heat */],
            ['ChangeProduction', 3, "Energy" /* Energy */],
        ],
        requires: [['HasTags', 1, "Jovian" /* Jovian */]]
    },
    {
        name: 'Mangrove',
        cost: 12,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Plant'],
        vp: 1,
        placeTiles: true,
        effectText: 'Requires +4\u00b0C or warmer. Place a Greenery tile ON AN AREA RESERVED FOR OCEAN and raise oxygen 1 step. Disregard normal placement restrictions for this.',
        effects: [['PlaceGreeneryOnOcean']],
        requires: [['MinHeat', 4]]
    },
    {
        name: 'Trees',
        cost: 13,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Plant'],
        vp: 1,
        effectText: 'Requires -4\u00b0C or warmer. Increase your plant production 3 steps. Gain 1 plant.',
        effects: [
            ['ChangeProduction', 3, "Plant" /* Plant */],
            ['ChangeInventory', 1, "Plant" /* Plant */],
        ],
        requires: [['MinHeat', -4]]
    },
    {
        name: 'Great Escarpment Consortium',
        cost: 6,
        type: 'Automated',
        deck: 'Corporate',
        effectText: 'Requires that you have steel production. Decrease any steel production 1 step and increase your own 1 step',
        effects: [
            ['DecreaseAnyProduction', 1, "Steel" /* Steel */],
            ['ChangeProduction', 1, "Steel" /* Steel */],
        ]
    },
    {
        name: 'Mineral Deposit',
        cost: 5,
        type: 'Event',
        deck: 'Corporate',
        tags: ['Event'],
        effectText: 'Gain 5 steel.',
        effects: [['ChangeInventory', 5, "Steel" /* Steel */]]
    },
    {
        name: 'Mining Expedition',
        cost: 12,
        type: 'Event',
        deck: 'Basic',
        tags: ['Event'],
        effectText: 'Raise oxygen 1 step. Remove 2 plants from any player. Gain 2 steel.',
        effects: [
            ['RaiseOxygen', 1],
            ['DecreaseAnyInventory', 2, "Plant" /* Plant */],
            ['ChangeInventory', 2, "Steel" /* Steel */],
        ]
    },
    {
        name: 'Mining Area',
        cost: 4,
        type: 'Automated',
        deck: 'Corporate',
        tags: ['Building'],
        placeTiles: true,
        effectText: 'Place [the mining] tile on an area with a steel or titanium placement bonus, adjacent to another of your tiles. Increase your production of that resource 1 step.',
        effects: [['PlaceMiningArea']]
    },
    {
        name: 'Building Industries',
        cost: 6,
        type: 'Automated',
        deck: 'Corporate',
        tags: ['Building'],
        effectText: 'Decrease your energy production 1 step and increase your steel production 2 steps.',
        effects: [
            ['ChangeProduction', 1, "Energy" /* Energy */],
            ['ChangeProduction', 2, "Steel" /* Steel */],
        ]
    },
    {
        name: 'Land Claim',
        cost: 1,
        type: 'Event',
        deck: 'Corporate',
        tags: ['Event'],
        effectText: 'Place your marker on a non-reserved area. Only you may place a tile here',
        effects: [['LandClaim']]
    },
    {
        name: 'Mining Rights',
        cost: 9,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Building'],
        effectText: 'Place [the mining] tile on an area with a steel or titanium placement bonus. Increase that production 1 step.',
        effects: [['PlaceMiningRights']]
    },
    {
        name: 'Sponsors',
        cost: 6,
        type: 'Automated',
        deck: 'Corporate',
        tags: ['Earth'],
        effectText: 'Increase your MC production 2  steps.',
        effects: [['ChangeProduction', 2, "Money" /* Money */]]
    },
    {
        name: 'Electro Catapult',
        cost: 17,
        type: 'Active',
        deck: 'Corporate',
        tags: ['Building'],
        vp: 1,
        actionText: 'Action: Spend 1 plant or 1 steel to gain 7 MC',
        effectText: 'Oxygen must be 8% or less. Decrease your energy production 1 step.',
        effects: [['ChangeProduction', -1, "Energy" /* Energy */]],
        actions: [
            [
                [
                    'Choice',
                    [['ChangeInventory', 1, "Plant" /* Plant */], ['ChangeInventory', 1, "Steel" /* Steel */]],
                ],
                ['ChangeInventory', 7, "Money" /* Money */],
            ],
        ],
        requires: [['MaxOxygen', 8]]
    },
    {
        name: 'Earth Catapult',
        cost: 23,
        type: 'Active',
        deck: 'Corporate',
        tags: ['Earth'],
        vp: 2,
        actionText: 'Effect: when you play a card, you pay 2 MC less for it.',
        discounts: [[2]]
    },
    {
        name: 'Advanced Alloys',
        cost: 9,
        type: 'Active',
        deck: 'Corporate',
        tags: ['Science'],
        actionText: 'Effect: Each titanium you have is worth 1MC extra. Each steel you have is worth 1 MC extra.',
        effects: [
            ['IncreaseResourceValue', 1, "Steel" /* Steel */],
            ['IncreaseResourceValue', 1, "Titanium" /* Titanium */],
        ]
    },
    {
        name: 'Birds',
        cost: 10,
        type: 'Active',
        deck: 'Basic',
        tags: ['Animal'],
        vp: ['VPForCardResources', "Animal" /* Animals */],
        actionText: 'Action: Add an animal to this card.',
        effectText: 'Requires 13% oxygen. Decrease any plant production 2 steps. 1 VP for each animal on this card',
        actions: [[['ChangeCardResource', 1]]],
        effects: [['DecreaseAnyProduction', 2, "Plant" /* Plant */]],
        resourceHeld: "Animal" /* Animals */,
        requires: [['MinOxygen', 13]]
    },
    {
        name: 'Mars University',
        cost: 8,
        type: 'Active',
        deck: 'Corporate',
        tags: ['Science', 'Building'],
        vp: 1,
        actionText: 'Effect: When you play a science tag, including this, you may discard a card from hand to draw a card.',
        afterCardTriggers: [
            ['PlayedTagMatches', [["Science" /* Science */]]],
            [['Option', [['Discard', 1], ['Draw', 1]]]],
        ]
    },
    {
        name: 'Viral Enhancers',
        cost: 9,
        type: 'Active',
        deck: 'Corporate',
        tags: ['Science', 'Microbe'],
        actionText: 'Effect: When you play a plant, microbe, or an animal tag, including this, gain 1 plant or add 1 resource TO THAT CARD.',
        afterCardTriggers: [
            ['PlayedTagMatches', [["Plant" /* Plant */], ["Microbe" /* Microbe */], ["Animal" /* Animal */]]],
            [['Choice', [['ChangeInventory', 1, "Plant" /* Plant */], ['ChangePlayedCardResource', 1]]]],
        ]
    },
    {
        name: 'Towing a Comet',
        cost: 23,
        type: 'Event',
        deck: 'Basic',
        tags: ['Space', 'Event'],
        placeTiles: true,
        effectText: 'Gain 2 plants. Raise oxygen level 1 step and place an ocean tile.',
        effects: [['ChangeInventory', 2, "Plant" /* Plant */], ['RaiseOxygen', 1], ['PlaceOceans']]
    },
    {
        name: 'Space Mirrors',
        cost: 3,
        type: 'Active',
        deck: 'Basic',
        tags: ['Space', 'Energy'],
        actionText: 'Action: Spend 7MC to increase your energy production 1 step.',
        actions: [
            [['ChangeInventory', -7, "Money" /* Money */], ['ChangeProduction', 1, "Energy" /* Energy */]],
        ]
    },
    {
        name: 'Solar Wind Power',
        cost: 11,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Science', 'Space', 'Energy'],
        effectText: 'Increase your energy production 1 step and gain 2 titanium.',
        effects: [
            ['ChangeProduction', 1, "Energy" /* Energy */],
            ['ChangeInventory', 2, "Titanium" /* Titanium */],
        ]
    },
    {
        name: 'Ice Asteroid',
        cost: 23,
        type: 'Event',
        deck: 'Basic',
        tags: ['Space', 'Event'],
        placeTiles: true,
        effectText: 'Place 2 ocean tiles.',
        effects: [['PlaceOceans'], ['PlaceOceans']]
    },
    {
        name: 'Quantum Extractor',
        cost: 13,
        type: 'Active',
        deck: 'Corporate',
        tags: ['Science', 'Energy'],
        actionText: 'Effect: When you play a space card, you pay 2 MC less for it',
        discounts: [[2, ["Space" /* Space */]]],
        requires: [['HasTags', 4, "Science" /* Science */]]
    },
    {
        name: 'Giant Ice Asteroid',
        cost: 36,
        type: 'Event',
        deck: 'Basic',
        tags: ['Space', 'Event'],
        placeTiles: true,
        effectText: 'Raise temperature 2 steps and place 2 ocean tiles. Remove up to 6 plants from any plyer.',
        effects: [
            ['IncreaseTemperature', 2],
            ['PlaceOceans'],
            ['PlaceOceans'],
            ['DecreaseAnyProduction', 6, "Plant" /* Plant */],
        ]
    },
    {
        name: 'Ganymede Colony',
        cost: 20,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Space', 'City', 'Jovian'],
        vp: ['VPForTags', "Jovian" /* Jovian */],
        placeTiles: true,
        effectText: 'Place a city tile ON THE RESERVED AREA [for Ganymede Colony]. 1 VP per Jovian tag you have.',
        effects: [['PlaceSpecialCity', 'Ganymede Colony']]
    },
    {
        name: 'Callisto Penal Mines',
        cost: 24,
        type: 'Automated',
        deck: 'Corporate',
        tags: ['Space', 'Jovian'],
        vp: 2,
        effectText: 'Increase your MC production 3 steps.',
        effects: [['ChangeProduction', 3, "Money" /* Money */]]
    },
    {
        name: 'Giant Space Mirror',
        cost: 17,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Space', 'Energy'],
        effectText: 'Increase your energy production 3 steps.',
        effects: [['ChangeProduction', 3, "Energy" /* Energy */]]
    },
    {
        name: 'Trans-Neptune Probe',
        cost: 6,
        type: 'Automated',
        deck: 'Corporate',
        tags: ['Science', 'Space'],
        vp: 1
    },
    {
        name: 'Commercial District',
        cost: 16,
        type: 'Automated',
        deck: 'Corporate',
        tags: ['Building'],
        vp: ['CommericalDistrict'],
        placeTiles: true,
        effectText: 'Decrease your energy production 1 step and increase your MC production 4 steps. Place [the commercial district] tile. 1 VP PER ADJACENT CITY TILE.',
        effects: [
            ['ChangeProduction', -1, "Energy" /* Energy */],
            ['ChangeProduction', 4, "Money" /* Money */],
            ['PlaceCommercialDistrict'],
        ]
    },
    {
        name: 'Robotic Workforce',
        cost: 9,
        type: 'Automated',
        deck: 'Corporate',
        tags: ['Science'],
        effectText: 'Duplicate only the production box of one of your building cards.',
        effects: [['RoboticWorkforce']],
        todo: true
    },
    {
        name: 'Grass',
        cost: 11,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Plant'],
        effectText: 'Requires -16\u00b0C or warmer. Increase your plant production 1 step. Gain 3 plants.',
        effects: [
            ['ChangeProduction', 1, "Plant" /* Plant */],
            ['ChangeInventory', 3, "Plant" /* Plant */],
        ],
        requires: [['MinHeat', -16]]
    },
    {
        name: 'Heather',
        cost: 6,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Plant'],
        effectText: 'Requires -14\u00b0C or warmer. Increase your plant production 1 step. Gain 1 plant.',
        effects: [
            ['ChangeProduction', 1, "Plant" /* Plant */],
            ['ChangeInventory', 1, "Plant" /* Plant */],
        ],
        requires: [['MinHeat', -14]]
    },
    {
        name: 'Peroxide Power',
        cost: 7,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Building', 'Energy'],
        effectText: 'Decrease your MC production 1 step and increase your energy production 2 steps.',
        effects: [
            ['ChangeProduction', -1, "Money" /* Money */],
            ['ChangeInventory', 2, "Energy" /* Energy */],
        ]
    },
    {
        name: 'Research',
        cost: 11,
        type: 'Automated',
        deck: 'Corporate',
        tags: ['Science', 'Science'],
        vp: 2,
        effectText: 'Counts as playing 2 science cards. Draw 2 cards.',
        effects: [['Draw', 2]]
    },
    {
        name: 'Gene Repair',
        cost: 12,
        type: 'Automated',
        deck: 'Corporate',
        tags: ['Science'],
        vp: 2,
        effectText: 'Requires 3 science tags. Increase your MC production 2 steps.',
        effects: [['ChangeProduction', 2, "Money" /* Money */]],
        requires: [['HasTags', 3, "Science" /* Science */]]
    },
    {
        name: 'Io Mining Industries',
        cost: 41,
        type: 'Automated',
        deck: 'Corporate',
        tags: ['Space', 'Jovian'],
        vp: ['VPForTags', "Jovian" /* Jovian */],
        effectText: 'Increase your titanium production 2 steps and your MC production 2 steps. 1 VP per Jovian tag you have.',
        effects: [
            ['ChangeProduction', 2, "Titanium" /* Titanium */],
            ['ChangeProduction', 2, "Money" /* Money */],
        ]
    },
    {
        name: 'Bushes',
        cost: 10,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Plant'],
        effectText: 'Requires -10\u00b0C or warmer. Increase your plant production 2 steps. Gain 2 plants.',
        effects: [
            ['ChangeProduction', 2, "Plant" /* Plant */],
            ['ChangeInventory', 2, "Plant" /* Plant */],
        ],
        requires: [['MinHeat', -10]]
    },
    {
        name: 'Mass Converter',
        cost: 8,
        type: 'Active',
        deck: 'Corporate',
        tags: ['Science', 'Energy'],
        actionText: 'Effect: When you play a space card, you pay 2 MC less for it.',
        effectText: 'Requires 5 science tags. Increase your energy production 6 steps.',
        discounts: [[2, ["Space" /* Space */]]],
        effects: [['ChangeProduction', 6, "Energy" /* Energy */]],
        requires: [['HasTags', 5, "Science" /* Science */]]
    },
    {
        name: 'Physics Complex',
        cost: 12,
        type: 'Active',
        deck: 'Corporate',
        tags: ['Science', 'Building'],
        vp: ['VPForCardResources', "Science" /* Science */, 0.5],
        actionText: 'Action: Spend 6 energy to add a science resource to this card.',
        effectText: '2 VP for each science resource on this card.',
        actions: [[['ChangeInventory', -6, "Energy" /* Energy */], ['ChangeCardResource', 1]]],
        resourceHeld: "Science" /* Science */
    },
    {
        name: 'Greenhouses',
        cost: 6,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Building', 'Plant'],
        effectText: 'Gain 1 plant for each city tile in play.',
        effects: [['ChangeInventory', ['GetCities'], "Plant" /* Plant */]]
    },
    {
        name: 'Nuclear Zone',
        cost: 10,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Earth'],
        vp: -2,
        effectText: 'Place [the nuclear zone] tile and raise the temperature 2 steps.',
        effects: [['PlaceNuclearZone'], ['IncreaseTemperature', 2]]
    },
    {
        name: 'Tropical Resort',
        cost: 13,
        type: 'Automated',
        deck: 'Corporate',
        tags: ['Building'],
        vp: 2,
        effectText: 'Decrease your heat production 2 steps and increase your MC production 3 steps.',
        effects: [
            ['ChangeProduction', -2, "Heat" /* Heat */],
            ['ChangeProduction', 3, "Money" /* Money */],
        ]
    },
    {
        name: 'Toll Station',
        cost: 12,
        type: 'Automated',
        deck: 'Corporate',
        tags: ['Space'],
        effectText: 'Increase your MC production 1 step for each space tag your OPPONENTS have.',
        effects: [['ChangeProduction', ['GetOpponentTags', "Space" /* Space */], "Money" /* Money */]]
    },
    {
        name: 'Fueled Generators',
        cost: 1,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Building', 'Energy'],
        effectText: 'Decrease your MC production 1 step and increase your energy production 1 step.',
        effects: [
            ['ChangeProduction', -1, "Money" /* Money */],
            ['ChangeProduction', 1, "Energy" /* Energy */],
        ]
    },
    {
        name: 'Ironworks',
        cost: 11,
        type: 'Active',
        deck: 'Basic',
        tags: ['Building'],
        actionText: 'Action: Spend 4 energy to gain 1 steel and increase oxygen 1 step.',
        actions: [
            [
                ['ChangeInventory', -4, "Energy" /* Energy */],
                ['ChangeInventory', 1, "Steel" /* Steel */],
                ['RaiseOxygen', 1],
            ],
        ]
    },
    {
        name: 'Power Grid',
        cost: 18,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Energy'],
        effectText: 'Increase your energy production 1 step for each power tag you have, including this.)',
        effects: [['ChangeProduction', ['GetTags', "Power" /* Power */], "Energy" /* Energy */]]
    },
    {
        name: 'Steelworks',
        cost: 15,
        type: 'Active',
        deck: 'Basic',
        tags: ['Building'],
        actionText: 'Action: Spend 4 energy to gain 2 steel and increase oxygen 1 step.',
        actions: [
            [
                ['ChangeInventory', -4, "Energy" /* Energy */],
                ['ChangeInventory', 2, "Steel" /* Steel */],
                ['RaiseOxygen', 1],
            ],
        ]
    },
    {
        name: 'Ore Processor',
        cost: 13,
        type: 'Active',
        deck: 'Basic',
        tags: ['Building'],
        actionText: 'Action: Spend 4 energy to gain 1 titanium and increase oxygen 1 step.',
        actions: [
            [
                ['ChangeInventory', -4, "Energy" /* Energy */],
                ['ChangeInventory', 1, "Steel" /* Steel */],
                ['RaiseOxygen', 1],
            ],
        ]
    },
    {
        name: 'Earth Office',
        cost: 1,
        type: 'Active',
        deck: 'Corporate',
        tags: ['Earth'],
        actionText: 'Effect: When you play an Earth tag, you pay 3 MC less for it.',
        discounts: [[3, ["Earth" /* Earth */]]]
    },
    {
        name: 'Acquired Company',
        cost: 10,
        type: 'Automated',
        deck: 'Corporate',
        tags: ['Earth'],
        effectText: 'Increase your MC production 3 steps.',
        effects: [['ChangeProduction', 3, "Money" /* Money */]]
    },
    {
        name: 'Media Archives',
        cost: 8,
        type: 'Automated',
        deck: 'Corporate',
        tags: ['Earth'],
        effectText: 'Gain 1 MC for each event EVER PLAYED by all players',
        effects: [['ChangeInventory', ['GetAllTags', "Event" /* Event */], "Money" /* Money */]]
    },
    {
        name: 'Open City',
        cost: 23,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Building', 'City'],
        vp: 1,
        placeTiles: true,
        effectText: 'Requires 12% oxygen. Decrease your energy production 1 step and increase your MC production 4 steps. Gain 2 plants and place a city tile.',
        effects: [
            ['ChangeProduction', -1, "Energy" /* Energy */],
            ['ChangeProduction', 4, "Money" /* Money */],
            ['ChangeInventory', 2, "Plant" /* Plant */],
            ['PlaceCity'],
        ],
        requires: [['MinOxygen', 12]]
    },
    {
        name: 'Media Group',
        cost: 6,
        type: 'Active',
        deck: 'Corporate',
        tags: ['Earth'],
        actionText: 'Effect: After you play an event card, you gain 3MC',
        afterCardTriggers: [
            ['PlayedTagMatches', [["Event" /* Event */]]],
            [['ChangeInventory', 3, "Money" /* Money */]],
        ]
    },
    {
        name: 'Business Network',
        cost: 4,
        type: 'Active',
        deck: 'Corporate',
        tags: ['Earth'],
        actionText: 'Action: Look at the top card and either buy it or discard it',
        effectText: 'Decrease your MC production 1 step.',
        effects: [['ChangeProduction', -1, "Money" /* Money */]],
        actions: [[['BuyOrDiscard']]]
    },
    {
        name: 'Business Contacts',
        cost: 7,
        type: 'Event',
        deck: 'Corporate',
        tags: ['Earth', 'Event'],
        effectText: 'Look at the top 4 cards from the deck. Take 2 of them into hand and discard the other 2',
        effects: [['DrawAndChoose', 4, 2]]
    },
    {
        name: 'Bribed Committee',
        cost: 7,
        type: 'Event',
        deck: 'Corporate',
        tags: ['Earth', 'Event'],
        vp: -2,
        effectText: 'Raise your terraform rating 2 steps.',
        effects: [['IncreaseTR', 2]]
    },
    {
        name: 'Solar Power',
        cost: 11,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Building', 'Energy'],
        vp: 1,
        effectText: 'Increase your energy production 1 step.',
        effects: [['ChangeProduction', 1, "Energy" /* Energy */]]
    },
    {
        name: 'Breathing Filters',
        cost: 11,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Science'],
        vp: 2,
        effectText: 'Requires 7% oxygen.',
        requires: [['MinOxygen', 7]]
    },
    {
        name: 'Artificial Photosynthesis',
        cost: 12,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Science'],
        effectText: 'Increase your plant production 1 step or your energy production 2 steps.',
        effects: [
            [
                'Choice',
                [['ChangeProduction', 1, "Plant" /* Plant */], ['ChangeProduction', 2, "Energy" /* Energy */]],
            ],
        ]
    },
    {
        name: 'Artificial Lake',
        cost: 15,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Building'],
        vp: 1,
        placeTiles: true,
        effectText: 'Requires -6\u00b0C or warmer. Place 1 ocean tile ON AN AREA NOT RESERVED FOR OCEAN.',
        effects: [['ArtificialLake']],
        requires: [['MinHeat', -6]]
    },
    {
        name: 'Geothermal Power',
        cost: 11,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Building', 'Energy'],
        effectText: 'Increase your energy production 2 steps.',
        effects: [['ChangeProduction', 2, "Energy" /* Energy */]]
    },
    {
        name: 'Farming',
        cost: 16,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Plant'],
        vp: 2,
        effectText: 'Requires +4\u00b0C or warmer. Increase your MC production 2 steps and your plant production 2 steps. Gain 2 plants.',
        effects: [
            ['ChangeProduction', 2, "Money" /* Money */],
            ['ChangeProduction', 2, "Plant" /* Plant */],
            ['ChangeInventory', 2, "Plant" /* Plant */],
        ],
        requires: [['MinHeat', 4]]
    },
    {
        name: 'Dust Seals',
        cost: 2,
        type: 'Automated',
        deck: 'Basic',
        vp: 1,
        effectText: 'Requires 3 or less ocean tiles.',
        requires: [['MaxOceans', 3]]
    },
    {
        name: 'Urbanized Area',
        cost: 10,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Building', 'City'],
        placeTiles: true,
        effectText: 'Decrease your energy production 1 step and increase your MC production 2 steps. Place a city tile ADJACENT TO AT LEAST 2 OTHER CITY TILES.',
        effects: [
            ['ChangeProduction', -1, "Energy" /* Energy */],
            ['ChangeProduction', 2, "Money" /* Money */],
            ['PlaceUrbanizedArea'],
        ]
    },
    {
        name: 'Sabotage',
        cost: 1,
        type: 'Event',
        deck: 'Corporate',
        tags: ['Event'],
        effectText: 'Remove up to 3 titanium from any player, or 4 steel, or 7 MC.',
        effects: [
            [
                'Choice',
                [
                    ['DecreaseAnyInventory', 3, "Titanium" /* Titanium */],
                    ['DecreaseAnyInventory', 4, "Steel" /* Steel */],
                    ['DecreaseAnyInventory', 7, "Money" /* Money */],
                ],
            ],
        ]
    },
    {
        name: 'Moss',
        cost: 4,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Plant'],
        effectText: 'Requires 3 ocean tiles and that you lose 1 plant. Increase your plant production 1 step.',
        effects: [
            ['ChangeInventory', -1, "Plant" /* Plant */],
            ['ChangeProduction', 1, "Plant" /* Plant */],
        ],
        requires: [['MinOceans', 3]]
    },
    {
        name: 'Industrial Center',
        cost: 4,
        type: 'Active',
        deck: 'Corporate',
        tags: ['Building'],
        placeTiles: true,
        actionText: 'Action: Spend 7 MC to increase your steel production 1 step.',
        effectText: 'Place [the Industrial Center] tile ADJACENT TO A CITY TILE.',
        actions: [
            [['ChangeInventory', -7, "Money" /* Money */], ['ChangeProduction', 1, "Steel" /* Steel */]],
        ],
        effects: [['PlaceIndustrialCenter']]
    },
    {
        name: 'Hired Raiders',
        cost: 1,
        type: 'Event',
        deck: 'Corporate',
        tags: ['Event'],
        effectText: 'Steal up to 2 steel, or 3MC from any player.',
        effects: [
            [
                'Choice',
                [[['StealInventory', 2, "Steel" /* Steel */]], [['StealInventory', 3, "Money" /* Money */]]],
            ],
        ]
    },
    {
        name: 'Hackers',
        cost: 3,
        type: 'Automated',
        deck: 'Corporate',
        vp: -1,
        effectText: 'Decrease your energy production 1 step and any MC production 2 steps. Increase your MC production 2 steps.',
        effects: [
            ['ChangeProduction', -1, "Energy" /* Energy */],
            ['DecreaseAnyProduction', 2, "Money" /* Money */],
            ['ChangeProduction', 2, "Money" /* Money */],
        ]
    },
    {
        name: 'GHG Factories',
        cost: 11,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Building'],
        effectText: 'Decrease your energy production 1 step and increase your heat production 4 steps.',
        effects: [
            ['ChangeProduction', -1, "Energy" /* Energy */],
            ['ChangeProduction', 4, "Heat" /* Heat */],
        ]
    },
    {
        name: 'Subterranean Reservoir',
        cost: 11,
        type: 'Event',
        deck: 'Basic',
        tags: ['Event'],
        placeTiles: true,
        effectText: 'Place 1 ocean tile.',
        effects: [['PlaceOceans']]
    },
    {
        name: 'Ecological Zone',
        cost: 12,
        type: 'Active',
        deck: 'Basic',
        tags: ['Plant', 'Animal'],
        vp: ['VPForCardResources', "Animal" /* Animals */, 2],
        placeTiles: true,
        actionText: 'Effect: When you play an animal or a plant tag (including these 2), add an animal to this card.',
        effectText: 'Requires that you have a greenery tile. Place [the Ecological Zone] tile ADJACENT TO ANY GREENERY TILE. 1 VP per 2 animals on this card.',
        resourceHeld: "Animal" /* Animals */,
        todo: true
    },
    {
        name: 'Zeppelins',
        cost: 13,
        type: 'Automated',
        deck: 'Basic',
        vp: 1,
        effectText: 'Requires 5% oxygen. Increase your MC production 1 step for each city tile ON MARS.',
        effects: [['ChangeProduction', ['GetCitiesOnMars'], "Money" /* Money */]],
        requires: [['MinOxygen', 5]]
    },
    {
        name: 'Worms',
        cost: 8,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Microbe'],
        effectText: 'Requires 4% oxygen. Increase your plant production 1 step for every 2 microbe tags you have, including this.',
        effects: [['ChangeProduction', ['GetTags', "Microbe" /* Microbe */, 2], "Plant" /* Plant */]],
        requires: [['MinOxygen', 5]]
    },
    {
        name: 'Decomposers',
        cost: 5,
        type: 'Active',
        deck: 'Basic',
        tags: ['Microbe'],
        vp: ['VPForCardResources', "Microbe" /* Microbes */, 3],
        actionText: 'Effect: When you play an animal, plant, or microbe tag, including this, add a microbe to this card.',
        effectText: 'Requires 3# oxygen. 1 VP per 3 microbes on this card.',
        resourceHeld: "Microbe" /* Microbes */,
        requires: [['MinOxygen', 3]],
        afterCardTriggers: [
            ['PlayedTagMatches', [["Plant" /* Plant */], ["Microbe" /* Microbe */], ["Animal" /* Animal */]]],
            [['ChangeCardResource', 1]],
        ]
    },
    {
        name: 'Fusion Power',
        cost: 14,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Science', 'Building', 'Energy'],
        effectText: 'Requires 2 power tags. Increase your energy production 3 steps.',
        effects: [['ChangeProduction', 3, "Energy" /* Energy */]],
        requires: [['HasTags', 2, "Power" /* Power */]]
    },
    {
        name: 'Symbiotic Fungus',
        cost: 4,
        type: 'Active',
        deck: 'Basic',
        tags: ['Microbe'],
        actionText: 'Action: Add a microbe to ANOTHER card.',
        effectText: 'Requires -14\u00b0C or warmer.',
        actions: [[['ChangeAnyCardResource', 1, "Microbe" /* Microbes */]]],
        requires: [['MinHeat', -14]]
    },
    {
        name: 'Extreme-Cold Fungus',
        cost: 13,
        type: 'Active',
        deck: 'Basic',
        tags: ['Microbe'],
        actionText: 'Action: Gain 1 plant or add 2 microbes to ANOTHER card.',
        actions: [
            [['ChangeInventory', 1, "Plant" /* Plant */]],
            [['ChangeAnyCardResource', 2, "Microbe" /* Microbes */]],
        ],
        effectText: 'It must be -10\u00b0C or colder.',
        requires: [['MaxHeat', -10]]
    },
    {
        name: 'Advanced Ecosystems',
        cost: 11,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Microbe', 'Plant', 'Animal'],
        vp: 3,
        effectText: 'Requires a plant tag, a microbe tag, and an animal tag.',
        requires: [['HasTags', 1, "Microbe" /* Microbe */], ['HasTags', 1, "Plant" /* Plant */], ['HasTags', 1, "Animal" /* Animal */]]
    },
    {
        name: 'Great Dam',
        cost: 12,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Building', 'Energy'],
        vp: 1,
        effectText: 'Requires 4 ocean tiles. Increase your energy production 2 steps.',
        effects: [['ChangeProduction', 2, "Energy" /* Energy */]],
        requires: [['MinOceans', 4]]
    },
    {
        name: 'Cartel',
        cost: 8,
        type: 'Automated',
        deck: 'Corporate',
        tags: ['Earth'],
        effectText: 'Increase your MC production 1 step for each Earth tag you have, including this.',
        effects: [['ChangeProduction', ['GetTags', "Earth" /* Earth */], "Money" /* Money */]]
    },
    {
        name: 'Strip Mine',
        cost: 25,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Building'],
        effectText: 'Decrease your energy production 2 steps. Increase your steel production 2 steps and your titanium production 1 step. Raise oxygen 2 steps.',
        effects: [
            ['ChangeProduction', -2, "Energy" /* Energy */],
            ['ChangeProduction', 2, "Steel" /* Steel */],
            ['ChangeProduction', 1, "Titanium" /* Titanium */],
            ['RaiseOxygen', 2],
        ]
    },
    {
        name: 'Wave Power',
        cost: 8,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Energy'],
        vp: 1,
        effectText: 'Requires 3 ocean tiles. Increase your energy production 1 step.',
        effects: [['ChangeProduction', 1, "Energy" /* Energy */]],
        requires: [['MinOceans', 3]]
    },
    {
        name: 'Lava Flows',
        cost: 18,
        type: 'Event',
        deck: 'Basic',
        tags: ['Event'],
        effectText: 'Raise the temperature 2 steps and place this [the Lava Flow] tile ON EITHER THARSIS THOLUS, ASCRAEUS MONS, PAVONIS MONS OR ARSIA MONS.',
        effects: [['IncreaseTemperature', 2], ['PlaceLavaFlows']]
    },
    {
        name: 'Power Plant',
        cost: 4,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Building', 'Energy'],
        effectText: 'Increase your energy production 1 step.',
        effects: [['ChangeProduction', 1, "Energy" /* Energy */]]
    },
    {
        name: 'Mohole Area',
        cost: 20,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Building'],
        placeTiles: true,
        effectText: 'Increase your heat production 4 steps. Place [the Mohole Area] tile ON AN AREA RESERVED FOR OCEAN.',
        effects: [['ChangeProduction', 4, "Heat" /* Heat */], ['PlaceMohole']]
    },
    {
        name: 'Large Convoy',
        cost: 36,
        type: 'Event',
        deck: 'Basic',
        tags: ['Space', 'Earth', 'Event'],
        vp: 2,
        placeTiles: true,
        effectText: 'Place an ocean tile and draw 2 cards. Gain 5 plants, or add 4 animals to ANOTHER card.',
        effects: [
            ['PlaceOceans'],
            ['Draw', 2],
            [
                'Choice',
                [
                    [['ChangeInventory', 5, "Plant" /* Plant */]],
                    [['ChangeAnyCardResource', 4, "Animal" /* Animals */]],
                ],
            ],
        ]
    },
    {
        name: 'Titanium Mine',
        cost: 7,
        type: 'Automated',
        deck: 'Corporate',
        tags: ['Building'],
        effectText: 'Increase your titanium production 1 step.',
        effects: [['ChangeProduction', 1, "Titanium" /* Titanium */]]
    },
    {
        name: 'Tectonic Stress Power',
        cost: 18,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Building', 'Energy'],
        vp: 1,
        effectText: 'Requires 2 science tags. Increase your energy production 3 steps.',
        effects: [['ChangeProduction', 3, "Energy" /* Energy */]],
        requires: [['HasTags', 2, "Science" /* Science */]]
    },
    {
        name: 'Nitrophilic Moss',
        cost: 8,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Plant'],
        effectText: 'Requires 3 ocean tiles and that you lose 2 plants. Increase your plant production 2 steps.',
        effects: [
            ['ChangeInventory', -2, "Plant" /* Plant */],
            ['ChangeProduction', 2, "Plant" /* Plant */],
        ],
        requires: [['MinOceans', 3]]
    },
    {
        name: 'Herbivores',
        cost: 12,
        type: 'Active',
        deck: 'Basic',
        tags: ['Animal'],
        vp: ['VPForCardResources', "Animal" /* Animals */, 2],
        actionText: 'Effect: When you place a greenery tile, add an animal to this card.',
        effectText: 'Requires 8% oxygen. Add 1 animal to this card. Decrease any plant production 1 step. 1 VP per 2 animals on this card.',
        resourceHeld: "Animal" /* Animals */,
        requires: [['MinOxygen', 8]],
        afterTileTriggers: [[["greenery" /* Greenery */, true], [['ChangeCardResource', 1]]]],
        effects: [['ChangeCardResource', 1], ['DecreaseAnyProduction', 1, "Plant" /* Plant */]]
    },
    {
        name: 'Insects',
        cost: 9,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Microbe'],
        effectText: 'Requires 6% oxygen. Increase your plant production 1 step for each plant tag you have.',
        effects: [['ChangeProduction', ['GetTags', "Plant" /* Plant */], "Plant" /* Plant */]],
        requires: [['MinOxygen', 6]]
    },
    {
        name: "CEO's Favourite Project",
        cost: 1,
        type: 'Event',
        deck: 'Corporate',
        tags: ['Event'],
        effectText: 'Add 1 resource to a card with at least 1 resource on it.',
        effects: [['ChangeAnyCardResource', 1, null, 1]]
    },
    {
        name: 'Anti-Gravity Technology',
        cost: 14,
        type: 'Active',
        deck: 'Corporate',
        tags: ['Science'],
        vp: 3,
        actionText: 'Effect: when you play a card, you pay 2 MC less for it.',
        effectText: 'Requires 7 science tags.',
        discounts: [[2]],
        requires: [['HasTags', 7, "Science" /* Science */]]
    },
    {
        name: 'Investment Loan',
        cost: 3,
        type: 'Event',
        deck: 'Corporate',
        tags: ['Earth', 'Event'],
        effectText: 'Decrease your MC production 1 step. Gain 10 MC.',
        effects: [
            ['ChangeProduction', -1, "Money" /* Money */],
            ['ChangeInventory', 10, "Money" /* Money */],
        ]
    },
    {
        name: 'Insulation',
        cost: 2,
        type: 'Automated',
        deck: 'Basic',
        effectText: 'Decrease your heat production any number of steps and increase your MC production the same number of steps.',
        effects: [
            [
                'ChooseX',
                [
                    ['ChangeProduction', ['Neg', ['GetX']], "Heat" /* Heat */],
                    ['ChangeProduction', ['GetX'], "Money" /* Money */],
                ],
            ],
        ]
    },
    {
        name: 'Adaptation Technology',
        cost: 12,
        type: 'Active',
        deck: 'Basic',
        tags: ['Science'],
        vp: 1,
        actionText: 'Effect: Your global requirements are +2 or -2 steps, your choice in each case.',
        effects: [['OffsetRequirements', 2]]
    },
    {
        name: 'Caretaker Contract',
        cost: 3,
        type: 'Active',
        deck: 'Corporate',
        actionText: 'Action: Spend 8 heat to increase your terraforming rating 1 step.',
        effectText: 'Requires 0\u00b0C or warmer.',
        actions: [[['ChangeInventory', -8, "Heat" /* Heat */], ['IncreaseTR', 1]]]
    },
    {
        name: 'Designed Microorganisms',
        cost: 16,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Science', 'Microbe'],
        effectText: 'It must be -14\u00b0C or colder. Increase your plant production 2 steps.',
        effects: [['ChangeProduction', 2, "Plant" /* Plant */]],
        requires: [['MaxHeat', -14]]
    },
    {
        name: 'Standard Technology',
        cost: 6,
        type: 'Active',
        deck: 'Corporate',
        tags: ['Science'],
        actionText: 'Effect: After you pay for a standard project, except selling patents, you gain 3 MC.',
        afterStandardProjectTriggers: [['ChangeInventory', 3, "Money" /* Money */]]
    },
    {
        name: 'Nitrite Reducing Bacteria',
        cost: 11,
        type: 'Active',
        deck: 'Basic',
        tags: ['Microbe'],
        actionText: 'Action: Add 1 microbe to this card, or remove 3 microbes to increase your TR 1 step.',
        effectText: 'Add 3 microbes to this card.',
        actions: [[['ChangeCardResource', 1]], [['ChangeCardResource', -3], ['IncreaseTR', 1]]],
        effects: [['ChangeCardResource', 3, "Microbe" /* Microbes */]],
        resourceHeld: "Microbe" /* Microbes */
    },
    {
        name: 'Industrial Microbes',
        cost: 12,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Building', 'Microbe'],
        effectText: 'Increase your energy production and your steel production 1 step each.',
        effects: [
            ['ChangeProduction', 1, "Energy" /* Energy */],
            ['ChangeProduction', 1, "Steel" /* Steel */],
        ]
    },
    {
        name: 'Lichen',
        cost: 7,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Plant'],
        effectText: 'Requires -24\u00b0C or warmer. Increase your plant production 1 step.',
        effects: [['ChangeProduction', 1, "Plant" /* Plant */]],
        requires: [['MinHeat', -24]]
    },
    {
        name: 'Power Supply Consortium',
        cost: 5,
        type: 'Automated',
        deck: 'Corporate',
        tags: ['Energy'],
        effectText: 'Requires 2 power tags. Decrease any energy production 1 step and increase your own 1 step.',
        effects: [
            ['DecreaseAnyProduction', 1, "Energy" /* Energy */],
            ['ChangeProduction', 1, "Energy" /* Energy */],
        ],
        requires: [['HasTags', 2, "Power" /* Power */]]
    },
    {
        name: 'Convoy From Europa',
        cost: 15,
        type: 'Event',
        deck: 'Basic',
        tags: ['Space', 'Event'],
        placeTiles: true,
        effectText: 'Place 1 ocean tile and draw 1 card.',
        effects: [['PlaceOceans'], ['Draw', 1]]
    },
    {
        name: 'Imported GHG',
        cost: 7,
        type: 'Event',
        deck: 'Basic',
        tags: ['Space', 'Earth', 'Event'],
        effectText: 'Increase your heat production 1 step and gain 3 heat.',
        effects: [
            ['ChangeProduction', 1, "Heat" /* Heat */],
            ['ChangeInventory', 3, "Heat" /* Heat */],
        ]
    },
    {
        name: 'Imported Nitrogen',
        cost: 23,
        type: 'Event',
        deck: 'Basic',
        tags: ['Space', 'Earth', 'Event'],
        effectText: 'Raise your TR 1 step and gain 4 plants. Add 3 microbes to ANOTHER card and 2 animals to ANOTHER card.',
        effects: [
            ['IncreaseTR', 1],
            ['ChangeInventory', 4, "Plant" /* Plant */],
            ['ChangeAnyCardResource', 3, "Microbe" /* Microbes */],
            ['ChangeAnyCardResource', 2, "Animal" /* Animals */],
        ]
    },
    {
        name: 'Micro-Mills',
        cost: 3,
        type: 'Automated',
        deck: 'Basic',
        effectText: 'Increase your heat production 1 step.',
        effects: [['ChangeProduction', 1, "Heat" /* Heat */]]
    },
    {
        name: 'Magnetic Field Generators',
        cost: 20,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Building'],
        effectText: 'Decrease your energy production 4 steps and increase your plant production 2 steps. Raise your TR 3 steps.',
        effects: [
            ['ChangeProduction', -4, "Energy" /* Energy */],
            ['ChangeProduction', 2, "Plant" /* Plant */],
            ['IncreaseTR', 3],
        ]
    },
    {
        name: 'Shuttles',
        cost: 10,
        type: 'Active',
        deck: 'Basic',
        tags: ['Space'],
        vp: 1,
        actionText: 'Effect: When you play a space card, you pay 2MC less for it.',
        effectText: 'Requires 5% oxygen. Decrease your energy production 1 step and increase your MC production 2 steps.',
        effects: [
            ['ChangeProduction', -1, "Energy" /* Energy */],
            ['ChangeProduction', 2, "Money" /* Money */],
        ],
        requires: [['MinOxygen', 6]],
        discounts: [[2, ["Space" /* Space */]]]
    },
    {
        name: 'Import of Advanced GHG',
        cost: 9,
        type: 'Event',
        deck: 'Basic',
        tags: ['Space', 'Earth', 'Event'],
        effectText: 'Increase your heat production 2 steps.',
        effects: [['ChangeProduction', 2, "Heat" /* Heat */]]
    },
    {
        name: 'Windmills',
        cost: 6,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Building', 'Energy'],
        vp: 1,
        effectText: 'Requires 7% oxygen. Increase your energy production 1 step.',
        effects: [['ChangeProduction', 1, "Energy" /* Energy */]],
        requires: [['MinOxygen', 7]]
    },
    {
        name: 'Tundra Farming',
        cost: 16,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Plant'],
        vp: 2,
        effectText: 'Requires -6\u00b0C or warmer. Increase your plant production 1 step and your MC production 2 steps. Gain 1 plant.',
        effects: [
            ['ChangeProduction', 1, "Plant" /* Plant */],
            ['ChangeProduction', 2, "Money" /* Money */],
            ['ChangeInventory', 1, "Plant" /* Plant */],
        ],
        requires: [['MinHeat', -6]]
    },
    {
        name: 'Aerobraked Ammonia Asteroid',
        cost: 26,
        type: 'Event',
        deck: 'Basic',
        tags: ['Space', 'Event'],
        effectText: 'Add 2 microbes to ANOTHER card. Increase your heat production 3 steps and your plant production 1 step.',
        effects: [
            ['ChangeAnyCardResource', 2, "Microbe" /* Microbes */],
            ['ChangeProduction', 3, "Heat" /* Heat */],
            ['ChangeProduction', 1, "Plant" /* Plant */],
        ]
    },
    {
        name: 'Magnetic Field Dome',
        cost: 5,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Building'],
        effectText: 'Decrease your energy production 2 steps and increase your plant production 1 step. Raise your terraform rating 1 step.',
        effects: [
            ['ChangeProduction', -2, "Energy" /* Energy */],
            ['ChangeProduction', 1, "Plant" /* Plant */],
            ['IncreaseTR', 1],
        ]
    },
    {
        name: 'Pets',
        cost: 10,
        type: 'Active',
        deck: 'Basic',
        tags: ['Animal', 'Earth'],
        vp: ['VPForCardResources', "Animal" /* Animals */, 2],
        actionText: 'Effect: When any city tile is placed, add an animal to this card. Animals may not be removed from this card.',
        effectText: 'Add 1 animal to this card. 1 VP per 2 animals here.',
        resourceHeld: "Animal" /* Animals */,
        afterTileTriggers: [[["city" /* City */], [['ChangeCardResource', 1]]]],
        effects: [['ChangeCardResource', 1]]
    },
    {
        name: 'Protected Habitats',
        cost: 5,
        type: 'Active',
        deck: 'Corporate',
        actionText: '[Effect: ]Opponents may not remove your [plants, animals or microbes]',
        effects: [['ApplyStatus', 'ProtectedHabitats']]
    },
    {
        name: 'Protected Valley',
        cost: 23,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Building', 'Plant'],
        placeTiles: true,
        effectText: 'Increase your MC production 2 steps. Place a greenery tile ON AN AREA RESERVED FOR OCEAN, disregarding normal placement restrictions, and increase oxygen 1 step.',
        effects: [['ChangeProduction', 2, "Money" /* Money */], ['PlaceGreeneryOnOcean']]
    },
    {
        name: 'Satellites',
        cost: 10,
        type: 'Automated',
        deck: 'Corporate',
        tags: ['Space'],
        effectText: 'Increase your MC production 1 step for each space tag you have, including this one.',
        effects: [['ChangeProduction', ['GetTags', "Space" /* Space */], "Money" /* Money */]]
    },
    {
        name: 'Noctis Farming',
        cost: 10,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Building', 'Plant'],
        vp: 1,
        effectText: 'Requires -20\u00b0C or warmer. Increase your MC production 1 step and gain 2 plants.',
        effects: [
            ['ChangeProduction', 1, "Money" /* Money */],
            ['ChangeInventory', 2, "Plant" /* Plant */],
        ],
        requires: [['MinHeat', -20]]
    },
    {
        name: 'Water Splitting Plant',
        cost: 12,
        type: 'Active',
        deck: 'Basic',
        tags: ['Building'],
        actionText: 'Action: Spend 3 energy to raise oxygen 1 step.',
        effectText: 'Requires 2 ocean tiles.',
        actions: [[['ChangeInventory', -3, "Energy" /* Energy */], ['RaiseOxygen', 1]]],
        requires: [['MinOceans', 2]]
    },
    {
        name: 'Heat Trappers',
        cost: 6,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Building', 'Energy'],
        vp: -1,
        effectText: 'Decrease any heat production 2 steps and increase your energy production 1 step.',
        effects: [
            ['DecreaseAnyProduction', 2, "Heat" /* Heat */],
            ['ChangeProduction', 1, "Energy" /* Energy */],
        ]
    },
    {
        name: 'Soil Factory',
        cost: 9,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Building'],
        vp: 1,
        effectText: 'Decrease your energy production 1 step and increase your plant production 1 step.',
        effects: [
            ['ChangeProduction', -1, "Energy" /* Energy */],
            ['ChangeProduction', 1, "Plant" /* Plant */],
        ]
    },
    {
        name: 'Fuel Factory',
        cost: 6,
        type: 'Automated',
        deck: 'Corporate',
        tags: ['Building'],
        effectText: 'Decreases your energy production 1 step and increase your titanium and your MC production 1 step each.',
        effects: [
            ['ChangeProduction', -1, "Energy" /* Energy */],
            ['ChangeProduction', 1, "Titanium" /* Titanium */],
            ['ChangeProduction', 1, "Money" /* Money */],
        ]
    },
    {
        name: 'Ice cap Melting',
        cost: 5,
        type: 'Event',
        deck: 'Basic',
        tags: ['Event'],
        placeTiles: true,
        effectText: 'Requires +2\u00b0C or warmer. Place 1 ocean tile.',
        effects: [['PlaceOceans']],
        requires: [['MinHeat', 2]]
    },
    {
        name: 'Corporate Stronghold',
        cost: 11,
        type: 'Automated',
        deck: 'Corporate',
        tags: ['Building', 'City'],
        vp: -2,
        placeTiles: true,
        effectText: 'Decrease your energy production 1 step and increase your MC production 3 steps. Place a city tile.',
        effects: [
            ['ChangeProduction', -1, "Energy" /* Energy */],
            ['ChangeProduction', 3, "Money" /* Money */],
            ['PlaceCity'],
        ]
    },
    {
        name: 'Biomass Combustors',
        cost: 4,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Building', 'Energy'],
        vp: -1,
        effectText: 'Requires 6% oxygen. Decrease any plant production 1 step and increase your energy production 2 steps.',
        effects: [
            ['DecreaseAnyProduction', 1, "Plant" /* Plant */],
            ['ChangeProduction', 2, "Energy" /* Energy */],
        ],
        requires: [['MinOxygen', 6]]
    },
    {
        name: 'Livestock',
        cost: 13,
        type: 'Active',
        deck: 'Basic',
        tags: ['Animal'],
        vp: ['VPForCardResources', "Animal" /* Animals */],
        actionText: 'Action: Add 1 animal to this card.',
        effectText: 'Requires 9% oxygen. Decrease your plant production 1 step and increase your MC production 2 steps. 1 VP for each animal on this card.',
        actions: [[['ChangeCardResource', 1]]],
        effects: [
            ['ChangeProduction', -1, "Plant" /* Plant */],
            ['ChangeProduction', 2, "Money" /* Money */],
        ],
        resourceHeld: "Animal" /* Animals */,
        requires: [['MinOxygen', 9]]
    },
    {
        name: 'Olympus Conference',
        cost: 10,
        type: 'Active',
        deck: 'Corporate',
        tags: ['Science', 'Building', 'Earth'],
        vp: 1,
        actionText: 'Effect: When you play a science tag, including this, either add a science resource to this card, or remove a science resource from this card to draw a card.',
        resourceHeld: "Science" /* Science */,
        afterCardTriggers: [
            ['PlayedTagMatches', [["Science" /* Science */]]],
            [['Choice', [['ChangeCardResource', 1], [['ChangeCardResource', -1], ['Draw', 1]]]]],
        ]
    },
    {
        name: 'Rad-Suits',
        cost: 6,
        type: 'Automated',
        deck: 'Corporate',
        vp: 1,
        effectText: 'Requires 2 cities in play. Increase your MC production 1 step.',
        effects: [['ChangeProduction', 1, "Money" /* Money */]],
        requires: [['HasCitiesOnMars', 1]]
    },
    {
        name: 'Aquifer Pumping',
        cost: 18,
        type: 'Active',
        deck: 'Basic',
        tags: ['Building'],
        placeTiles: true,
        actionText: 'Action: Spend 8 MC to place 1 ocean tile. STEEL MAY BE USED as if you were playing a building card.',
        actions: [[['MultiCost', 8, ["Steel" /* Steel */]], ['PlaceOceans']]]
    },
    {
        name: 'Flooding',
        cost: 7,
        type: 'Event',
        deck: 'Basic',
        tags: ['Event'],
        vp: -1,
        placeTiles: true,
        effectText: 'Place an ocean tile. IF THERE ARE TILES ADJACENT TO THIS OCEAN TILE, YOU MAY REMOVE 4 MC FROM THE OWNER OF ONE OF THOSE TILES.',
        todo: true
    },
    {
        name: 'Energy Saving',
        cost: 15,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Energy'],
        effectText: 'Increase your energy production 1 step for each city tile in play.',
        effects: [['ChangeProduction', ['GetCities'], "Energy" /* Energy */]]
    },
    {
        name: 'Local Heat Trapping',
        cost: 1,
        type: 'Event',
        deck: 'Basic',
        tags: ['Event'],
        effectText: 'Spend 5 heat to either gain 4 plants, or to add 2 animals to ANOTHER card.',
        effects: [
            ['ChangeInventory', -5, "Heat" /* Heat */],
            [
                'Choice',
                [
                    ['ChangeInventory', 4, "Plant" /* Plant */],
                    ['ChangeAnyCardResource', 2, "Animal" /* Animals */],
                ],
            ],
        ]
    },
    {
        name: 'Permafrost extraction',
        cost: 8,
        type: 'Event',
        deck: 'Basic',
        tags: ['Event'],
        placeTiles: true,
        effectText: 'Requires -8\u00b0C or warmer. Place 1 ocean tile.',
        effects: [['PlaceOceans']],
        requires: [['MinHeat', -8]]
    },
    {
        name: 'Invention Contest',
        cost: 2,
        type: 'Event',
        deck: 'Corporate',
        tags: ['Science', 'Event'],
        effectText: 'Look at the top 3 cards from the deck. Take 1 of them into hand and discard the other 2',
        effects: [['DrawAndChoose', 3, 1]]
    },
    {
        name: 'Plantation',
        cost: 15,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Plant'],
        placeTiles: true,
        effectText: 'Requires 2 science tags. Place a greenery tile and raise oxygen 1 step.',
        effects: [['PlaceGreenery']],
        requires: [['HasTags', 2, "Science" /* Science */]]
    },
    {
        name: 'Power Infrastructure',
        cost: 4,
        type: 'Active',
        deck: 'Corporate',
        tags: ['Building', 'Energy'],
        actionText: 'Action: Spend any amount of energy to gain that amount of MC.',
        actions: [
            [
                [
                    'ChooseX',
                    [
                        ['ChangeInventory', ['Neg', ['GetX']], "Energy" /* Energy */],
                        ['ChangeInventory', ['GetX'], "Money" /* Money */],
                    ],
                ],
            ],
        ]
    },
    {
        name: 'Indentured Workers',
        cost: 0,
        type: 'Event',
        deck: 'Corporate',
        tags: ['Event'],
        vp: -1,
        effectText: 'The next card you play this generation costs 8MC less.',
        effects: [['AddNextCardEffect', ["Discount" /* Discount */, 8]]]
    },
    {
        name: 'Lagrange Observatory',
        cost: 9,
        type: 'Automated',
        deck: 'Corporate',
        tags: ['Science', 'Space'],
        vp: 1,
        effectText: 'Draw 1 card.',
        effects: [['Draw', 1]]
    },
    {
        name: 'Terraforming Ganymede',
        cost: 33,
        type: 'Automated',
        deck: 'Corporate',
        tags: ['Space', 'Jovian'],
        vp: 2,
        effectText: 'Raise your TR 1 step for each Jovian tag you have, including this.',
        effects: [['IncreaseTR', ['GetTags', "Jovian" /* Jovian */]]]
    },
    {
        name: 'Immigration Shuttles',
        cost: 31,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Space', 'Earth'],
        vp: ['VPForCitiesOnMars', 3],
        effectText: 'Increase your MC production 5 steps. 1 VP for every 3rd city in play.',
        effects: [['ChangeProduction', 5, "Money" /* Money */]]
    },
    {
        name: 'Restricted Area',
        cost: 11,
        type: 'Active',
        deck: 'Corporate',
        tags: ['Science'],
        actionText: 'Action: Spend 2MC to draw a card.',
        effectText: 'Place [the restricted area] tile.',
        actions: [[['ChangeInventory', -2, "Money" /* Money */], ['Draw', 1]]],
        effects: [['PlaceRestrictedArea']]
    },
    {
        name: 'Immigrant City',
        cost: 13,
        type: 'Active',
        deck: 'Basic',
        tags: ['Building', 'City'],
        placeTiles: true,
        actionText: 'Effect: Each time a city tile is placed, including this, increase your MC production 1 step.',
        effectText: 'Decrease your energy production 1 step and decrease your MC production 2 steps. Place a city tile.',
        afterTileTriggers: [[["city" /* City */], [['ChangeProduction', 1, "Money" /* Money */]]]],
        effects: [
            ['ChangeProduction', -1, "Energy" /* Energy */],
            ['ChangeProduction', -2, "Money" /* Money */],
            ['PlaceCity'],
        ]
    },
    {
        name: 'Energy Tapping',
        cost: 3,
        type: 'Automated',
        deck: 'Corporate',
        tags: ['Energy'],
        vp: -1,
        effectText: 'Decrease any energy production 1 step and increase your own 1 step.',
        effects: [
            ['DecreaseAnyProduction', 1, "Energy" /* Energy */],
            ['ChangeProduction', 1, "Energy" /* Energy */],
        ]
    },
    {
        name: 'Underground Detonations',
        cost: 6,
        type: 'Active',
        deck: 'Basic',
        tags: ['Building'],
        actionText: 'Action: Spend 10 MC to increase your heat production 2 steps.',
        actions: [
            [['ChangeInventory', -10, "Money" /* Money */], ['ChangeProduction', 2, "Heat" /* Heat */]],
        ]
    },
    {
        name: 'Soletta',
        cost: 35,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Space'],
        effectText: 'Increase your heat production 7 steps.',
        effects: [['ChangeProduction', 7, "Heat" /* Heat */]]
    },
    {
        name: 'Technology Demonstration',
        cost: 5,
        type: 'Event',
        deck: 'Corporate',
        tags: ['Science', 'Space', 'Event'],
        effectText: 'Draw 2 cards.',
        effects: [['Draw', 2]]
    },
    {
        name: 'Rad-Chem Factory',
        cost: 8,
        type: 'Automated',
        deck: 'Basic',
        tags: ['Building'],
        effectText: 'Decrease your energy production 1 step. Raise your terraform rating 2 steps.',
        effects: [['ChangeProduction', -1, "Energy" /* Energy */], ['IncreaseTR', 2]]
    },
    {
        name: 'Special Design',
        cost: 4,
        type: 'Event',
        deck: 'Basic',
        tags: ['Science', 'Event'],
        effectText: 'The next card you play this generation is +2 or -2 in global requirements, your choice.',
        effects: [['AddNextCardEffect', ["OffsetRequirements" /* OffsetRequirements */, 2]]]
    },
    {
        name: 'Medical Lab',
        cost: 13,
        type: 'Automated',
        deck: 'Corporate',
        tags: ['Science', 'Building'],
        vp: 1,
        effectText: 'Increase your MC production 1 step for every 2 building tags you have, including this.',
        effects: [['ChangeProduction', ['GetTags', "Building" /* Building */, 2], "Money" /* Money */]]
    },
    {
        name: 'AI Central',
        cost: 21,
        type: 'Active',
        deck: 'Corporate',
        tags: ['Science', 'Building'],
        vp: 1,
        actionText: 'Action: Draw 2 cards.',
        effectText: 'Requires 3 science tags to play. Decrease your energy production 1 step.',
        actions: [[['Draw', 2]]],
        effects: [['ChangeProduction', -1, "Energy" /* Energy */]],
        requires: [['HasTags', 3, "Science" /* Science */]]
    },
    {
        name: 'Small Asteroid',
        cost: 10,
        type: 'Event',
        deck: 'Promo',
        tags: ['Space', 'Event'],
        effectText: 'Increase temperature 1 step. Remove up to 2 plants from any player.',
        effects: [['IncreaseTemperature', 1], ['DecreaseAnyInventory', 2, "Plant" /* Plant */]]
    },
    {
        name: 'Self-Replicating Robots',
        cost: 7,
        type: 'Active',
        deck: 'Promo',
        actionText: 'Action: Reveal and place a SPACE OR BUILDING card here from hand, and place 2 resources on it, OR double the resources on a card here. Effect: Cards here may be played as if from hand with its cost reduced by the number of resources on it.',
        effectText: 'Requires 2 science tags.',
        todo: true,
        requires: [['HasTags', 2, "Science" /* Science */]]
    },
    {
        name: 'Snow Algae',
        cost: 12,
        type: 'Active',
        deck: 'Promo',
        tags: ['Plant'],
        effectText: 'Requires 2 oceans. Increase your plant production and your heat production 1 step each.',
        requires: [['MinOceans', 2]],
        effects: [
            ['ChangeProduction', 2, "Plant" /* Plant */],
            ['ChangeProduction', 1, "Heat" /* Heat */],
        ]
    },
];
var CARDS_BY_NAME = lodash.keyBy(CARDS, 'name');
var getCardByName = function (name) { return CARDS_BY_NAME[name]; };

var N_INITIAL_CARDS = 10;
var N_DRAFT_CARDS = 4;
var draw = function (n, state) {
    var drawn = [];
    for (var i = 0; i < n; i++) {
        drawn.push(state.deck.splice(0, 1)[0]);
    }
    return [drawn, state];
};
var setupDraft = function (state) {
    var draft = state.draft;
    var drawResult = draw(N_DRAFT_CARDS * state.players.length, state);
    var cards = drawResult[0];
    state = drawResult[1];
    state.players.forEach(function (player, i) {
        draft[player] = {
            taken: [],
            queued: [cards.slice(4 * i, 4 * (i + 1))]
        };
    });
    return state;
};
var handlePlayerChoice = function (state, player, choice) {
    var playerIndex = state.players.indexOf(player);
    var currentChoices = state.draft[player].queued[0];
    var chosenIndex = currentChoices.findIndex(function (c) { return c === choice; });
    state.draft[player].taken.push(choice);
    state.draft[player].queued.splice(0, 1);
    // Pass rest of cards to next player.
    currentChoices.splice(chosenIndex, 1);
    var nextPlayer = state.players[(playerIndex + (state.generation % 2 === 0 ? -1 : 1) + state.players.length) %
        state.players.length];
    if (currentChoices.length >= 2)
        state.draft[nextPlayer].queued.push(currentChoices.slice());
    else if (currentChoices.length === 1)
        state.draft[nextPlayer].taken.push(currentChoices[0]);
    return state;
};
var isDraftDone = function (state) {
    return state.players
        .map(function (player) { return state.draft[player].taken.length === N_DRAFT_CARDS; })
        .every(function (x) { return x; });
};
var setupInitialHands = function (state) {
    var choosingCards = state.choosingCards;
    var drawResult = draw(state.players.length * N_INITIAL_CARDS, state);
    var cards = drawResult[0];
    state = drawResult[1];
    state.players.forEach(function (player, i) {
        choosingCards[player] = cards.slice(N_INITIAL_CARDS * i, N_INITIAL_CARDS * (i + 1));
    });
    return state;
};

var OCEAN_POSITIONS = [
    [-3, 4],
    [-1, 4],
    [0, 4],
    [1, 3],
    [3, 1],
    [-1, 0],
    [0, 0],
    [1, 0],
    [2, -1],
    [3, -1],
    [4, -1],
    [4, -4],
];
var VOLCANO_POSITIONS = [[-4, 0], [-4, 1], [-4, 2], [-3, 3]];
var RESOURCE_BONUSES = {
    '-4,4': ["Steel" /* Steel */, "Steel" /* Steel */],
    '-4,2': ["Card" /* Card */],
    '-4,1': ["Plant" /* Plant */, "Titanium" /* Titanium */],
    '-4,0': ["Plant" /* Plant */, "Plant" /* Plant */],
    '-3,4': ["Steel" /* Steel */, "Steel" /* Steel */],
    '-3,3': ["Steel" /* Steel */],
    '-3,1': ["Plant" /* Plant */],
    '-3,0': ["Plant" /* Plant */, "Plant" /* Plant */],
    '-3,-1': ["Plant" /* Plant */],
    '-2,1': ["Plant" /* Plant */],
    '-2,0': ["Plant" /* Plant */, "Plant" /* Plant */],
    '-2,-1': ["Plant" /* Plant */, "Plant" /* Plant */],
    '-1,4': ["Card" /* Card */],
    '-1,1': ["Plant" /* Plant */],
    '-1,0': ["Plant" /* Plant */, "Plant" /* Plant */],
    '-1,-1': ["Plant" /* Plant */],
    '-1,-3': ["Steel" /* Steel */, "Steel" /* Steel */],
    '0,1': ["Plant" /* Plant */, "Plant" /* Plant */],
    '0,0': ["Plant" /* Plant */, "Plant" /* Plant */],
    '0,-1': ["Plant" /* Plant */],
    '0,-4': ["Steel" /* Steel */],
    '1,3': ["Card" /* Card */, "Card" /* Card */],
    '1,1': ["Plant" /* Plant */],
    '1,0': ["Plant" /* Plant */, "Plant" /* Plant */],
    '1,-1': ["Plant" /* Plant */],
    '1,-4': ["Steel" /* Steel */, "Steel" /* Steel */],
    '2,2': ["Steel" /* Steel */],
    '2,1': ["Plant" /* Plant */],
    '2,0': ["Plant" /* Plant */, "Plant" /* Plant */],
    '2,-1': ["Plant" /* Plant */],
    '2,-3': ["Card" /* Card */],
    '3,1': ["Plant" /* Plant */, "Plant" /* Plant */],
    '3,0': ["Plant" /* Plant */, "Plant" /* Plant */],
    '3,-1': ["Plant" /* Plant */],
    '3,-2': ["Plant" /* Plant */],
    '4,0': ["Plant" /* Plant */, "Plant" /* Plant */],
    '4,-1': ["Plant" /* Plant */],
    '4,-3': ["Titanium" /* Titanium */],
    '4,-4': ["Titanium" /* Titanium */, "Titanium" /* Titanium */]
};

var isValid = function (_a) {
    var x = _a[0], y = _a[1];
    var xMin = Math.max(-4, -4 - y);
    var xMax = Math.min(4, 4 - y);
    return xMin <= x && x <= xMax;
};
var isOcean = function (_a) {
    var x = _a[0], y = _a[1];
    var key = makeKeyFromPosition([x, y]);
    return OCEAN_POSITIONS.map(makeKeyFromPosition).indexOf(key) >= 0;
};
var isVolcano = function (_a) {
    var x = _a[0], y = _a[1];
    var key = makeKeyFromPosition([x, y]);
    return VOLCANO_POSITIONS.map(makeKeyFromPosition).indexOf(key) >= 0;
};
var ADJACENT_OFFSETS = [[1, 0], [0, 1], [-1, 1], [-1, 0], [0, -1], [1, -1]];
var getAdjacentTiles = function (_a) {
    var x = _a[0], y = _a[1];
    return ADJACENT_OFFSETS.map(function (_a) {
        var dx = _a[0], dy = _a[1];
        return [x + dx, y + dy];
    }).filter(isValid);
};
var isAdjacentToOwn = function (state, _a) {
    var x = _a[0], y = _a[1];
    return getAdjacentTiles([x, y])
        .map(makeKeyFromPosition)
        .map(function (key) {
        return state.map[key] &&
            state.map[key].type !== "ocean" /* Ocean */ &&
            state.map[key].owner == state.player;
    })
        .some(function (x) { return x; });
};
var getTileBonus = function (_a) {
    var x = _a[0], y = _a[1];
    return RESOURCE_BONUSES[makeKeyFromPosition([x, y])] || [];
};
var makeKeyFromPosition = function (_a) {
    var x = _a[0], y = _a[1];
    return x + "," + y;
};

var CORPORATIONS = [
    {
        name: 'Ecoline',
        startingMoney: 36,
        tags: ['Plant'],
        effects: [
            ['ChangeProduction', 2, "Plant" /* Plant */],
            ['ChangeInventory', 3, "Plant" /* Plant */],
        ]
    },
    {
        name: 'Credicor',
        startingMoney: 57,
        afterCardTriggers: [['PlayedMinCost', 20], [['ChangeInventory', 4, "Money" /* Money */]]],
        afterStandardProjectTriggers: [
            ['StandardProjectMatches', ["Greenery" /* Greenery */, "City" /* City */]],
            [['ChangeInventory', 4, "Money" /* Money */]],
        ]
    },
    {
        name: 'Saturn Systems',
        startingMoney: 42,
        tags: ['Jovian'],
        effects: [['ChangeProduction', 1, "Titanium" /* Titanium */]],
        afterCardTriggers: [
            ['PlayedTagMatchesAny', [["Jovian" /* Jovian */]]],
            [['ChangeProduction', 1, "Money" /* Money */]],
        ]
    },
    {
        name: 'Tharsis Republic',
        startingMoney: 40,
        tags: ['Building'],
        afterTileTriggers: [
            [["city" /* City */], [['ChangeProduction', 1, "Money" /* Money */]]],
            [["city" /* City */, true], [['ChangeInventory', 3, "Money" /* Money */]]],
        ]
    },
    {
        name: 'Thorgate',
        startingMoney: 48,
        tags: ['Power'],
        effects: [['ChangeProduction', 1, "Energy" /* Energy */]],
        discounts: [[3, ["Power" /* Power */]], [3, ["PowerPlant" /* PowerPlant */]]]
    },
    {
        name: 'Inventrix',
        startingMoney: 45,
        tags: ['Science'],
        effects: [['Draw', 3], ['OffsetRequirements', 2]]
    },
    {
        name: 'Mining Guild',
        startingMoney: 30,
        tags: ['Building', 'Building'],
        effects: [
            ['ChangeProduction', 1, "Steel" /* Steel */],
            ['ChangeInventory', 5, "Steel" /* Steel */],
        ],
        afterTileTriggers: [
            [["Steel" /* Steel */], [['ChangeProduction', 1, "Steel" /* Steel */]]],
            [["Titanium" /* Titanium */], [['ChangeProduction', 1, "Steel" /* Steel */]]],
        ]
    },
    {
        name: 'Helion',
        startingMoney: 42,
        tags: ['Space'],
        effects: [['ChangeProduction', 3, "Heat" /* Heat */]],
        text: 'Can use heat as money.'
    },
    {
        name: 'Phoblog',
        startingMoney: 23,
        tags: ['Space'],
        effects: [
            ['ChangeInventory', 10, "Titanium" /* Titanium */],
            ['IncreaseResourceValue', 1, "Titanium" /* Titanium */],
        ]
    },
    {
        name: 'Beginner Corporation',
        startingMoney: 42,
        text: 'Keep all 10 cards.'
    },
    {
        name: 'Interplanetary Cinematics',
        startingMoney: 30,
        tags: ['Building'],
        effects: [['ChangeInventory', 20, "Steel" /* Steel */]],
        afterCardTriggers: [
            ['PlayedTagMatches', [["Event" /* Event */]]],
            [['ChangeInventory', 2, "Money" /* Money */]],
        ]
    },
    {
        name: 'Teractor',
        startingMoney: 60,
        tags: ['Earth'],
        discounts: [[3, ["Earth" /* Earth */]]]
    },
    {
        name: 'United Nations Mars Initiative (UNMI)',
        startingMoney: 40,
        tags: ['Earth'],
        actions: [[['UNTerraform']]]
    },
];
var CORPORATIONS_BY_NAME = lodash.keyBy(CORPORATIONS, 'name');
var getCorporationByName = function (name) { return CORPORATIONS_BY_NAME[name]; };

var DecreaseAnyProduction = function (delta, type) { return function (state, action, choice, card) {
    state.log.push({
        type: 'ProductionChange',
        player: choice.player,
        resource: type,
        from: state.playerState[choice.player].resources[type].production,
        to: state.playerState[choice.player].resources[type].production - delta
    });
    state.playerState[choice.player].resources[type].production -= delta;
    return state;
}; };
var DecreaseAnyInventory = function (delta, type) { return function (state, action, choice, card) {
    state.log.push({
        type: 'InventoryChange',
        player: choice.player,
        resource: type,
        from: state.playerState[choice.player].resources[type].count,
        to: state.playerState[choice.player].resources[type].count - delta
    });
    state.playerState[choice.player].resources[type].count -= delta;
    return state;
}; };
var ChangeAnyCardResource = function (n, type, minimum) {
    if (minimum === void 0) { minimum = 0; }
    return function (state, action, choice) {
        var cardOwner = state.players.find(function (player) { return state.playerState[player].played.indexOf(choice.card) >= 0; });
        if (!cardOwner)
            throw Error('Invalid card.');
        var cardObj = getCardByName(choice.card);
        if (type && cardObj.resourceHeld !== type)
            throw Error('Invalid card resource type.');
        if (!state.playerState[cardOwner].cardResources[choice.card])
            state.playerState[cardOwner].cardResources[choice.card] = 0;
        if (state.playerState[cardOwner].cardResources[choice.card] < minimum)
            throw Error('Card does not have minimum resources.');
        state.playerState[state.player].cardResources[choice.card] += n;
        return state;
    };
};
var ChangeCardResource = function (n, type) { return function (state, action, choice, card) {
    var playerState = state.playerState[action.player || state.player];
    if (!playerState.cardResources[card.name])
        playerState.cardResources[card.name] = 0;
    playerState.cardResources[card.name] += n;
    return state;
}; };
var SellCards = function () { return function (state, action, choice) {
    state = ChangeInventory(choice.cards.length, "Money" /* Money */)(state);
    state.playerState[state.player].hand = lodash.pull.apply(void 0, [state.playerState[state.player].hand].concat(choice.cards));
    return state;
}; };
var ChangeInventory = function (n, resource) { return function (state, action, choice) {
    if (typeof n !== 'number') {
        n = n(state, action, choice);
    }
    return changeInventory(state, (action && action.player) || state.player, resource, n);
}; };
var ChangeProduction = function (n, resource) { return function (state, action, choice) {
    if (typeof n !== 'number') {
        n = n(state, action, choice);
    }
    var player = (action && action.player) || state.player;
    var playerState = state.playerState[player];
    playerState.resources[resource].production += n;
    if (resource !== "Money" /* Money */ && playerState.resources[resource].production < 0) {
        throw Error('Not enough production');
    }
    state.log.push({
        type: 'ProductionChange',
        player: player,
        resource: resource,
        from: playerState.resources[resource].production,
        to: playerState.resources[resource].production + n
    });
    return state;
}; };
var DrawAndChoose = function (nDraw, nKeep) { return function (state) {
    var _a = draw(nDraw, state), drawn = _a[0], newState = _a[1];
    state = newState;
    state.playerState[state.player].choices.push({
        type: 'KeepCards',
        cards: drawn,
        nKeep: nKeep,
        effects: [['KeepCards', drawn, nKeep]]
    });
    return state;
}; };
var Draw = function (n) { return function (state, action, choice) {
    var _a = draw(n, state), drawn = _a[0], newState = _a[1];
    newState.playerState[state.player].hand = newState.playerState[state.player].hand.concat(drawn);
    state.log.push({
        type: 'Draw',
        player: state.player,
        n: n
    });
    return newState;
}; };
var IncreaseTR = function (n) { return function (state) {
    if (typeof n !== 'number') {
        var effect = n[0], args = n.slice(1);
        n = REGISTRY[effect].apply(REGISTRY, args);
    }
    state.playerState[state.player].TR += n;
    state.playerState[state.player].hasIncreasedTRThisGeneration = true;
    state.log.push({
        type: 'IncreaseTR',
        player: state.player,
        from: state.playerState[state.player].TR - n,
        n: n
    });
    return state;
}; };
var IncreaseResourceValue = function (n, resource) { return function (state) {
    state.log.push({
        type: 'IncreaseResourceValue',
        player: state.player,
        from: state.playerState[state.player].conversions[resource],
        n: n
    });
    state.playerState[state.player].conversions[resource] += n;
    return state;
}; };
var IncreaseTemperature = function (n) { return function (state, action, choice) {
    if (state.globalParameters.Heat < 0 && state.globalParameters.Heat + 2 * n >= 0) {
        // Player gets to place an ocean
        state.playerState[state.player].choices.push({
            type: 'PlaceOcean',
            effects: [['PlaceOceans']]
        });
    }
    state.log.push({
        type: 'IncreaseTemperature',
        player: state.player,
        from: state.globalParameters.Heat,
        to: state.globalParameters.Heat + 2 * n
    });
    state.playerState[state.player].TR += n;
    state.playerState[state.player].hasIncreasedTRThisGeneration = true;
    state.globalParameters.Heat += 2 * n;
    return state;
}; };
var RaiseOxygen = function (delta) { return function (state, action, choice) {
    state.log.push({
        type: 'RaiseOxygen',
        player: state.player,
        from: state.globalParameters.Oxygen,
        to: state.globalParameters.Oxygen + delta
    });
    state.globalParameters.Oxygen += 1;
    state.playerState[state.player].TR += 1;
    state.playerState[state.player].hasIncreasedTRThisGeneration = true;
    return state;
}; };
var PlaceOceans = function () { return function (state, action, choice) {
    state.log.push({
        type: 'PlaceOceans',
        player: state.player
    });
    if (!isOcean(choice.location))
        throw Error('Not an ocean tile');
    state = placeTile(state, { owner: state.player, type: "ocean" /* Ocean */ }, choice.location);
    state.playerState[state.player].TR += 1;
    state.playerState[state.player].hasIncreasedTRThisGeneration = true;
    state.globalParameters.Oceans += 1;
    return state;
}; };
var PlaceLavaFlows = function () { return function (state, action, choice) {
    if (!isVolcano(choice.location))
        throw Error('Not an volcano tile');
    state = placeTile(state, { owner: state.player, type: "lavaFlows" /* LavaFlows */ }, choice.location);
    return state;
}; };
var PlaceCity = function () { return function (state, action, choice) {
    return placeTile(state, { owner: state.player, type: "city" /* City */ }, choice.location);
}; };
var PlaceSpecialCity = function (name) { return function (state, action, choice) {
    return placeSpecialTile(state, { owner: state.player, type: "city" /* City */ }, name);
}; };
var PlaceMiningArea = function () { return function (state, action, choice) {
    var bonus = getTileBonus(choice.location);
    if (bonus.indexOf("Steel" /* Steel */) < 0 && bonus.indexOf("Titanium" /* Titanium */) < 0)
        throw Error('Invalid tile for mining area');
    if (!isAdjacentToOwn(state, choice.location))
        throw Error('Not adjacent to own tile.');
    state = placeTile(state, { owner: state.player, type: "miningArea" /* MiningArea */ }, choice.location);
    state = ChangeProduction(1, choice.resource)(state);
    return state;
}; };
var PlaceMiningRights = function () { return function (state, action, choice) {
    var bonus = getTileBonus(choice.location);
    if (bonus.indexOf("Steel" /* Steel */) < 0 && bonus.indexOf("Titanium" /* Titanium */) < 0)
        throw Error('Invalid tile for mining area');
    state = placeTile(state, { owner: state.player, type: "miningArea" /* MiningArea */ }, choice.location);
    state = ChangeProduction(1, choice.resource)(state);
    return state;
}; };
var PlaceIndustrialCenter = function () { return function (state, action, choice) {
    // todo: check adjacency
    return placeTile(state, { owner: state.player, type: "industrialCenter" /* IndustrialCenter */ }, choice.location);
}; };
var PlaceGreenery = function () { return function (state, action, choice) {
    // todo: check adjacency
    state = placeTile(state, { owner: state.player, type: "greenery" /* Greenery */ }, choice.location);
    state.globalParameters.Oxygen += 1;
    state.playerState[state.player].TR += 1;
    state.playerState[state.player].hasIncreasedTRThisGeneration = true;
    return state;
}; };
var KeepCards = function (cards) { return function (state, action, choice) {
    state.playerState[state.player].hand = state.playerState[state.player].hand.concat(choice.cards);
    return state;
}; };
var PlaceGreeneryOnOcean = function () { return function (state, action, choice) {
    if (!isOcean(choice.location))
        throw Error('Not an ocean tile.');
    state = placeTile(state, { owner: state.player, type: "greenery" /* Greenery */ }, choice.location);
    state.globalParameters.Oxygen += 1;
    state.playerState[state.player].TR += 1;
    state.playerState[state.player].hasIncreasedTRThisGeneration = true;
    return state;
}; };
var OffsetRequirements = function (n) { return function (state, action, choice) {
    if (!state.playerState[state.player].globalRequirementsOffset)
        state.playerState[state.player].globalRequirementsOffset = 0;
    state.playerState[state.player].globalRequirementsOffset += n;
    return state;
}; };
var PlaceResearchOutpost = function () { return function (state, action, choice) {
    getAdjacentTiles(choice.location).forEach(function (_a) {
        var x = _a[0], y = _a[1];
        if (state.map[makeKeyFromPosition([x, y])])
            throw Error('Cannot be next to another tile.');
    });
    state = placeTile(state, { owner: state.player, type: "city" /* City */ }, choice.location);
    return state;
}; };




var PlaceUrbanizedArea = function () { return function (state, action, choice) {
    var nAdjacentCities = getAdjacentTiles(choice.location).filter(function (_a) {
        var x = _a[0], y = _a[1];
        return state.map[makeKeyFromPosition([x, y])] &&
            state.map[makeKeyFromPosition([x, y])].type === "city" /* City */;
    }).length;
    if (nAdjacentCities < 2)
        throw Error('Not next to 2 cities.');
    state = placeTile(state, { owner: state.player, type: "city" /* City */ }, choice.location);
    return state;
}; };
var PlaceNaturalPreserve = function () { return function (state, action, choice) {
    getAdjacentTiles(choice.location).forEach(function (_a) {
        var x = _a[0], y = _a[1];
        if (state.map[makeKeyFromPosition([x, y])])
            throw Error('Cannot be next to another tile.');
    });
    state = placeTile(state, { owner: state.player, type: "naturalPreserve" /* NaturalPreserve */ }, choice.location);
    return state;
}; };
var PlaceNoctis = function () { return function (state, action, choice) {
    state = placeTile(state, { owner: state.player, type: "city" /* City */ }, [-2, 0]);
    return state;
}; };
var PlaceMohole = function () { return function (state, action, choice) {
    if (!isOcean(choice.location))
        throw Error('Not an ocean tile');
    state = placeTile(state, { owner: state.player, type: "moholeArea" /* MoholeArea */ }, choice.location);
    return state;
}; };
var ChooseX = function (effects) { return function (state, action, choice) {
    var x = choice.x;
    state = applyEffects(state, { choices: effects.map(function (eff) { return ({ x: x }); }) }, effects);
    return state;
}; };
var Choice = function (args) { return function (state, action, choice) {
    var chosenEffects = args[choice.index];
    state = applyEffects(state, { choices: chosenEffects.map(function () { return choice; }) }, chosenEffects);
    return state;
}; };
var Branch = function (predicate, ifTrue, ifFalse) { return function (state, action) {
    var ok = predicate(state);
    state = applyEffects(state, action, ok ? ifTrue : ifFalse);
    return state;
}; };



/* Global Parameter Requirement Checks (for playing cards) */
var GlobalTypeWithinRange = function (param, min, max) { return function (state) {
    var playerState = state.playerState[state.player];
    var offset = playerState.globalRequirementsOffset || 0;
    // Check nextCardEffect; add if necessary -- maybe refactor this and do a type check on the arg types?
    if (playerState.nextCardEffect) {
        var _a = playerState.nextCardEffect, effectName = _a[0], args = _a.slice(1);
        if (effectName === "OffsetRequirements" /* OffsetRequirements */)
            offset = offset + args[0];
    }
    if (param === GlobalType.Heat)
        offset *= 2;
    return (state.globalParameters[param] >= min - offset && state.globalParameters[param] <= max + offset);
}; };
var MinOxygen = function (thresh) {
    return GlobalTypeWithinRange(GlobalType.Oxygen, thresh, Infinity);
};
var MaxOxygen = function (thresh) {
    return GlobalTypeWithinRange(GlobalType.Oxygen, -Infinity, thresh);
};
var MinHeat = function (thresh) { return GlobalTypeWithinRange(GlobalType.Heat, thresh, Infinity); };
var MaxHeat = function (thresh) { return GlobalTypeWithinRange(GlobalType.Heat, -Infinity, thresh); };
var MinOceans = function (thresh) {
    return GlobalTypeWithinRange(GlobalType.Oceans, thresh, Infinity);
};
var MaxOceans = function (thresh) {
    return GlobalTypeWithinRange(GlobalType.Oceans, -Infinity, thresh);
};
/* Card Tag Requirement Check */
var HasTags = function (minimum, tag) {
    return function (state) { return GetTags(tag)(state) >= minimum; };
};
var HasCitiesOnMars = function (minimum) {
    return function (state) { return true; };
};
/* Compute VP as a function of card resources */




/* After card triggers */
var IsSubset = function (required, options) {
    var isInOptions = required.map(function (x) { return options.find(function (y) { return x === y; }) != null; });
    return isInOptions.every(function (x) { return x; });
};
var PlayedTagMatches = function (tags) {
    return function (card, cardPlayer, owner) {
        if (owner === cardPlayer) {
            var playedTagMatches = tags.map(function (x) { return IsSubset(x, card.tags ? card.tags : []); }).some(function (x) { return x; });
            return playedTagMatches;
        }
        else {
            return false;
        }
    };
};
var AnyPlayedTagMatches = function (tags) {
    return function (card, cardPlayer, owner) {
        var playedTagMatches = tags.map(function (x) { return IsSubset(x, card.tags ? card.tags : []); }).some(function (x) { return x; });
        return playedTagMatches;
    };
};
var PlayedMinCost = function (min) {
    return function (card, cardPlayer, owner) {
        if (owner == cardPlayer) {
            return card.cost >= min;
        }
        else {
            return false;
        }
    };
};
var AFTER_CARD_REGISTRY = {
    PlayedTagMatches: PlayedTagMatches,
    AnyPlayedTagMatches: AnyPlayedTagMatches,
    PlayedMinCost: PlayedMinCost
};
var applyAfterCardTrigger = function (state, card, player, curCard, curPlayer) {
    if (card.afterCardTriggers) {
        var _a = card.afterCardTriggers[0], opName = _a[0], args = _a.slice(1);
        var effects = card.afterCardTriggers[1];
        var condition = AFTER_CARD_REGISTRY[opName].apply(AFTER_CARD_REGISTRY, args);
        if (condition(curCard, curPlayer, player)) {
            applyEffects(state, { player: player, choices: [] }, effects); // Is it always true that choice is 0?
        }
    }
};
var applyAfterCardTriggers = function (state, currentCard, currentPlayer) {
    state.players.forEach(function (otherPlayer) {
        state.playerState[otherPlayer].played.map(getCardByName).forEach(function (otherCard) {
            applyAfterCardTrigger(state, otherCard, otherPlayer, currentCard, currentPlayer);
        });
    });
    return state;
};
/* After project triggers */


var GetTags = function (tag, ratio) {
    if (ratio === void 0) { ratio = 1; }
    return function (state) {
        return Math.floor(GetPlayerTags(tag, state.player)(state) / ratio);
    };
};
var GetAllTags = function (tag) { return function (state) {
    return lodash.sum(state.players.map(function (player) { return GetPlayerTags(tag, player)(state); }));
}; };
var GetPlayerTags = function (tag, player) { return function (state) {
    var allPlayed = state.playerState[player].played
        .map(getCardByName)
        .filter(function (card) { return tag === 'Event' || card.type !== 'Event'; }).concat([
        getCorporationByName(state.playerState[player].corporation),
    ]);
    return lodash.flatMap(allPlayed, function (card) { return card.tags || []; }).filter(function (t) { return t === tag; }).length;
}; };



var GetX = function () { return function (state, action, choice) {
    return choice.x;
}; };
var Neg = function (fn) { return function (state, action, choice) {
    return -fn(state, action, choice);
}; };
var AddNextCardEffect = function (nextCardEffect) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    return function (state, action, choice, card) {
        var playerState = state.playerState[state.player];
        playerState.nextCardEffect = [nextCardEffect].concat(args);
        return state;
    };
};
var REGISTRY = {
    AddNextCardEffect: AddNextCardEffect,
    DecreaseAnyProduction: DecreaseAnyProduction,
    DecreaseAnyInventory: DecreaseAnyInventory,
    ChangeCardResource: ChangeCardResource,
    ChangeAnyCardResource: ChangeAnyCardResource,
    ChangeInventory: ChangeInventory,
    ChangeProduction: ChangeProduction,
    Choice: Choice,
    Draw: Draw,
    DrawAndChoose: DrawAndChoose,
    GetAllTags: GetAllTags,
    ChooseX: ChooseX,
    Neg: Neg,
    GetX: GetX,
    GetTags: GetTags,
    IncreaseTR: IncreaseTR,
    IncreaseTemperature: IncreaseTemperature,
    IncreaseResourceValue: IncreaseResourceValue,
    RaiseOxygen: RaiseOxygen,
    PlaceOceans: PlaceOceans,
    PlaceCity: PlaceCity,
    PlaceSpecialCity: PlaceSpecialCity,
    PlaceUrbanizedArea: PlaceUrbanizedArea,
    PlaceGreenery: PlaceGreenery,
    PlaceGreeneryOnOcean: PlaceGreeneryOnOcean,
    PlaceLavaFlows: PlaceLavaFlows,
    PlaceMohole: PlaceMohole,
    PlaceMiningArea: PlaceMiningArea,
    PlaceMiningRights: PlaceMiningRights,
    PlaceNaturalPreserve: PlaceNaturalPreserve,
    PlaceResearchOutpost: PlaceResearchOutpost,
    PlaceIndustrialCenter: PlaceIndustrialCenter,
    PlaceNoctis: PlaceNoctis,
    SellCards: SellCards,
    Branch: Branch,
    HasTags: HasTags,
    OffsetRequirements: OffsetRequirements,
    // Choices only
    KeepCards: KeepCards
};
var fromJSON = function (obj) {
    if (obj instanceof Array && typeof obj[0] === 'string') {
        var opName = obj[0], args = obj.slice(1);
        if (!REGISTRY[opName])
            return obj;
        return REGISTRY[opName].apply(REGISTRY, args.map(fromJSON));
    }
    else {
        return obj;
    }
};
var applyEffects = function (state, action, effects, card) {
    lodash.zip(action.choices || [], effects).forEach(function (_a) {
        var choice = _a[0], effect = _a[1];
        var effectFn = fromJSON(effect);
        state = effectFn(state, action, choice, card);
    });
    return state;
};
function isSubset(l1, l2) {
    var s1 = new Set(l1);
    var s2 = new Set(l2);
    for (var _i = 0, _a = Array.from(s1.values()); _i < _a.length; _i++) {
        var elem = _a[_i];
        if (!s2.has(elem)) {
            return false;
        }
    }
    return true;
}
var changeInventory = function (state, player, resource, delta) {
    if (delta != 0) {
        state.log.push({
            type: 'ChangeInventory',
            player: player,
            resource: resource,
            from: state.playerState[player].resources[resource].count,
            to: state.playerState[player].resources[resource].count + delta
        });
    }
    state.playerState[player].resources[resource].count += delta;
    if (state.playerState[player].resources[resource].count < 0) {
        throw Error('Not enough resources');
    }
    return state;
};
var cloneState = function (state) { return lodash.cloneDeep(state); };
function clone(x) {
    return lodash.cloneDeep(x);
}
var REQUIREMENTS_REGISTRY = {
    MinOxygen: MinOxygen,
    MaxOxygen: MaxOxygen,
    MinOceans: MinOceans,
    MaxOceans: MaxOceans,
    MinHeat: MinHeat,
    MaxHeat: MaxHeat,
    HasTags: HasTags,
    HasCitiesOnMars: HasCitiesOnMars
};
var fromJSONRequires = function (obj) {
    if (obj instanceof Array) {
        var opName = obj[0], args = obj.slice(1);
        if (!REQUIREMENTS_REGISTRY[opName]) {
            // maybe this shouldn't throw an error
            throw Error('could not find ' + opName);
        }
        return REQUIREMENTS_REGISTRY[opName].apply(REQUIREMENTS_REGISTRY, args);
    }
    else {
        return obj;
    }
};
var checkCardRequirements = function (card, state) {
    // todo: check if can pay for it as well?
    var requirementArray = card.requires ? card.requires : [];
    if (requirementArray) {
        var requirementResults = requirementArray.map(function (requirement) {
            return fromJSONRequires(requirement)(state);
        });
        if (requirementResults.every(function (x) { return x; })) {
            return true;
        }
        else {
            return false;
        }
    }
    else {
        return true;
    }
};
var applyAfterTileTriggers = function (state, tile) {
    state.players.forEach(function (player) {
        var cards = state.playerState[player].played.map(getCardByName).concat([
            getCorporationByName(state.playerState[player].corporation),
        ]);
        cards.forEach(function (card) {
            if (card.afterTileTriggers) {
                var triggers = card.afterTileTriggers;
                triggers.forEach(function (trigger) {
                    var _a = trigger[0], type = _a[0], ownTile = _a[1], effects = trigger[1];
                    if (type === tile.type && (!ownTile || tile.owner === player)) {
                        state = applyEffects(state, { player: player, choices: [] }, effects, card);
                    }
                });
            }
        });
    });
    return state;
};
var getOceanRefund = function (state, position) {
    var numAdjacentOceans = getAdjacentTiles(position)
        .map(makeKeyFromPosition) // Make string key from the position
        .map(function (key) { return (state.map[key] ? state.map[key].type === "ocean" /* Ocean */ : false); }) // Check if ocean
        .map(function (foundOcean) { return (foundOcean ? 1 : 0); })
        .reduce(function (x, y) { return x + y; }); // Sum together number of oceans found
    var oceanMultiplier = 2;
    return numAdjacentOceans * oceanMultiplier;
};
var placeSpecialTile = function (state, tile, name) {
    state.map[name] = tile;
    state = applyAfterTileTriggers(state, tile);
    return state;
};
var placeTile = function (state, tile, position) {
    var x = position[0], y = position[1];
    var key = makeKeyFromPosition(position);
    if (state.map[key])
        throw Error('Tile location taken.');
    state.map[key] = tile;
    // todo: check restrictions on tiles
    var bonuses = getTileBonus(position);
    bonuses.forEach(function (bonus) {
        if (bonus === "Card" /* Card */) {
            state = Draw(1)(state, {}, {});
        }
        else if (bonus === "Plant" /* Plant */) {
            state = changeInventory(state, state.player, "Plant" /* Plant */, 1);
        }
        else if (bonus === "Steel" /* Steel */) {
            state = changeInventory(state, state.player, "Steel" /* Steel */, 1);
        }
        else if (bonus === "Titanium" /* Titanium */) {
            state = changeInventory(state, state.player, "Titanium" /* Titanium */, 1);
        }
    });
    var oceanRefund = getOceanRefund(state, position);
    state = changeInventory(state, state.player, "Money" /* Money */, oceanRefund);
    state = applyAfterTileTriggers(state, tile);
    return state;
};

var STANDARD_PROJECTS = (_a$1 = {}, _a$1["SellPatents" /* SellPatents */] = {
        name: 'Sell Patents',
        cost: 0,
        effects: [['SellCards']]
    }, _a$1["PowerPlant" /* PowerPlant */] = {
        name: 'Power Plant',
        cost: 11,
        effects: [
            ['ChangeInventory', -11, "Money" /* Money */],
            ['ChangeProduction', 1, "Energy" /* Energy */],
        ]
    }, _a$1["Asteroid" /* Asteroid */] = {
        name: 'Asteroid',
        cost: 14,
        effects: [['ChangeInventory', -14, "Money" /* Money */], ['IncreaseTemperature', 1]]
    }, _a$1["Aquifer" /* Aquifer */] = {
        name: 'Aquifer',
        cost: 18,
        effects: [['ChangeInventory', -18, "Money" /* Money */], ['PlaceOceans', 1]]
    }, _a$1["Greenery" /* Greenery */] = {
        name: 'Greenery',
        cost: 23,
        effects: [['ChangeInventory', -23, "Money" /* Money */], ['PlaceGreenery']]
    }, _a$1["City" /* City */] = {
        name: 'City',
        cost: 25,
        effects: [
            ['ChangeInventory', -25, "Money" /* Money */],
            ['PlaceCity'],
            ['ChangeProduction', 1, "Money" /* Money */],
        ]
    }, _a$1);
var _a$1;

var c = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return function (state, action) {
        var newState = state;
        args.forEach(function (fn) { return (newState = fn(newState, action)); });
        return newState;
    };
};
var changeProduction = function (delta, resource) { return function (state) {
    var playerState = state.playerState[state.player];
    playerState.resources[resource].production += delta;
    return state;
}; };
var costs = function (cost, resource) { return changeProduction(-cost, resource); };
var raiseHeat = function (state) { return state; };
var MAX_OXYGEN = 14;
var raiseOxygen = function (state) {
    if (state.globalParameters.Oxygen < MAX_OXYGEN) {
        state.globalParameters.Oxygen += 1;
        state.playerState[state.player].TR += 1;
    }
    return state;
};
var placeGreenery = function (state, action) {
    state.map[action.position] = {
        type: "greenery" /* Greenery */,
        owner: state.player
    };
    return raiseOxygen(state);
};
var generationProduction = function (state) {
    state.players.forEach(function (player) {
        var playerState = state.playerState[player];
        // Convert energy into heat.
        playerState.resources["Heat" /* Heat */].count +=
            playerState.resources["Energy" /* Energy */].count;
        playerState.resources["Energy" /* Energy */].count = 0;
        // Produce each resource.
        RESOURCE_TYPES.forEach(function (resource) {
            var production = playerState.resources[resource].production;
            if (resource === "Money" /* Money */) {
                production += playerState.TR;
            }
            playerState.resources[resource].count += production;
        });
    });
    return state;
};
var resetNewGeneration = function (state) {
    state.generation++;
    state.passed = {};
    state.draft = {};
    state.firstPlayer =
        state.players[(state.players.indexOf(state.firstPlayer) + 1) % state.players.length];
    state.actionsDone = 0;
    state.player = state.firstPlayer;
    state.players.forEach(function (player) {
        var playerState = state.playerState[player];
        playerState.hasIncreasedTRThisGeneration = false;
        playerState.cardActionsUsedThisGeneration = {};
    });
    return state;
};
var normalProduction = {
    GREENERY: c(costs(8, "Plant" /* Plant */), placeGreenery),
    RAISE_HEAT: c(costs(8, "Heat" /* Heat */), raiseHeat)
};
var SEED = 'martin';
var INITIAL_RESOURCES = (_a = {}, _a["Money" /* Money */] = { production: 0, count: 0 }, _a["Titanium" /* Titanium */] = { production: 0, count: 0 }, _a["Steel" /* Steel */] = { production: 0, count: 0 }, _a["Plant" /* Plant */] = { production: 0, count: 0 }, _a["Energy" /* Energy */] = { production: 0, count: 0 }, _a["Heat" /* Heat */] = { production: 0, count: 0 }, _a);
var getInitialGameState = function (players, seed) {
    if (seed === void 0) { seed = SEED; }
    var state = {
        phase: "ChoosingCorporations" /* ChoosingCorporations */,
        generation: 0,
        players: players,
        firstPlayer: players[0],
        playerState: {},
        passed: {},
        player: players[0],
        actionsDone: 0,
        deck: shuffle(CARDS.map(function (card) { return card.name; }), SEED),
        discards: [],
        globalParameters: {
            Oxygen: 0,
            Oceans: 0,
            Heat: -30
        },
        map: {},
        milestones: [],
        awards: [],
        log: [],
        // Private
        draft: {},
        choosingCards: {},
        choosingCorporations: {},
        seed: SEED
    };
    var shuffled = shuffle(CORPORATIONS, SEED);
    state.players.forEach(function (player, i) {
        state.choosingCorporations[player] = shuffled.splice(2 * i, 2).map(function (c) { return c.name; });
        state.playerState[player] = {
            TR: 20,
            hand: [],
            played: [],
            corporation: '',
            cardResources: {},
            cardActionsUsedThisGeneration: {},
            hasIncreasedTRThisGeneration: false,
            globalRequirementsOffset: 0,
            resources: clone(INITIAL_RESOURCES),
            choices: [],
            statuses: {},
            nextCardEffect: null,
            conversions: {
                Titanium: 3,
                Steel: 2
            }
        };
    });
    state = setupInitialHands(state);
    return state;
};
var getDiscount = function (played, corporation, nextCardEffect, card) {
    var delta = 0;
    // Examine played cards for discounts
    played.forEach(function (playedCard) {
        if (playedCard.discounts) {
            playedCard.discounts.forEach(function (_a) {
                var discountDelta = _a[0], tags = _a[1];
                if (tags) {
                    if (isSubset(tags, card.tags || [])) {
                        delta += discountDelta;
                    }
                }
                else {
                    delta += discountDelta;
                }
            });
        }
    });
    // Examine corporation for discount
    if (corporation && corporation.discounts) {
        corporation.discounts.forEach(function (_a) {
            var discountDelta = _a[0], tags = _a[1];
            if (tags) {
                if (isSubset(tags, card.tags || [])) {
                    delta += discountDelta;
                }
            }
            else {
                delta += discountDelta;
            }
        });
    }
    // Examine if there are any next card effects
    if (nextCardEffect) {
        var effectName = nextCardEffect[0], args = nextCardEffect.slice(1);
        if (effectName === "Discount" /* Discount */)
            delta += args[0];
    }
    return delta;
};
var buyCards = function (state, player, chosen, free) {
    if (free === void 0) { free = false; }
    // todo: Check subset of player
    // state.choosingCards[player]
    if (!free) {
        state = changeInventory(state, player, "Money" /* Money */, -chosen.length * 3);
    }
    state.playerState[player].hand = state.playerState[player].hand.concat(chosen);
    delete state.choosingCards[player];
    // Add remaining to discard
    state.log.push({
        type: 'BuyCards',
        player: player,
        n: chosen.length
    });
    return state;
};
var isDoneBuyingCards = function (state) {
    return state.players.map(function (player) { return !state.choosingCards[player]; }).every(function (x) { return x; });
};
var isDoneChoosingCorporations = function (state) {
    return state.players.map(function (player) { return !state.choosingCorporations[player]; }).every(function (x) { return x; });
};
var milestoneChecks = (_b = {}, _b["Terraformer" /* Terraformer */] = function (state) { return state.playerState[state.player].TR >= 35; }, _b["Builder" /* Builder */] = HasTags(8, "Building" /* Building */), _b["Planner" /* Planner */] = function (state) { return state.playerState[state.player].hand.length >= 16; }, _b);
var awardFns = (_c = {}, _c["Landlord" /* Landlord */] = function (state, player) {
        return Object.keys(state.map)
            .map(function (key) { return state.map[key].owner; })
            .filter(function (owner) { return owner === player; }).length;
    }, _c["Banker" /* Banker */] = function (state, player) {
        return state.playerState[player].resources["Money" /* Money */].production;
    }, _c["Scientist" /* Scientist */] = function (state, player) { return GetPlayerTags("Science" /* Science */, player)(state); }, _c["Thermalist" /* Thermalist */] = function (state, player) {
        return state.playerState[player].resources["Heat" /* Heat */].count;
    }, _c["Miner" /* Miner */] = function (state, player) {
        return state.playerState[player].resources["Steel" /* Steel */].count +
            state.playerState[player].resources["Titanium" /* Titanium */].count;
    }, _c);
var AWARD_COSTS = [8, 14, 20];
var fundAward = function (state, award) {
    var cost = AWARD_COSTS[state.awards.length];
    state.playerState[state.player].resources["Money" /* Money */].count -= cost;
    state.awards.push({
        player: state.player,
        award: award
    });
    return state;
};
var haveAllPassed = function (state) {
    return state.players.map(function (player) { return state.passed[player]; }).every(function (x) { return x; });
};
var switchToNextPlayer = function (state) {
    if (haveAllPassed(state)) {
        // Generation over.
        state = generationProduction(state);
        state = resetNewGeneration(state);
        state = setupDraft(state);
        state.phase = "Draft" /* Draft */;
        return state;
    }
    var playerIndex = state.players.indexOf(state.player);
    var offset = 1;
    var nextPlayer = state.player;
    while (true) {
        nextPlayer = state.players[(playerIndex + offset) % state.players.length];
        if (!state.passed[nextPlayer])
            break;
        offset++;
    }
    state.player = nextPlayer;
    state.playerState[state.player].choices = [];
    state.actionsDone = 0;
    return state;
};
var turnActionHandlers = (_d = {}, _d["ClaimMilestone" /* ClaimMilestone */] = function (state, action) { }, _d["FundAward" /* FundAward */] = function (state, action) {
        return fundAward(state, action.award);
    }, _d["StandardProject" /* StandardProject */] = function (state, action) {
        state.log.push({
            type: 'StandardProject',
            project: action.project
        });
        state = applyEffects(state, action, STANDARD_PROJECTS[action.project].effects);
        // standard project triggers
        return state;
    }, _d["PlantGreenery" /* PlantGreenery */] = function (state, action) {
        var greeneryCost = state.playerState[state.player].corporation === 'Ecoline' ? 7 : 8;
        state = applyEffects(state, action, [
            ['PlaceGreenery'],
            ['ChangeInventory', -greeneryCost, "Plant" /* Plant */],
        ]);
        return state;
    }, _d["RaiseHeat" /* RaiseHeat */] = function (state, action) {
        state = applyEffects(state, action, [
            ['IncreaseTemperature', 1],
            ['ChangeInventory', -8, "Heat" /* Heat */],
        ]);
        // standard project triggers
        return state;
    }, _d["PlayCard" /* PlayCard */] = function (state, action) {
        var playerState = state.playerState[state.player];
        var cardName = action.card;
        var card = getCardByName(action.card);
        // Check requirements
        var meetsRequirements = checkCardRequirements(card, state);
        if (!meetsRequirements)
            throw new Error('Does not meet requirements');
        // Get discount
        var played = playerState.played.map(getCardByName);
        var corporation = getCorporationByName(playerState.corporation);
        var discount = getDiscount(played, corporation, playerState.nextCardEffect, card);
        var actualCost = Math.max(0, card.cost - discount);
        var resources = {
            Money: action.resources.Money || 0,
            Steel: action.resources.Steel || 0,
            Titanium: action.resources.Titanium || 0
        };
        state.log.push({
            type: 'PlayCard',
            player: state.player,
            card: action.card,
            resources: resources
        });
        var paidFor = resources.Money +
            playerState.conversions.Steel * resources.Steel +
            playerState.conversions.Titanium * resources.Titanium;
        if ((card.tags || []).indexOf("Building" /* Building */) === -1 && resources.Steel > 0)
            throw Error('Cannot use steel.');
        if ((card.tags || []).indexOf("Space" /* Space */) === -1 && resources.Titanium > 0)
            throw Error('Cannot use titanium.');
        if (paidFor < actualCost)
            throw Error('Did not pay enough.');
        changeInventory(state, state.player, "Money" /* Money */, -resources.Money);
        changeInventory(state, state.player, "Steel" /* Steel */, -resources.Steel);
        changeInventory(state, state.player, "Titanium" /* Titanium */, -resources.Titanium);
        // Play to board and remove from hand
        playerState.played.push(cardName);
        lodash.pull(playerState.hand, cardName);
        // Card effects (read choices)
        if (card.effects) {
            state = applyEffects(state, action, card.effects, card);
        }
        // Clear any "next card effects" from the player state
        if (playerState.nextCardEffect)
            playerState.nextCardEffect = null;
        // After-card triggers
        state = applyAfterCardTriggers(state, card, state.player);
        return state;
    }, _d["CardAction" /* CardAction */] = function (state, action) {
        var card = getCardByName(action.card);
        var cardActions = card.actions;
        if (!cardActions || !cardActions[action.index])
            throw Error('Invalid action.');
        if (state.playerState[state.player].cardActionsUsedThisGeneration[action.card])
            throw Error('Card already used.');
        var effects = cardActions[action.index];
        state = applyEffects(state, action, effects, card);
        state.playerState[state.player].cardActionsUsedThisGeneration[action.card] = true;
        return state;
    }, _d);
// Enumerates all client messages.
var handlers = (_e = {}, _e["DraftRoundChoice" /* DraftRoundChoice */] = function (state, action) {
        state = handlePlayerChoice(state, action.player, action.choice);
        if (isDraftDone(state)) {
            state = startActions(state);
        }
        return state;
    }, _e["CorpAndCardsChoice" /* CorpAndCardsChoice */] = function (state, action) {
        // Assign corp and initial bonuses
        state.playerState[action.player].corporation = action.corporation;
        var corporation = getCorporationByName(action.corporation);
        state.playerState[action.player].resources["Money" /* Money */].count = corporation.startingMoney;
        delete state.choosingCorporations[action.player];
        // Buy and possibly pay for cards
        var cardsAreFree = corporation.name === 'Beginner Corporation';
        state = buyCards(state, action.player, action.cards, cardsAreFree);
        // Possible corporation effects
        if (corporation.effects) {
            state = applyEffects(state, action, corporation.effects);
        }
        if (isDoneChoosingCorporations(state)) {
            state.phase = "Actions" /* Actions */;
            state.player = state.firstPlayer;
            state.passed = {};
        }
        return state;
    }, _e["BuyCards" /* BuyCards */] = function (state, action) {
        state = buyCards(state, action.player, action.chosen);
        if (isDoneBuyingCards(state)) {
            state.phase = "Actions" /* Actions */;
            state.player = state.firstPlayer;
            state.passed = {};
        }
        return state;
    }, _e["Action" /* Action */] = function (state, action) {
        if (action.player && action.player !== state.player)
            throw Error('Invalid player');
        state = turnActionHandlers[action.actionType](state, action);
        // Check if any remaining choices.
        if (state.playerState[state.player].choices.length > 0) {
            state.phase = "Choices" /* Choices */;
            return state;
        }
        state.actionsDone++;
        if (state.actionsDone === 2) {
            // Get next player.
            state = switchToNextPlayer(state);
        }
        return state;
    }, _e["Choices" /* Choices */] = function (state, action) {
        if (action.player && action.player !== state.player)
            throw Error('Invalid player');
        var currentChoice = state.playerState[state.player].choices[0];
        state.playerState[state.player].choices.splice(0, 1);
        state = applyEffects(state, action, currentChoice.effects);
        if (state.playerState[state.player].choices.length > 0) {
            state.phase = "Choices" /* Choices */;
            return state;
        }
        state.actionsDone++;
        state.phase = "Actions" /* Actions */;
        if (state.actionsDone === 2) {
            // Get next player.
            state = switchToNextPlayer(state);
        }
        return state;
    }, _e["Cede" /* Cede */] = function (state, action) {
        if (action.player && action.player !== state.player)
            throw Error('Invalid player');
        // Get next player.
        if (state.actionsDone === 0)
            throw Error('Cannot cede without acting.');
        state = switchToNextPlayer(state);
        state.log.push({
            type: 'Cede',
            player: action.player
        });
        return state;
    }, _e["Pass" /* Pass */] = function (state, action) {
        if (action.player && action.player !== state.player)
            throw Error('Invalid player');
        // Get next player.
        state.passed[state.player] = true;
        state = switchToNextPlayer(state);
        state.log.push({
            type: 'Pass',
            player: action.player
        });
        return state;
    }, _e.CHOOSE_BUY_OR_DISCARD = function () { }, _e.CHOOSE_DISCARD = function () { }, _e);
var startActions = function (state) {
    state.player = state.firstPlayer;
    state.phase = "CardBuying" /* CardBuying */;
    state.players.forEach(function (player) {
        state.choosingCards[player] = state.draft[player].taken;
        delete state.draft[player];
    });
    return state;
};
var handleAction = function (state, action) {
    var stateCopy = cloneState(state);
    if (handlers[action.type]) {
        // try {
        return handlers[action.type](state, action);
        // } catch (e) {
        //   console.error('Action failed', action, e)
        // } finally {
        //   return stateCopy
        // }
    }
    return stateCopy;
};
var getClientState = function (state, player) {
    var publicState = lodash.omit(state, [
        'playerState',
        'deck',
        'seed',
        'draft',
        'choosingCards',
        'choosingCorporations',
    ]);
    publicState.playerState = lodash.mapValues(state.playerState, function (pstate, p) { return (p === player ? pstate : lodash.omit(pstate, ['hand'])); });
    var keys = ['draft', 'choosingCards', 'choosingCorporations'];
    keys.forEach(function (key) {
        publicState[key] = lodash.pick(state[key], player);
    });
    publicState['deckSize'] = state.deck.length;
    return publicState;
};
// Used by server.
var TerraformingMars = {
    getInitialState: getInitialGameState,
    reducer: handleAction,
    getClientState: getClientState
};
var _a;
var _b;
var _c;
var _d;
var _e;

var TEST_SEED = 'martin';
var getStateAfterActions = function () {
    var state = getInitialGameState(['a', 'b'], TEST_SEED);
    state.firstPlayer = 'a';
    handleAction(state, {
        type: "CorpAndCardsChoice" /* CorpAndCardsChoice */,
        player: 'a',
        corporation: 'Ecoline',
        cards: [
            'Equatorial Magnetizer',
            'Interstellar Colony Ship',
            'Gene Repair',
            'Trans-Neptune Probe',
        ]
    });
    handleAction(state, {
        type: "CorpAndCardsChoice" /* CorpAndCardsChoice */,
        player: 'b',
        corporation: 'Beginner Corporation',
        cards: state.choosingCards['b']
    });
    return state;
};

// import {PowerGrid} from '../../../games/power-grid/src/index'
var GAMES = {
    // PowerGrid,
    TerraformingMars: TerraformingMars
};
var RedisStorage = /** @class */ (function () {
    function RedisStorage(params, playerConnection) {
        this.playerConnection = playerConnection;
        this.playerConnection.setStorage(this);
        this.connect(params);
    }
    RedisStorage.prototype.connect = function (params) {
        this.client = handyRedis.createHandyClient(params);
        this.client.redis.on('error', function (err) {
            console.error(err);
        });
    };
    RedisStorage.prototype.createUser = function (id) {
        // return r
        //   .table'users')
        //   .insert({id})
        //   .run(this.connection)
        return Promise.resolve(true);
    };
    RedisStorage.prototype.getRoom = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var roomStr;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.client.get(id)];
                    case 1:
                        roomStr = _a.sent();
                        if (!!roomStr) return [3 /*break*/, 3];
                        roomStr = JSON.stringify({ id: id, g: 'TerraformingMars' });
                        return [4 /*yield*/, this.client.set(id, roomStr)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/, JSON.parse(roomStr)];
                }
            });
        });
    };
    RedisStorage.prototype.updateRoom = function (id, update) {
        return __awaiter(this, void 0, void 0, function () {
            var room, updated;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getRoom(id)];
                    case 1:
                        room = _a.sent();
                        updated = __assign({}, room, update(room));
                        return [4 /*yield*/, this.client.set(id, JSON.stringify(updated))];
                    case 2:
                        _a.sent();
                        this.playerConnection.notifyRoom(updated, updated.g && GAMES[updated.g].getClientState);
                        return [2 /*return*/];
                }
            });
        });
    };
    RedisStorage.prototype.onRoomJoin = function (id, player) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log('room join', id, player);
                return [2 /*return*/, this.updateRoom(id, function (room) { return ({
                        users: Array.from(new Set((room.users || []).concat([player])))
                    }); })];
            });
        });
    };
    RedisStorage.prototype.onRoomLeave = function (id, player) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.updateRoom(id, function (room) { return ({
                        users: (room.users || []).filter(function (user) { return user !== player; })
                    }); })];
            });
        });
    };
    RedisStorage.prototype.onRoomStart = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var room, game;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getRoom(id)];
                    case 1:
                        room = (_a.sent());
                        console.log('start', room, GAMES[room.g]);
                        game = getStateAfterActions();
                        console.log('new', game);
                        return [2 /*return*/, this.updateRoom(id, function (room) { return ({
                                game: game
                            }); })];
                }
            });
        });
    };
    RedisStorage.prototype.onRoomMove = function (id, player, move) {
        return __awaiter(this, void 0, void 0, function () {
            var room, state, newState;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('move', id, player, move);
                        return [4 /*yield*/, this.getRoom(id)];
                    case 1:
                        room = (_a.sent());
                        state = room.game;
                        newState = cloneState(state);
                        try {
                            newState = GAMES[room.g].reducer(state, __assign({}, move, { player: player }));
                        }
                        catch (e) {
                            console.log(e);
                        }
                        // console.log('new state', newState)
                        return [2 /*return*/, this.updateRoom(id, function (room) { return ({
                                game: newState
                            }); })];
                }
            });
        });
    };
    RedisStorage.prototype.onRoomReset = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.onRoomStart(id);
                return [2 /*return*/];
            });
        });
    };
    return RedisStorage;
}());

var PORT = 3000;
var express = express_;
var app = express();
var server = new http.Server(app);
var socketServer = new SocketServer(server);
socketServer.start();
var gameStorage = new RedisStorage({
    host: process.env.REDIS_HOST || 'localhost',
    password: process.env.REDIS_PASSWORD || '',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    db: '1'
}, socketServer);
server.listen(PORT, function () {
    console.log('Listening on', PORT);
});
var healthApp = express();
var healthServer = new http.Server(app);
healthApp.get('/', function (req, res) { return res.send('Hello World!'); });
healthApp.get('/.well-known/acme-challenge/1bT0BoqfQkvgMziCRNkxXrPHDVlDioTas4ijW667jhg', function (req, res) {
    return res.send('1bT0BoqfQkvgMziCRNkxXrPHDVlDioTas4ijW667jhg.3YYmf2dm6hNdyTzGpYLNEVkTtynr72JFE0eKuewhzQE');
});
healthApp.listen(3002);
