var cheerio = require('cheerio');
var fs = require('fs');
var path = require('path');
var request = require('request');

try {
    var regdateCache = JSON.parse(fs.readFileSync('config/regdatecache.json', 'utf8'));
} catch (e) {
    var regdateCache = {};
}

try {
    var urbanCache = JSON.parse(fs.readFileSync('config/udcache.json', 'utf8'));
} catch (e) {
    var urbanCache = {};
}

function cacheUrbanWord (word, definition) {
    word = word.toLowerCase().replace(/ /g, '');
    urbanCache[word] = {"definition": definition, "time": Date.now()};
    fs.writeFile('config/urbancache.json', JSON.stringify(urbanCache));
}

function cacheRegdate (user, date) {
    regdateCache[toId(user)] = date;
    fs.writeFile('config/regdatecache.json', JSON.stringify(regdateCache));
}

module.exports = {
    regdate: function(target, room, user, connection) {
        if (!this.canBroadcast()) return;
        if (!target) return this.sendReply('/regdate [username] - Get the registration date of a user.');
        var name = toId(target);
        if (regdateCache[name]) {
           this.sendReplyBox(Tools.escapeHTML(name) + ' was registered on ' + regdateCache[name] + '.');
           return room.update();
        }

        request('http://pokemonshowdown.com/users/' + name, function(error, response, body) {
            if (error) console.log(error);
            if (response.statusCode !== 200) {
                this.sendReplyBox(Tools.escapeHTML(target) + ' is not registered.');
                return room.update();
            }
            var $ = cheerio.load(body);
            var date = $('small').first().text().split(': ')[1];
            cacheRegdate(name, date);
            this.sendReplyBox(Tools.escapeHTML(target) + ' was registered on ' + date + '.');
            room.update();
        }.bind(this));
    },

    def: 'define',
    define: function(target, room, user) {
        if (!target) return this.sendReply('Usage: /define <word>');
        target = toId(target);
        if (target > 50) return this.sendReply('/define <word> - word can not be longer than 50 characters.');
        if (!this.canBroadcast()) return;

        var options = {
            url: 'http://api.wordnik.com:80/v4/word.json/'+target+'/definitions?limit=3&sourceDictionaries=all' +
            '&useCanonical=false&includeTags=false&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5',
        };

        var self = this;

        function callback(error, response, body) {
            if (!error && response.statusCode == 200) {
                var page = JSON.parse(body);
                var output = '<font color=#24678d><b>Definitions for ' + target + ':</b></font><br />';
                if (!page[0]) {
                    self.sendReplyBox('No results for <b>"' + target + '"</b>.');
                    return room.update();
                } else {
                    var count = 1;
                    for (var u in page) {
                        if (count > 3) break;
                        output += '(<b>'+count+'</b>) ' + Tools.escapeHTML(page[u]['text']) + '<br />';
                        count++;
                    }
                    self.sendReplyBox(output);
                    return room.update();
                }
            }
        }
        request(options, callback);
    },

    u: 'ud',
    urbandefine: 'ud',
    ud: function(target, room, user, connection, cmd) {
        var random;
        if (!target) {
            target = '';
            random = true;
        } else {
            random = false;
        }
        if (target.toString().length > 50) return this.sendReply('/ud - <phrase> can not be longer than 50 characters.');
        if (!this.canBroadcast()) return;
        if (user.userid === 'roseybear' && this.broadcasting) return this.sendReply('lol nope');

        if (!random) {
            options = {
                url: 'http://www.urbandictionary.com/iphone/search/define',
                term: target,
                headers: {
                    'Referer': 'http://m.urbandictionary.com'
                },
                qs: {
                    'term': target
                }
            };
        } else {
            options = {
                url: 'http://www.urbandictionary.com/iphone/search/random',
                headers: {
                    'Referer': 'http://m.urbandictionary.com'
                },
            };
        }

        var milliseconds = ((44640 * 60) * 1000);

        if (urbanCache[target.toLowerCase().replace(/ /g, '')] && Math.round(Math.abs((urbanCache[target.toLowerCase().replace(/ /g, '')].time - Date.now())/(24*60*60*1000))) < 31) {
            return this.sendReplyBox("<b>" + Tools.escapeHTML(target) + ":</b> " + urbanCache[target.toLowerCase().replace(/ /g, '')].definition.substr(0,400));
        }

        self = this;

        function callback(error, response, body) {
            if (!error && response.statusCode == 200) {
                page = JSON.parse(body);
                definitions = page['list'];
                if (page['result_type'] == 'no_results') {
                    self.sendReplyBox('No results for <b>"' + Tools.escapeHTML(target) + '"</b>.');
                    return room.update();
                } else {
                    if (!definitions[0]['word'] || !definitions[0]['definition']) {
                        self.sendReplyBox('No results for <b>"' + Tools.escapeHTML(target) + '"</b>.');
                        return room.update();
                    }
                    output = '<b>' + Tools.escapeHTML(definitions[0]['word']) + ':</b> ' + Tools.escapeHTML(definitions[0]['definition']).replace(/\r\n/g, '<br />').replace(/\n/g, ' ');
                    if (output.length > 400) output = output.slice(0,400) + '...';
                    cacheUrbanWord(target, Tools.escapeHTML(definitions[0]['definition']).replace(/\r\n/g, '<br />').replace(/\n/g, ' '));
                    self.sendReplyBox(output);
                    return room.update();
                }
            }
        }
        request(options, callback);
    },

    tell: function (target, room, user, connection) {
        if (!target) return this.sendReply('/tell [username], [message] - Send a message to an offline user that will be received when they log in.');
        target = this.splitTarget(target);
        var targetUser = this.targetUser;
        if (!target) {
            this.sendReply("You forgot the comma.");
            return this.sendReply('/tell [username], [message] - Send a message to an offline user that will be received when they log in.');
        }

        if (targetUser && targetUser.connected) {
            return this.parse('/pm ' + this.targetUsername + ', ' + target);
        }

        if (user.locked) return this.popupReply("You may not send offline messages when locked.");
        if (target.length > 255) return this.popupReply("Your message is too long to be sent as an offline message (>255 characters).");

        if (Config.tellrank === 'autoconfirmed' && !user.autoconfirmed) {
            return this.popupReply("You must be autoconfirmed to send an offline message.");
        } else if (!Config.tellrank || Config.groupsranking.indexOf(user.group) < Config.groupsranking.indexOf(Config.tellrank)) {
            return this.popupReply("You cannot send an offline message because offline messaging is " +
                (!Config.tellrank ? "disabled" : "only available to users of rank " + Config.tellrank + " and above") + ".");
        }

        var userid = toId(this.targetUsername);
        if (userid.length > 18) return this.popupReply("\"" + this.targetUsername + "\" is not a legal username.");

        var sendSuccess = Tells.addTell(user, userid, target);
        if (!sendSuccess) {
            if (sendSuccess === false) return this.popupReply("User " + this.targetUsername + " has too many offline messages queued.");
            else return this.popupReply("You have too many outgoing offline messages queued. Please wait until some have been received or have expired.");
        }
        return connection.send('|pm|' + user.getIdentity() + '|' +
            (targetUser ? targetUser.getIdentity() : ' ' + this.targetUsername) +
            "|/text This user is currently offline. Your message will be delivered when they are next online.");
    }
};
