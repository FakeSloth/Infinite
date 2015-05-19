var Q = require('q');
var Economy = require('../economy');
var User = require('../mongo').userModel;

var shop = [
    ['Symbol', 'Buys a custom symbol to go infront of name and puts you at top of userlist. (Temporary until restart, certain symbols are blocked)', 5],
    ['Fix', 'Buys the ability to alter your current custom avatar or trainer card. (don\'t buy if you have neither)', 10],
    ['PM', 'Send a message to everyone on the server. [Can be refused] (Everyone on the server will receive a message from "~Server PM - [Do not reply] Uses: League Advertisements, Celebrations, ETC', 20],
    ['Avatar', 'Buys an custom avatar to be applied to your name (You supply. Images larger than 80x80 may not show correctly)', 50],
    ['Declare', 'Globally declare a message to the whole server! [Can be refused](A small blue message that every chatroom can see; Uses: League Advertisements, Celebrations, ETC)', 50],
    ['Trainer', 'Buys a trainer card which shows information through a command. (You supply, can be refused)', 50],
    ['Room', 'Buys a chatroom for you to own. (within reason, can be refused)', 100],
    ['Tacosaur', 'Your name gets added to /tacosaur.', 150],
    ['Félicette', 'Backdoor Access: Félicette! Back by popular demand!', 300]
];

var shopDisplay = getShopDisplay(shop);

module.exports = {
    atm: 'wallet',
    purse: 'wallet',
    wallet: function(target, room, user) {
        if (!this.canBroadcast()) return;
        if (!target) target = user.name;
        Economy.get(target).then(function(amount) {
            this.sendReplyBox(Tools.escapeHTML(target) + ' has ' + amount + Economy.currency(amount) + '.');
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
            Users.get(this.targetUsername).connections[0].sendTo(room.id, user.name + ' has given you ' + currency + '. You now have ' + total + Economy.currency(total) + '.');
        }.bind(this));
    },

    takebuck: 'takemoney',
    takebucks: 'takemoney',
    takemoney: function(target, room, user) {
        if (!user.can('takemoney')) return this.sendReply('/takemoney - Access denied.');
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
                    Users.get(targetName).connections[0].sendTo(room.id, user.name + ' has transferred ' + currency + '. You now have ' + targetTotal + Economy.currency(targetTotal) + '.');
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
            var cost = findItem.call(self, target, money);
            if (!cost) return room.update();

            Economy.take(user.name, cost).then(function(total) {
                self.sendReply('You have bought ' + target + ' for ' + cost + 
                    Economy.currency(cost) + '. You now have ' + total + 
                    Economy.currency(total) + ' left.');
                room.addRaw(user.name + ' has bought <b>' + target + '</b> from the shop.');
                handleBoughtItem.call(self, target.toLowerCase(), user);
                room.update();
            });
        });
    },

    customsymbol: function(target, room, user) {
        if (!user.canCustomSymbol) return this.sendReply('You need to buy this item from the shop.');
        if (!target || target.length > 1) return this.sendReply('/customsymbol [symbol] - Get a custom symbol.');
        if (target.match(/[A-Za-z\d]+/g) || '?!+%@\u2605&~#'.indexOf(target) >= 0) return this.sendReply('Sorry, but you cannot change your symbol to this for safety/stability reasons.');
        user.customSymbol = target;
        user.updateIdentity();
        user.canCustomSymbol = false;
        user.hasCustomSymbol = true;
    },

    resetcustomsymbol: 'resetsymbol',
    resetsymbol: function(target, room, user) {
        if (!user.hasCustomSymbol) return this.sendReply('You don\'t have a custom symbol.');
        user.customSymbol = null;
        user.updateIdentity();
        user.hasCustomSymbol = false;
        this.sendReply('Your symbol has been reset.');
    },

    moneyladder: 'richestuser',
    richladder: 'richestuser',
    richestusers: 'richestuser',
    richestuser: function(target, room) {
        if (!this.canBroadcast()) return;
        var self = this;
        var display = '<center><u><b>Richest Users</b></u></center><br>\
                 <table border="1" cellspacing="0" cellpadding="5" width="100%">\
                   <tbody>\
                     <tr>\
                       <th>Rank</th>\
                       <th>Username</th>\
                       <th>Money</th>\
                   </tr>';
        User
            .find()
            .sort({money: -1})
            .limit(10)
            .exec(function(err, users) {
                if (err) return;
                users.forEach(function(user, index) {
                    display += '<tr>\
                                    <td>' + (index + 1) + '</td>\
                                    <td>' + user.name + '</td>\
                                    <td>' + user.money + '</td>\
                                </tr>';
                });
                display += '</tbody></table>';
                self.sendReply('|raw|' + display);
                room.update();
            });
    },

    resetbuck: 'resetmoney',
    resetbucks: 'resetmoney',
    resetmoney: function(target, room, user) {
        if (!user.can('resetmoney')) return this.sendReply('/resetmoney - Access denied.');
        var self = this;
        User.findOne({name: toId(target)}, function(err, user) {
            if (err) throw err;
            if (!user) {
                self.sendReply(target + ' already has 0 bucks.');
                return room.update();
            }
            user.money = 0;
            user.save(function(err) {
                if (err) throw err;
                self.sendReply(target + ' now has 0 bucks.');
                room.update();
            });
        });
    },

    shopdeclare: function (target, room, user) {
        if (!user.canShopDeclare) return this.sendReply('You need to buy this item from the shop to use.');
        if (!target) return this.sendReply('/shopdeclare [message] - Send message to all rooms.');

        for (var id in Rooms.rooms) {
            if (id !== 'global') {
                Rooms.rooms[id].addRaw('<div class="broadcast-blue"><b>' + target + '</b></div>');
            }
        }
        this.logModCommand(user.name + " globally declared " + target);
        user.canShopDeclare = false;
    },

    shoppm: function (target, room, user) {
        if (!user.canShopPM) return this.sendReply('You need to buy this item from the shop to use.');
        if (!target) return this.sendReply('/shoppm [message] - PM all users in the server.');
        if (target.indexOf('/html') >= 0) return this.sendReply('Cannot contain /html.');

        var pmName = '~Global PM from ' + user.name +' [Do not reply]';

        for (var name in Users.users) {
            var message = '|pm|' + pmName + '|' + Users.users[name].getIdentity() + '|' + target;
            Users.users[name].send(message);
        }
        user.canShopPM = false;
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
    var price = 0;
    var amount = 0;
    while(len--) {
        if (item.toLowerCase() !== shop[len][0].toLowerCase()) continue;
        price = shop[len][2];
        if (price > money) {
            amount = price - money;
            this.sendReply('You don\'t have you enough money for this. You need ' + amount + Economy.currency(amount) + ' more to buy ' + item + '.');
            return false;
        }
        return price;
    }
    this.sendReply(item + ' not found in shop.');
}

/**
 * Handling the bought item from the shop.
 * 
 * @param {String} item
 * @param {Object} user
 */

function handleBoughtItem(item, user) {
    if (item === 'symbol') {
        user.canCustomSymbol = true;
        this.sendReply('You have purchased a custom symbol. You can use /customsymbol to get your custom symbol.');
        this.sendReply('You will have this until you log off for more than an hour.');
        this.sendReply('If you do not want your custom symbol anymore, you may use /resetsymbol to go back to your old symbol.'); 
   } else if (item === 'declare') {
        user.canShopDeclare = true;
        this.sendReply('You have purchased a declare. You can use /shopdeclare to declare your message.');
   } else if (item === 'pm') {
        user.canShopPM = true;
        this.sendReply('You have purchased a pm. You can use /shoppm to declare your message.');
   } else {
        var msg = user.name + ' has bought ' + item + '.';
        for (var i in Users.users) {
            if (Users.users[i].group === '~') {
                Users.users[i].send('|pm|~Shop Alert|' + Users.users[i].getIdentity() + '|' + msg);
            }
        } 
   }
}
