var fs = require('fs');
var color = require('../color');
var emoticons = require('../emoticons');
var emotes = emoticons.emotes;
var emotesKeys = emoticons.emotesKeys;
var patternRegex = emoticons.patternRegex;

var MAX_MESSAGE_LENGTH = 300;
var BROADCAST_COOLDOWN = 20 * 1000;
var MESSAGE_COOLDOWN = 5 * 60 * 1000;
var MAX_PARSE_RECURSION = 10;

var commands = CommandParser.commands;
var modlog = CommandParser.modlog;

var parse = CommandParser.parse = function (message, room, user, connection, levelsDeep) {
    var cmd = '', target = '';
    if (!message || !message.trim().length) return;
    if (!levelsDeep) {
        levelsDeep = 0;
    } else {
        if (levelsDeep > MAX_PARSE_RECURSION) {
            return connection.sendTo(room, "Error: Too much recursion");
        }
    }

    if (message.substr(0, 3) === '>> ') {
        // multiline eval
        message = '/eval ' + message.substr(3);
    } else if (message.substr(0, 4) === '>>> ') {
        // multiline eval
        message = '/evalbattle ' + message.substr(4);
    }

    var spaceIndex;
    if (message.charAt(0) === '/' && message.charAt(1) !== '/') {
        spaceIndex = message.indexOf(' ');
        if (spaceIndex > 0) {
            cmd = message.substr(1, spaceIndex - 1);
            target = message.substr(spaceIndex + 1);
        } else {
            cmd = message.substr(1);
            target = '';
        }
    } else if (message.charAt(0) === '!') {
        spaceIndex = message.indexOf(' ');
        if (spaceIndex > 0) {
            cmd = message.substr(0, spaceIndex);
            target = message.substr(spaceIndex + 1);
        } else {
            cmd = message;
            target = '';
        }
    }
    cmd = cmd.toLowerCase();
    var broadcast = false;
    if (cmd.charAt(0) === '!') {
        broadcast = true;
        cmd = cmd.substr(1);
    }

    var namespaces = [];
    var currentCommands = commands;
    var originalMessage = message;
    var commandHandler;
    do {
        commandHandler = currentCommands[cmd];
        if (typeof commandHandler === 'string') {
            // in case someone messed up, don't loop
            commandHandler = currentCommands[commandHandler];
        }
        if (commandHandler && typeof commandHandler === 'object') {
            namespaces.push(cmd);

            var newCmd = target;
            var newTarget = '';
            spaceIndex = target.indexOf(' ');
            if (spaceIndex > 0) {
                newCmd = target.substr(0, spaceIndex);
                newTarget = target.substr(spaceIndex + 1);
            }
            newCmd = newCmd.toLowerCase();
            var newMessage = message.replace(cmd + (target ? ' ' : ''), '');

            cmd = newCmd;
            target = newTarget;
            message = newMessage;
            currentCommands = commandHandler;
        }
    } while (commandHandler && typeof commandHandler === 'object');
    if (!commandHandler && currentCommands.default) {
        commandHandler = currentCommands.default;
        if (typeof commandHandler === 'string') {
            commandHandler = currentCommands[commandHandler];
        }
    }
    var fullCmd = namespaces.concat(cmd).join(' ');

    if (commandHandler) {
        var context = {
            sendReply: function (data) {
                if (this.broadcasting) {
                    room.add(data);
                } else {
                    connection.sendTo(room, data);
                }
            },
            sendReplyBox: function (html) {
                this.sendReply('|raw|<div class="infobox">' + html + '</div>');
            },
            popupReply: function (message) {
                connection.popup(message);
            },
            add: function (data) {
                room.add(data);
            },
            send: function (data) {
                room.send(data);
            },
            privateModCommand: function (data, noLog) {
                this.sendModCommand(data);
                this.logEntry(data);
                this.logModCommand(data);
            },
            sendModCommand: function (data) {
                for (var i in room.users) {
                    var user = room.users[i];
                    // hardcoded for performance reasons (this is an inner loop)
                    if (user.isStaff || (room.auth && (room.auth[user.userid] || '+') !== '+')) {
                        user.sendTo(room, data);
                    }
                }
            },
            logEntry: function (data) {
                room.logEntry(data);
            },
            addModCommand: function (text, logOnlyText) {
                this.add(text);
                this.logModCommand(text + (logOnlyText || ""));
            },
            logModCommand: function (result) {
                if (!modlog[room.id]) {
                    if (room.battle) {
                        modlog[room.id] = modlog['battle'];
                    } else {
                        modlog[room.id] = fs.createWriteStream('logs/modlog/modlog_' + room.id + '.txt', {flags:'a+'});
                    }
                }
                modlog[room.id].write('[' + (new Date().toJSON()) + '] (' + room.id + ') ' + result + '\n');
            },
            can: function (permission, target, room) {
                if (!user.can(permission, target, room)) {
                    this.sendReply("/" + fullCmd + " - Access denied.");
                    return false;
                }
                return true;
            },
            canBroadcast: function (suppressMessage) {
                if (broadcast) {
                    var message = this.canTalk(originalMessage);
                    if (!message) return false;
                    if (!user.can('broadcast', null, room)) {
                        connection.sendTo(room, "You need to be voiced to broadcast this command's information.");
                        connection.sendTo(room, "To see it for yourself, use: /" + message.substr(1));
                        return false;
                    }

                    // broadcast cooldown
                    var normalized = message.toLowerCase().replace(/[^a-z0-9\s!,]/g, '');
                    if (room.lastBroadcast === normalized &&
                            room.lastBroadcastTime >= Date.now() - BROADCAST_COOLDOWN) {
                        connection.sendTo(room, "You can't broadcast this because it was just broadcast.");
                        return false;
                    }
                    this.add('|c|' + user.getIdentity(room.id) + '|' + (suppressMessage || message));
                    room.lastBroadcast = normalized;
                    room.lastBroadcastTime = Date.now();

                    this.broadcasting = true;
                }
                return true;
            },
            parse: function (message, inNamespace) {
                if (inNamespace && (message[0] === '/' || message[0] === '!')) {
                    message = message[0] + namespaces.concat(message.slice(1)).join(" ");
                }
                return parse(message, room, user, connection, levelsDeep + 1);
            },
            canTalk: function (message, relevantRoom) {
                var innerRoom = (relevantRoom !== undefined) ? relevantRoom : room;
                return canTalk(user, innerRoom, connection, message);
            },
            canHTML: function (html) {
                html = '' + (html || '');
                var images = html.match(/<img\b[^<>]*/ig);
                if (!images) return true;
                for (var i = 0; i < images.length; i++) {
                    if (!/width=([0-9]+|"[0-9]+")/i.test(images[i]) || !/height=([0-9]+|"[0-9]+")/i.test(images[i])) {
                        this.sendReply('All images must have a width and height attribute');
                        return false;
                    }
                }
                if (/>here.?</i.test(html) || /click here/i.test(html)) {
                    this.sendReply('Do not use "click here"');
                    return false;
                }

                // check for mismatched tags
                var tags = html.toLowerCase().match(/<\/?(div|a|button|b|i|u|center|font)\b/g);
                if (tags) {
                    var stack = [];
                    for (i = 0; i < tags.length; i++) {
                        var tag = tags[i];
                        if (tag.charAt(1) === '/') {
                            if (!stack.length) {
                                this.sendReply("Extraneous </" + tag.substr(2) + "> without an opening tag.");
                                return false;
                            }
                        } else {
                            stack.push(tag.substr(1));
                        }
                    }
                }

                return true;
            },
            targetUserOrSelf: function (target, exactName) {
                if (!target) {
                    this.targetUsername = user.name;
                    return user;
                }
                this.splitTarget(target, exactName);
                return this.targetUser;
            },
            getLastIdOf: function (user) {
                if (typeof user === 'string') user = Users.get(user);
                return (user.named ? user.userid : (Object.keys(user.prevNames).last() || user.userid));
            },
            splitTarget: function (target, exactName) {
                var commaIndex = target.indexOf(',');
                var targetUser;
                if (commaIndex < 0) {
                    targetUser = Users.get(target, exactName);
                    this.targetUser = targetUser;
                    this.targetUsername = targetUser ? targetUser.name : target;
                    return '';
                }
                targetUser = Users.get(target.substr(0, commaIndex), exactName);
                if (!targetUser) {
                    targetUser = null;
                }
                this.targetUser = targetUser;
                this.targetUsername = targetUser ? targetUser.name : target.substr(0, commaIndex);
                return target.substr(commaIndex + 1).trim();
            }
        };

        var result;
        try {
            result = commandHandler.call(context, target, room, user, connection, cmd, message);
        } catch (err) {
            var stack = err.stack + '\n\n' +
                    'Additional information:\n' +
                    'user = ' + user.name + '\n' +
                    'room = ' + room.id + '\n' +
                    'message = ' + originalMessage;
            var fakeErr = {stack: stack};

            if (!require('./crashlogger.js')(fakeErr, 'A chat command')) {
                var ministack = ("" + err.stack).escapeHTML().split("\n").slice(0, 2).join("<br />");
                Rooms.lobby.send('|html|<div class="broadcast-red"><b>POKEMON SHOWDOWN HAS CRASHED:</b> ' + ministack + '</div>');
            } else {
                context.sendReply('|html|<div class="broadcast-red"><b>Pokemon Showdown crashed!</b><br />Don\'t worry, we\'re working on fixing it.</div>');
            }
        }
        if (result === undefined) result = false;

        return result;
    } else {
        // Check for mod/demod/admin/deadmin/etc depending on the group ids
        for (var g in Config.groups) {
            var groupid = Config.groups[g].id;
            if (cmd === groupid || cmd === 'global' + groupid) {
                return parse('/promote ' + toId(target) + ', ' + g, room, user, connection);
            } else if (cmd === 'de' + groupid || cmd === 'un' + groupid || cmd === 'globalde' + groupid || cmd === 'deglobal' + groupid) {
                return parse('/demote ' + toId(target), room, user, connection);
            } else if (cmd === 'room' + groupid) {
                return parse('/roompromote ' + toId(target) + ', ' + g, room, user, connection);
            } else if (cmd === 'roomde' + groupid || cmd === 'deroom' + groupid || cmd === 'roomun' + groupid) {
                return parse('/roomdemote ' + toId(target), room, user, connection);
            }
        }

        if (message.charAt(0) === '/' && fullCmd) {
            // To guard against command typos, we now emit an error message
            return connection.sendTo(room.id, "The command '/" + fullCmd + "' was unrecognized. To send a message starting with '/" + fullCmd + "', type '//" + fullCmd + "'.");
        }
    }

    if (message.charAt(0) === '/' && message.charAt(1) !== '/') {
        message = '/' + message;
    }
    message = canTalk(user, room, connection, message);
    if (!message) return false;
    if (message.charAt(0) === '/' && message.charAt(1) !== '/') {
        return parse(message, room, user, connection, levelsDeep + 1);
    }

    /**
     * Emoticons
     */

    if (room.disableEmoticons) {
        return message; 
    }

    var match = false;
    var len = emotesKeys.length;

    while (len--) {
        if (message.indexOf(emotesKeys[len]) >= 0) {
            match = true;
            break;
        }
    }

    // Emoticon not found => do default parse
    if (!match) {
        return message;
    }

    // escape HTML
    message = Tools.escapeHTML(message);

    // add emotes
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

/**
 * Can this user talk?
 * Shows an error message if not.
 */
function canTalk(user, room, connection, message) {
    if (!user.named) {
        connection.popup("You must choose a name before you can talk.");
        return false;
    }
    if (room && user.locked) {
        connection.sendTo(room, "You are locked from talking in chat.");
        return false;
    }
    if (room && user.mutedRooms[room.id]) {
        connection.sendTo(room, "You are muted and cannot talk in this room.");
        return false;
    }
    if (room && room.modchat) {
        if (room.modchat === 'crash') {
            if (!user.can('ignorelimits')) {
                connection.sendTo(room, "Because the server has crashed, you cannot speak in lobby chat.");
                return false;
            }
        } else {
            var userGroup = user.group;
            if (room.auth) {
                if (room.auth[user.userid]) {
                    userGroup = room.auth[user.userid];
                } else if (room.isPrivate === true) {
                    userGroup = ' ';
                }
            }
            if (!user.autoconfirmed && (room.auth && room.auth[user.userid] || user.group) === ' ' && room.modchat === 'autoconfirmed') {
                connection.sendTo(room, "Because moderated chat is set, your account must be at least one week old and you must have won at least one ladder game to speak in this room.");
                return false;
            } else if (Config.groupsranking.indexOf(userGroup) < Config.groupsranking.indexOf(room.modchat)) {
                var groupName = Config.groups[room.modchat].name || room.modchat;
                connection.sendTo(room, "Because moderated chat is set, you must be of rank " + groupName + " or higher to speak in this room.");
                return false;
            }
        }
    }
    if (room && !(user.userid in room.users)) {
        connection.popup("You can't send a message to this room without being in it.");
        return false;
    }

    if (typeof message === 'string') {
        if (!message) {
            connection.popup("Your message can't be blank.");
            return false;
        }
        if (message.length > MAX_MESSAGE_LENGTH && !user.can('ignorelimits')) {
            connection.popup("Your message is too long:\n\n" + message);
            return false;
        }

        // remove zalgo
        message = message.replace(/[\u0300-\u036f\u0483-\u0489\u064b-\u065f\u0670\u0E31\u0E34-\u0E3A\u0E47-\u0E4E]{3,}/g, '');

        if (room && room.id === 'lobby') {
            var normalized = message.trim();
            if ((normalized === user.lastMessage) &&
                    ((Date.now() - user.lastMessageTime) < MESSAGE_COOLDOWN)) {
                connection.popup("You can't send the same message again so soon.");
                return false;
            }
            user.lastMessage = message;
            user.lastMessageTime = Date.now();
        }

        if (Config.chatfilter) {
            return Config.chatfilter(message, user, room, connection);
        }
        return message;
    }

    return true;
}
