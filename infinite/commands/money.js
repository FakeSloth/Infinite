var Q = require('q');
var Economy = require('../economy');

var shop = [
    ['Symbol', 'Buys a custom symbol to go infront of name and puts you at top of userlist. (Temporary until restart, certain symbols are blocked)', 5],
    ['Fix', 'Buys the ability to alter your current custom avatar or trainer card. (don\'t buy if you have neither)', 10],
    ['Poof', 'Buy a poof message to be added into the pool of possible poofs.', 15],
    ['Who', 'Buys a custom whois bot message for your name.', 25],
    ['Avatar', 'Buys an custom avatar to be applied to your name (You supply. Images larger than 80x80 may not show correctly)', 30],
    ['Trainer', 'Buys a trainer card which shows information through a command.', 50],
    ['Room', 'Buys a chatroom for you to own. (within reason, can be refused)', 100]
];

var shopDisplay = getShopDisplay(shop);

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
    },

    shop: function(target, room, user) {
       if (!this.canBroadcast()) return;
       return this.sendReply('|raw|' + shopDisplay);
    },


    buy: function(target, room, user) {
        if (!target) return this.sendReply('/buy [command] - Buys an item from the shop.');
        var self = this;
        Economy.get(user.name).then(function(money) {
            var item = findItem(target, money);
            if (!item.success) self.sendReply(item.message);
            Economy.take(user.name, item.cost).then(function(total) {
                self.sendReply('You have bought ' + target + ' for ' + item.cost + 
                    Economy.currency(item.cost) + '. You now have ' + total + 
                    Economy.currency(total) + ' left.');
                room.add(user.name + ' has bought ' + target + ' from the shop.');
                room.update();
            });
        });
    }
};

/**
 * Displays the shop
 *
 * @param {Array} shop
 * @return {String} display
 */

function getShopDisplay(shop) {
    var display = '<table border="1" cellspacing="0" cellpadding="5" width="100%">\
                    <tbody>\
                        <tr>\
                            <th>Command</th>\
                            <th>Description</th>\
                            <th>Cost</th>\
                        </tr>';
    var start = 0;
    while (start < shop.length) {
        display += '<tr>\
                        <td><button name="send" value="/buy ' + shop[start][0] + '">' + shop[start][0] + '</button>' + '</td>\
                        <td>' + shop[start][1] + '</td>\
                        <td>' + shop[start][2] + '</td>\
                    </tr>';
        start++;
    }
    display += '</tbody></table><center>To buy an item from the shop, use /buy <em>command</em>.</center>';
    return display;
}

/**
 * Find the item in the shop.
 * 
 * @param {String} item
 * @param {Number} money
 * @return {Object}
 */

function findItem(item, money) {
    var len = shop.length;
    var match = false;
    var price = 0;
    var amount = 0;
    while(len--) {
        if (item.toLowerCase() !== shop[len][0].toLowerCase()) continue;
        match = true;
        price = shop[len][2];
        if (price > money) {
            amount = price - money;
            return {
                success: false,
                message:'You don\'t have you enough money for this. You need ' + amount + Economy.currency(amount) + ' more to buy ' + item + '.'
            };
        }
        return {
            success: true,
            cost: price
        };
    }
    if (!match) {
        return {
            success: false,
            message: item + ' not found in shop.'
        };
    }
}
