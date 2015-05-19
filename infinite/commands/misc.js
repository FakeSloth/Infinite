/**
 * Miscellaneous commands
 */

var moment = require('moment');
var color = require('../color');
var Economy = require('../economy');
var Profile = require('../profile');
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
    cmds: 'serverhelp',
    infinitehelp: 'serverhelp',
    serverhelp: function(target, room, user, connection) {
        if (!this.canBroadcast()) return;
        if (user.isStaff) {
            connection.sendTo(room.id, '|raw|<div class="infobox">\
            <center><b><u>List of <i>staff</i> commands:</u></b></center><br>\
            <b>/clearall</b> - Clear all messages in the room.<br>\
            <b>/endpoll</b> - End the poll in the room.<br>\
            <b>/givemoney</b> <i>name</i>, <i>amount</i> - Give a user a certain amount of money.<br>\
            <b>/givepack</b> <i>user</i>, <i>pack</i> - Give a user a pack.<br>\
            <b>/hide</b> - Hide your staff symbol.<br>\
            <b>/pmall</b> <i>message</i> - Private message all users in the server.<br>\
            <b>/pmstaff</b> <i>message</i> - Private message all staff.<br>\
            <b>/poll</b> <i>question</i>, <i>option 1</i>, <i>option 2</i>... - Create a poll where users can vote on an option.<br>\
            <b>/psgostats</b> - Get stats about PSGO.<br>\
            <b>/reload</b> - Reload commands.<br>\
            <b>/reloadfile</b> <i>file directory</i> - Reload a certain file.<br>\
            <b>/resetmoney</b> <i>name</i> - Reset the user\'s money to 0.<br>\
            <b>/rmall</b> <i>message</i> - Private message all users in the room.<br>\
            <b>/show</b> - Show your staff symbol.<br>\
            <b>/strawpoll</b> <i>question</i>, <i>option 1</i>, <i>option 2</i>... - Create a strawpoll, declares the link to all rooms and pm all users in the server.<br>\
            <b>/toggleemoticons</b> - Toggle emoticons on or off.<br>\
            <b>/takemoney</b> <i>user</i>, <i>amount</i> - Take a certain amount of money from a user.<br>\
            <b>/takepack</b> <i>user</i>, <i>pack</i> - Take a pack from a user.<br>\
            <b>/trainercard</b> <i>help</i> - Makes adding trainer cards EZ.<br>\
                </div>');
        }
        if (!target || target === '1') {
            return this.sendReplyBox('\
            <center><b><u>List of commands (1/3):</u></b></center><br>\
            <b>/away</b> - Set yourself away.<br>\
            <b>/back</b> - Set yourself back from away.<br>\
            <b>/buy</b> <i>command</i> - Buys an item from the shop.<br>\
            <b>/buypack</b> <i>pack</i> - Buys a pack from the pack shop.<br>\
            <b>/card</b> <i>card id</i>, <i>user (optional)</i> - Show a card.<br>\
            <b>/cardladder</b> - Displays the ladder for the top users with the best cards.<br>\
            <b>/customsymbol</b> <i>symbol</i> - Get a custom symbol.<br>\
            <b>/define</b> <i>word</i> - Shows the definition of a word.<br>\
            <b>/emotes</b> - Get a list of emoticons.<br>\
            <b>/hangman</b> help - Help on hangman specific commands.<br><br>\
            Use /serverhelp <i>number</i> to see more commands.\
            ');
        }
        if (target === '2') {
            return this.sendReplyBox('\
            <center><b><u>List of commands (2/3):</u></b></center><br>\
            <b>/openpack</b> <i>pack</i> - Open a Pokemon Card Pack.<br>\
            <b>/packs</b> <i>user</i> - Shows how many packs a user has.<br>\
            <b>/packshop</b> - Displays the shop for packs.<br>\
            <b>/poof</b> - Disconnects the user and leaves a message in the room.<br>\
            <b>/psgohelp</b> - Displays help for the card game <u>PSGO</u>.<br>\
            <b>/showcase</b> <i>user</i> - Shows the cards a user has collected<br>\
            <b>/regdate</b> <i>user</i> - Gets registration date of the user.<br>\
            <b>/resetsymbol</b> - Reset custom symbol if you have one.<br>\
            <b>/seen</b> <i>username</i> - Shows when the user last connected on the server.<br>\
            <b>/richestusers</b> - Show the richest users.<br><br>\
            Use /serverhelp <i>number</i> to see more commands.\
            ');
        }
        if (target === '3') {
            return this.sendReplyBox('\
            <center><b><u>List of commands (3/3):</u></b></center><br>\
            <b>/shop</b> - Displays the server\'s main shop.<br>\
            <b>/stafflist</b> - Shows the staff.<br>\
            <b>/tell</b> <i>username</i>, <i>message</i> - Send a message to an offline user that will be received when they log in.<br>\
            <b>/transfer</b> <i>user</i>, <i>amount</i> - Transfer a certain amount of money to a user.<br>\
            <b>/urbandefine</b> <i>word</i> - Shows the urban definition of the word.<br>\
            <b>/wallet</b> <i>user</i> - Displays how much money a user has. Parameter is optional.<br><br>\
            Use /serverhelp <i>number</i> to see more commands.\
            ');
        }
    },

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

    profile: function(target, room, user) {
        if (!this.canBroadcast()) return;
        if (target.length >= 19) return this.sendReply('Usernames are required to be less than 19 characters long.');
        var targetUser = this.targetUserOrSelf(target);
        var profile;
        if (!targetUser) {
            profile = new Profile(false, target);
        } else {
            profile = new Profile(true, targetUser, targetUser.avatar);
        }
        profile.show(function(display) {
            this.sendReplyBox(display);
            room.update();
        }.bind(this));
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
        this.sendReply('Disallowing emoticons is set to ' + room.allowEmoticons + ' in this room.');
        if (room.disableEmoticons) {
            this.add("|raw|<div class=\"broadcast-red\"><b>Emoticons are disabled!</b><br />Emoticons will not work.</div>");
        } else {
            this.add("|raw|<div class=\"broadcast-blue\"><b>Emoticons are enabled!</b><br />Emoticons will work now.</div>");
        }
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
