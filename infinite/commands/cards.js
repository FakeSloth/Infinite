var PSGO = require('../PSGO');
var cards = PSGO.cards;
var packs = PSGO.packs;

module.exports = {
    card: function(target, room, user) {
        this.sendReplyBox('<img src="'+cards.legendary.lucario.card+'" align="left"><center><h1><b>Lucario</b></h1><br><br>Legendary<br><br>'+cards.legendary.lucario.points+'</center><br clear="all">');
    },
    openpack: function(target, room, user) {
        var pack = packs[target]();
        var cardIndex = pack.length - 1;
        var card = pack[cardIndex];
        var display = '<marquee scrollamount="15" loop="1">';
        pack.forEach(function(card, index) {
            if (index !== cardIndex) {
                display += '<img src="' + card.card + '">&nbsp;&nbsp;&nbsp;';
            } else {
                display += '<blink><img src="' + card.card + '"></blink></marquee>';
            }
        });
        setTimeout(function() {
            this.sendReplyBox(createCardDisplay(card));
            room.update();
        }.bind(this), 1000 * 20);
        this.sendReplyBox(display);
    }
};

function createCardDisplay(card) {
    return '<img src="'+card.card+'" align="left"><center><h1><b>'+card.name+'</b></h1><br><br>'+card.rarity+'<br><br>'+card.points+'</center><br clear="all">';
}