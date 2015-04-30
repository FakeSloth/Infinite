var PSGO = require('../PSGO');
var cards = PSGO.cards;
var packs = PSGO.packs;

var colors = {
    Legendary: '#FF851B',
    Epic: 'purple',
    Rare: '#0074D9',
    Uncommon: 'gray',
    Common: 'black'
};

module.exports = {
    card: function(target, room, user) {
        this.sendReplyBox('<img src="'+cards.legendary.lucario.card+'" align="left"><center><h1><b>Lucario</b></h1><br><br>Legendary<br><br>'+cards.legendary.lucario.points+'</center><br clear="all">');
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
        var pack = packs[target]();
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
        // maybe instead show up another replybox saying you got this card(s) and click on the name which is button to show the card
        setTimeout(function() {
            this.sendReplyBox(createCardDisplay(card));
            room.add(user.name + ' got ' + card.rarity + ' '+ card.name + ' from a ' + target + ' pack.');
            room.update();
        }.bind(this), 1000 * 20);
        this.sendReplyBox(display);
    }
};

/**
 * Make a display for a card.
 *
 * @param {Object} card
 * @return {String}
 */

function createCardDisplay(card) {
    return '<img src="' + card.card + '" align="left">\
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

function pointColor(points) {
    var clrs = ['red', 'blue', '#FF4136', '#001f3f'];
    var rng = Math.floor(Math.random() * clrs.length);
    return '<font size="50" color="' + clrs[rng] + '"><b>' + points + '</b></font>';
}
