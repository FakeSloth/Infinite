// Unlimited room intro size

Rooms.ChatRoom.prototype.getIntroMessage = function () {
    if (this.modchat && this.introMessage) {
        return '\n|raw|<div class="infobox">' + this.introMessage + '</div>' +
            '<br />' +
            '<div class="broadcast-red">' +
            'Must be rank ' + this.modchat + ' or higher to talk right now.' +
            '</div>';
    }

    if (this.modchat) {
        return '\n|raw|<div class="infobox"><div class="broadcast-red">' +
            'Must be rank ' + this.modchat + ' or higher to talk right now.' +
            '</div></div>';
    }

    if (this.introMessage) return '\n|raw|<div class="infobox">' + this.introMessage + '</div>';

    return '';
};
