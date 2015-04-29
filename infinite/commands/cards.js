var PSGO = require('../PSGO');
var cards = PSGO.cards;

module.exports = {
    card: function(target, room, user) {
        this.sendReplyBox('<img src="'+cards.legendary.lucario.card+'" align="left"><center><h1><b>Lucario</b></h1><br><br>Legendary<br><br>'+cards.legendary.lucario.points+'</center><br clear="all">');
    }
};