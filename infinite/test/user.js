var assert = require('assert');
var Economy = require('../economy');
var Mongo = require('../mongo');
var User = Mongo.User;
var userModel = Mongo.userModel;

Mongo.connect();

var testUser = toId('test-user name');
var testUser2 = toId('t3st-User name 2');
describe('User Model', function() {
    it('should create a new user', function(done) {
        var user = new userModel({name: testUser});
        user.save(function(err) {
            if (err) return done(err);
            done();
        });
    });

    it('should not create a user with the unique name', function(done) {
        var user = new userModel({name: testUser});
        userModel.save(function(err) {
            if (err) assert.deepEqual(err, 11000);
            done();
        });
    });

    it('should find user by name', function(done) {
        User.findOne({name: testUser})
            .then(function(user) {
                assert.deepEqual(typeof user.name, 'string');
                assert.deepEqual(typeof user.money, 'number');
                assert.deepEqual(user.name, testUser);
                assert.deepEqual(user.money, 0);
                done();
            }, function(err) {
                if (err) done(err);
            });
    });

    it('should find users', function(done) {
        User.find({})
            .then(function(users) {
                assert.deepEqual(users.constructor, Array);
                done();
            }, function(err) {
                if (err) done(err);
            });
    });

    it('should delete a user', function(done) {
        userModel.remove({name: testUser}, function(err) {
            if (err) return done(err);
            done();
        });
    });
});

describe('User in economy', function() {
    it('should create new users', function(done) {
        var user = new userModel({name: testUser});
        user.save(function(err) {
            if (err) return done(err);
            user = new userModel({name: testUser});
            user.save(function(err) {
                if (err) return done(err);
                done();
            });
        });
    });

    it('should get user by name', function(done) {
        Economy.get(testUser)
            .then(function(money) {
                assert.deepEqual(typeof money, 'number');
                assert.deepequal(money, 0);
            }, function(err) {
                if (err) done(err);
            });
    });

    it('should take user money', function(done) {
        Economy.take(testUser, 10)
            .then(function(money) {
                assert.deepEqual(typeof money, 'number');
                assert.deepequal(money, 0);
            }, function(err) {
                if (err) done(err);
            });
    });

    it('should transfer user money', function(done) {
        var amount = 5;
        Economy.get(testUser)
            .then(function(money) {
                assert.deepEqual(amount > money, false);
                assert.deepEqual(money, 10);
                return [Economy.give(testUser2, amount), Economy.take(testUser, amount)];
            })
            .spread(function(targetTotal, userTotal) {
                assert.deepEqual(targetTotal, 5);
                assert.deepEqual(userTotal, 5);
                done();
            }).done();
    });

    it('should give user money', function(done) {
        Economy.give(testUser, 5)
            .then(function(money) {
                assert.deepEqual(typeof money, 'number');
                assert.deepequal(money, 5);
            }, function(err) {
                if (err) done(err);
            });
    });

    it('should delete a users', function(done) {
        userModel.remove({name: testUser}, function(err) {
            if (err) return done(err);
            userModel.remove({name: testUser2}, function(err) {
                if (err) return done(err);
                done();
            });
        });
    });
});
