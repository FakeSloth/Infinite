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
 */

var cards = {
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