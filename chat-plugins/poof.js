const messages = [
	"A large 8-eyed spiedr descended from the sky and picked up {{user}}.",
	"Aerow accidently kicked {{user}} from the server!",
	"became a fgt!",
	"fell in love with Aerow!",
	"saw Aerow and Levi kissing each other!",
	"fell in love with Slugma!",
	"{{user}}: why couldn't cacnea see behind him? sparkbot: because he couldn't cacturne around",
	"{{user}}: which legendary commits the most thievery? sparkbot: Regi-steal",
	"felt the need to poop.",
	"realized Fender is a nerd!",
	"saw a pic of Aerow irl!",
	"{{user}}: why didn't the meowth like the glameow? sparkbot: It looked purugly",
	"fender accidently kicked {{user}} from the server!",
	"got 6-0'd by Fiend Hound's manual sand team and quit mons.",
	"got banned by levi for insulting Foongus!",
	"got banned by sparktrain for insulting Seel!",
	"{{user}}: What is a meal made with Grass-types served on? sparkbot: An Od-dish.",
	"got haxed by FLCL and quit mons.",
	"got hit by several of Antgeezy's frothy turds.",
	"got lost in a cave of salt!",
	"got salted.",
	"got swept by Hophip!",
	"is a fatass and rolls in marmalade LEWL :D",
	"left the saltfest!",
	"married Nineage!",
	"pooped on Aerow!",
	"saw Dhaora's ghost!",
	"saw zeriloa fapping!",
	"sparktrain intentionally kicked {{user}} from the server!",
	"took all of Nineage's money!",
	"took an Aerow to the knee... and then one to the face.",
	"turned into a nerd!",
	"turned into trash!",
	"used Memento on Pawniard!",
	"visited zeriloa's bedroom and never returned!",
	"was BLEGHED on by Fender!",
	"{{user}}: what is the most popular pokemon hair product? sparkbot: loreal Paras",
	"{{user}}: what was wrong with the painting in the video game? sparkbot: it had a low frame rate",
	"was shot by Aerow's Arrow!",
	"was squished by zeriloa's large behind!",
];

exports.commands = {
	d: 'poof',
	cpoof: 'poof',
	poof: function (target, room, user) {
		if (Config.poofOff) return this.sendReply("Poof is currently disabled.");
		if (target && !this.can('broadcast')) return false;
		if (room.id !== 'lobby') return false;
		var message = target || messages[Math.floor(Math.random() * messages.length)];
		if (message.indexOf('{{user}}') < 0)
			message = '{{user}} ' + message;
		message = message.replace(/{{user}}/g, user.name);
		if (!this.canTalk(message)) return false;

		var colour = '#' + [1, 1, 1].map(function () {
			var part = Math.floor(Math.random() * 0xaa);
			return (part < 0x10 ? '0' : '') + part.toString(16);
		}).join('');

		room.addRaw('<center><strong><font color="' + colour + '">~~ ' + Tools.escapeHTML(message) + ' ~~</font></strong></center>');
		user.disconnectAll();
	},

	poofoff: 'nopoof',
	nopoof: function () {
		if (!this.can('poofoff')) return false;
		Config.poofOff = true;
		return this.sendReply("Poof is now disabled.");
	},

	poofon: function () {
		if (!this.can('poofoff')) return false;
		Config.poofOff = false;
		return this.sendReply("Poof is now enabled.");
	}
};
