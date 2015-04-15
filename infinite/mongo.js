var mongoose = require('mongoose');

/**
 * Connect to MongoDB Database.
 *
 * @param {String} db
 */

exports.connect_database = function(db) {
    if (!db) db = 'mongodb://localhost:27017/ps';
    var url = process.env.MONGODB || db;
    mongoose.connect(url);
    mongoose.connection.on('error', function() {
        console.error('MongoDB Connection Error. Make sure MongoDB is running.');
    });
}

var userSchema = new mongoose.Schema({
    name: { type: String, lowercase: true, unique: true },
    money: { type: Number, default: 0 },
    symbol: String,
    seen: Date
});

exports.User = mongoose.model('user', userSchema);
