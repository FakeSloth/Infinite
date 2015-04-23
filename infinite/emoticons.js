module.exports = (function() {
    var emotes = {
        'feelsbd': 'http://i.imgur.com/YyEdmwX.png',
        'feelsdd': 'http://i.imgur.com/fXtdLtV.png',
        'feelsgd': 'http://i.imgur.com/Jf0n4BL.png',
        'feelsgn': 'http://i.imgur.com/juJQh0J.png',
        'feelsmd': 'http://i.imgur.com/DJHMdSw.png',
        'feelsnv': 'http://i.imgur.com/XF6kIdJ.png',
        'feelsok': 'http://i.imgur.com/gu3Osve.png',
        'feelspika': 'http://i.imgur.com/mBq3BAW.png',
        'feelspink': 'http://i.imgur.com/jqfB8Di.png',
        'feelsrs': 'http://i.imgur.com/qGEot0R.png',
        'feelssc': 'http://i.imgur.com/cm6oTZ1.png',
        'Kappa': 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-ddc6e3a8732cb50f-25x28.png',
        'funnylol': 'http://i.imgur.com/SlzCghq.png',
        'Obama': 'http://i.imgur.com/rBA9M7A.png',
        'oshet': 'http://i.imgur.com/yr5DjuZ.png',
        'PJSalt': 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-18be1a297459453f-36x30.png',
        'wtfman': 'http://i.imgur.com/kwR8Re9.png',
        'xD': 'http://i.imgur.com/V728AvL.png'
    };

    var emotesKeys = Object.keys(emotes);
    var patterns = [];
    var metachars = /[[\]{}()*+?.\\|^$\-,&#\s]/g;

    for (var i in emotes) {
        if (emotes.hasOwnProperty(i)) {
            patterns.push('(' + i.replace(metachars, '\\$&') + ')');
        }
    }
    var patternRegex = new RegExp(patterns.join('|'), 'g');


    return {
        emotes: emotes,
        emotesKeys: emotesKeys,
        patternRegex: patternRegex        
    };
})();
