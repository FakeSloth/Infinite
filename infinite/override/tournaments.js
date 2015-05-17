var Economy = require('../economy');

// Tournament winnings

var color = '#088cc7';
var sizeRequiredToEarn = 3;
var Tournament = Tournaments.Tournament;

/**
 * Gets the name of users
 *
 * @param {Array} users
 * @return {String} name
 */

function usersToNames(users) {
    return users.map(function(user) {
        return user.name;
    });
}

if (!Tournament.prototype.onOriginalTournamentEnd) {
    Tournament.prototype.onOriginalTournamentEnd = Tournament.prototype.onTournamentEnd;
}

Tournament.prototype.onTournamentEnd = function() {
    this.onOriginalTournamentEnd();

    var data = this.generator.getResults().map(usersToNames).toString();
    var winner, runnerUp;

    if (data.indexOf(',') >= 0) {
        data = data.split(',');
        winner = data[0];
        if (data[1]) {
            runnerUp = data[1];
        }
    } else {
        winner = data;
    }

    var wid = toId(winner);
    var rid = toId(runnerUp);
    var tourSize = this.generator.users.size;

    if (this.room.isOfficial && tourSize >= sizeRequiredToEarn) {
        var firstMoney = Math.round(tourSize);
        var secondMoney = Math.round(firstMoney / 2);

        Economy.give(wid, firstMoney);
        var pack = GiveTourPack(wid);
        this.room.addRaw('<b><font color="' + color + '">' + Tools.escapeHTML(winner) + '</font> has won ' + 
            '<font color="' + color + '">' + firstMoney + '</font>' + Economy.currency(firstMoney) + ' and a <button name="send" value="/openpack ' + pack + '">' + pack + '</button> pack for winning the tournament!</b>');
        
        // annouces the winner and runnerUp if runnerUp exists
        if (runnerUp) {
            Economy.give(rid, secondMoney);
            this.room.addRaw('<b><font color="' + color + '">' + Tools.escapeHTML(runnerUp) + '</font> has won ' + 
            '<font color="' + color + '">' + secondMoney + '</font>' + Economy.currency(secondMoney) + ' for winning the tournament!</b>');
        }
    }
};
