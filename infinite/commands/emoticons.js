var emotes = require('../emoticons').emotes;

var emotes_table = create_table();

module.exports = {
    emotes: 'emoticons',
    emoticons: function() {
        if (!this.canBroadcast()) return;
        this.sendReply('|raw|' + emotes_table);
    }    
};

/**
 * Create a two column table listing emoticons.
 *
 * @return {String} emotes table
 */

function create_table() {
    var emotes_name = Object.keys(emotes);
    var emotes_list = [];
    var emotes_group_list = [];
    var len = emotes_name.length;

    for (var i = 0; i < len; i++) {
        emotes_list.push('<td>' +
            '<img src="' + emotes[emotes_name[i]] + '" title="' + emotes_name[i] + '">' +
            emotes_name[i] + '</td>');
    }

    var emotes_list_right = emotes_list.splice(len / 2, len / 2);

    for (i = 0; i < len / 2; i++) {
        var emote1 = emotes_list[i],
            emote2 = emotes_list_right[i];
        if (emote2) {
            emotes_group_list.push('<tr>' + emote1 + emote2 + '</tr>');
        } else {
            emotes_group_list.push('<tr>' + emote1 + '</tr>');
        }
    }

    return '<center><b><u>List of Emoticons</u></b></center>' + '<table border="1" cellspacing="0" cellpadding="5" width="100%">' + '<tbody>' + emotes_group_list.join('') + '</tbody>' + '</table>';
}
