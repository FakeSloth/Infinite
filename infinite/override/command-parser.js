// Emoticons

var color = require('../color');
var emoticons = require('../emoticons');
var emotes = emoticons.emotes;
var emotesKeys = emoticons.emotesKeys;
var patternRegex = emoticons.patternRegex;

if (!CommandParser.originalParse) {
    CommandParser.originalParse = CommandParser.parse;
}

CommandParser.parse = function(message, room, user, connection, levelsDeep) {
    if (room.disableEmoticons || (message.charAt(0) === '/' && message.charAt(1) !== '/')) {
        return CommandParser.originalParse(message, room, user, connection, levelsDeep + 1);
    }
    message = CommandParser.originalParse(message, room, user, connection, levelsDeep);
    if (!message) return message;

    var match = false;
    var len = emotesKeys.length;

    while (len--) {
        if (message.indexOf(emotesKeys[len]) >= 0) {
            match = true;
            break;
        }
    }

    if (!match) return message;

    // escape HTML
    message = Tools.escapeHTML(message);

    // emoticons
    message = message.replace(patternRegex, function(match) {
        var emote = emotes[match];
        return typeof emote === 'string' ? '<img src="' + emote + '" title="' + match + '" />' : match;
    });

    // __italics__
    message = message.replace(/\_\_([^< ](?:[^<]*?[^< ])?)\_\_(?![^<]*?<\/a)/g, '<i>$1</i>');

    // **bold**
    message = message.replace(/\*\*([^< ](?:[^<]*?[^< ])?)\*\*/g, '<b>$1</b>');

    var group = user.getIdentity().charAt(0);
    if (room.auth) group = room.auth[user.userid] || user.getIdentity().charAt(0);

    room.addRaw(
        '<div class="chat"><small>' + group + '</small>' +
        '<button name="parseCommand" value="/user ' + user.name + '" class="emote-chat">' +
        '<b><font color="' + color(user.userid) + '">' + user.name + ':</font></b></button>' +
        '<em class="mine">' + message + '</em></div>'
        );

    return false;
};