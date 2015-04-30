var PSGO = require('../PSGO');
var cards = PSGO.cards;
var packs = PSGO.packs;
var packsKeys = Object.keys(packs);

// Storage for user's packs.
var users = {};

// temp card storage
var cards = {};

var colors = {
    Legendary: '#FF851B',
    Epic: 'purple',
    Rare: '#0074D9',
    Uncommon: 'gray',
    Common: 'black'
};

module.exports = {
    card: function(target, room, user) {
        if (!this.canBroadcast()) return;
        if (!target) return;
        if (!cards[user.userid]) cards[user.userid] = [];
        if (!cards[user.userid].length === 0) return this.sendReply('You have no cards.');

        var match, cardInstance;
        cards[user.userid].forEach(function(card) {
            if (card.id === target) {
                match = true;
                cardInstance = card;
            }
        });

        if (!match) {
            return this.sendReply('Card not found.');
        }

        this.sendReplyBox(createCardDisplay(cardInstance));
    },

    openpack: function(target, room, user) {
        if (!this.canBroadcast()) return;
        if (!target) {
            this.sendReply('/openpack [pack]');
            this.sendReply('note this is just for testing, you can open any pack');
            this.sendReply('availiable packs:');
            this.sendReply(Object.keys(packs).join(', '));
            return;
        }
        if (packsKeys.indexOf(target.toLowerCase()) < 0) return this.sendReply('This pack does not exist.');
        console.log(JSON.stringify(users));
        if (!users[user.userid] || users[user.userid].length === 0) return this.sendReply('You have no packs.');

        var packId = users[user.userid].splice(target.toLowerCase(), 1);
        console.log(JSON.stringify(users));
        var pack = packs[packId]();
        var cardIndex = pack.length - 1;
        var card = pack[cardIndex];

        var display = '<marquee scrollamount="15" loop="2">';
        pack.forEach(function(card, index) {
            if (index !== cardIndex) {
                display += '<img src="' + card.card + '">&nbsp;&nbsp;&nbsp;';
            } else {
                display += '<blink><img src="' + card.card + '"></blink></marquee>';
            }
        });

        if (!cards[user.userid]) cards[user.userid] = [];
        cards[user.userid].push(card);
        console.log(JSON.stringify(cards));

        var cardName = toTitleCase(card.name);
        var packName = toTitleCase(target.toLowerCase());
        this.sendReplyBox(display);
        setTimeout(function() {
            room.addRaw(user.name + ' got <font color="' + colors[card.rarity] + '">' + card.rarity + '</font>' +
            ' <b>' + cardName + '</b> from a <button name="send" value="/buypack ' + packName + '">' + packName + ' Pack</button>.');
            room.update();
            this.sendReplyBox('You got <font color="' + colors[card.rarity] + '">' + card.rarity + '</font>\
            <button name="send" value="/card ' + card.id + '"><b>' + cardName + '</b></button> from a \
            <button name="send" value="/buypack ' + packName + '">' + packName + ' Pack</button>.');
        }.bind(this), 1000 * 18);
    },

    givepack: function(target, room, user) {
        if (!user.can('givepack')) return false;
        if (!target) return this.sendReply('/givepack [user], [pack] - Give a user a pack.');

        var parts = target.split(',');
        this.splitTarget(parts[0]);
        if (!parts[1]) return this.sendReply('/givepack [user], [pack] - Give a user a pack.');
        var pack = parts[1].toLowerCase().trim();

        if (packsKeys.indexOf(pack) < 0) return this.sendReply('This pack does not exist.');
        if (!this.targetUser) return this.sendReply('User ' + this.targetUsername + ' not found.');
        if (!users[user.userid]) users[user.userid] = [];

        users[user.userid].push(pack);
        console.log(JSON.stringify(users));
        this.sendReply(this.targetUsername + ' was given ' + pack + ' pack. This user now has ' + users[user.userid].length + ' pack(s).');
        Users.get(this.targetUsername).send(
            '|raw|' + user.name + ' has given you ' + pack + ' pack. \
            Use <button name="send" value="/openpack ' + pack + '"><b>/openpack ' + pack + '</b></button> to open your pack.');
    }
};

/**
 * Make a display for a card.
 *
 * @param {Object} card
 * @return {String}
 */

function createCardDisplay(card) {
    return '<img src="' + card.card + '" title="' + card.id + '" align="left">\
            <br><center><h1><u><b>' + toTitleCase(card.name) + '</b></u></h1>\
            <br><br>\
            <h2><font color="' + colors[card.rarity] + '">' + card.rarity + '</font></h2>\
            <br><br><br>\
            <font color="#AAA"><i>Points:</i></font><br>' + 
            pointColor(card.points) + '</center><br clear="all">';
}

/**
 * Uppercase first letters of a name.
 *
 * @param {String} str
 * @return {String}
 */

function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt){
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

/**
 * Get color for pokemon card's points.
 *
 * @param {Number} points
 * @return {String}
 */

function pointColor(points) {
    var clrs = ['red', 'blue', '#FF4136', '#001f3f'];
    var rng = Math.floor(Math.random() * clrs.length);
    return '<font size="50" color="' + clrs[rng] + '"><b>' + points + '</b></font>';
}
