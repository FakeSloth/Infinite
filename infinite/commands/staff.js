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

    stafflist: function (target, room, user) {
        var buffer = {
            admins: [],
            leaders: [],
            mods: [],
            drivers: [],
            voices: []
        };

        var staffList = fs.readFileSync(path.join(__dirname, '../../', 'config/usergroups.csv'), 'utf8').split('\n');
        var numStaff = 0;
        var staff;

        var len = staffList.length;
        while (len--) {
            staff = staffList[len].split(',');
            if (staff.length >= 2) numStaff++;
            if (staff[1] === '~') {
                buffer.admins.push(staff[0]);
            }
            if (staff[1] === '&') {
                buffer.leaders.push(staff[0]);
            }
            if (staff[1] === '@') {
                buffer.mods.push(staff[0]);
            }
            if (staff[1] === '%') {
                buffer.drivers.push(staff[0]);
            }
            if (staff[1] === '+') {
                buffer.voices.push(staff[0]);
            }
        }

        buffer.admins = buffer.admins.join(', ');
        buffer.leaders = buffer.leaders.join(', ');
        buffer.mods = buffer.mods.join(', ');
        buffer.drivers = buffer.drivers.join(', ');
        buffer.voices = buffer.voices.join(', ');

        this.popupReply('Administrators:\n--------------------\n' + buffer.admins + '\n\nLeaders:\n-------------------- \n' + buffer.leaders + '\n\nModerators:\n-------------------- \n' + buffer.mods + '\n\nDrivers:\n--------------------\n' + buffer.drivers + '\n\nVoices:\n-------------------- \n' + buffer.voices + '\n\n\t\t\t\tTotal Staff Members: ' + numStaff);
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

    reload: function(target, room, user) {
        if (!this.can('reload')) return false;
        if (!target) return this.sendReply('/reload [file directory] - Reload a certain file.');
        this.sendReply('|raw|<b>delete require.cache[require.resolve("' + target + '")]</b>');
        this.parse('/eval delete require.cache[require.resolve("' + target + '")]');
        this.sendReply('|raw|<b>require("' + target + '")</b>');
        this.parse('/eval require("' + target + '")');
    }
};
