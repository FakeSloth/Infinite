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
            <b>/buypack</b> <i>pack</i> - Buys a pack from the pack shop.<br>\
            <b>/card</b> <i>card id</i>, <i>user (optional)</i> - Show a card.<br>\
            <b>/cardladder</b> - Displays the ladder for the top users with the best cards.<br>\
            <b>/customsymbol</b> <i>symbol</i> - Get a custom symbol.<br>\
            <b>/define</b> <i>word</i> - Shows the definition of a word.<br>\
            <b>/emotes</b> - Get a list of emoticons.<br>\
            <b>/hangman</b> help - Help on hangman specific commands.<br>\
            <b>/openpack</b> <i>pack</i> - Open a Pokemon Card Pack.<br>\
            <b>/packs</b> <i>user</i> - Shows how many packs a user has.<br>\
            <b>/packshop</b> - Displays the shop for packs.<br>\
            <b>/poof</b> - Disconnects the user and leaves a message in the room.<br>\
            <b>/psgohelp</b> - Displays help for the card game <u>PSGO</u>.<br>\
            <b>/showcase</b> <i>user</i> - Shows the cards a user has collected<br>\
            <b>/regdate</b> <i>user</i> - Gets registration date of the user.<br>\
            <b>/resetsymbol</b> - Reset custom symbol if you have one.<br>\
            <b>/seen</b> <i>username</i> - Shows when the user last connected on the server.<br>\
            <b>/richestusers</b> - Show the richest users.<br>\
            <b>/shop</b> - Displays the server\'s main shop.<br>\
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
            <b>/givepack</b> <i>user</i>, <i>pack</i> - Give a user a pack.<br>\
            <b>/hide</b> - Hide your staff symbol.<br>\
            <b>/pmall</b> <i>message</i> - Private message all users in the server.<br>\
            <b>/pmstaff</b> <i>message</i> - Private message all staff.<br>\
            <b>/resetmoney</b> <i>name</i> - Reset the user\'s money to 0.<br>\
            <b>/rmall</b> <i>message</i> - Private message all users in the room.<br>\
            <b>/poll</b> <i>question</i>, <i>option 1</i>, <i>option 2</i>... - Create a poll where users can vote on an option.<br>\
            <b>/psgostats</b> - Get stats about PSGO.<br>\
            <b>/reload</b> <i>file directory</i> - Reload a certain file.<br>\
            <b>/show</b> - Show your staff symbol.<br>\
            <b>/takemoney</b> <i>user</i>, <i>amount</i> - Take a certain amount of money from a user.<br>\
            <b>/takepack</b> <i>user</i>, <i>pack</i> - Take a pack from a user.<br>\
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
