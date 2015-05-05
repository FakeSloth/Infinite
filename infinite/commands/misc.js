/**
 * Miscellaneous commands
 *
 * Contains poof, redirekt, emoticons, seen
 */

var moment = require('moment');
var User = require('../mongo').userModel;

var emotes = require('../emoticons').emotes;

var emotes_table = create_table();

var messages = [
    'has vanished into nothingness!',
    'used Explosion!',
    'fell into the void.',
    'went into a cave without a repel!',
    'has left the building.',
    'was forced to give StevoDuhHero\'s mom an oil massage!',
    'was hit by Magikarp\'s Revenge!',
    'ate a bomb!',
    'is blasting off again!',
    '(Quit: oh god how did this get here i am not good with computer)',
    'was unfortunate and didn\'t get a cool message.',
    '{{user}}\'s mama accidently kicked {{user}} from the server!'
];

module.exports = {
    d: 'poof',
    cpoof: 'poof',
    poof: function (target, room, user) {
        if (Config.poofOff) return this.sendReply("Poof is currently disabled.");
        if (target && !this.can('broadcast')) return false;
        if (room.id !== 'lobby') return false;
        var message = target || messages[Math.floor(Math.random() * messages.length)];
        if (message.indexOf('{{user}}') < 0)
            message = '{{user}} ' + message;
        message = message.replace(/{{user}}/g, user.name);
        if (!this.canTalk(message)) return false;

        var colour = '#' + [1, 1, 1].map(function () {
            var part = Math.floor(Math.random() * 0xaa);
            return (part < 0x10 ? '0' : '') + part.toString(16);
        }).join('');

        room.addRaw('<strong><font color="' + colour + '">~~ ' + Tools.escapeHTML(message) + ' ~~</font></strong>');
        user.disconnectAll();
    },

    emotes: 'emoticons',
    emoticons: function() {
        if (!this.canBroadcast()) return;
        this.sendReply('|raw|' + emotes_table);
    },

    poofoff: 'nopoof',
    nopoof: function () {
        if (!this.can('poofoff')) return false;
        Config.poofOff = true;
        return this.sendReply("Poof is now disabled.");
    },

    poofon: function () {
        if (!this.can('poofoff')) return false;
        Config.poofOff = false;
        return this.sendReply("Poof is now enabled.");
    },

    redirekt: 'redir',

    seen: function(target, room) {
        if (!this.canBroadcast()) return;
        if (!target) return this.sendReply('/seen [username] - Shows when the user last connected on the server.');
        var user = Users.get(target);
        if (user && user.connected) return this.sendReplyBox(target + ' is <b>currently online</b>.');
        var self = this;
        User.findOne({name: toId(target)}, function(err, user) {
            if (err) throw err;
            if (!user || !user.seen) {
                self.sendReplyBox(target + ' has never been online on this server.');
                return room.update();
            }
            self.sendReplyBox(target + ' was last seen <b>' + moment(user.seen).fromNow() + '</b>.');
            room.update();
        });
    },

    toggleemote: 'toggleemoticons',
    toggleemotes: 'toggleemoticons',
    toggleemoticon: 'toggleemoticon',
    toggleemoticons: function(target, room, user) {
        if (!user.can('toggleemoticons')) return false;
        room.disableEmoticons = !room.disableEmoticons;
        this.sendReply('Allowing emoticons is set to ' + room.allowEmoticons + ' in this room.');
    }    
};

/**
 * Create a two column table listing emoticons.
 *
 * @return {String} emotes table
 */

function create_table() {
    var emotes_name = Object.keys(emotes);
    var emotes_list = [];
    var emotes_group_list = [];
    var len = emotes_name.length;

    for (var i = 0; i < len; i++) {
        emotes_list.push('<td>' +
            '<img src="' + emotes[emotes_name[i]] + '" title="' + emotes_name[i] + '">' +
            emotes_name[i] + '</td>');
    }

    var emotes_list_right = emotes_list.splice(len / 2, len / 2);

    for (i = 0; i < len / 2; i++) {
        var emote1 = emotes_list[i],
            emote2 = emotes_list_right[i];
        if (emote2) {
            emotes_group_list.push('<tr>' + emote1 + emote2 + '</tr>');
        } else {
            emotes_group_list.push('<tr>' + emote1 + '</tr>');
        }
    }

    return '<center><b><u>List of Emoticons</u></b></center>' + '<table border="1" cellspacing="0" cellpadding="5" width="100%">' + '<tbody>' + emotes_group_list.join('') + '</tbody>' + '</table>';
}
