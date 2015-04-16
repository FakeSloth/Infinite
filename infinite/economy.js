var Q = require('q');
var User = require('./mongo').User;

module.exports = {
    get: function(name) {
        var deferred = Q.defer();
        User.findOne({name : toId(name)}, function(err, user) {
            if (err) return deferred.reject(new Error(err));
            if (!user) return deferred.resolve(0);
            deferred.resolve(user.money);
        });
        return deferred.promise;
    }
};