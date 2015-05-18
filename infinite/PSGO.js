/**
 * PG:GO
 * 
 * Trading Card Game based off of CS:GO opening cases.
 *
 * A Card's worth is based on it's rarity and points.
 *
 * To calculate a card's point multiply it's Rarity Points and HP and then add 
 * it's attacks.
 *
 * A deck total points is measure without duplicates.
 *
 * Rarity Points:
 * Legendary - 5
 * Epic - 4
 * Rare - 3
 * Uncommon - 2
 * Common - 1
 */

var Q = require('q');
var crypto = require('crypto');
var mongo = require('./mongo');
var User = mongo.User;
var userModel = mongo.userModel;

var cards = {
    common: {
        'aron': {card: 'http://assets1.pokemon.com/assets/cms2/img/cards/web/EX1/EX1_EN_49.png', points: 65},
        'carvanha': {card: 'http://assets19.pokemon.com/assets/cms2/img/cards/web/EX1/EX1_EN_51.png', points: 50},
        'chansey': {card: 'http://assets3.pokemon.com/assets/cms2/img/cards/web/EX1/EX1_EN_96.png', points: 200},
        'druddigon': {card: 'http://assets8.pokemon.com/assets/cms2/img/cards/web/BW10/BW10_EN_70.png', points: 200},
        'electrike': {card: 'http://assets20.pokemon.com/assets/cms2/img/cards/web/EX1/EX1_EN_52.png', points: 60},
        'eevee': {card: 'http://assets24.pokemon.com/assets/cms2/img/cards/web/BW5/BW5_EN_83.png', points: 80},
        'gulpin': {card: 'http://assets23.pokemon.com/assets/cms2/img/cards/web/EX14/EX14_EN_33.png', points: 90},
        'jigglypuff': {card: 'http://assets18.pokemon.com/assets/cms2/img/cards/web/XY1/XY1_EN_87.png', points: 70},
        'kangaskhan': {card: 'http://assets9.pokemon.com/assets/cms2/img/cards/web/BW10/BW10_EN_71.png', points: 180},
        'koffing': {card: 'http://assets22.pokemon.com/assets/cms2/img/cards/web/EX1/EX1_EN_54.png', points: 75},
        'lapras': {card: 'http://assets9.pokemon.com/assets/cms2/img/cards/web/BW10/BW10_EN_17.png', points: 170},
        'mightyena': {card: 'http://assets3.pokemon.com/assets/cms2/img/cards/web/DC1/DC1_EN_18.png', points: 270},
        'machamp': {card: 'http://assets23.pokemon.com/assets/cms2/img/cards/web/PL2/PL2_EN_46.png', points: 250},
        'mudkip': {card: 'http://assets2.pokemon.com/assets/cms2/img/cards/web/EX1/EX1_EN_59.png', points: 60},
        'poochyena': {card: 'http://assets23.pokemon.com/assets/cms2/img/cards/web/EX1/EX1_EN_64.png', points: 70},
        'ralts': {card: 'http://assets2.pokemon.com/assets/cms2/img/cards/web/EX1/EX1_EN_68.png', points: 90},
        'scyther': {card: 'http://assets14.pokemon.com/assets/cms2/img/cards/web/EX1/EX1_EN_102.png', points: 150},
        'skarmory': {card: 'http://assets23.pokemon.com/assets/cms2/img/cards/web/XY4/XY4_EN_59.png', points: 220},
        'sneasel': {card: 'http://assets15.pokemon.com/assets/cms2/img/cards/web/EX1/EX1_EN_103.png', points: 140},
        'snorlax': {card: 'http://assets22.pokemon.com/assets/cms2/img/cards/web/PL2/PL2_EN_81.png', points: 230},
        'steelix': {card: 'http://assets19.pokemon.com/assets/cms2/img/cards/web/PL2/PL2_EN_51.png', points: 300},
        'swalot': {card: 'http://assets8.pokemon.com/assets/cms2/img/cards/web/EX9/EX9_EN_40.png', points: 140},
        'throh': {card: 'http://assets7.pokemon.com/assets/cms2/img/cards/web/BW10/BW10_EN_51.png', points: 240},
        'treecko': {card: 'http://assets1.pokemon.com/assets/cms2/img/cards/web/EX1/EX1_EN_76.png', points: 70},
        'uraring': {card: 'http://assets9.pokemon.com/assets/cms2/img/cards/web/BW11/BW11_EN_RC16.png', points: 280}
    },

    uncommon: {
        'avalaugg': {card: 'http://assets9.pokemon.com/assets/cms2/img/cards/web/XY2/XY2_EN_31.png', points: 390},
        'blissey': {card: 'http://assets1.pokemon.com/assets/cms2/img/cards/web/HGSS1/HGSS1_EN_36.png', points: 310},
        'combusken': {card: 'http://assets23.pokemon.com/assets/cms2/img/cards/web/EX1/EX1_EN_28.png', points: 210},
        'dragonite': {card: 'http://assets1.pokemon.com/assets/cms2/img/cards/web/PL3/PL3_EN_56.png', points: 380},
        'delcatty': {card: 'http://assets24.pokemon.com/assets/cms2/img/cards/web/EX1/EX1_EN_29.png', points: 250},
        'diggersby': {card: 'http://assets5.pokemon.com/assets/cms2/img/cards/web/XY1/XY1_EN_112.png', points: 250},
        'donphan': {card: 'http://assets21.pokemon.com/assets/cms2/img/cards/web/HGSS1/HGSS1_EN_40.png', points: 380},
        'electrike': {card: 'http://assets16.pokemon.com/assets/cms2/img/cards/web/EX1/EX1_EN_30.png', points: 140},
        'graveler': {card: 'http://assets15.pokemon.com/assets/cms2/img/cards/web/XY2/XY2_EN_46.png', points: 320},
        'grovyle': {card: 'http://assets17.pokemon.com/assets/cms2/img/cards/web/EX1/EX1_EN_31.png', points: 170},
        'gyarados': {card: 'http://assets22.pokemon.com/assets/cms2/img/cards/web/EX3/EX3_EN_32.png', points: 290},
        'hariyama': {card: 'http://assets19.pokemon.com/assets/cms2/img/cards/web/EX1/EX1_EN_33.png', points: 240},
        'hippowdon': {card: 'http://assets23.pokemon.com/assets/cms2/img/cards/web/BW4/BW4_EN_66.png', points: 400},
        'kingler': {card: 'http://assets14.pokemon.com/assets/cms2/img/cards/web/XY4/XY4_EN_14.png', points: 320},
        'kirlia': {card: 'http://assets20.pokemon.com/assets/cms2/img/cards/web/EX1/EX1_EN_34.png', points: 200},
        'lairon': {card: 'http://assets23.pokemon.com/assets/cms2/img/cards/web/EX1/EX1_EN_37.png', points: 270},
        'lickilicky': {card: 'http://assets23.pokemon.com/assets/cms2/img/cards/web/XY3/XY3_EN_79.png', points: 380},
        'linoone': {card: 'http://assets24.pokemon.com/assets/cms2/img/cards/web/EX1/EX1_EN_38.png', points: 260},
        'manectric': {card: 'http://assets25.pokemon.com/assets/cms2/img/cards/web/EX1/EX1_EN_39.png', points: 220},
        'miltank': {card: 'http://assets16.pokemon.com/assets/cms2/img/cards/web/XY2/XY2_EN_83.png', points: 340},
        'muk': {card: 'http://assets23.pokemon.com/assets/cms2/img/cards/web/PL1/PL1_EN_57.png', points: 300},
        'torchic': {card: 'http://assets19.pokemon.com/assets/cms2/img/cards/web/XY5/XY5_EN_26.png', points: 110},
        'torkoal': {card: 'http://assets12.pokemon.com/assets/cms2/img/cards/web/XY2/XY2_EN_16.png', points: 300},
        'vigoroth': {card: 'http://assets24.pokemon.com/assets/cms2/img/cards/web/EX1/EX1_EN_47.png', points: 250},
        'wobbuffet': {card: 'http://assets18.pokemon.com/assets/cms2/img/cards/web/XY4/XY4_EN_36.png', points: 270}
    },

    rare: {
        'breloom': {card: 'http://assets20.pokemon.com/assets/cms2/img/cards/web/EX1/EX1_EN_16.png', points: 280},
        'bronzong': {card: 'http://assets20.pokemon.com/assets/cms2/img/cards/web/XYP/XYP_EN_XY21.png', points: 330},
        'chesnaught': {card: 'http://assets24.pokemon.com/assets/cms2/img/cards/web/BWP/BWP_EN_BW40.png', points: 570},
        'crobat': {card: 'http://assets1.pokemon.com/assets/cms2/img/cards/web/BWP/BWP_EN_BW51.png', points: 430},
        'donphan': {card: 'http://assets21.pokemon.com/assets/cms2/img/cards/web/EX1/EX1_EN_17.png', points: 460},
        'emboar': {card: 'http://assets23.pokemon.com/assets/cms2/img/cards/web/BWP/BWP_EN_BW21.png', points: 530},
        'flygon': {card: 'http://assets3.pokemon.com/assets/cms2/img/cards/web/BWP/BWP_EN_BW53.png', points: 500},
        'swalot': {card: 'http://assets20.pokemon.com/assets/cms2/img/cards/web/XY4/XY4_EN_38.png', points: 460},
        'torchic': {card: 'http://assets7.pokemon.com/assets/cms2/img/cards/web/EX7/EX7_EN_108.png', points: 300},
        'xerneas': {card: 'ttp://assets24.pokemon.com/assets/cms2/img/cards/web/XYP/XYP_EN_XY07.png', points: 880},
        'yveltal': {card: 'http://assets25.pokemon.com/assets/cms2/img/cards/web/XYP/XYP_EN_XY08.png', points: 790},
        'zoroark': {card: 'http://assets4.pokemon.com/assets/cms2/img/cards/web/BWP/BWP_EN_BW09.png', points: 300}
    },

    epic: {
        'black kyurem': {card: 'http://assets8.pokemon.com/assets/cms2/img/cards/web/BWP/BWP_EN_BW58.png', points: 660},
        'dragonite': {card: 'http://assets18.pokemon.com/assets/cms2/img/cards/web/XY3/XY3_EN_74.png', points: 840},
        'white kyurem': {card: 'http://assets9.pokemon.com/assets/cms2/img/cards/web/BWP/BWP_EN_BW59.png', points: 680}
    },
    
    legendary: {
        'camerupt': {card: 'http://assets22.pokemon.com/assets/cms2/img/cards/web/XY5/XY5_EN_29.png', points: 1610},
        'charizard': {card: 'http://assets4.pokemon.com/assets/cms2/img/cards/web/XY2/XY2_EN_100.png', points: 1050},
        'charizard base set': {card: 'http://i.imgur.com/2KBhEEV.png', points: 5000},
        'blastoise': {card: 'http://assets8.pokemon.com/assets/cms2/img/cards/web/XY1/XY1_EN_142.png', points: 1050},
        'dragonite': {card: 'http://assets14.pokemon.com/assets/cms2/img/cards/web/XY3/XY3_EN_108.png', points: 1020},
        'gengar': {card: 'http://assets13.pokemon.com/assets/cms2/img/cards/web/XY4/XY4_EN_114.png', points: 940},
        'heracross': {card: 'http://assets11.pokemon.com/assets/cms2/img/cards/web/XY3/XY3_EN_105.png', points: 1010},
        'lucario': {card: 'http://assets13.pokemon.com/assets/cms2/img/cards/web/XY3/XY3_EN_107.png', points: 1090},
        'lysandre': {card: 'http://assets8.pokemon.com/assets/cms2/img/cards/web/XY2/XY2_EN_104.png', points: 2000},
        'manectric': {card: 'http://assets12.pokemon.com/assets/cms2/img/cards/web/XY4/XY4_EN_113.png', points: 990},
        'mega charizard x': {card: 'http://assets20.pokemon.com/assets/cms2/img/cards/web/XY2/XY2_EN_69.png', points: 1450},
        'mega charizard y': {card: 'http://assets4.pokemon.com/assets/cms2/img/cards/web/XY2/XY2_EN_100.png', points: 1450},
        'mega blastoise': {card: 'http://assets6.pokemon.com/assets/cms2/img/cards/web/XY1/XY1_EN_30.png', points: 1280},
        'mega heracross': {card: 'http://assets14.pokemon.com/assets/cms2/img/cards/web/XY3/XY3_EN_5.png', points: 1280},
        'mega kangaskhan': {card: 'http://assets13.pokemon.com/assets/cms2/img/cards/web/XY2/XY2_EN_109.png', points: 1430},
        'mega manectric': {card: 'http://assets15.pokemon.com/assets/cms2/img/cards/web/XY4/XY4_EN_24.png', points: 1160},
        'mega rayquaza': {card: 'http://assets20.pokemon.com/assets/cms2/img/cards/web/XY6/XY6_EN_61.png', points: 1450},
        'mega venusaur': {card: 'http://assets7.pokemon.com/assets/cms2/img/cards/web/XY1/XY1_EN_2.png', points: 1270},
        'n': {card: 'http://assets9.pokemon.com/assets/cms2/img/cards/web/BW3/BW3_EN_101.png', points: 1700},
        'venusaur': {card: 'http://assets7.pokemon.com/assets/cms2/img/cards/web/XY1/XY1_EN_141.png', points: 1060},
        'wailord': {card: 'http://assets22.pokemon.com/assets/cms2/img/cards/web/XY5/XY5_EN_38.png', points: 1370}
    }
};

exports.cards = cards;

var common = generate(cards.common, 'Common');
var uncommon = generate(cards.uncommon, 'Uncommon');
var rare = generate(cards.rare, 'Rare');
var epic = generate(cards.epic, 'Epic');
var legendary = generate(cards.legendary, 'Legendary');

var packs = {
   /**
    * 10 iterations of common cards
    * 5 uncommon cards
    * 3 rare cards
    * 1 epic card
    * 1 legendary card
    */
    poke: function() {
        var pile = base(common, 10);
        for (var i = 0; i < 5; i++) {
            pile.push(uncommon[randIndex(uncommon)]);
        }
        for (i = 0; i < 3; i++) {
            pile.push(rare[randIndex(rare)]);
        }
        pile.push(epic[randIndex(epic)]);
        pile.push(legendary[randIndex(legendary)]);

        return create(pile);
    },

   /**
    * 6 iterations of common cards
    * 3 iterations of uncommon cards
    * 5 rare cards
    * 1 epic card
    * 1 legendary card
    */
    great: function() {
        var pile = base(common, 6).concat(base(uncommon, 3));
        for (i = 0; i < 5; i++) {
            pile.push(rare[randIndex(rare)]);
        }
        pile.push(epic[randIndex(epic)]);
        pile.push(legendary[randIndex(legendary)]);

        return create(pile);
    },

   /**
    * 3 iterations of common cards
    * 5 iterations of uncommon cards
    * 5 iterations of rare cards
    * 2 iterations of epic cards
    * 3 legendary cards
    */
    ultra: function() {
        var pile = base(common, 3)
                    .concat(base(uncommon, 5))
                    .concat(base(rare, 5))
                    .concat(base(epic, 2));
        for (i = 0; i < 3; i++) {
            pile.push(legendary[randIndex(legendary)]);
        }

        return create(pile);
    },

   /**
    * 1 iterations of common card
    * 1 iterations of uncommon card
    * 4 iterations of rare cards
    * 5 iterations of epic cards
    * 1 iterations of legendary card
    */
    master: function() {
        var pile = base(common, 1)
                    .concat(base(uncommon, 1))
                    .concat(base(rare, 4))
                    .concat(base(epic, 5))
                    .concat(base(legendary, 1));

        return create(pile);
    },

   /**
    * 1 iterations of uncommon card
    * 2 iterations of rare cards
    * 3 iterations of epic cards
    * 4 iterations of legendary cards
    */
    smogon: function() {
        var pile = base(uncommon, 1)
                    .concat(base(rare, 2))
                    .concat(base(epic, 3))
                    .concat(base(legendary, 4));

        return create(pile);
    },

   /**
    * 1 iterations of rare card
    * 1 iterations of epic card
    * 6 iterations of legendary cards
    */
    infinite: function() {
        var pile = base(rare, 1)
                    .concat(base(epic, 1))
                    .concat(base(legendary, 6));

        return create(pile);
    }
};

exports.packs = packs;

function addCard(name, card) {
    userModel.findOne({name: toId(name)}, function(err, user) {
        if (err) throw err;
        if (!user) {
            user = new userModel({
                name: toId(name),
                cards: [card]
            });
            return user.save(function(err) {
                if (err) throw err;
            });
        }
        user.cards.push(card);
        user.markModified('cards');
        user.save(function(err) {
            if (err) throw err;
        });
    });
}

exports.addCard = addCard;

function getCards(name) {
    var deferred = Q.defer();
    User.findOne({name: toId(name)})
        .then(function(user) {
            if (!user) return deferred.resolve();
            deferred.resolve(user.cards);
        }, function(err) {
            if (err) return deferred.reject(new Error(err));
        });
    return deferred.promise;
}

exports.getCards = getCards;

/**
 * Generate a group of cards in the same rarity.
 * Set name and rarity for each card.
 *
 * @param {Object} cards
 * @param {String} rarity
 * @return {Array} group
 */

function generate(cards, rarity) {
    var group = [];
    for (var i in cards) {
        cards[i].id = crypto.randomBytes(4).toString('hex');
        cards[i].name = i;
        cards[i].rarity = rarity;
        group.push(cards[i]);
    }
    return group;
}

/**
 * Get base amount of cards for a pack.
 *
 * @param {Array} group
 * @param {Number} iterations
 * @return {Array} pack
 */
function base(group, iterations) {
    var pack = [];
    var addCard = function(card) {
        pack.push(card);
    };
    for (var i = 0; i < iterations; i++) {
        group.forEach(addCard);
    }
    return pack;
}

/**
 * Picks a random index from the array.
 *
 * @param {Array} arr
 * @return {Number}
 */

function randIndex(arr) {
    return Math.floor(Math.random() * arr.length);
}

/**
 * Create a pack from a pile of cards.
 *
 * @param {Array} pile
 * @return {Array} pack
 */

function create(pile) {
    var pack = [];
    for (i = 0; i < 10; i++) {
        pack.push(pile[randIndex(pile)]);
    } 
    return pack;
}
