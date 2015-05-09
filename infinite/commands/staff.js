var fs = require('fs');
var path = require('path');

/**
 * Staff required and staff related commands.
 */

module.exports = {
    hide: function(target, room, user) {
        if (!this.can('lock')) return false;
        user.hiding = true;
        user.updateIdentity();
        this.sendReply('You have hidden your staff symbol.');
    },

    show: function(target, room, user) {
        if (!this.can('lock')) return false;
        user.hiding = false;
        user.updateIdentity();
        this.sendReply('You have revealed your staff symbol.');
    },

    masspm: 'pmall',
    pmall: function (target, room, user) {
        if (!this.can('pmall')) return false;
        if (!target) return this.sendReply('/pmall [message] - PM all users in the server.');

        var pmName = '~Server PM [Do not reply]';

        for (var i in Users.users) {
            var message = '|pm|' + pmName + '|' + Users.users[i].getIdentity() + '|' + target;
            Users.users[i].send(message);
        }
    },

    pmstaff: 'pmallstaff',
    pmallstaff: function (target, room, user) {
        if (!target) return this.sendReply('/pmallstaff [message] - Sends a PM to every staff member online.');
        if (!this.can('pmall')) return false;

        var pmName = '~Staff PM [Do not reply]';

        for (var i in Users.users) {
            if (Users.users[i].isStaff) {
                Users.users[i].send('|pm|' + pmName + '|' + Users.users[i].group + Users.users[i].name + '|' + target);
            }
        }
    },

    pmroom: 'rmall',
    rmall: function (target, room, user) {
        if(!this.can('ban')) return false;
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
        if (!this.can('clearall')) return false;
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
        if (!this.can('reload')) return false;
        if (!target) return this.sendReply('/reload [file directory] - Reload a certain file.');
        this.sendReply('|raw|<b>delete require.cache[require.resolve("' + target + '")]</b>');
        this.parse('/eval delete require.cache[require.resolve("' + target + '")]');
        this.sendReply('|raw|<b>require("' + target + '")</b>');
        this.parse('/eval require("' + target + '")');
    },
	/* reload: function (target, room, user) {
        if (!this.can('reload')) return;

        try {
            this.sendReply('Reloading CommandParser...');
            CommandParser.uncacheTree(path.join(__dirname, './', 'command-parser.js'));
            CommandParser = require(path.join(__dirname, './', 'command-parser.js'));

            this.sendReply('Reloading Tournaments...');
            var runningTournaments = Tournaments.tournaments;
            CommandParser.uncacheTree(path.join(__dirname, './', './tournaments/index.js'));
            Tournaments = require(path.join(__dirname, './', './tournaments/index.js'));
            Tournaments.tournaments = runningTournaments;
			
		    this.sendReply('Reloading Core...');
            CommandParser.uncacheTree(path.join(__dirname, './', './core.js'));
            Core = require(path.join(__dirname, './', './core.js')).core;

            this.sendReply('Reloading Components...');
            CommandParser.uncacheTree(path.join(__dirname, './', './components.js'));
            Components = require(path.join(__dirname, './', './components.js'));

            this.sendReply('Reloading SysopAccess...');
            CommandParser.uncacheTree(path.join(__dirname, './', './core.js'));
            SysopAccess = require(path.join(__dirname, './', './core.js'));
			
			this.sendReply('Reloading Formats...');
            CommandParser.uncacheTree(path.join(__dirname, './', './config/formats.js'));
            SysopAccess = require(path.join(__dirname, './', './config/formats.js'));
			
			return this.sendReply('|raw|<font color="green">All files have been reloaded.</font>');
        } catch (e) {
            return this.sendReply('|raw|<font color="red">Something failed while trying to reload files:</font> \n' + e.stack);
        }
    } */
};
