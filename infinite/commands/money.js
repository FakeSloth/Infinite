var Q = require('q');
var Economy = require('../economy');

module.exports = {
    atm: 'wallet',
    purse: 'wallet',
    wallet: function(target, room, user) {
        if (!this.canBroadcast()) return;
        if (!target) target = user.name;
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
        var currency = amount + Economy.currency(amount);

        if (!this.targetUser) return this.sendReply('User ' + this.targetUsername + ' not found.');
        if (isNaN(parts[1])) return this.sendReply('Must be a number.');
        if (String(parts[1]).indexOf('.') >= 0) return this.sendReply('Cannot contain a decimal.');
        if (amount < 1) return this.sendReply('You can\'t give less than one' + Economy.currency(amount));

        Economy.give(this.targetUsername, amount).then(function(total) {
            this.sendReply(this.targetUsername + ' was given ' + currency  + '. This user now has ' + total + Economy.currency(total) + '.');
            Users.get(this.targetUsername).send(user.name + ' has given you ' + currency + '. You now have ' + total + Economy.currency(total) + '.');
        }.bind(this));
    },


    givebuck: 'takemoney',
    givebucks: 'takemoney',
    takemoney: function(target, room, user) {
        if (!user.can('takemoney')) this.sendReply('/takemoney - Access denied.');
        if (!target || target.indexOf(',') < 0) {
            return this.sendReply('/takemoney [user], [amount] - Take a certain amount of money from a user.'); 
        }

        var parts = target.split(',');
        this.splitTarget(parts[0]);
        var amount = Number(parts[1].trim());
        var currency = amount + Economy.currency(amount);

        if (!this.targetUser) return this.sendReply('User ' + this.targetUsername + ' not found.');
        if (isNaN(parts[1])) return this.sendReply('Must be a number.');
        if (String(parts[1]).indexOf('.') >= 0) return this.sendReply('Cannot contain a decimal.');
        if (amount < 1) return this.sendReply('You can\'t give less than one' + Economy.currency(amount));

        Economy.take(this.targetUsername, amount).then(function(total) {
            this.sendReply(this.targetUsername + ' losted ' + currency + '. This user now has ' + total + Economy.currency(total) + '.');
            Users.get(this.targetUsername).send(user.name + ' has taken ' + currency + ' from you. You now have ' + total + Economy.currency(total) + '.');
        }.bind(this));
    },

    transfer: 'transfermoney',
    transferbuck: 'transfermoney',
    transferbucks: 'transfermoney',
    transfermoney: function(target, room, user) {
        if (!target || target.indexOf(',') < 0) {
            return this.sendReply('/transfer [user], [amount] - Transfer a certain amount of money to a user.');
        }

        var parts = target.split(',');
        var amount = Number(parts[1].trim());
        var targetName = parts[0];
        var currency = amount + Economy.currency(amount);

        if (toId(targetName) === user.userid) return this.sendReply('You cannot transfer to yourself.');
        if (isNaN(parts[1])) return this.sendReply('Must be a number.');
        if (String(parts[1]).indexOf('.') >= 0) return this.sendReply('Cannot contain a decimal.');
        if (amount < 1) return this.sendReply('You can\'t give less than one' + Economy.currency(amount));

        var self = this;
        Economy.get(user.name)
            .then(function(money) {
                if (amount > money) return self.sendReply('You cannot transfer more money than what you have.');
                return [Economy.give(targetName, amount), Economy.take(user.name, amount)];
            })
            .spread(function(targetTotal, userTotal) {
                self.sendReply('You have successfully transferred ' + currency + '. You now have ' + userTotal + Economy.currency(userTotal) + '.');
                if (Users.get(targetName)) {
                    Users.get(targetName).send(user.name + ' has transferred ' + currency + '. You now have ' + targetTotal + Economy.currency(targetTotal) + '.');
                }
            }, function(err) {
                if (err) console.error(err);
            }).done();
    }
};