module.exports = {
    cmds: 'serverhelp',
    infinitehelp: 'serverhelp',
    serverhelp: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('\
            <center><b><u>List of commands:</u></b></center><br>\
            <b>/alias</b> <i>command</i> - Get all alias of a command.<br>\
            <b>/away</b> - Set yourself away.<br>\
            <b>/back</b> - Set yourself back from away.<br>\
            <b>/buy</b> <i>command</i> - Buys an item from the shop.<br>\
            <b>/customsymbol</b> <i>symbol</i> - Get a custom symbol.<br>\
            <b>/define</b> <i>word</i> - Shows the definition of a word.<br>\
            <b>/emotes</b> - Get a list of emoticons.<br>\
            <b>/poof</b> - Disconnects the user and leaves a message in the room.<br>\
            <b>/regdate</b> <i>user</i> - Gets registration date of the user.<br>\
            <b>/resetsymbol</b> - Reset custom symbol if you have one.<br>\
            <b>/richestusers</b> - Show the richest users.<br>\
            <b>/shop</b> - Displays the shop.<br>\
            <b>/stafflist</b> - Shows the staff.<br>\
            <b>/transfer</b> <i>user</i>, <i>amount</i> - Transfer a certain amount of money to a user.<br>\
            <b>/urbandefine</b> <i>word</i> - Shows the urban definition of the word.<br>\
            <b>/wallet</b> <i>user</i> - Displays how much money a user has. Parameter is optional.<br>\
            ');

        if (user.isStaff) {
            Users.get(user.userid).send('|raw|<div class="infobox">\
            <center><b><u>List of <i>staff</i> commands:</u></b></center><br>\
            <b>/clearall</b> - Clear all messages in the room.<br>\
            <b>/endpoll</b> - End the poll in the room.<br>\
            <b>/givemoney</b> <i>name</i>, <i>amount</i> - Give a user a certain amount of money.<br>\
            <b>/hide</b> - Hide your staff symbol.<br>\
            <b>/pmall</b> <i>message</i> - Private message all users in the server.<br>\
            <b>/pmstaff</b> <i>message</i> - Private message all staff.<br>\
            <b>/resetmoney</b> <i>name</i> - Reset the user\'s money to 0.<br>\
            <b>/rmall</b> <i>message</i> - Private message all users in the room.<br>\
            <b>/poll</b> <i>question</i>, <i>option 1</i>, <i>option 2</i>... - Create a poll where users can vote on an option.<br>\
            <b>/show</b> - Show your staff symbol.<br>\
            <b>/takemoney</b> <i>user</i>, <i>amount</i> - Take a certain amount of money from a user.<br>\
            <b>/trainercard</b> <i>help</i> - Makes adding trainer cards EZ.<br>\
                </div>');
        }
    },

    alias: function(target, room, user) {
        if (!this.canBroadcast()) return;
        if (!target) return this.sendReply('/alias [command] - Get all aliases of a command.');
        var match = { value: false };

        handleAlias.call(this, '/serverhelp, /infinitehelp, /cmds', target, match);
        handleAlias.call(this, '/emoticons, /emotes', target, match);
        handleAlias.call(this, '/def, /define', target, match);
        handleAlias.call(this, '/u, /ud', target, match);
        handleAlias.call(this, '/wallet, /purse, /atm', target, match);
        handleAlias.call(this, '/givemoney, /givebucks, /givebuck', target, match);
        handleAlias.call(this, '/takemoney, /takebucks, /takebuck', target, match);
        handleAlias.call(this, '/transfermoney, /transferbucks, /transferbuck, /transfer', target, match);
        handleAlias.call(this, '/resetsymbol, /resetcustomsymbol', target, match);
        handleAlias.call(this, '/pollremind, /pr', target, match);
        handleAlias.call(this, '/pmall, /masspm', target, match);
        handleAlias.call(this, '/pmallstaff, /pmallstaff', target, match);
        handleAlias.call(this, '/pmroom, /rmall', target, match);
        handleAlias.call(this, '/trainercard, /tc, /trainercards, /eztc', target, match);
        handleAlias.call(this, '/moneyladder, /richladder, /richestuser, /richestusers', target, match);
        handleAlias.call(this, '/resetmoney, /resetbucks, /resetbuck', target, match);
        handleAlias.call(this, '/redirect, /redirekt', target, match);

        if (!match.value) {
            this.sendReply('Alias not found for this command.');
        }
    }
};

/**
 * Handle the alias of the command.
 * 
 * @param {String} commands
 * @param {String} cmd
 * @param {Object} match
 */

function handleAlias(commands, cmd, match) {
    if (match.value) return;
    if (commands.indexOf(cmd) >= 0) {
        match.value = true;
        this.sendReplyBox(commands);
    } else {
       match.value = false; 
    }
}
