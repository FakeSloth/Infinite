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

    rmall: function (target, room, user) {
        if(!this.can('ban')) return false;
        if (!target) return this.sendReply('/rmall [message] - Sends a pm to all users in the room.');

        var pmName = '~Room PM [Do not reply]';

        for (var i in room.users) {
            var message = '|pm|' + pmName + '|' + room.users[i].getIdentity() + '|' + target;
            room.users[i].send(message);
        }
    }
};
