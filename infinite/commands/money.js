var Economy = require('../economy');

module.exports = {
    atm: 'wallet',
    purse: 'wallet',
    wallet: function(target, room, user) {
        if (!this.canBroadcast()) return;
        if (!target) target = user.userid;
        Economy.get(target).then(function(amount) {
            this.sendReplyBox(target + ' has ' + amount + Economy.currency(amount) + '.');
            room.update();
        }.bind(this));
    },

    givebuck: 'givemoney',
    givebucks: 'givemoney',
    givemoney: function(target, room, user) {
        if (!user.can('givemoney')) return this.sendReply('/givemoney - Access denied.');
        if (!target || target.indexOf(',') < 0) {
            return this.sendReply('/givemoney [user], [amount] - Give a user a certain amount of money.');
        }

        var parts = target.split(',');
        this.splitTarget(parts[0]);
        var amount = Number(parts[1].trim());

        if (!this.targetUser) return this.sendReply('User ' + this.targetUsername + ' not found.');
        if (isNaN(parts[1])) return this.sendReply('Must be a number.');
        if (String(parts[1]).indexOf('.') >= 0) return this.sendReply('Cannot contain a decimal.');
        if (amount < 1) return this.sendReply('You can\'t give less than one' + Economy.currency(amount));

        Economy.give(this.targetUsername, amount).then(function(total) {
            this.sendReply(this.targetUsername + ' was given ' + amount + Economy.currency(amount) + '. This user now has ' + total + Economy.currency(total) + '.');
            Users.get(this.targetUsername).send(user.name + ' has given you ' + amount + Economy.currency(amount) + '. You now have ' + total + Economy.currency(total) + '.');
        }.bind(this));
    },

    takemoney: function(target, room, user) {
        if (!user.can('takemoney')) this.sendReply('/takemoney - Access denied.');
        if (!target || target.indexOf(',') < 0) {
            return this.sendReply('/takemoney [user], [amount] - Take a certain amount of money from a user.'); 
        }

        var parts = target.split(',');
        this.splitTarget(parts[0]);
        var amount = Number(parts[1].trim());

        if (!this.targetUser) return this.sendReply('User ' + this.targetUsername + ' not found.');
        if (isNaN(parts[1])) return this.sendReply('Must be a number.');
        if (String(parts[1]).indexOf('.') >= 0) return this.sendReply('Cannot contain a decimal.');
        if (amount < 1) return this.sendReply('You can\'t give less than one' + Economy.currency(amount));

        Economy.take(this.targetUsername, amount).then(function(total) {
            this.sendReply(this.targetUsername + ' losted ' + amount + Economy.currency(amount) + '. This user now has ' + total + Economy.currency(total) + '.');
            Users.get(this.targetUsername).send(user.name + ' has taken ' + amount + Economy.currency(amount) + ' from you. You now have ' + total + Economy.currency(amount) + '.');
        }.bind(this));
    }
};