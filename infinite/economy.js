var Q = require('q');
var Mongo = require('./mongo');
var User = Mongo.User;
var userModel = Mongo.userModel;

module.exports = {
    /**
     * Get economy's currency name.
     * 
     * @param {Number} amount
     * @return {String} currency name
     */
    currency: function(amount) {
        var name = ' buck';
        return amount === 1 ? name : name + 's';
    },

    /**
     * Get a user money amount.
     *
     * @param {String} name
     * @return {Promise}
     */
    get: function(name) {
        var deferred = Q.defer();
        User.findOne({name: toId(name)})
            .then(function(user) {
                if (!user) return deferred.resolve(0);
                deferred.resolve(user.money);
            }, function(err) {
                if (err) return deferred.reject(new Error(err));
            });
        return deferred.promise;
    },

    /**
     * Give a user a ceratin amount of money.
     *
     * @param {String} name
     * @param {Number} amount
     * @return {Promise}
     */
    give: function(name, amount) {
        var deferred = Q.defer();
        User.findOne({name: toId(name)})
            .then(function(user) {
                if (!user) {
                    user = new userModel({
                        name: toId(name),
                        money: amount
                    });
                    return user.save(function(err) {
                        if (err) return deferred.reject(new Error(err));
                        deferred.resolve(user.money);
                    });
                }
                user.money += amount;
                user.save(function(err) {
                    if (err) return deferred.reject(new Error(err));
                    deferred.resolve(user.money);
                });
            }, function(err) {
                if (err) return deferred.reject(new Error(err));
            });
        return deferred.promise;
    },

    /**
     * Take a certain amount of money from a user.
     * 
     * @param {String} name
     * @param {Number} amount
     * @return {Promise}
     */
    take: function(name, amount) {
        var deferred = Q.defer();
        User.findOne({name: toId(name)})
            .then(function(user) {
                if (!user) {
                    user = new userModel({
                        name: toId(name),
                        money: amount
                    });
                    return user.save(function(err) {
                        if (err) return deferred.reject(new Error(err));
                        deferred.resolve(user.money);
                    });
                }
                user.money -= amount;
                user.save(function(err) {
                    if (err) return deferred.reject(new Error(err));
                    deferred.resolve(user.money);
                });
            }, function(err) {
                if (err) return deferred.reject(new Error(err));
            });
        return deferred.promise;
    }
};
