var assert = require('assert');
var mongo = require('../mongo');
var User = mongo.User;
var userModel = mongo.userModel;

mongo.connect();

var testUser = toId('test-user name');
describe('User Model', function() {
    it('should create a new user', function(done) {
        var user = new userModel({name: testUser});
        userModel.save(function(err) {
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
