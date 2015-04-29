/**
 * PG:GO
 * 
 * Trading Card Game based off CS:GO opening cases.
 *
 * A Card's worth is based on it's rarity and points.
 *
 * To calculus a card's point multiply it's Rarity Points and HP and then add 
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

var cards = {
    common: {
        'aron': {card: 'http://assets1.pokemon.com/assets/cms2/img/cards/web/EX1/EX1_EN_49.png', points: 65},
        'carvanha': {card: 'http://assets19.pokemon.com/assets/cms2/img/cards/web/EX1/EX1_EN_51.png', points: 50},
        'electrike': {card: 'http://assets20.pokemon.com/assets/cms2/img/cards/web/EX1/EX1_EN_52.png', points: 60},
        'gulpin': {card: 'http://assets23.pokemon.com/assets/cms2/img/cards/web/EX14/EX14_EN_33.png', points: 90},
        'koffing': {card: 'http://assets22.pokemon.com/assets/cms2/img/cards/web/EX1/EX1_EN_54.png', points: 75},
        'mudkip': {card: 'http://assets2.pokemon.com/assets/cms2/img/cards/web/EX1/EX1_EN_59.png', points: 60},
        'ralts': {card: 'http://assets2.pokemon.com/assets/cms2/img/cards/web/EX1/EX1_EN_68.png', points: 90},
        'swalot': {card: 'http://assets8.pokemon.com/assets/cms2/img/cards/web/EX9/EX9_EN_40.png', points: 140}
    },
    uncommon: {
        'combusken': {card: 'http://assets23.pokemon.com/assets/cms2/img/cards/web/EX1/EX1_EN_28.png', points: 210},
        'delcatty': {card: 'http://assets17.pokemon.com/assets/cms2/img/cards/web/EX1/EX1_EN_31.png', points: 80},
        'grovyle': {card: 'http://assets17.pokemon.com/assets/cms2/img/cards/web/EX1/EX1_EN_31.png', points: 170},
        'hariyama': {card: 'http://assets19.pokemon.com/assets/cms2/img/cards/web/EX1/EX1_EN_33.png', points: 240},
        'kirlia': {card: 'http://assets20.pokemon.com/assets/cms2/img/cards/web/EX1/EX1_EN_34.png', points: 200},
        'torchic': {card: 'http://assets19.pokemon.com/assets/cms2/img/cards/web/XY5/XY5_EN_26.png', points: 110}
    },
    rare: {
        'breloom': {card: 'http://assets20.pokemon.com/assets/cms2/img/cards/web/EX1/EX1_EN_16.png', points: 280},
        'bronzong': {card: 'http://assets20.pokemon.com/assets/cms2/img/cards/web/XYP/XYP_EN_XY21.png', points: 330},
        'donphan': {card: 'http://assets21.pokemon.com/assets/cms2/img/cards/web/EX1/EX1_EN_17.png', points: 460},
        'emboar': {card: 'http://assets23.pokemon.com/assets/cms2/img/cards/web/BWP/BWP_EN_BW21.png', points: 530},
        'swalot': {card: 'http://assets20.pokemon.com/assets/cms2/img/cards/web/XY4/XY4_EN_38.png', points: 460},
        'torchic': {card: 'http://assets7.pokemon.com/assets/cms2/img/cards/web/EX7/EX7_EN_108.png', points: 300},
        'zoroark': {card: 'http://assets4.pokemon.com/assets/cms2/img/cards/web/BWP/BWP_EN_BW09.png', points: 300}
    },
    epic: {
        'black kyurem': {card: 'http://assets8.pokemon.com/assets/cms2/img/cards/web/BWP/BWP_EN_BW58.png', points: 660},
        'mewtwo': {card: 'http://assets9.pokemon.com/assets/cms2/img/cards/web/BWP/BWP_EN_BW59.png', points: 460},
        'white kyurem': {card: 'http://assets9.pokemon.com/assets/cms2/img/cards/web/BWP/BWP_EN_BW59.png', points: 680}
    },
    legendary: {
        'camerupt': {card: 'http://assets22.pokemon.com/assets/cms2/img/cards/web/XY5/XY5_EN_29.png', points: 1610},
        'charizard': {card: 'http://assets4.pokemon.com/assets/cms2/img/cards/web/XY2/XY2_EN_100.png', points: 1050},
        'blastoise': {card: 'http://assets8.pokemon.com/assets/cms2/img/cards/web/XY1/XY1_EN_142.png', points: 1050},
        'dragonite': {card: 'http://assets14.pokemon.com/assets/cms2/img/cards/web/XY3/XY3_EN_108.png', points: 1020},
        'dragonite2': {card: 'http://assets18.pokemon.com/assets/cms2/img/cards/web/XY3/XY3_EN_74.png', points: 1020},
        'gengar': {card: 'http://assets13.pokemon.com/assets/cms2/img/cards/web/XY4/XY4_EN_114.png', points: 940},
        'lucario': {card: 'http://assets13.pokemon.com/assets/cms2/img/cards/web/XY3/XY3_EN_107.png', points: 1090},
        'manectric': {card: 'http://assets12.pokemon.com/assets/cms2/img/cards/web/XY4/XY4_EN_113.png', points: 990},
        'mega charizard x': {card: 'http://assets20.pokemon.com/assets/cms2/img/cards/web/XY2/XY2_EN_69.png', points: 1450},
        'mega charizard y': {card: 'http://assets4.pokemon.com/assets/cms2/img/cards/web/XY2/XY2_EN_100.png', points: 1450},
        'mega blastoise': {card: 'http://assets6.pokemon.com/assets/cms2/img/cards/web/XY1/XY1_EN_30.png', points: 1280},
        'mega heracross': {card: 'http://assets14.pokemon.com/assets/cms2/img/cards/web/XY3/XY3_EN_5.png', points: 1280},
        'mega venusaur': {card: 'http://assets7.pokemon.com/assets/cms2/img/cards/web/XY1/XY1_EN_2.png', points: 1270},
        'heracross': {card: 'http://assets11.pokemon.com/assets/cms2/img/cards/web/XY3/XY3_EN_105.png', points: 1010},
        'venusaur': {card: 'http://assets7.pokemon.com/assets/cms2/img/cards/web/XY1/XY1_EN_141.png', points: 1060},
        'wailord': {card: 'http://assets22.pokemon.com/assets/cms2/img/cards/web/XY5/XY5_EN_38.png', points: 1370}
    }
};

exports.cards = cards;

function generate(cards, rarity) {
    cards.forEach(function(card) {
        card.rarity = rarity;
    });
    return cards;
}