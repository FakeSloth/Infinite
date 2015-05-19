var color = require('./color');

module.exports = Profile;

var BR = '<br>';
var SPACE = '&nbsp;';
var profileColor = '#24678d';
var trainersprites = [1, 2, 101, 102, 169, 170, 265, 266, 168];

/**
 * Profile constructor.
 *
 * @param {Boolean} isOnline
 * @param {Object|String} user - if isOnline then Object else String
 * @param {String} image
 */

function Profile(isOnline, user, image) {
   this.isOnline = isOnline || false; 
   this.user = user || null;
   this.image = image;

   this.url = '';
}

/**
 * Create an bold html tag element.
 *
 * Example:
 * createFont('Hello World!');
 * => '<b>Hello World!</b>'
 *
 * @param {String} color
 * @param {String} text
 * @return {String}
 */

function bold(text) {
    return '<b>' + text + '</b>';
}

/**
 * Create an font html tag element.
 *
 * Example:
 * createFont('Hello World!', 'blue');
 * => '<font color="blue">Hello World!</font>'
 *
 * @param {String} color
 * @param {String} text
 * @return {String}
 */

function font(color, text) {
    return '<font color="' + color + '">' + text + '</font>';
}

/**
 * Create an img tag element.
 *
 * Example:
 * createImg('phil.png');
 * => '<img src="phil.png" height="80" width="80" align="left">'
 *
 * @param {String} link
 * @return {String}
 */

function img(link) {
    return '<img src="' + link + '" height="80" width="80" align="left">';
}

/**
 * Create a font html element wrap around by a bold html element.
 * Uses to `profileColor` as a color.
 * Adds a colon at the end of the text and a SPACE at the end of the element.
 *
 * @param {String} text
 * @return {String}
 */

function label(text) {
    return bold(font(profileColor, text + ':')) + SPACE;
}

Profile.prototype.avatar = function() {
    if (this.isOnline) {
        if (typeof this.image === 'string') return img(this.url + '/avatars/' + this.image);
        return img('http://play.pokemonshowdown.com/sprites/trainers/' + this.image + '.png');
    }
    for (var name in Config.customAvatars) {
        if (this.user === name) {
            return img(this.url + '/avatars/' + Config.customAvatars[name]);
        }
    }
    var selectedSprite = trainersprites[Math.floor(Math.random() * trainersprites.length)];
    return img('http://play.pokemonshowdown.com/sprites/trainers/' + selectedSprite + '.png');
};

Profile.prototype.group = function() {
    if (this.isOnline && this.user.group === ' ') return label('Group') + 'Regular User';
    if (this.isOnline) return label('Group') + Config.groups[this.user.group].name;
    for (var user in Users.usergroups) {
        if (this.user === Users.usergroups[name]) {
            return label('Group') + Config.groups[Users.usergroups[name].charAt(0)].name;
        }
    }
    return label('Group') + 'Regular User';
};

Profile.prototype.name = function() {
    if (this.isOnline) return label('Name') + font(color(toId(this.user.name)), this.user.name);
    return label('Name') + font(color(this.user), this.user);
};

Profile.prototype.display = function() {
    return this.avatar() +
        SPACE + this.name() + BR +
        SPACE + this.group() +
        '<br clear="all">';
};
