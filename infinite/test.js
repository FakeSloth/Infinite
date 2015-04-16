var mongo = require('./mongo');
var Economy = require('./economy');

mongo.connect();

Economy.get('creaturephil')
.then(function(money) {
    console.log(money);
}, function(err) {
    console.log(err);
});
Economy.get('micheal')
.then(function(money) {
    console.log(money);
}, function(err) {
    console.log(err);
});