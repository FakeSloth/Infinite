var fs = require('fs');
var path = require('path');

/**
 * Staff required and staff related commands.
 */

module.exports = {
    globalpromote: 'promote',
    promote: function (target, room, user, connection, cmd) {
        if (!target) return this.parse('/help promote');

        target = this.splitTarget(target, true);
        var targetUser = this.targetUser;
        var userid = toId(this.targetUsername);
        var name = targetUser ? targetUser.name : this.targetUsername;

        if (!userid) return this.parse('/help promote');
        if (targetUser && !targetUser.registered) return this.sendReply("User '" + name + "' is not registered.");

        var currentGroup = ((targetUser && targetUser.group) || Users.usergroups[userid] || ' ')[0];
        var nextGroup = target ? target : Users.getNextGroupSymbol(currentGroup, cmd === 'demote', true);
        if (target === 'deauth') nextGroup = Config.groupsranking[0];
        if (!Config.groups[nextGroup]) {
            return this.sendReply("Group '" + nextGroup + "' does not exist.");
        }
        if (Config.groups[nextGroup].roomonly) {
            return this.sendReply("Group '" + nextGroup + "' does not exist as a global rank.");
        }

        var groupName = Config.groups[nextGroup].name || "regular user";
        if (currentGroup === nextGroup) {
            return this.sendReply("User '" + name + "' is already a " + groupName);
        }
        if (!user.canPromote(currentGroup, nextGroup)) {
            return this.sendReply("/" + cmd + " - Access denied.");
        }

        if (!Users.setOfflineGroup(name, nextGroup)) {
            return this.sendReply("/promote - WARNING: This user is offline and could be unregistered. Use /forcepromote if you're sure you want to risk it.");
        }
        if (Config.groups[nextGroup].rank < Config.groups[currentGroup].rank) {
            this.privateModCommand("(" + name + " was demoted to " + groupName + " by " + user.name + ".)");
            if (targetUser) targetUser.popup("You were demoted to " + groupName + " by " + user.name + ".");
        } else {
            this.addModCommand("" + name + " was promoted to " + groupName + " by " + user.name + ".");
        }

        if (targetUser) targetUser.updateIdentity();
    },

    hide: function(target, room, user) {
        if (!this.can('lock')) return this.sendReply('/hide - Access denied.');
        user.hiding = true;
        user.updateIdentity();
        this.sendReply('You have hidden your staff symbol.');
    },

    show: function(target, room, user) {
        if (!this.can('lock')) return this.sendReply('/show - Access denied.');
        user.hiding = false;
        user.updateIdentity();
        this.sendReply('You have revealed your staff symbol.');
    },

    masspm: 'pmall',
    pmall: function (target, room, user) {
        if (!this.can('pmall')) return this.sendReply('/pmall - Access denied.');
        if (!target) return this.sendReply('/pmall [message] - PM all users in the server.');

        var pmName = '~Server PM [Do not reply]';

        for (var i in Users.users) {
            var message = '|pm|' + pmName + '|' + Users.users[i].getIdentity() + '|' + target;
            Users.users[i].send(message);
        }
    },

    staffpm: 'pmallstaff',
    pmstaff: 'pmallstaff',
    pmallstaff: function (target, room, user) {
        if (!this.can('pmstaff')) return this.sendReply('/pmstaff - Access denied.');
        if (!target) return this.sendReply('/pmallstaff [message] - Sends a PM to every staff member online.');

        var pmName = '~Staff PM [Do not reply]';

        for (var i in Users.users) {
            if (Users.users[i].isStaff) {
                Users.users[i].send('|pm|' + pmName + '|' + Users.users[i].group + Users.users[i].name + '|' + target);
            }
        }
    },

    pmroom: 'rmall',
    rmall: function (target, room, user) {
        if(!this.can('ban')) return this.sendReply('/rmall - Access denied.');
        if (!target) return this.sendReply('/rmall [message] - Sends a pm to all users in the room.');

        var pmName = '~Room PM [Do not reply]';

        for (var i in room.users) {
            var message = '|pm|' + pmName + '|' + room.users[i].getIdentity() + '|' + target;
            room.users[i].send(message);
        }
    },

    stafflist: 'authority',
    auth: 'authority',
    authlist: 'authority',
    authority: function (target, room, user, connection) {
        var rankLists = {};
        var ranks = Object.keys(Config.groups);
        for (var u in Users.usergroups) {
            var rank = Users.usergroups[u].charAt(0);
            // In case the usergroups.csv file is not proper, we check for the server ranks.
            if (ranks.indexOf(rank) > -1) {
                var name = Users.usergroups[u].substr(1);
                if (!rankLists[rank]) rankLists[rank] = [];
                if (name) rankLists[rank].push(((Users.getExact(name) && Users.getExact(name).connected) ? '**' + name + '**' : name));
            }
        }

        var buffer = [];
        Object.keys(rankLists).sort(function (a, b) {
            return (Config.groups[b] || {rank: 0}).rank - (Config.groups[a] || {rank: 0}).rank;
        }).forEach(function (r) {
            buffer.push((Config.groups[r] ? r + Config.groups[r].name + "s (" + rankLists[r].length + ")" : r) + ":\n" + rankLists[r].sort().join(", "));
        });

        if (!buffer.length) buffer = "This server has no auth.";
        connection.popup(buffer.join("\n\n"));
    },

    clearall: function (target, room, user) {
        if (!this.can('clearall')) return this.sendReply('/clearall - Access denied.');
        if (room.battle) return this.sendReply('You cannot clearall in battle rooms.');
        
        var len = room.log.length;
        var users = [];
        while (len--) {
            room.log[len] = '';
        }
        for (var u in room.users) {
            users.push(u);
            Users.get(u).leaveRoom(room, Users.get(u).connections[0]);
        }
        len = users.length;
        setTimeout(function() {
            while (len--) {
                Users.get(users[len]).joinRoom(room, Users.get(users[len]).connections[0]);
            }
        }, 1000);
    },

    reloadfile: function(target, room, user) {
        if (!this.can('reloadfile')) return this.sendReply('/reloadfile - Access denied.');
        if (!target) return this.sendReply('/reload [file directory] - Reload a certain file.');
        this.sendReply('|raw|<b>delete require.cache[require.resolve("' + target + '")]</b>');
        this.parse('/eval delete require.cache[require.resolve("' + target + '")]');
        this.sendReply('|raw|<b>require("' + target + '")</b>');
        this.parse('/eval require("' + target + '")');
    },

    reload: function (target, room, user) {
        if (!this.can('reload')) return this.sendReply('/reload - Access denied.');

        try {
            this.sendReply('Reloading Commands...');
            var cmds = path.join(process.cwd(), './infinite/commands/');
            fs.readdirSync(cmds).forEach(function (file) {
                if (file.substr(-3) === '.js') {
                    delete require.cache[require.resolve(path.join(cmds, file))];
                }
            });
            fs.readdirSync(cmds).forEach(function (file) {
                if (file.substr(-3) === '.js') {
                    Object.merge(CommandParser.commands, require(cmds + file));
                }
            });

            return this.sendReply('|raw|<font color="green">These files have been reloaded.</font>');
        } catch (e) {
            return this.sendReply('|raw|<font color="red">Something failed while trying to reload files:</font> \n' + e.stack);
        }
    }
};
