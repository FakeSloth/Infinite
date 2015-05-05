var color = require('../color');

module.exports = {
    eating: 'away',
    gaming: 'away',
    game: 'away',
    sleep: 'away',
    crie: 'away',
    cri: 'away',
    cry: 'away',
    work: 'away',
    working: 'away',
    sleeping: 'away',
    busy: 'away',
    draw: 'away',
    drawing: 'away',
    afk: 'away',
    fap: 'away',
    poop: 'away',
    away: function(target, room, user, connection, cmd) {
        if (!this.can('away')) return false;
        // unicode away message idea by Siiilver
        var t = 'Ⓐⓦⓐⓨ';
        var t2 = 'Away';
        switch (cmd) {
            case 'busy':
                t = 'Ⓑⓤⓢⓨ';
                t2 = 'Busy';
                break;
            case 'sleeping':
                t = 'Ⓢⓛⓔⓔⓟⓘⓝⓖ';
                t2 = 'Sleeping';
                break;
            case 'sleep':
                t = 'Ⓢⓛⓔⓔⓟⓘⓝⓖ';
                t2 = 'Sleeping';
                break;
            case 'gaming':
                t = 'Ⓖⓐⓜⓘⓝⓖ';
                t2 = 'Gaming';
                break;
            case 'game':
                t = 'Ⓖⓐⓜⓘⓝⓖ';
                t2 = 'Gaming';
                break;
            case 'working':
                t = 'Ⓦⓞⓡⓚⓘⓝⓖ';
                t2 = 'Working';
                break;
            case 'work':
                t = 'Ⓦⓞⓡⓚⓘⓝⓖ';
                t2 = 'Working';
                break;
            case 'cri':
                t = 'Ⓒⓡⓨⓘⓝⓖ';
                t2 = 'Crying';
                break;
            case 'fap': //Venom thought of it and Connor begged me to add this.
                t = 'Ⓕⓐⓟⓟⓘⓝⓖ';
                t2 = 'Fapping';
                break;
            case 'poop': //GL✘Hobo✘Itsme/Dusk Ω Espeon/helper/dman begged me to add this.
                t = 'ⓟⓞⓞⓟⓘⓝⓖ';
                t2 = 'Pooping';
                break;
            case 'cry':
                t = 'Ⓒⓡⓨⓘⓝⓖ';
                t2 = 'Crying';
                break;
            case 'crie':
                t = 'Ⓒⓡⓨⓘⓝⓖ';
                t2 = 'Crying';
                break;
            case 'eating':
                t = 'Ⓔⓐⓣⓘⓝⓖ';
                t2 = 'Eating';
                break;
            case 'draw':
                t = 'Ⓓⓡⓐⓦⓘⓝⓖ';
                t2 = 'Drawing';
                break;
            case 'drawing':
                t = 'Ⓓⓡⓐⓦⓘⓝⓖ';
                t2 = 'Drawing';
                break;
            default:
                t = 'Ⓐⓦⓐⓨ';
                t2 = 'Away';
                break;
        }

        if (user.name.length > 18) return this.sendReply('Your username exceeds the length limit.');
        if ((user.locked || user.mutedRooms[room.id]) && !user.can('bypassall')) return this.sendReply("You cannot do this while unable to talk.");

        if (!user.isAway) {
            user.originalName = user.name;
            var awayName = user.name + ' - ' + t;
            //delete the user object with the new name in case it exists - if it does it can cause issues with forceRename
            Users.get(awayName).destroy();
            user.forceRename(awayName, undefined, true);

            if (user.isStaff) this.add('|raw|-- <b><font color="' + color(user.originalName) + '">' + user.originalName + '</font color></b> is now ' + t2.toLowerCase() + '. ' + (target ? " (" + Tools.escapeHTML(target) + ")" : ""));

            user.isAway = true;
        } else {
            return this.sendReply('You are already set as a form of away, type /back if you are now back.');
        }

        user.updateIdentity();
    },


    ack: 'back',
    bac: 'back',
    back: function(target, room, user, connection) {
        if (!this.can('away')) return false;

        if (user.isAway) {
            if (user.name === user.originalName) {
                user.isAway = false;
                return this.sendReply('Your name has been left unaltered and no longer marked as away.');
            }

            var newName = user.originalName;

            //delete the user object with the new name in case it exists - if it does it can cause issues with forceRename
            Users.get(newName).destroy();

            user.forceRename(newName, undefined, true);

            //user will be authenticated
            user.authenticated = true;

            if (user.isStaff) this.add('|raw|-- <b><font color="#088cc7">' + newName + '</font color></b> is back.');

            user.originalName = '';
            user.isAway = false;
        } else {
            return this.sendReply('You are not set as away.');
        }

        user.updateIdentity();
    }
};
