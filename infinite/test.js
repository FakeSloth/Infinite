var mongo = require('./mongo');
var Economy = require('./economy');

mongo.connect();

Economy.get('craturephil')
.then(function(result) {
    console.log(result);
}, function(err) {
    console.log(err);
});