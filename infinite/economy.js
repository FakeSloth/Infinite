var Q = require('q');
var User = require('./mongo').User;

module.exports = {
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
    }
};
