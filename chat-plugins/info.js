/**
 * Informational Commands
 * Pokemon Showdown - https://pokemonshowdown.com/
 *
 * These are informational commands. For instance, you can define the command
 * 'whois' here, then use it by typing /whois into Pokemon Showdown.
 *
 * For the API, see chat-plugins/COMMANDS.md
 *
 * @license MIT license
 */

var commands = exports.commands = {

	ip: 'whois',
	rooms: 'whois',
	alt: 'whois',
	alts: 'whois',
	whoare: 'whois',
	whois: function (target, room, user, connection, cmd) {
		var targetUser = this.targetUserOrSelf(target, user.group === ' ');
		if (!targetUser) {
			return this.sendReply("User " + this.targetUsername + " not found.");
		}

		this.sendReply("|raw|User: " + targetUser.name + (!targetUser.connected ? ' <font color="gray"><em>(offline)</em></font>' : ''));
		if (user.can('alts', targetUser)) {
			var alts = targetUser.getAlts(true);
			var output = Object.keys(targetUser.prevNames).join(", ");
			if (output) this.sendReply("Previous names: " + output);

			for (var j = 0; j < alts.length; ++j) {
				var targetAlt = Users.get(alts[j]);
				if (!targetAlt.named && !targetAlt.connected) continue;
				if (targetAlt.group === '~' && user.group !== '~') continue;

				this.sendReply("|raw|Alt: " + targetAlt.name + (!targetAlt.connected ? ' <font color="gray"><em>(offline)</em></font>' : ''));
				output = Object.keys(targetAlt.prevNames).join(", ");
				if (output) this.sendReply("Previous names: " + output);
			}
			if (targetUser.locked) {
				switch (targetUser.locked) {
				case '#dnsbl':
					this.sendReply("Locked: IP is in a DNS-based blacklist. ");
					break;
				case '#range':
					this.sendReply("Locked: IP or host is in a temporary range-lock.");
					break;
				case '#hostfilter':
					this.sendReply("Locked: host is permanently locked for being a proxy.");
					break;
				default:
					this.sendReply("Locked under the username: " + targetUser.locked);
				}
			}
		}
		if (Config.groups[targetUser.group] && Config.groups[targetUser.group].name) {
			this.sendReply("Group: " + Config.groups[targetUser.group].name + " (" + targetUser.group + ")");
		}
		if (targetUser.isSysop) {
			this.sendReply("(Pok\xE9mon Showdown System Operator)");
		}
		if (!targetUser.registered) {
			this.sendReply("(Unregistered)");
		}
		if ((cmd === 'ip' || cmd === 'whoare') && (user.can('ip', targetUser) || user === targetUser)) {
			var ips = Object.keys(targetUser.ips);
			this.sendReply("IP" + ((ips.length > 1) ? "s" : "") + ": " + ips.join(", ") +
					(user.group !== ' ' && targetUser.latestHost ? "\nHost: " + targetUser.latestHost : ""));
		}
		var publicrooms = "In rooms: ";
		var hiddenrooms = "In hidden rooms: ";
		var first = true;
		var hiddencount = 0;
		for (var i in targetUser.roomCount) {
			var targetRoom = Rooms.get(i);
			if (i === 'global' || targetRoom.isPrivate === true) continue;

			var output = (targetRoom.auth && targetRoom.auth[targetUser.userid] ? targetRoom.auth[targetUser.userid] : '') + '<a href="/' + i + '" room="' + i + '">' + i + '</a>';
			if (targetRoom.isPrivate) {
				if (hiddencount > 0) hiddenrooms += " | ";
				++hiddencount;
				hiddenrooms += output;
			} else {
				if (!first) publicrooms += " | ";
				first = false;
				publicrooms += output;
			}
		}
		this.sendReply('|raw|' + publicrooms);
		if (cmd === 'whoare' && user.can('lock') && hiddencount > 0) {
			this.sendReply('|raw|' + hiddenrooms);
		}
	},
	whoishelp: ["/whois - Get details on yourself: alts, group, IP address, and rooms.",
		"/whois [username] - Get details on a username: alts (Requires: % @ & ~), group, IP address (Requires: @ & ~), and rooms."],

	ipsearchall: 'ipsearch',
	hostsearch: 'ipsearch',
	ipsearch: function (target, room, user, connection, cmd) {
		if (!target.trim()) return this.parse('/help ipsearch');
		if (!this.can('rangeban')) return;
		var results = [];

		var isAll = (cmd === 'ipsearchall');

		if (/[a-z]/.test(target)) {
			// host
			this.sendReply("Users with host " + target + ":");
			for (var userid in Users.users) {
				var curUser = Users.users[userid];
				if (!curUser.latestHost || !curUser.latestHost.endsWith(target)) continue;
				if (results.push((curUser.connected ? " \u25C9 " : " \u25CC ") + " " + curUser.name) > 100 && !isAll) {
					return this.sendReply("More than 100 users match the specified IP range. Use /ipsearchall to retrieve the full list.");
				}
			}
		} else if (target.slice(-1) === '*') {
			// IP range
			this.sendReply("Users in IP range " + target + ":");
			target = target.slice(0, -1);
			for (var userid in Users.users) {
				var curUser = Users.users[userid];
				if (!curUser.latestIp.startsWith(target)) continue;
				if (results.push((curUser.connected ? " \u25C9 " : " \u25CC ") + " " + curUser.name) > 100 && !isAll) {
					return this.sendReply("More than 100 users match the specified IP range. Use /ipsearchall to retrieve the full list.");
				}
			}
		} else {
			this.sendReply("Users with IP " + target + ":");
			for (var userid in Users.users) {
				var curUser = Users.users[userid];
				if (curUser.latestIp === target) {
					results.push((curUser.connected ? " \u25C9 " : " \u25CC ") + " " + curUser.name);
				}
			}
		}
		if (!results.length) return this.sendReply("No results found.");
		return this.sendReply(results.join('; '));
	},
	ipsearchhelp: ["/ipsearch [ip|range|host] - Find all users with specified IP, IP range, or host (Requires: & ~)"],

	/*********************************************************
	 * Shortcuts
	 *********************************************************/

	inv: 'invite',
	invite: function (target, room, user) {
		target = this.splitTarget(target);
		if (!this.targetUser) {
			return this.sendReply("User " + this.targetUsername + " not found.");
		}
		var targetRoom = (target ? Rooms.search(target) : room);
		if (!targetRoom) {
			return this.sendReply("Room " + target + " not found.");
		}
		return this.parse('/msg ' + this.targetUsername + ', /invite ' + targetRoom.id);
	},
	invitehelp: ["/invite [username], [roomname] - Invites the player [username] to join the room [roomname]."],

	/*********************************************************
	 * Data Search Tools
	 *********************************************************/

	pstats: 'data',
	stats: 'data',
	dex: 'data',
	pokedex: 'data',
	data: function (target, room, user, connection, cmd) {
		if (!this.canBroadcast()) return;

		var buffer = '';
		var targetId = toId(target);
		if (!targetId) return this.parse('/help data');
		if (targetId === '' + parseInt(targetId)) {
			for (var p in Tools.data.Pokedex) {
				var pokemon = Tools.getTemplate(p);
				if (pokemon.num === parseInt(target)) {
					target = pokemon.species;
					targetId = pokemon.id;
					break;
				}
			}
		}
		var newTargets = Tools.dataSearch(target);
		var showDetails = (cmd === 'dt' || cmd === 'details');
		if (newTargets && newTargets.length) {
			for (var i = 0; i < newTargets.length; ++i) {
				if (newTargets[i].id !== targetId && !Tools.data.Aliases[targetId] && !i) {
					buffer = "No Pokemon, item, move, ability or nature named '" + target + "' was found. Showing the data of '" + newTargets[0].name + "' instead.\n";
				}
				if (newTargets[i].searchType === 'nature') {
					buffer += "" + newTargets[i].name + " nature: ";
					if (newTargets[i].plus) {
						var statNames = {'atk': "Attack", 'def': "Defense", 'spa': "Special Attack", 'spd': "Special Defense", 'spe': "Speed"};
						buffer += "+10% " + statNames[newTargets[i].plus] + ", -10% " + statNames[newTargets[i].minus] + ".";
					} else {
						buffer += "No effect.";
					}
					return this.sendReply(buffer);
				} else {
					buffer += '|c|~|/data-' + newTargets[i].searchType + ' ' + newTargets[i].name + '\n';
				}
			}
		} else {
			return this.sendReply("No Pokemon, item, move, ability or nature named '" + target + "' was found. (Check your spelling?)");
		}

		if (showDetails) {
			var details;
			var isSnatch = false;
			var isMirrorMove = false;
			if (newTargets[0].searchType === 'pokemon') {
				var pokemon = Tools.getTemplate(newTargets[0].name);
				var weighthit = 20;
				if (pokemon.weightkg >= 200) {
					weighthit = 120;
				} else if (pokemon.weightkg >= 100) {
					weighthit = 100;
				} else if (pokemon.weightkg >= 50) {
					weighthit = 80;
				} else if (pokemon.weightkg >= 25) {
					weighthit = 60;
				} else if (pokemon.weightkg >= 10) {
					weighthit = 40;
				}
				details = {
					"Dex#": pokemon.num,
					"Gen": pokemon.gen,
					"Height": pokemon.heightm + " m",
					"Weight": pokemon.weightkg + " kg <em>(" + weighthit + " BP)</em>",
					"Dex Colour": pokemon.color,
					"Egg Group(s)": pokemon.eggGroups.join(", ")
				};
				if (!pokemon.evos.length) {
					details["<font color=#585858>Does Not Evolve</font>"] = "";
				} else {
					details["Evolution"] = pokemon.evos.map(function (evo) {
						evo = Tools.getTemplate(evo);
						return evo.name + " (" + evo.evoLevel + ")";
					}).join(", ");
				}
			} else if (newTargets[0].searchType === 'move') {
				var move = Tools.getMove(newTargets[0].name);
				details = {
					"Priority": move.priority,
					"Gen": move.gen
				};

				if (move.secondary || move.secondaries) details["<font color=black>&#10003; Secondary effect</font>"] = "";
				if (move.flags['contact']) details["<font color=black>&#10003; Contact</font>"] = "";
				if (move.flags['sound']) details["<font color=black>&#10003; Sound</font>"] = "";
				if (move.flags['bullet']) details["<font color=black>&#10003; Bullet</font>"] = "";
				if (move.flags['pulse']) details["<font color=black>&#10003; Pulse</font>"] = "";
				if (!move.flags['protect'] && !/(ally|self)/i.test(move.target)) details["<font color=black>&#10003; Bypasses Protect</font>"] = "";
				if (move.flags['authentic']) details["<font color=black>&#10003; Bypasses Substitutes</font>"] = "";
				if (move.flags['defrost']) details["<font color=black>&#10003; Thaws user</font>"] = "";
				if (move.flags['bite']) details["<font color=black>&#10003; Bite</font>"] = "";
				if (move.flags['punch']) details["<font color=black>&#10003; Punch</font>"] = "";
				if (move.flags['powder']) details["<font color=black>&#10003; Powder</font>"] = "";
				if (move.flags['reflectable']) details["<font color=black>&#10003; Bounceable</font>"] = "";
				if (move.flags['gravity']) details["<font color=black>&#10007; Suppressed by Gravity</font>"] = "";

				if (move.id === 'snatch') isSnatch = true;
				if (move.id === 'mirrormove') isMirrorMove = true;

				details["Target"] = {
					'normal': "One Adjacent Pokemon",
					'self': "User",
					'adjacentAlly': "One Ally",
					'adjacentAllyOrSelf': "User or Ally",
					'adjacentFoe': "One Adjacent Opposing Pokemon",
					'allAdjacentFoes': "All Adjacent Opponents",
					'foeSide': "Opposing Side",
					'allySide': "User's Side",
					'allyTeam': "User's Side",
					'allAdjacent': "All Adjacent Pokemon",
					'any': "Any Pokemon",
					'all': "All Pokemon"
				}[move.target] || "Unknown";
			} else if (newTargets[0].searchType === 'item') {
				var item = Tools.getItem(newTargets[0].name);
				details = {
					"Gen": item.gen
				};

				if (item.fling) {
					details["Fling Base Power"] = item.fling.basePower;
					if (item.fling.status) details["Fling Effect"] = item.fling.status;
					if (item.fling.volatileStatus) details["Fling Effect"] = item.fling.volatileStatus;
					if (item.isBerry) details["Fling Effect"] = "Activates the Berry's effect on the target.";
					if (item.id === 'whiteherb') details["Fling Effect"] = "Restores the target's negative stat stages to 0.";
					if (item.id === 'mentalherb') details["Fling Effect"] = "Removes the effects of Attract, Disable, Encore, Heal Block, Taunt, and Torment from the target.";
				} else {
					details["Fling"] = "This item cannot be used with Fling.";
				}
				if (item.naturalGift) {
					details["Natural Gift Type"] = item.naturalGift.type;
					details["Natural Gift Base Power"] = item.naturalGift.basePower;
				}
			} else {
				details = {};
			}

			buffer += '|raw|<font size="1">' + Object.keys(details).map(function (detail) {
				return '<font color=#585858>' + detail + (details[detail] !== '' ? ':</font> ' + details[detail] : '</font>');
			}).join("&nbsp;|&ThickSpace;") + '</font>';

			if (isSnatch) buffer += '&nbsp;|&ThickSpace;<a href="http://pokemonshowdown.com/dex/moves/snatch"><font size="1">Snatchable Moves</font></a>';
			if (isMirrorMove) buffer += '&nbsp;|&ThickSpace;<a href="http://pokemonshowdown.com/dex/moves/mirrormove"><font size="1">Mirrorable Moves</font></a>';
		}
		this.sendReply(buffer);
	},
	datahelp: ["/data [pokemon/item/move/ability] - Get details on this pokemon/item/move/ability/nature.",
		"!data [pokemon/item/move/ability] - Show everyone these details. Requires: + % @ & ~"],

	dt: 'details',
	details: function () {
		CommandParser.commands.data.apply(this, arguments);
	},
	detailshelp: ["/details [pokemon] - Get additional details on this pokemon/item/move/ability/nature.",
		"!details [pokemon] - Show everyone these details. Requires: + % @ & ~"],

	ds: 'dexsearch',
	dsearch: 'dexsearch',
	dexsearch: function (target, room, user) {
		if (!this.canBroadcast()) return;

		if (!target) return this.parse('/help dexsearch');
		var targets = target.split(',');
		var searches = {};
		var allTiers = {'uber':1, 'ou':1, 'bl':1, 'uu':1, 'bl2':1, 'ru':1, 'bl3':1, 'nu':1, 'bl4':1, 'pu':1, 'nfe':1, 'lc uber':1, 'lc':1, 'cap':1};
		var allColours = {'green':1, 'red':1, 'blue':1, 'white':1, 'brown':1, 'yellow':1, 'purple':1, 'pink':1, 'gray':1, 'black':1};
		var allStats = {'hp':1, 'atk':1, 'def':1, 'spa':1, 'spd':1, 'spe':1};
		var showAll = false;
		var megaSearch = null;
		var output = 10;
		var categories = ['gen', 'tier', 'color', 'types', 'ability', 'stats', 'compileLearnsets', 'moves', 'recovery', 'priority'];

		for (var i = 0; i < targets.length; i++) {
			var isNotSearch = false;
			target = targets[i].trim().toLowerCase();
			if (target.charAt(0) === '!') {
				isNotSearch = true;
				target = target.substr(1);
			}

			var targetAbility = Tools.getAbility(targets[i]);
			if (targetAbility.exists) {
				if (!searches['ability']) searches['ability'] = {};
				if (Object.count(searches['ability'], true) === 1 && !isNotSearch) return this.sendReplyBox("Specify only one ability.");
				if ((searches['ability'][targetAbility.name] && isNotSearch) || (searches['ability'][targetAbility.name] === false && !isNotSearch)) return this.sendReplyBox("A search cannot both exclude and include an ability.");
				searches['ability'][targetAbility.name] = !isNotSearch;
				continue;
			}

			if (target in allTiers) {
				if (!searches['tier']) searches['tier'] = {};
				if ((searches['tier'][target] && isNotSearch) || (searches['tier'][target] === false && !isNotSearch)) return this.sendReplyBox('A search cannot both exclude and include a tier.');
				searches['tier'][target] = !isNotSearch;
				continue;
			}

			if (target in allColours) {
				if (!searches['color']) searches['color'] = {};
				if ((searches['color'][target] && isNotSearch) || (searches['color'][target] === false && !isNotSearch)) return this.sendReplyBox('A search cannot both exclude and include a color.');
				searches['color'][target] = !isNotSearch;
				continue;
			}

			if (target.substr(0, 3) === 'gen' && Number.isInteger(parseFloat(target.substr(3)))) target = target.substr(3).trim();
			var targetInt = parseInt(target);
			if (0 < targetInt && targetInt < 7) {
				if (!searches['gen']) searches['gen'] = {};
				if ((searches['gen'][target] && isNotSearch) || (searches['gen'][target] === false && !isNotSearch)) return this.sendReplyBox('A search cannot both exclude and include a generation.');
				searches['gen'][target] = !isNotSearch;
				continue;
			}

			if (target === 'all') {
				if (this.broadcasting) return this.sendReplyBox("A search with the parameter 'all' cannot be broadcast.");
				showAll = true;
				continue;
			}

			if (target === 'megas' || target === 'mega') {
				if ((megaSearch && isNotSearch) || (megaSearch === false && !isNotSearch)) return this.sendReplyBox('A search cannot both exclude and include Mega Evolutions.');
				megaSearch = !isNotSearch;
				continue;
			}

			if (target === 'recovery') {
				if ((searches['recovery'] && isNotSearch) || (searches['recovery'] === false && !isNotSearch)) return this.sendReplyBox('A search cannot both exclude and recovery moves.');
				searches['recovery'] = !isNotSearch;
				continue;
			}

			if (target === 'priority') {
				if ((searches['priority'] && isNotSearch) || (searches['priority'] === false && !isNotSearch)) return this.sendReplyBox('A search cannot both exclude and recovery moves.');
				searches['priority'] = !isNotSearch;
				continue;
			}

			var targetMove = Tools.getMove(target);
			if (targetMove.exists) {
				if (!searches['moves']) searches['moves'] = {};
				if (Object.count(searches['moves'], true) === 4 && !isNotSearch) return this.sendReplyBox("Specify a maximum of 4 moves.");
				if ((searches['moves'][targetMove.id] && isNotSearch) || (searches['moves'][targetMove.id] === false && !isNotSearch)) return this.sendReplyBox("A search cannot both exclude and include a move.");
				searches['moves'][targetMove.id] = !isNotSearch;
				continue;
			}

			var typeIndex = target.indexOf(' type');
			if (typeIndex >= 0) {
				target = target.charAt(0).toUpperCase() + target.substring(1, typeIndex);
				if (target in Tools.data.TypeChart) {
					if (!searches['types']) searches['types'] = {};
					if (Object.count(searches['types'], true) === 2 && !isNotSearch) return this.sendReplyBox("Specify a maximum of two types.");
					if ((searches['types'][target] && isNotSearch) || (searches['types'][target] === false && !isNotSearch)) return this.sendReplyBox("A search cannot both exclude and include a type.");
					searches['types'][target] = !isNotSearch;
					continue;
				}
			}

			var inequality = target.search(/>|<|=/);
			if (inequality >= 0) {
				if (isNotSearch) return this.sendReplyBox("You cannot use the negation symbol '!' in stat ranges.");
				inequality = target.charAt(inequality);
				var targetParts = target.replace(/\s/g, '').split(inequality);
				var numSide, statSide, direction;
				if (!isNaN(targetParts[0])) {
					numSide = 0;
					statSide = 1;
					switch (inequality) {
						case '>': direction = 'less'; break;
						case '<': direction = 'greater'; break;
						case '=': direction = 'equal'; break;
					}
				} else if (!isNaN(targetParts[1])) {
					numSide = 1;
					statSide = 0;
					switch (inequality) {
						case '<': direction = 'less'; break;
						case '>': direction = 'greater'; break;
						case '=': direction = 'equal'; break;
					}
				} else {
					return this.sendReplyBox("No value given to compare with '" + Tools.escapeHTML(target) + "'.");
				}
				var stat = targetParts[statSide];
				switch (toId(targetParts[statSide])) {
					case 'attack': stat = 'atk'; break;
					case 'defense': stat = 'def'; break;
					case 'specialattack': stat = 'spa'; break;
					case 'spatk': stat = 'spa'; break;
					case 'specialdefense': stat = 'spd'; break;
					case 'spdef': stat = 'spd'; break;
					case 'speed': stat = 'spe'; break;
				}
				if (!(stat in allStats)) return this.sendReplyBox("'" + Tools.escapeHTML(target) + "' did not contain a valid stat.");
				if (!searches['stats']) searches['stats'] = {};
				if (direction === 'equal') {
					if (searches['stats'][stat]) return this.sendReplyBox("Invalid stat range for " + stat + ".");
					searches['stats'][stat] = {};
					searches['stats'][stat]['less'] = parseFloat(targetParts[numSide]);
					searches['stats'][stat]['greater'] = parseFloat(targetParts[numSide]);
				} else {
					if (!searches['stats'][stat]) searches['stats'][stat] = {};
					if (searches['stats'][stat][direction]) return this.sendReplyBox("Invalid stat range for " + stat + ".");
					searches['stats'][stat][direction] = parseFloat(targetParts[numSide]);
				}
				continue;
			}
			return this.sendReplyBox("'" + Tools.escapeHTML(target) + "' could not be found in any of the search categories.");
		}

		if (showAll && Object.size(searches) === 0 && megaSearch === null) return this.sendReplyBox("No search parameters other than 'all' were found. Try '/help dexsearch' for more information on this command.");

		var dex = {};
		for (var pokemon in Tools.data.Pokedex) {
			var template = Tools.getTemplate(pokemon);
			var megaSearchResult = (megaSearch === null || (megaSearch === true && template.isMega) || (megaSearch === false && !template.isMega));
			if (template.tier !== 'Unreleased' && template.tier !== 'Illegal' && (template.tier !== 'CAP' || (searches['tier'] && searches['tier']['cap'])) && megaSearchResult) {
				dex[pokemon] = template;
			}
		}

		//Only construct full learnsets for Pokemon if learnsets are used in the search
		if (searches.moves || searches.recovery || searches.priority) searches['compileLearnsets'] = true;

		for (var cat = 0; cat < categories.length; cat++) {
			var search = categories[cat];
			if (!searches[search]) continue;
			switch (search) {
				case 'types':
					for (var mon in dex) {
						if (Object.count(searches[search], true) === 2) {
							if (!(searches[search][dex[mon].types[0]]) || !(searches[search][dex[mon].types[1]])) delete dex[mon];
						} else {
							if (searches[search][dex[mon].types[0]] === false || searches[search][dex[mon].types[1]] === false || (Object.count(searches[search], true) > 0 &&
								(!(searches[search][dex[mon].types[0]]) && !(searches[search][dex[mon].types[1]])))) delete dex[mon];
						}
					}
					break;

				case 'tier':
					for (var mon in dex) {
						if ('lc' in searches[search]) {
							// some LC legal Pokemon are stored in other tiers (Ferroseed/Murkrow etc)
							// this checks for LC legality using the going criteria, instead of dex[mon].tier
							var isLC = (dex[mon].evos && dex[mon].evos.length > 0) && !dex[mon].prevo && dex[mon].tier !== "LC Uber" && Tools.data.Formats['lc'].banlist.indexOf(dex[mon].species) < 0;
							if ((searches[search]['lc'] && !isLC) || (!searches[search]['lc'] && isLC)) {
								delete dex[mon];
								continue;
							}
						}
						if (searches[search][String(dex[mon][search]).toLowerCase()] === false) {
							delete dex[mon];
						} else if (Object.count(searches[search], true) > 0 && !searches[search][String(dex[mon][search]).toLowerCase()]) delete dex[mon];
					}
					break;

				case 'gen':
				case 'color':
					for (var mon in dex) {
						if (searches[search][String(dex[mon][search]).toLowerCase()] === false) {
							delete dex[mon];
						} else if (Object.count(searches[search], true) > 0 && !searches[search][String(dex[mon][search]).toLowerCase()]) delete dex[mon];
					}
					break;

				case 'ability':
					for (var mon in dex) {
						for (var ability in searches[search]) {
							var needsAbility = searches[search][ability];
							var hasAbility = Object.count(dex[mon].abilities, ability) > 0;
							if (hasAbility !== needsAbility) {
								delete dex[mon];
								break;
							}
						}
					}
					break;

				case 'compileLearnsets':
					for (var mon in dex) {
						var template = dex[mon];
						if (!template.learnset) template = Tools.getTemplate(template.baseSpecies);
						if (!template.learnset) continue;
						var fullLearnset = template.learnset;
						while (template.prevo) {
							template = Tools.getTemplate(template.prevo);
							for (var move in template.learnset) {
								if (!fullLearnset[move]) fullLearnset[move] = template.learnset[move];
							}
						}
						dex[mon].learnset = fullLearnset;
					}
					break;

				case 'moves':
					for (var mon in dex) {
						if (!dex[mon].learnset) continue;
						for (var move in searches[search]) {
							var canLearn = (dex[mon].learnset.sketch && ['chatter', 'struggle', 'magikarpsrevenge'].indexOf(move) < 0) || dex[mon].learnset[move];
							if ((!canLearn && searches[search][move]) || (searches[search][move] === false && canLearn)) {
								delete dex[mon];
								break;
							}
						}
					}
					break;

				case 'recovery':
					for (var mon in dex) {
						if (!dex[mon].learnset) continue;
						var recoveryMoves = ["recover", "roost", "moonlight", "morningsun", "synthesis", "milkdrink", "slackoff", "softboiled", "wish", "healorder"];
						var canLearn = false;
						for (var i = 0; i < recoveryMoves.length; i++) {
							canLearn = (dex[mon].learnset.sketch) || dex[mon].learnset[recoveryMoves[i]];
							if (canLearn) break;
						}
						if ((!canLearn && searches[search]) || (searches[search] === false && canLearn)) delete dex[mon];
					}
					break;

				case 'priority':
					var priorityMoves = [];
					for (var move in Tools.data.Movedex) {
						var moveData = Tools.getMove(move);
						if (moveData.category === "Status") continue;
						if (moveData.priority > 0) priorityMoves.push(move);
					}
					for (var mon in dex) {
						if (!dex[mon].learnset) continue;
						var canLearn = false;
						for (var i = 0; i < priorityMoves.length; i++) {
							canLearn = (dex[mon].learnset.sketch) || dex[mon].learnset[priorityMoves[i]];
							if (canLearn) break;
						}
						if ((!canLearn && searches[search]) || (searches[search] === false && canLearn)) delete dex[mon];
					}
					break;

				case 'stats':
					for (var stat in searches[search]) {
						for (var mon in dex) {
							if (typeof searches[search][stat].less === 'number') {
								if (dex[mon].baseStats[stat] > searches[search][stat].less) {
									delete dex[mon];
									continue;
								}
							}
							if (typeof searches[search][stat].greater === 'number') {
								if (dex[mon].baseStats[stat] < searches[search][stat].greater) {
									delete dex[mon];
									continue;
								}
							}
						}
					}
					break;

				default:
					return this.sendReplyBox("Something broke! PM SolarisFox here or on the Smogon forums with the command you tried.");
			}
		}

		var results = [];
		for (var mon in dex) {
			if (dex[mon].baseSpecies && results.indexOf(dex[mon].baseSpecies) >= 0) continue;
			results.push(dex[mon].species);
		}

		var resultsStr = "";
		if (results.length > 0) {
			if (showAll || results.length <= output + 5) {
				results.sort();
				resultsStr = results.join(", ");
			} else {
				resultsStr = results.slice(0, output).join(", ") + ", and " + string(results.length - output) + " more. <font color=#999999>Redo the search with 'all' as a search parameter to show all results.</font>";
			}
		} else {
			resultsStr = "No Pok&eacute;mon found.";
		}
		return this.sendReplyBox(resultsStr);
	},
	dexsearchhelp: ["/dexsearch [type], [move], [move], ... - Searches for Pokemon that fulfill the selected criteria",
		"Search categories are: type, tier, color, moves, ability, gen, recovery, priority, stat.",
		"Valid colors are: green, red, blue, white, brown, yellow, purple, pink, gray and black.",
		"Valid tiers are: Uber/OU/BL/UU/BL2/RU/BL3/NU/PU/NFE/LC/CAP.",
		"Types must be followed by ' type', e.g., 'dragon type'.",
		"Inequality ranges use the characters '>' and '<' though they behave as '≥' and '≤', e.g., 'speed > 100' searches for all Pokemon equal to and greater than 100 speed.",
		"Parameters can be excluded through the use of '!', e.g., '!water type' excludes all water types.",
		"The parameter 'mega' can be added to search for Mega Evolutions only, and the parameters 'FE' or 'NFE' can be added to search fully or not-fully evolved Pokemon only.",
		"The order of the parameters does not matter."],

	ms: 'movesearch',
	msearch: 'movesearch',
	movesearch: function (target, room, user) {
		if (!this.canBroadcast()) return;

		if (!target) return this.parse('/help movesearch');
		var targets = target.split(',');
		var searches = {};
		var allCategories = {'physical':1, 'special':1, 'status':1};
		var allProperties = {'basePower':1, 'accuracy':1, 'priority':1, 'pp':1};
		var allFlags = {'bite':1, 'bullet':1, 'contact':1, 'defrost':1, 'powder':1, 'pulse':1, 'punch':1, 'secondary':1, 'snatch':1, 'sound':1};
		var allStatus = {'psn':1, 'tox':1, 'brn':1, 'par':1, 'frz':1, 'slp':1};
		var allVolatileStatus = {'flinch':1, 'confusion':1, 'partiallytrapped':1};
		var allBoosts = {'hp':1, 'atk':1, 'def':1, 'spa':1, 'spd':1, 'spe':1, 'accuracy':1, 'evasion':1};
		var showAll = false;
		var output = 10;
		var lsetData = {};
		var targetMon = '';

		for (var i = 0; i < targets.length; i++) {
			var isNotSearch = false;
			target = targets[i].toLowerCase().trim();
			if (target.charAt(0) === '!') {
				isNotSearch = true;
				target = target.substr(1);
			}

			var typeIndex = target.indexOf(' type');
			if (typeIndex >= 0) {
				target = target.charAt(0).toUpperCase() + target.substring(1, typeIndex);
				if (!(target in Tools.data.TypeChart)) return this.sendReplyBox("Type '" + Tools.escapeHTML(target) + "' not found.");
				if (!searches['type']) searches['type'] = {};
				if ((searches['type'][target] && isNotSearch) || (searches['type'][target] === false && !isNotSearch)) return this.sendReplyBox('A search cannot both exclude and include a type.');
				searches['type'][target] = !isNotSearch;
				continue;
			}

			if (target in allCategories) {
				target = target.charAt(0).toUpperCase() + target.substr(1);
				if (!searches['category']) searches['category'] = {};
				if ((searches['category'][target] && isNotSearch) || (searches['category'][target] === false && !isNotSearch)) return this.sendReplyBox('A search cannot both exclude and include a category.');
				searches['category'][target] = !isNotSearch;
				continue;
			}

			if (target in allFlags) {
				if (!searches['flags']) searches['flags'] = {};
				if ((searches['flags'][target] && isNotSearch) || (searches['flags'][target] === false && !isNotSearch)) return this.sendReplyBox('A search cannot both exclude and include \'' + target + '\'.');
				searches['flags'][target] = !isNotSearch;
				continue;
			}

			if (target === 'all') {
				if (this.broadcasting) return this.sendReplyBox("A search with the parameter 'all' cannot be broadcast.");
				showAll = true;
				continue;
			}

			if (target === 'recovery') {
				if (!searches['recovery']) {
					searches['recovery'] = !isNotSearch;
				} else if ((searches['recovery'] && isNotSearch) || (searches['recovery'] === false && !isNotSearch)) {
					return this.sendReplyBox('A search cannot both exclude and include recovery moves.');
				}
				continue;
			}

			var template = Tools.getTemplate(target);
			if (template.exists) {
				if (Object.size(lsetData) !== 0) return this.sendReplyBox("A search can only include one Pokemon learnset.");
				if (!template.learnset) template = Tools.getTemplate(template.baseSpecies);
				lsetData = template.learnset;
				targetMon = template.name;
				while (template.prevo) {
					template = Tools.getTemplate(template.prevo);
					for (var move in template.learnset) {
						if (!lsetData[move]) lsetData[move] = template.learnset[move];
					}
				}
				continue;
			}

			var inequality = target.search(/>|<|=/);
			if (inequality >= 0) {
				if (isNotSearch) return this.sendReplyBox("You cannot use the negation symbol '!' in quality ranges.");
				inequality = target.charAt(inequality);
				var targetParts = target.replace(/\s/g, '').split(inequality);
				var numSide, propSide, direction;
				if (!isNaN(targetParts[0])) {
					numSide = 0;
					propSide = 1;
					switch (inequality) {
						case '>': direction = 'less'; break;
						case '<': direction = 'greater'; break;
						case '=': direction = 'equal'; break;
					}
				} else if (!isNaN(targetParts[1])) {
					numSide = 1;
					propSide = 0;
					switch (inequality) {
						case '<': direction = 'less'; break;
						case '>': direction = 'greater'; break;
						case '=': direction = 'equal'; break;
					}
				} else {
					return this.sendReplyBox("No value given to compare with '" + Tools.escapeHTML(target) + "'.");
				}
				var prop = targetParts[propSide];
				switch (toId(targetParts[propSide])) {
					case 'basepower': prop = 'basePower'; break;
					case 'bp': prop = 'basePower'; break;
					case 'acc': prop = 'accuracy'; break;
				}
				if (!(prop in allProperties)) return this.sendReplyBox("'" + Tools.escapeHTML(target) + "' did not contain a valid property.");
				if (!searches['property']) searches['property'] = {};
				if (direction === 'equal') {
					if (searches['property'][prop]) return this.sendReplyBox("Invalid property range for " + prop + ".");
					searches['property'][prop] = {};
					searches['property'][prop]['less'] = parseFloat(targetParts[numSide]);
					searches['property'][prop]['greater'] = parseFloat(targetParts[numSide]);
				} else {
					if (!searches['property'][prop]) searches['property'][prop] = {};
					if (searches['property'][prop][direction]) {
						return this.sendReplyBox("Invalid property range for " + prop + ".");
					} else {
						searches['property'][prop][direction] = parseFloat(targetParts[numSide]);
					}
				}
				continue;
			}

			if (target.substr(0, 8) === 'priority') {
				var sign = '';
				target = target.substr(8).trim();
				if (target === "+") {
					sign = 'greater';
				} else if (target === "-") {
					sign = 'less';
				} else {
					return this.sendReplyBox("Priority type '" + target + "' not recognized.");
				}
				if (!searches['property']) searches['property'] = {};
				if (searches['property']['priority']) {
					return this.sendReplyBox("Priority cannot be set with both shorthand and inequality range.");
				} else {
					searches['property']['priority'] = {};
					searches['property']['priority'][sign] = (sign === 'less' ? -1 : 1);
				}
				continue;
			}

			if (target.substr(0, 7) === 'boosts ') {
				switch (target.substr(7)) {
					case 'attack': target = 'atk'; break;
					case 'defense': target = 'def'; break;
					case 'specialattack': target = 'spa'; break;
					case 'spatk': target = 'spa'; break;
					case 'specialdefense': target = 'spd'; break;
					case 'spdef': target = 'spd'; break;
					case 'speed': target = 'spe'; break;
					case 'acc': target = 'accuracy'; break;
					case 'evasiveness': target = 'evasion'; break;
					default: target = target.substr(7);
				}
				if (!(target in allBoosts)) return this.sendReplyBox("'" + Tools.escapeHTML(target.substr(7)) + "' is not a recognized stat.");
				if (!searches['boost']) searches['boost'] = {};
				if ((searches['boost'][target] && isNotSearch) || (searches['boost'][target] === false && !isNotSearch)) return this.sendReplyBox('A search cannot both exclude and include a stat boost.');
				searches['boost'][target] = !isNotSearch;
				continue;
			}

			var oldTarget = target;
			if (target.charAt(target.length - 1) === 's') target = target.substr(0, target.length - 1);
			switch (target) {
				case 'toxic': target = 'tox'; break;
				case 'poison': target = 'psn'; break;
				case 'burn': target = 'brn'; break;
				case 'paralyze': target = 'par'; break;
				case 'freeze': target = 'frz'; break;
				case 'sleep': target = 'slp'; break;
				case 'confuse': target = 'confusion'; break;
				case 'trap': target = 'partiallytrapped'; break;
				case 'flinche': target = 'flinch'; break;
			}

			if (target in allStatus) {
				if (!searches['status']) searches['status'] = {};
				if ((searches['status'][target] && isNotSearch) || (searches['status'][target] === false && !isNotSearch)) return this.sendReplyBox('A search cannot both exclude and include a status.');
				searches['status'][target] = !isNotSearch;
				continue;
			}

			if (target in allVolatileStatus) {
				if (!searches['volatileStatus']) searches['volatileStatus'] = {};
				if ((searches['volatileStatus'][target] && isNotSearch) || (searches['volatileStatus'][target] === false && !isNotSearch)) return this.sendReplyBox('A search cannot both exclude and include a volitile status.');
				searches['volatileStatus'][target] = !isNotSearch;
				continue;
			}

			return this.sendReplyBox("'" + Tools.escapeHTML(oldTarget) + "' could not be found in any of the search categories.");
		}

		if (showAll && Object.size(searches) === 0 && !targetMon) return this.sendReplyBox("No search parameters other than 'all' were found. Try '/help movesearch' for more information on this command.");

		var dex = {};
		if (targetMon) {
			for (var move in lsetData) {
				dex[move] = Tools.getMove(move);
			}
		} else {
			for (var move in Tools.data.Movedex) {
				dex[move] = Tools.getMove(move);
			}
			delete dex.magikarpsrevenge;
		}

		for (var search in searches) {
			switch (search) {
				case 'type':
				case 'category':
					for (var move in dex) {
						if (searches[search][String(dex[move][search])] === false) {
							delete dex[move];
						} else if (Object.count(searches[search], true) > 0 && !searches[search][String(dex[move][search])]) delete dex[move];
					}
					break;

				case 'flags':
					for (var flag in searches[search]) {
						for (var move in dex) {
							if (flag !== 'secondary') {
								if ((!dex[move].flags[flag] && searches[search][flag]) || (dex[move].flags[flag] && !searches[search][flag])) delete dex[move];
							} else {
								if (searches[search][flag]) {
									if (!dex[move].secondary && !dex[move].secondaries) delete dex[move];
								} else {
									if (dex[move].secondary && dex[move].secondaries) delete dex[move];
								}
							}
						}
					}
					break;

				case 'recovery':
					for (var move in dex) {
						var hasRecovery = (dex[move].drain || dex[move].flags.heal);
						if ((!hasRecovery && searches[search]) || (hasRecovery && !searches[search])) delete dex[move];
					}
					break;

				case 'property':
					for (var prop in searches[search]) {
						for (var move in dex) {
							if (typeof searches[search][prop].less === "number") {
								if (dex[move][prop] === true) {
									delete dex[move];
									continue;
								}
								if (dex[move][prop] > searches[search][prop].less) {
									delete dex[move];
									continue;
								}
							}
							if (typeof searches[search][prop].greater === "number") {
								if (dex[move][prop] === true) {
									if (dex[move].category === "Status") delete dex[move];
									continue;
								}
								if (dex[move][prop] < searches[search][prop].greater) {
									delete dex[move];
									continue;
								}
							}
						}
					}
					break;

				case 'boost':
					for (var boost in searches[search]) {
						for (var move in dex) {
							if (dex[move].boosts) {
								if ((dex[move].boosts[boost] > 0 && searches[search][boost]) ||
									(dex[move].boosts[boost] < 1 && !searches[search][boost])) continue;
							} else if (dex[move].secondary && dex[move].secondary.self && dex[move].secondary.self.boosts) {
								if ((dex[move].secondary.self.boosts[boost] > 0 && searches[search][boost]) ||
									(dex[move].secondary.self.boosts[boost] < 1 && !searches[search][boost])) continue;
							}
							delete dex[move];
						}
					}
					break;

				case 'status':
				case 'volatileStatus':
					for (var searchStatus in searches[search]) {
						for (var move in dex) {
							if (dex[move][search] !== searchStatus) {
								if (!dex[move].secondaries) {
									if (!dex[move].secondary) {
										if (searches[search][searchStatus]) delete dex[move];
									} else {
										if ((dex[move].secondary[search] !== searchStatus && searches[search][searchStatus]) ||
											(dex[move].secondary[search] === searchStatus && !searches[search][searchStatus])) delete dex[move];
									}
								} else {
									var hasSecondary = false;
									for (var i = 0; i < dex[move].secondaries.length; i++) {
										if (dex[move].secondaries[i][search] === searchStatus) hasSecondary = true;
									}
									if ((!hasSecondary && searches[search][searchStatus]) || (hasSecondary && !searches[search][searchStatus])) delete dex[move];
								}
							} else {
								if (!searches[search][searchStatus]) delete dex[move];
							}
						}
					}
					break;

				default:
					return this.sendReplyBox("Something broke! PM SolarisFox here or on the Smogon forums with the command you tried.");
			}
		}

		var results = [];
		for (var move in dex) {
			results.push(dex[move].name);
		}

		var resultsStr = targetMon ? ("<font color=#999999>Matching moves found in learnset for</font> " + targetMon + ":<br>") : "";
		if (results.length > 0) {
			if (showAll || results.length <= output + 5) {
				results.sort();
				resultsStr += results.join(", ");
			} else {
				resultsStr += results.slice(0, output).join(", ") + ", and " + string(results.length - output) + " more. <font color=#999999>Redo the search with 'all' as a search parameter to show all results.</font>";
			}
		} else {
			resultsStr = "No moves found.";
		}
		return this.sendReplyBox(resultsStr);
	},
	movesearchhelp: ["/movesearch [parameter], [parameter], [parameter], ... - Searches for moves that fulfill the selected criteria.",
		"Search categories are: type, category, flag, status inflicted, type boosted, and numeric range for base power, pp, and accuracy.",
		"Types must be followed by ' type', e.g., 'dragon type'.",
		"Stat boosts must be preceded with 'boosts ', e.g., 'boosts attack' searches for moves that boost the attack stat.",
		"Inequality ranges use the characters '>' and '<' though they behave as '≥' and '≤', e.g., 'bp > 100' searches for all moves equal to and greater than 100 base power.",
		"Parameters can be excluded through the use of '!', e.g., !water type' excludes all water type moves.",
		"If a Pokemon is included as a parameter, moves will be searched from it's movepool.",
		"The order of the parameters does not matter."],

	learnset: 'learn',
	learnall: 'learn',
	learn5: 'learn',
	g6learn: 'learn',
	rbylearn: 'learn',
	gsclearn: 'learn',
	advlearn: 'learn',
	dpplearn: 'learn',
	bw2learn: 'learn',
	learn: function (target, room, user, connection, cmd) {
		if (!target) return this.parse('/help learn');

		if (!this.canBroadcast()) return;

		var lsetData = {set:{}};
		var targets = target.split(',');
		var template = Tools.getTemplate(targets[0]);
		var move = {};
		var problem;
		var format = {rby:'gen1ou', gsc:'gen2ou', adv:'gen3ou', dpp:'gen4ou', bw2:'gen5ou'}[cmd.substring(0, 3)];
		var all = (cmd === 'learnall');
		if (cmd === 'learn5') lsetData.set.level = 5;
		if (cmd === 'g6learn') lsetData.format = {noPokebank: true};

		if (!template.exists) {
			return this.sendReply("Pokemon '" + template.id + "' not found.");
		}

		if (targets.length < 2) {
			return this.sendReply("You must specify at least one move.");
		}

		for (var i = 1, len = targets.length; i < len; ++i) {
			move = Tools.getMove(targets[i]);
			if (!move.exists) {
				return this.sendReply("Move '" + move.id + "' not found.");
			}
			problem = TeamValidator.checkLearnsetSync(format, move, template.species, lsetData);
			if (problem) break;
		}
		var buffer = template.name + (problem ? " <span class=\"message-learn-cannotlearn\">can't</span> learn " : " <span class=\"message-learn-canlearn\">can</span> learn ") + (targets.length > 2 ? "these moves" : move.name);
		if (format) buffer += ' on ' + cmd.substring(0, 3).toUpperCase();
		if (!problem) {
			var sourceNames = {E:"egg", S:"event", D:"dream world"};
			if (lsetData.sources || lsetData.sourcesBefore) buffer += " only when obtained from:<ul class=\"message-learn-list\">";
			if (lsetData.sources) {
				var sources = lsetData.sources.sort();
				var prevSource;
				var prevSourceType;
				var prevSourceCount = 0;
				for (var i = 0, len = sources.length; i < len; ++i) {
					var source = sources[i];
					if (source.substr(0, 2) === prevSourceType) {
						if (prevSourceCount < 0) {
							buffer += ": " + source.substr(2);
						} else if (all || prevSourceCount < 3) {
							buffer += ", " + source.substr(2);
						} else if (prevSourceCount === 3) {
							buffer += ", ...";
						}
						++prevSourceCount;
						continue;
					}
					prevSourceType = source.substr(0, 2);
					prevSourceCount = source.substr(2) ? 0 : -1;
					buffer += "<li>gen " + source.charAt(0) + " " + sourceNames[source.charAt(1)];
					if (prevSourceType === '5E' && template.maleOnlyHidden) buffer += " (cannot have hidden ability)";
					if (source.substr(2)) buffer += ": " + source.substr(2);
				}
			}
			if (lsetData.sourcesBefore) {
				if (!(cmd.substring(0, 3) in {'rby':1, 'gsc':1})) {
					buffer += "<li>any generation before " + (lsetData.sourcesBefore + 1);
				} else if (!lsetData.sources) {
					buffer += "<li>gen " + lsetData.sourcesBefore;
				}
			}
			buffer += "</ul>";
		}
		this.sendReplyBox(buffer);
	},
	learnhelp: ["/learn [pokemon], [move, move, ...] - Displays how a Pokemon can learn the given moves, if it can at all.",
		"!learn [pokemon], [move, move, ...] - Show everyone that information. Requires: + % @ & ~"],

	weaknesses: 'weakness',
	weak: 'weakness',
	resist: 'weakness',
	weakness: function (target, room, user) {
		if (!target) return this.parse('/help weakness');
		if (!this.canBroadcast()) return;
		target = target.trim();
		var targets = target.split(/ ?[,\/ ] ?/);

		var pokemon = Tools.getTemplate(target);
		var type1 = Tools.getType(targets[0]);
		var type2 = Tools.getType(targets[1]);

		if (pokemon.exists) {
			target = pokemon.species;
		} else if (type1.exists && type2.exists && type1 !== type2) {
			pokemon = {types: [type1.id, type2.id]};
			target = type1.id + "/" + type2.id;
		} else if (type1.exists) {
			pokemon = {types: [type1.id]};
			target = type1.id;
		} else {
			return this.sendReplyBox("" + Tools.escapeHTML(target) + " isn't a recognized type or pokemon.");
		}

		var weaknesses = [];
		var resistances = [];
		var immunities = [];
		Object.keys(Tools.data.TypeChart).forEach(function (type) {
			var notImmune = Tools.getImmunity(type, pokemon);
			if (notImmune) {
				var typeMod = Tools.getEffectiveness(type, pokemon);
				switch (typeMod) {
				case 1:
					weaknesses.push(type);
					break;
				case 2:
					weaknesses.push("<b>" + type + "</b>");
					break;
				case -1:
					resistances.push(type);
					break;
				case -2:
					resistances.push("<b>" + type + "</b>");
					break;
				}
			} else {
				immunities.push(type);
			}
		});

		var buffer = [];
		buffer.push(pokemon.exists ? "" + target + ' (ignoring abilities):' : '' + target + ':');
		buffer.push('<span class="message-effect-weak">Weaknesses</span>: ' + (weaknesses.join(', ') || '<font color=#999999>None</font>'));
		buffer.push('<span class="message-effect-resist">Resistances</span>: ' + (resistances.join(', ') || '<font color=#999999>None</font>'));
		buffer.push('<span class="message-effect-immune">Immunities</span>: ' + (immunities.join(', ') || '<font color=#999999>None</font>'));
		this.sendReplyBox(buffer.join('<br>'));
	},
	weaknesshelp: ["/weakness [pokemon] - Provides a Pokemon's resistances, weaknesses, and immunities, ignoring abilities.",
		"/weakness [type 1]/[type 2] - Provides a type or type combination's resistances, weaknesses, and immunities, ignoring abilities.",
		"!weakness [pokemon] - Shows everyone a Pokemon's resistances, weaknesses, and immunities, ignoring abilities. Requires: + % @ & ~",
		"!weakness [type 1]/[type 2] - Shows everyone a type or type combination's resistances, weaknesses, and immunities, ignoring abilities. Requires: + % @ & ~"],

	eff: 'effectiveness',
	type: 'effectiveness',
	matchup: 'effectiveness',
	effectiveness: function (target, room, user) {
		var targets = target.split(/[,/]/).slice(0, 2);
		if (targets.length !== 2) return this.sendReply("Attacker and defender must be separated with a comma.");

		var searchMethods = {'getType':1, 'getMove':1, 'getTemplate':1};
		var sourceMethods = {'getType':1, 'getMove':1};
		var targetMethods = {'getType':1, 'getTemplate':1};
		var source, defender, foundData, atkName, defName;

		for (var i = 0; i < 2; ++i) {
			var method;
			for (method in searchMethods) {
				foundData = Tools[method](targets[i]);
				if (foundData.exists) break;
			}
			if (!foundData.exists) return this.parse('/help effectiveness');
			if (!source && method in sourceMethods) {
				if (foundData.type) {
					source = foundData;
					atkName = foundData.name;
				} else {
					source = foundData.id;
					atkName = foundData.id;
				}
				searchMethods = targetMethods;
			} else if (!defender && method in targetMethods) {
				if (foundData.types) {
					defender = foundData;
					defName = foundData.species + " (not counting abilities)";
				} else {
					defender = {types: [foundData.id]};
					defName = foundData.id;
				}
				searchMethods = sourceMethods;
			}
		}

		if (!this.canBroadcast()) return;

		var factor = 0;
		if (Tools.getImmunity(source, defender) || source.ignoreImmunity && (source.ignoreImmunity === true || source.ignoreImmunity[source.type])) {
			var totalTypeMod = 0;
			if (source.effectType !== 'Move' || source.category === 'Status' || source.basePower || source.basePowerCallback) {
				for (var i = 0; i < defender.types.length; i++) {
					var baseMod = Tools.getEffectiveness(source, defender.types[i]);
					var moveMod = source.onEffectiveness && source.onEffectiveness.call(Tools, baseMod, defender.types[i], source);
					totalTypeMod += typeof moveMod === 'number' ? moveMod : baseMod;
				}
			}
			factor = Math.pow(2, totalTypeMod);
		}

		this.sendReplyBox("" + atkName + " is " + factor + "x effective against " + defName + ".");
	},
	effectivenesshelp: ["/effectiveness [attack], [defender] - Provides the effectiveness of a move or type on another type or a Pokémon.",
		"!effectiveness [attack], [defender] - Shows everyone the effectiveness of a move or type on another type or a Pokémon."],

	cover: 'coverage',
	coverage: function (target, room, user) {
		if (!this.canBroadcast()) return;
		if (!target) return this.parse("/help coverage");

		var targets = target.split(/[,+]/);
		var sources = [];

		var dispTable = false;
		var bestCoverage = {};
		for (var type in Tools.data.TypeChart) {
			// This command uses -5 to designate immunity
			bestCoverage[type] = -5;
		}

		for (var i = 0; i < targets.length; i++) {
			var move = targets[i].trim().capitalize();
			if (move === 'Table' || move === 'All') {
				if (this.broadcasting) return this.sendReplyBox("The full table cannot be broadcast.");
				dispTable = true;
				continue;
			}

			var eff;
			if (move in Tools.data.TypeChart) {
				sources.push(move);
				for (var type in bestCoverage) {
					if (!Tools.getImmunity(move, type) && !move.ignoreImmunity) continue;
					eff = Tools.getEffectiveness(move, type);
					if (eff > bestCoverage[type]) bestCoverage[type] = eff;
				}
				continue;
			}
			move = Tools.getMove(move);
			if (move.exists) {
				if (!move.basePower && !move.basePowerCallback) continue;
				sources.push(move);
				for (var type in bestCoverage) {
					if (!Tools.getImmunity(move.type, type) && !move.ignoreImmunity) continue;
					var baseMod = Tools.getEffectiveness(move, type);
					var moveMod = move.onEffectiveness && move.onEffectiveness.call(Tools, baseMod, type, move);
					eff = typeof moveMod === 'number' ? moveMod : baseMod;
					if (eff > bestCoverage[type]) bestCoverage[type] = eff;
				}
				continue;
			}

			return this.sendReply("No type or move '" + targets[i] + "' found.");
		}
		if (sources.length === 0) return this.sendReply("No moves using a type table for determining damage were specified.");
		if (sources.length > 4) return this.sendReply("Specify a maximum of 4 moves or types.");

		// converts to fractional effectiveness, 0 for immune
		for (var type in bestCoverage) {
			if (bestCoverage[type] === -5) {
				bestCoverage[type] = 0;
				continue;
			}
			bestCoverage[type] = Math.pow(2, bestCoverage[type]);
		}

		if (!dispTable) {
			var buffer = [];
			var superEff = [];
			var neutral = [];
			var resists = [];
			var immune = [];

			for (var type in bestCoverage) {
				switch (bestCoverage[type]) {
					case 0:
						immune.push(type);
						break;
					case 0.25:
					case 0.5:
						resists.push(type);
						break;
					case 1:
						neutral.push(type);
						break;
					case 2:
					case 4:
						superEff.push(type);
						break;
					default:
						throw new Error("/coverage effectiveness of " + bestCoverage[type] + " from parameters: " + target);
				}
			}
			buffer.push('Coverage for ' + sources.join(' + ') + ':');
			buffer.push('<b><font color=#559955>Super Effective</font></b>: ' + (superEff.join(', ') || '<font color=#999999>None</font>'));
			buffer.push('<span class="message-effect-resist">Neutral</span>: ' + (neutral.join(', ') || '<font color=#999999>None</font>'));
			buffer.push('<span class="message-effect-weak">Resists</span>: ' + (resists.join(', ') || '<font color=#999999>None</font>'));
			buffer.push('<span class="message-effect-immune">Immunities</span>: ' + (immune.join(', ') || '<font color=#999999>None</font>'));
			return this.sendReplyBox(buffer.join('<br>'));
		} else {
			var buffer = '<div class="scrollable"><table cellpadding="1" width="100%"><tr><th></th>';
			var icon = {};
			for (var type in Tools.data.TypeChart) {
				icon[type] = '<img src="http://play.pokemonshowdown.com/sprites/types/' + type + '.png" width="32" height="14">';
				// row of icons at top
				buffer += '<th>' + icon[type] + '</th>';
			}
			buffer += '</tr>';
			for (var type1 in Tools.data.TypeChart) {
				// assembles the rest of the rows
				buffer += '<tr><th>' + icon[type1] + '</th>';
				for (var type2 in Tools.data.TypeChart) {
					var typing;
					var cell = '<th ';
					var bestEff = -5;
					if (type1 === type2) {
						// when types are the same it's considered pure type
						typing = type1;
						bestEff = bestCoverage[type1];
					} else {
						typing = type1 + "/" + type2;
						for (var i = 0; i < sources.length; i++) {
							var move = sources[i];

							var curEff = 0;
							if ((!Tools.getImmunity((move.type || move), type1) || !Tools.getImmunity((move.type || move), type2)) && !move.ignoreImmunity) continue;
							var baseMod = Tools.getEffectiveness(move, type1);
							var moveMod = move.onEffectiveness && move.onEffectiveness.call(Tools, baseMod, type1, move);
							curEff += typeof moveMod === 'number' ? moveMod : baseMod;
							baseMod = Tools.getEffectiveness(move, type2);
							moveMod = move.onEffectiveness && move.onEffectiveness.call(Tools, baseMod, type2, move);
							curEff += typeof moveMod === 'number' ? moveMod : baseMod;

							if (curEff > bestEff) bestEff = curEff;
						}
						if (bestEff === -5) {
							bestEff = 0;
						} else {
							bestEff = Math.pow(2, bestEff);
						}
					}
					switch (bestEff) {
						case 0:
							cell += 'bgcolor=#666666 title="' + typing + '"><font color=#000000>' + bestEff + '</font>';
							break;
						case 0.25:
						case 0.5:
							cell += 'bgcolor=#AA5544 title="' + typing + '"><font color=#660000>' + bestEff + '</font>';
							break;
						case 1:
							cell += 'bgcolor=#6688AA title="' + typing + '"><font color=#000066>' + bestEff + '</font>';
							break;
						case 2:
						case 4:
							cell += 'bgcolor=#559955 title="' + typing + '"><font color=#003300>' + bestEff + '</font>';
							break;
						default:
							throw new Error("/coverage effectiveness of " + bestEff + " from parameters: " + target);
					}
					cell += '</th>';
					buffer += cell;
				}
			}
			buffer += '</table></div>';

			this.sendReplyBox('Coverage for ' + sources.join(' + ') + ':<br>' + buffer);
		}
	},
	coveragehelp: ["/coverage [move 1], [move 2] ... - Provides the best effectiveness match-up against all defending types for given moves or attacking types",
		"!coverage [move 1], [move 2] ... - Shows this information to everyone.",
		"Adding the parameter 'all' or 'table' will display the information with a table of all type combinations."],

	/*********************************************************
	 * Informational commands
	 *********************************************************/

	uptime: function (target, room, user) {
		if (!this.canBroadcast()) return;
		var uptime = process.uptime();
		var uptimeText;
		if (uptime > 24 * 60 * 60) {
			var uptimeDays = Math.floor(uptime / (24 * 60 * 60));
			uptimeText = uptimeDays + " " + (uptimeDays === 1 ? "day" : "days");
			var uptimeHours = Math.floor(uptime / (60 * 60)) - uptimeDays * 24;
			if (uptimeHours) uptimeText += ", " + uptimeHours + " " + (uptimeHours === 1 ? "hour" : "hours");
		} else {
			uptimeText = uptime.seconds().duration();
		}
		this.sendReplyBox("Uptime: <b>" + uptimeText + "</b>");
	},

	groups: function (target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox(
			"+ <b>Voice</b> - They can use ! commands like !groups, and talk during moderated chat<br />" +
			"% <b>Driver</b> - The above, and they can mute. Global % can also lock users and check for alts<br />" +
			"@ <b>Moderator</b> - The above, and they can ban users<br />" +
			"&amp; <b>Leader</b> - The above, and they can promote to moderator and force ties<br />" +
			"# <b>Room Owner</b> - They are leaders of the room and can almost totally control it<br />" +
			"~ <b>Administrator</b> - They can do anything, like change what this message says"
		);
	},
	groupshelp: ["/groups - Explains what the + % @ & next to people's names mean.",
		"!groups - Show everyone that information. Requires: + % @ & ~"],

	repo: 'opensource',
	repository: 'opensource',
	git: 'opensource',
	opensource: function (target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox(
			"Pokemon Showdown is open source:<br />" +
			"- Language: JavaScript (Node.js)<br />" +
			"- <a href=\"https://github.com/Zarel/Pokemon-Showdown/commits/master\">What's new?</a><br />" +
			"- <a href=\"https://github.com/Zarel/Pokemon-Showdown\">Server source code</a><br />" +
			"- <a href=\"https://github.com/Zarel/Pokemon-Showdown-Client\">Client source code</a>"
		);
	},
	opensourcehelp: ["/opensource - Links to PS's source code repository.",
		"!opensource - Show everyone that information. Requires: + % @ & ~"],

	staff: function (target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox("<a href=\"https://www.smogon.com/sim/staff_list\">Pokemon Showdown Staff List</a>");
	},

	avatars: function (target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('You can <button name="avatars">change your avatar</button> by clicking on it in the <button name="openOptions"><i class="icon-cog"></i> Options</button> menu in the upper right. Custom avatars are only obtainable by staff.');
	},
	avatarshelp: ["/avatars - Explains how to change avatars.",
		"!avatars - Show everyone that information. Requires: + % @ & ~"],

	introduction: 'intro',
	intro: function (target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox(
			"New to competitive pokemon?<br />" +
			"- <a href=\"https://www.smogon.com/sim/ps_guide\">Beginner's Guide to Pokémon Showdown</a><br />" +
			"- <a href=\"https://www.smogon.com/dp/articles/intro_comp_pokemon\">An introduction to competitive Pokémon</a><br />" +
			"- <a href=\"https://www.smogon.com/bw/articles/bw_tiers\">What do 'OU', 'UU', etc mean?</a><br />" +
			"- <a href=\"https://www.smogon.com/xyhub/tiers\">What are the rules for each format? What is 'Sleep Clause'?</a>"
		);
	},
	introhelp: ["/intro - Provides an introduction to competitive pokemon.",
		"!intro - Show everyone that information. Requires: + % @ & ~"],

	mentoring: 'smogintro',
	smogonintro: 'smogintro',
	smogintro: function (target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox(
			"Welcome to Smogon's official simulator! Here are some useful links to <a href=\"https://www.smogon.com/mentorship/\">Smogon\'s Mentorship Program</a> to help you get integrated into the community:<br />" +
			"- <a href=\"https://www.smogon.com/mentorship/primer\">Smogon Primer: A brief introduction to Smogon's subcommunities</a><br />" +
			"- <a href=\"https://www.smogon.com/mentorship/introductions\">Introduce yourself to Smogon!</a><br />" +
			"- <a href=\"https://www.smogon.com/mentorship/profiles\">Profiles of current Smogon Mentors</a><br />" +
			"- <a href=\"http://mibbit.com/#mentor@irc.synirc.net\">#mentor: the Smogon Mentorship IRC channel</a>"
		);
	},

	calculator: 'calc',
	calc: function (target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox(
			"Pokemon Showdown! damage calculator. (Courtesy of Honko)<br />" +
			"- <a href=\"https://pokemonshowdown.com/damagecalc/\">Damage Calculator</a>"
		);
	},
	calchelp: ["/calc - Provides a link to a damage calculator",
		"!calc - Shows everyone a link to a damage calculator. Requires: + % @ & ~"],

	capintro: 'cap',
	cap: function (target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox(
			"An introduction to the Create-A-Pokemon project:<br />" +
			"- <a href=\"https://www.smogon.com/cap/\">CAP project website and description</a><br />" +
			"- <a href=\"https://www.smogon.com/forums/showthread.php?t=48782\">What Pokemon have been made?</a><br />" +
			"- <a href=\"https://www.smogon.com/forums/forums/311\">Talk about the metagame here</a><br />" +
			"- <a href=\"https://www.smogon.com/forums/threads/3512318/#post-5594694\">Sample XY CAP teams</a>"
		);
	},
	caphelp: ["/cap - Provides an introduction to the Create-A-Pokemon project.",
		"!cap - Show everyone that information. Requires: + % @ & ~"],

	gennext: function (target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox(
			"NEXT (also called Gen-NEXT) is a mod that makes changes to the game:<br />" +
			"- <a href=\"https://github.com/Zarel/Pokemon-Showdown/blob/master/mods/gennext/README.md\">README: overview of NEXT</a><br />" +
			"Example replays:<br />" +
			"- <a href=\"https://replay.pokemonshowdown.com/gennextou-120689854\">Zergo vs Mr Weegle Snarf</a><br />" +
			"- <a href=\"https://replay.pokemonshowdown.com/gennextou-130756055\">NickMP vs Khalogie</a>"
		);
	},

	om: 'othermetas',
	othermetas: function (target, room, user) {
		if (!this.canBroadcast()) return;
		target = toId(target);
		var buffer = "";
		var matched = false;

		if (target === 'all' && this.broadcasting) {
			return this.sendReplyBox("You cannot broadcast informatiom about all Other Metagames at once.");
		}

		if (!target || target === 'all') {
			matched = true;
			buffer += "- <a href=\"https://www.smogon.com/tiers/om/\">Other Metagames Hub</a><br />";
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3505031/\">Other Metagames Index</a><br />";
		}
		if (target === 'all' || target === 'anythinggoes' || target === 'ag') {
			matched = true;
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3523229/\">Anything Goes</a><br />";
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3535064/\">Anything Goes Viability Ranking</a><br />";
		}
		if (target === 'all' || target === 'smogondoublesuu' || target === 'doublesuu') {
			matched = true;
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3516968/\">Doubles UU</a><br />";
		}
		if (target === 'all' || target === 'smogontriples' || target === 'triples') {
			matched = true;
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3511522/\">Smogon Triples</a><br />";
		}
		if (target === 'all' || target === 'omofthemonth' || target === 'omotm' || target === 'month') {
			matched = true;
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3481155/\">Other Metagame of the Month</a><br />";
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3505227/\">Current OMotM: 2v2 Doubles</a><br />";
		}
		if (target === 'all' || target === 'seasonal') {
			matched = true;
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3491902/\">Seasonal Ladder</a><br />";
		}
		if (target === 'all' || target === 'balancedhackmons' || target === 'bh') {
			matched = true;
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3489849/\">Balanced Hackmons</a><br />";
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3515725/\">Balanced Hackmons Suspect Discussion</a><br />";
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3525676/\">Balanced Hackmons Viability Ranking</a><br />";
		}
		if (target === 'all' || target === '1v1') {
			matched = true;
			if (target !== 'all') buffer += "Bring three Pokémon to Team Preview and choose one to battle.<br />";
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3496773/\">1v1</a><br />";
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3536109/\">1v1 Viability Ranking</a><br />";
		}
		if (target === 'all' || target === 'monotype') {
			matched = true;
			if (target !== 'all') buffer += "All Pokémon on a team must share a type.<br />";
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3493087/\">Monotype</a><br />";
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3517737/\">Monotype Viability Ranking</a><br />";
		}
		if (target === 'all' || target === 'tiershift' || target === 'ts') {
			matched = true;
			if (target !== 'all') buffer += "Pokémon below OU/BL get all their stats boosted. UU/BL2 get +5, RU/BL3 get +10, and NU or lower get +15.<br />";
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3532973/\">Tier Shift</a><br />";
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3536719/\">Tier Shift Viability Ranking</a><br />";
		}
		if (target === 'all' || target === 'pu') {
			matched = true;
			if (target !== 'all') buffer += "The unofficial tier below NU.<br />";
			buffer += "- <a href=\"http://www.smogon.com/forums/forums/pu.327/\">PU</a><br />";
		}
		if (target === 'all' || target === 'inversebattle' || target === 'inverse') {
			matched = true;
			if (target !== 'all') buffer += "Battle with an inverted type chart.<br />";
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3518146/\">Inverse Battle</a><br />";
		}
		if (target === 'all' || target === 'almostanyability' || target === 'aaa') {
			matched = true;
			if (target !== 'all') buffer += "Pokémon can use any ability, barring the few that are banned.<br />";
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3528058/\">Almost Any Ability</a><br />";
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3517258/\">Almost Any Ability Viability Ranking</a><br />";
		}
		if (target === 'all' || target === 'stabmons') {
			matched = true;
			if (target !== 'all') buffer += "Pokémon can use any move of their typing, in addition to the moves they can normally learn.<br />";
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3493081/\">STABmons</a><br />";
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3512215/\">STABmons Viability Ranking</a><br />";
		}
		if (target === 'all' || target === 'lcuu') {
			matched = true;
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3523929/\">LC UU</a><br />";
		}
		if (target === 'all' || target === 'averagemons') {
			matched = true;
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3526481/\">Averagemons</a><br />";
		}
		if (target === 'all' || target === 'classichackmons' || target === 'hackmons' || target === 'ch') {
			matched = true;
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3521887/\">Classic Hackmons</a><br />";
		}
		if (target === 'all' || target === 'hiddentype' || target === 'ht') {
			matched = true;
			if (target !== 'all') buffer += "Pokémon have an added type determined by their IVs. Same as the Hidden Power type.<br />";
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3516349/\">Hidden Type</a><br />";
		}
		if (target === 'all' || target === 'middlecup' || target === 'mc') {
			matched = true;
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3524287/\">Middle Cup</a><br />";
		}
		if (target === 'all' || target === 'outheorymon' || target === 'theorymon') {
			matched = true;
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3536615/\">OU Theorymon</a><br />";
		}
		if (!matched) {
			return this.sendReply("The Other Metas entry '" + target + "' was not found. Try /othermetas or /om for general help.");
		}
		this.sendReplyBox(buffer);
	},
	othermetashelp: ["/om - Provides links to information on the Other Metagames.",
		"!om - Show everyone that information. Requires: + % @ & ~"],

	/*formats: 'formathelp',
	formatshelp: 'formathelp',
	formathelp: function (target, room, user) {
		if (!this.canBroadcast()) return;
		if (this.broadcasting && (room.id === 'lobby' || room.battle)) return this.sendReply("This command is too spammy to broadcast in lobby/battles");
		var buf = [];
		var showAll = (target === 'all');
		for (var id in Tools.data.Formats) {
			var format = Tools.data.Formats[id];
			if (!format) continue;
			if (format.effectType !== 'Format') continue;
			if (!format.challengeShow) continue;
			if (!showAll && !format.searchShow) continue;
			buf.push({
				name: format.name,
				gameType: format.gameType || 'singles',
				mod: format.mod,
				searchShow: format.searchShow,
				desc: format.desc || 'No description.'
			});
		}
		this.sendReplyBox(
			"Available Formats: (<strong>Bold</strong> formats are on ladder.)<br />" +
			buf.map(function (data) {
				var str = "";
				// Bold = Ladderable.
				str += (data.searchShow ? "<strong>" + data.name + "</strong>" : data.name) + ": ";
				str += "(" + (!data.mod || data.mod === 'base' ? "" : data.mod + " ") + data.gameType + " format) ";
				str += data.desc;
				return str;
			}).join("<br />")
		);
	},*/

	roomhelp: function (target, room, user) {
		if (room.id === 'lobby' || room.battle) return this.sendReply("This command is too spammy for lobby/battles.");
		if (!this.canBroadcast()) return;
		this.sendReplyBox(
			"Room drivers (%) can use:<br />" +
			"- /warn OR /k <em>username</em>: warn a user and show the Pokemon Showdown rules<br />" +
			"- /mute OR /m <em>username</em>: 7 minute mute<br />" +
			"- /hourmute OR /hm <em>username</em>: 60 minute mute<br />" +
			"- /unmute <em>username</em>: unmute<br />" +
			"- /announce OR /wall <em>message</em>: make an announcement<br />" +
			"- /modlog <em>username</em>: search the moderator log of the room<br />" +
			"- /modnote <em>note</em>: adds a moderator note that can be read through modlog<br />" +
			"<br />" +
			"Room moderators (@) can also use:<br />" +
			"- /roomban OR /rb <em>username</em>: bans user from the room<br />" +
			"- /roomunban <em>username</em>: unbans user from the room<br />" +
			"- /roomvoice <em>username</em>: appoint a room voice<br />" +
			"- /roomdevoice <em>username</em>: remove a room voice<br />" +
			"- /modchat <em>[off/autoconfirmed/+]</em>: set modchat level<br />" +
			"<br />" +
			"Room owners (#) can also use:<br />" +
			"- /roomintro <em>intro</em>: sets the room introduction that will be displayed for all users joining the room<br />" +
			"- /rules <em>rules link</em>: set the room rules link seen when using /rules<br />" +
			"- /roommod, /roomdriver <em>username</em>: appoint a room moderator/driver<br />" +
			"- /roomdemod, /roomdedriver <em>username</em>: remove a room moderator/driver<br />" +
			"- /modchat <em>[%/@/#]</em>: set modchat level<br />" +
			"- /declare <em>message</em>: make a large blue declaration to the room<br />" +
			"- !htmlbox <em>HTML code</em>: broadcasts a box of HTML code to the room<br />" +
			"- !showimage <em>[url], [width], [height]</em>: shows an image to the room<br />" +
			"<br />" +
			"More detailed help can be found in the <a href=\"https://www.smogon.com/sim/roomauth_guide\">roomauth guide</a><br />" +
			"</div>"
		);
	},

	restarthelp: function (target, room, user) {
		if (room.id === 'lobby' && !this.can('lockdown')) return false;
		if (!this.canBroadcast()) return;
		this.sendReplyBox(
			"The server is restarting. Things to know:<br />" +
			"- We wait a few minutes before restarting so people can finish up their battles<br />" +
			"- The restart itself will take around 0.6 seconds<br />" +
			"- Your ladder ranking and teams will not change<br />" +
			"- We are restarting to update Pokémon Showdown to a newer version"
		);
	},

	rule: 'rules',
	rules: function (target, room, user) {
		if (!target) {
			if (!this.canBroadcast()) return;
			this.sendReplyBox("Please follow the rules:<br />" +
				(room.rulesLink ? "- <a href=\"" + Tools.escapeHTML(room.rulesLink) + "\">" + Tools.escapeHTML(room.title) + " room rules</a><br />" : "") +
				"- <a href=\"https://pokemonshowdown.com/rules\">" + (room.rulesLink ? "Global rules" : "Rules") + "</a>");
			return;
		}
		if (!this.can('roommod', null, room)) return;
		if (target.length > 100) {
			return this.sendReply("Error: Room rules link is too long (must be under 100 characters). You can use a URL shortener to shorten the link.");
		}

		room.rulesLink = target.trim();
		this.sendReply("(The room rules link is now: " + target + ")");

		if (room.chatRoomData) {
			room.chatRoomData.rulesLink = room.rulesLink;
			Rooms.global.writeChatRoomData();
		}
	},

	faq: function (target, room, user) {
		if (!this.canBroadcast()) return;
		target = target.toLowerCase();
		var buffer = "";
		var matched = false;

		if (target === 'all' && this.broadcasting) {
			return this.sendReplyBox("You cannot broadcast all FAQs at once.");
		}

		if (!target || target === 'all') {
			matched = true;
			buffer += "<a href=\"https://www.smogon.com/sim/faq\">Frequently Asked Questions</a><br />";
		}
		if (target === 'all' || target === 'elo') {
			matched = true;
			buffer += "<a href=\"https://www.smogon.com/sim/faq#elo\">Why did this user gain or lose so many points?</a><br />";
		}
		if (target === 'all' || target === 'doubles' || target === 'triples' || target === 'rotation') {
			matched = true;
			buffer += "<a href=\"https://www.smogon.com/sim/faq#doubles\">Can I play doubles/triples/rotation battles here?</a><br />";
		}
		if (target === 'all' || target === 'restarts') {
			matched = true;
			buffer += "<a href=\"https://www.smogon.com/sim/faq#restarts\">Why is the server restarting?</a><br />";
		}
		if (target === 'all' || target === 'star' || target === 'player') {
			matched = true;
			buffer += '<a href="http://www.smogon.com/sim/faq#star">Why is there this star (&starf;) in front of my username?</a><br />';
		}
		if (target === 'all' || target === 'staff') {
			matched = true;
			buffer += "<a href=\"https://www.smogon.com/sim/staff_faq\">Staff FAQ</a><br />";
		}
		if (target === 'all' || target === 'autoconfirmed' || target === 'ac') {
			matched = true;
			buffer += "A user is autoconfirmed when they have won at least one rated battle and have been registered for a week or longer.<br />";
		}
		if (target === 'all' || target === 'customavatar' || target === 'ca') {
			matched = true;
			buffer += "<a href=\"https://www.smogon.com/sim/faq#customavatar\">How can I get a custom avatar?</a><br />";
		}
		if (target === 'all' || target === 'pm') {
			matched = true;
			buffer += "<a href=\"https://www.smogon.com/sim/faq#pm\">How can I send a user a private message?</a><br />";
		}
		if (target === 'all' || target === 'challenge') {
			matched = true;
			buffer += "<a href=\"https://www.smogon.com/sim/faq#challenge\">How can I battle a specific user?</a><br />";
		}
		if (target === 'all'  || target === 'gxe') {
			matched = true;
			buffer += "<a href=\"https://www.smogon.com/sim/faq#gxe\">What does GXE mean?</a><br />";
		}
		if (!matched) {
			return this.sendReply("The FAQ entry '" + target + "' was not found. Try /faq for general help.");
		}
		this.sendReplyBox(buffer);
	},
	faqhelp: ["/faq [theme] - Provides a link to the FAQ. Add deviation, doubles, randomcap, restart, or staff for a link to these questions. Add all for all of them.",
		"!faq [theme] - Shows everyone a link to the FAQ. Add deviation, doubles, randomcap, restart, or staff for a link to these questions. Add all for all of them. Requires: + % @ & ~"],

	banlists: 'tiers',
	tier: 'tiers',
	tiers: function (target, room, user) {
		if (!this.canBroadcast()) return;
		target = toId(target);
		var buffer = "";
		var matched = false;

		if (target === 'all' && this.broadcasting) {
			return this.sendReplyBox("You cannot broadcast information about all tiers at once.");
		}

		if (!target || target === 'all') {
			matched = true;
			buffer += "- <a href=\"https://www.smogon.com/tiers/\">Smogon Tiers</a><br />";
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/tiering-faq.3498332/\">Tiering FAQ</a><br />";
			buffer += "- <a href=\"https://www.smogon.com/xyhub/tiers\">The banlists for each tier</a><br />";
		}
		if (target === 'all' || target === 'overused' || target === 'ou') {
			matched = true;
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3521201/\">OU Metagame Discussion</a><br />";
			buffer += "- <a href=\"https://www.smogon.com/dex/xy/tags/ou/\">OU Banlist</a><br />";
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3526596/\">OU Viability Ranking</a><br />";
		}
		if (target === 'all' || target === 'ubers' || target === 'uber') {
			matched = true;
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3522911/\">Ubers Metagame Discussion</a><br />";
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3523419/\">Ubers Viability Ranking</a><br />";
		}
		if (target === 'all' || target === 'underused' || target === 'uu') {
			matched = true;
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3537422/\">np: UU Stage 3</a><br />";
			buffer += "- <a href=\"https://www.smogon.com/dex/xy/tags/uu/\">UU Banlist</a><br />";
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3523649/\">UU Viability Ranking</a><br />";
		}
		if (target === 'all' || target === 'rarelyused' || target === 'ru') {
			matched = true;
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3537443/\">np: RU Stage 9</a><br />";
			buffer += "- <a href=\"https://www.smogon.com/dex/xy/tags/ru/\">RU Banlist</a><br />";
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3538036/\">RU Viability Ranking</a><br />";
		}
		if (target === 'all' || target === 'neverused' || target === 'nu') {
			matched = true;
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3537418/\">np: NU Stage 6</a><br />";
			buffer += "- <a href=\"https://www.smogon.com/dex/xy/tags/nu/\">NU Banlist</a><br />";
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3523692/\">NU Viability Ranking</a><br />";
		}
		if (target === 'all' || target === 'littlecup' || target === 'lc') {
			matched = true;
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3505710/\">LC Metagame Discussion</a><br />";
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3490462/\">LC Banlist</a><br />";
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3496013/\">LC Viability Ranking</a><br />";
		}
		if (target === 'all' || target === 'doublesou' || target === 'doubles' || target === 'smogondoubles') {
			matched = true;
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3525739/\">np: Doubles OU Stage 1.5</a><br />";
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3498688/\">Doubles OU Banlist</a><br />";
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3522814/\">Doubles OU Viability Ranking</a><br />";
		}
		if (!matched) {
			return this.sendReply("The Tiers entry '" + target + "' was not found. Try /tiers for general help.");
		}
		this.sendReplyBox(buffer);
	},

	analysis: 'smogdex',
	strategy: 'smogdex',
	smogdex: function (target, room, user) {
		if (!this.canBroadcast()) return;

		var targets = target.split(',');
		if (toId(targets[0]) === 'previews') return this.sendReplyBox("<a href=\"https://www.smogon.com/forums/threads/sixth-generation-pokemon-analyses-index.3494918/\">Generation 6 Analyses Index</a>, brought to you by <a href=\"https://www.smogon.com\">Smogon University</a>");
		var pokemon = Tools.getTemplate(targets[0]);
		var item = Tools.getItem(targets[0]);
		var move = Tools.getMove(targets[0]);
		var ability = Tools.getAbility(targets[0]);
		var atLeastOne = false;
		var generation = (targets[1] || 'xy').trim().toLowerCase();
		var genNumber = 6;
		// var doublesFormats = {'vgc2012':1, 'vgc2013':1, 'vgc2014':1, 'doubles':1};
		var doublesFormats = {};
		var doublesFormat = (!targets[2] && generation in doublesFormats) ? generation : (targets[2] || '').trim().toLowerCase();
		var doublesText = '';
		if (generation === 'xy' || generation === 'xy' || generation === '6' || generation === 'six') {
			generation = 'xy';
		} else if (generation === 'bw' || generation === 'bw2' || generation === '5' || generation === 'five') {
			generation = 'bw';
			genNumber = 5;
		} else if (generation === 'dp' || generation === 'dpp' || generation === '4' || generation === 'four') {
			generation = 'dp';
			genNumber = 4;
		} else if (generation === 'adv' || generation === 'rse' || generation === 'rs' || generation === '3' || generation === 'three') {
			generation = 'rs';
			genNumber = 3;
		} else if (generation === 'gsc' || generation === 'gs' || generation === '2' || generation === 'two') {
			generation = 'gs';
			genNumber = 2;
		} else if (generation === 'rby' || generation === 'rb' || generation === '1' || generation === 'one') {
			generation = 'rb';
			genNumber = 1;
		} else {
			generation = 'xy';
		}
		if (doublesFormat !== '') {
			// Smogon only has doubles formats analysis from gen 5 onwards.
			if (!(generation in {'bw':1, 'xy':1}) || !(doublesFormat in doublesFormats)) {
				doublesFormat = '';
			} else {
				doublesText = {'vgc2012':"VGC 2012", 'vgc2013':"VGC 2013", 'vgc2014':"VGC 2014", 'doubles':"Doubles"}[doublesFormat];
				doublesFormat = '/' + doublesFormat;
			}
		}

		// Pokemon
		if (pokemon.exists) {
			atLeastOne = true;
			if (genNumber < pokemon.gen) {
				return this.sendReplyBox("" + pokemon.name + " did not exist in " + generation.toUpperCase() + "!");
			}
			// if (pokemon.tier === 'CAP') generation = 'cap';
			if (pokemon.tier === 'CAP') return this.sendReply("CAP is not currently supported by Smogon Strategic Pokedex.");

			var illegalStartNums = {'351':1, '421':1, '487':1, '493':1, '555':1, '647':1, '648':1, '649':1, '681':1};
			if (pokemon.isMega || pokemon.num in illegalStartNums) pokemon = Tools.getTemplate(pokemon.baseSpecies);
			var poke = pokemon.name.toLowerCase().replace(/\ /g, '_').replace(/[^a-z0-9\-\_]+/g, '');

			this.sendReplyBox("<a href=\"https://www.smogon.com/dex/" + generation + "/pokemon/" + poke + doublesFormat + "\">" + generation.toUpperCase() + " " + doublesText + " " + pokemon.name + " analysis</a>, brought to you by <a href=\"https://www.smogon.com\">Smogon University</a>");
		}

		// Item
		if (item.exists && genNumber > 1 && item.gen <= genNumber) {
			atLeastOne = true;
			var itemName = item.name.toLowerCase().replace(' ', '_');
			this.sendReplyBox("<a href=\"https://www.smogon.com/dex/" + generation + "/items/" + itemName + "\">" + generation.toUpperCase() + " " + item.name + " item analysis</a>, brought to you by <a href=\"https://www.smogon.com\">Smogon University</a>");
		}

		// Ability
		if (ability.exists && genNumber > 2 && ability.gen <= genNumber) {
			atLeastOne = true;
			var abilityName = ability.name.toLowerCase().replace(' ', '_');
			this.sendReplyBox("<a href=\"https://www.smogon.com/dex/" + generation + "/abilities/" + abilityName + "\">" + generation.toUpperCase() + " " + ability.name + " ability analysis</a>, brought to you by <a href=\"https://www.smogon.com\">Smogon University</a>");
		}

		// Move
		if (move.exists && move.gen <= genNumber) {
			atLeastOne = true;
			var moveName = move.name.toLowerCase().replace(' ', '_');
			this.sendReplyBox("<a href=\"https://www.smogon.com/dex/" + generation + "/moves/" + moveName + "\">" + generation.toUpperCase() + " " + move.name + " move analysis</a>, brought to you by <a href=\"https://www.smogon.com\">Smogon University</a>");
		}

		if (!atLeastOne) {
			return this.sendReplyBox("Pokemon, item, move, or ability not found for generation " + generation.toUpperCase() + ".");
		}
	},
	smogdexhelp: ["/analysis [pokemon], [generation] - Links to the Smogon University analysis for this Pokemon in the given generation.",
		"!analysis [pokemon], [generation] - Shows everyone this link. Requires: + % @ & ~"],

	register: function () {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('You will be prompted to register upon winning a rated battle. Alternatively, there is a register button in the <button name="openOptions"><i class="icon-cog"></i> Options</button> menu in the upper right.');
	},

	/*********************************************************
	 * Miscellaneous commands
	 *********************************************************/

	potd: function (target, room, user) {
		if (!this.can('potd')) return false;

		Config.potd = target;
		Simulator.SimulatorProcess.eval('Config.potd = \'' + toId(target) + '\'');
		if (target) {
			if (Rooms.lobby) Rooms.lobby.addRaw("<div class=\"broadcast-blue\"><b>The Pokemon of the Day is now " + target + "!</b><br />This Pokemon will be guaranteed to show up in random battles.</div>");
			this.logModCommand("The Pokemon of the Day was changed to " + target + " by " + user.name + ".");
		} else {
			if (Rooms.lobby) Rooms.lobby.addRaw("<div class=\"broadcast-blue\"><b>The Pokemon of the Day was removed!</b><br />No pokemon will be guaranteed in random battles.</div>");
			this.logModCommand("The Pokemon of the Day was removed by " + user.name + ".");
		}
	},

	spammode: function (target, room, user) {
		if (!this.can('ban')) return false;

		// NOTE: by default, spammode does nothing; it's up to you to set stricter filters
		// in config for chatfilter/hostfilter. Put this above the spammode filters:
		/*
		if (!Config.spammode) return;
		if (Config.spammode < Date.now()) {
			delete Config.spammode;
			return;
		}
		*/

		if (target === 'off' || target === 'false') {
			if (Config.spammode) {
				delete Config.spammode;
				this.privateModCommand("(" + user.name + " turned spammode OFF.)");
			} else {
				this.sendReply("Spammode is already off.");
			}
		} else if (!target || target === 'on' || target === 'true') {
			if (Config.spammode) {
				this.privateModCommand("(" + user.name + " renewed spammode for half an hour.)");
			} else {
				this.privateModCommand("(" + user.name + " turned spammode ON for half an hour.)");
			}
			Config.spammode = Date.now() + 30 * 60 * 1000;
		} else {
			this.sendReply("Unrecognized spammode setting.");
		}
	},

	roll: 'dice',
	dice: function (target, room, user) {
		if (!target || target.match(/[^d\d\s\-\+HL]/i)) return this.parse('/help dice');
		if (!this.canBroadcast()) return;

		// ~30 is widely regarded as the sample size required for sum to be a Gaussian distribution.
		// This also sets a computation time constraint for safety.
		var maxDice = 40;

		var diceQuantity = 1;
		var diceDataStart = target.indexOf('d');
		if (diceDataStart >= 0) {
			diceQuantity = Number(target.slice(0, diceDataStart));
			target = target.slice(diceDataStart + 1);
			if (!Number.isInteger(diceQuantity) || diceQuantity <= 0 || diceQuantity > maxDice) return this.sendReply("The amount of dice rolled should be a natural number up to " + maxDice + ".");
		}
		var offset = 0;
		var removeOutlier = 0;

		var modifierData = target.match(/[\-\+]/);
		if (modifierData) {
			switch (target.slice(modifierData.index).trim().toLowerCase()) {
			case '-l':
				removeOutlier = -1;
				break;
			case '-h':
				removeOutlier = +1;
				break;
			default:
				offset = Number(target.slice(modifierData.index));
				if (isNaN(offset)) return this.parse('/help dice');
				if (!Number.isSafeInteger(offset)) return this.sendReply("The specified offset must be an integer up to " + Number.MAX_SAFE_INTEGER + ".");
			}
			if (removeOutlier && diceQuantity <= 1) return this.sendReply("More than one dice should be rolled before removing outliers.");
			target = target.slice(0, modifierData.index);
		}

		var diceFaces = 6;
		if (target.length) {
			diceFaces = Number(target);
			if (!Number.isSafeInteger(diceFaces) || diceFaces <= 0) {
				return this.sendReply("Rolled dice must have a natural amount of faces up to " + Number.MAX_SAFE_INTEGER + ".");
			}
		}

		if (diceQuantity > 1) {
			// Make sure that we can deal with high rolls
			if (!Number.isSafeInteger(offset < 0 ? diceQuantity * diceFaces : diceQuantity * diceFaces + offset)) {
				return this.sendReply("The maximum sum of rolled dice must be lower or equal than " + Number.MAX_SAFE_INTEGER + ".");
			}
		}

		var maxRoll = 0;
		var minRoll = Number.MAX_SAFE_INTEGER;

		var trackRolls = diceQuantity * (('' + diceFaces).length + 1) <= 60;
		var rolls = [];
		var rollSum = 0;

		for (var i = 0; i < diceQuantity; ++i) {
			var curRoll = Math.floor(Math.random() * diceFaces) + 1;
			rollSum += curRoll;
			if (curRoll > maxRoll) maxRoll = curRoll;
			if (curRoll < minRoll) minRoll = curRoll;
			if (trackRolls) rolls.push(curRoll);
		}

		// Apply modifiers

		if (removeOutlier > 0) {
			rollSum -= maxRoll;
		} else if (removeOutlier < 0) {
			rollSum -= minRoll;
		}
		if (offset) rollSum += offset;

		// Reply with relevant information

		var offsetFragment = "";
		if (offset) offsetFragment += (offset > 0 ? "+" + offset : offset);

		if (diceQuantity === 1) return this.sendReplyBox("Roll (1 - " + diceFaces + ")" + offsetFragment + ": " + rollSum);

		var sumFragment = "<br />Sum" + offsetFragment + (removeOutlier ? " except " + (removeOutlier > 0 ? "highest" : "lowest") : "");
		return this.sendReplyBox("" + diceQuantity + " rolls (1 - " + diceFaces + ")" + (trackRolls ? ": " + rolls.join(", ") : "") + sumFragment + ": " + rollSum);
	},
	dicehelp: ["/dice [max number] - Randomly picks a number between 1 and the number you choose.",
		"/dice [number of dice]d[number of sides] - Simulates rolling a number of dice, e.g., /dice 2d4 simulates rolling two 4-sided dice.",
		"/dice [number of dice]d[number of sides][+/-][offset] - Simulates rolling a number of dice and adding an offset to the sum, e.g., /dice 2d6+10: two standard dice are rolled; the result lies between 12 and 22.",
		"/dice [number of dice]d[number of sides]-[H/L] - Simulates rolling a number of dice with removal of extreme values, e.g., /dice 3d8-L: rolls three 8-sided dice; the result ignores the lowest value."],

	pr: 'pickrandom',
	pick: 'pickrandom',
	pickrandom: function (target, room, user) {
		var options = target.split(',');
		if (options.length < 2) return this.parse('/help pick');
		if (!this.canBroadcast()) return false;
		return this.sendReplyBox('<em>We randomly picked:</em> ' + Tools.escapeHTML(options.sample().trim()));
	},
	pickrandomhelp: ["/pick [option], [option], ... - Randomly selects an item from a list containing 2 or more elements."],

	showimage: function (target, room, user) {
		if (!target) return this.parse('/help showimage');
		if (!this.can('declare', null, room)) return false;
		if (!this.canBroadcast()) return;

		var targets = target.split(',');
		if (targets.length !== 3) {
			return this.parse('/help showimage');
		}

		this.sendReply('|raw|<img src="' + Tools.escapeHTML(targets[0]) + '" alt="" width="' + toId(targets[1]) + '" height="' + toId(targets[2]) + '" />');
	},
	showimagehelp: ["/showimage [url], [width], [height] - Show an image. Requires: # & ~"],

	htmlbox: function (target, room, user, connection, cmd, message) {
		if (!target) return this.parse('/help htmlbox');
		if (!this.canHTML(target)) return;

		if (room.id === 'development') {
			if (!this.can('announce', null, room)) return;
			if (message.charAt(0) === '!') this.broadcasting = true;
		} else {
			if (!this.can('declare', null, room)) return;
			if (!this.canBroadcast('!htmlbox')) return;
		}

		this.sendReplyBox(target);
	},
	htmlboxhelp: ["/htmlbox [message] - Displays a message, parsing HTML code contained. Requires: ~ # with global authority"],

	sdt: 'seasonaldata',
	sdata: 'seasonaldata',
	seasonaldata: function (target, room, user) {
		if (!this.canBroadcast()) return;

		var buffer = '|raw|';
		var targetId = toId(target);
		switch (targetId) {
		case 'cura':
		case 'recover':
			buffer += '<ul class="utilichart"><li class="result"><a data-name="Cura"><span class="col movenamecol">Cura</span> <span class="col typecol"></span> <span class="col labelcol"></span> <span class="col widelabelcol"></span> <span class="col pplabelcol"></span> <span class="col movedesccol">Heals the active team by 20%.</span> </a></li><li></li></ul>';
			break;
		case 'curaga':
		case 'softboiled':
			buffer += '<ul class="utilichart"><li class="result"><a data-name="Curaga"><span class="col movenamecol">Curaga</span> <span class="col typecol"></span> <span class="col labelcol"></span> <span class="col widelabelcol"></span> <span class="col pplabelcol"></span> <span class="col movedesccol">Heals the active team by 33%.</span> </a></li><li></li></ul>';
			break;
		case 'wildgrowth':
		case 'reflect':
			buffer += '<ul class="utilichart"><li class="result"><a data-name="Wild Growth"><span class="col movenamecol">Wild Growth</span> <span class="col typecol"></span> <span class="col labelcol"></span> <span class="col widelabelcol"></span> <span class="col pplabelcol"></span> <span class="col movedesccol">Heals the team by 12.5% each turn for 5 turns.</span> </a></li><li></li></ul>';
			break;
		case 'powershield':
		case 'acupressure':
			buffer += '<ul class="utilichart"><li class="result"><a data-name="Power Shield"><span class="col movenamecol">Power Shield</span> <span class="col typecol"></span> <span class="col labelcol"></span> <span class="col widelabelcol"></span> <span class="col pplabelcol"></span> <span class="col movedesccol">The target will be healed by 25% of the next damage received.</span> </a></li><li></li></ul>';
			break;
		case 'rejuvenation':
		case 'holdhands':
			buffer += '<ul class="utilichart"><li class="result"><a data-name="Rejuvenation"><span class="col movenamecol">Rejuvenation</span> <span class="col typecol"></span> <span class="col labelcol"></span> <span class="col widelabelcol"></span> <span class="col pplabelcol"></span> <span class="col movedesccol">The target will be healed by 18% each turn for 3 turns.</span> </a></li><li></li></ul>';
			break;
		case 'fairyward':
		case 'luckychant':
			buffer += '<ul class="utilichart"><li class="result"><a data-name="Fairy Ward"><span class="col movenamecol">Fairy Ward</span> <span class="col typecol"></span> <span class="col labelcol"></span> <span class="col widelabelcol"></span> <span class="col pplabelcol"></span> <span class="col movedesccol">Prevents status and reduce damage by 5% for all the team for 3 turns.</span> </a></li><li></li></ul>';
			break;
		case 'taunt':
		case 'followme':
			buffer += '<ul class="utilichart"><li class="result"><a data-name="Taunt"><span class="col movenamecol">Taunt</span> <span class="col typecol"></span> <span class="col labelcol"></span> <span class="col widelabelcol"></span> <span class="col pplabelcol"></span> <span class="col movedesccol">Will redirect all attacks to user for three turns.</span> </a></li><li></li></ul>';
			break;
		case 'sacrifice':
		case 'meditate':
			buffer += '<ul class="utilichart"><li class="result"><a data-name="Sacrifice"><span class="col movenamecol">Sacrifice</span> <span class="col typecol"></span> <span class="col labelcol"></span> <span class="col widelabelcol"></span> <span class="col pplabelcol"></span> <span class="col movedesccol">Will redirect all team damage to user for 4 turns.</span> </a></li><li></li></ul>';
			break;
		case 'cooperation':
		case 'helpinghand':
			buffer += '<ul class="utilichart"><li class="result"><a data-name="Cooperation"><span class="col movenamecol">Cooperation</span> <span class="col typecol"></span> <span class="col labelcol"></span> <span class="col widelabelcol"></span> <span class="col pplabelcol"></span> <span class="col movedesccol">Switches positions with target.</span> </a></li><li></li></ul>';
			break;
		case 'slowdown':
		case 'spite':
			buffer += '<ul class="utilichart"><li class="result"><a data-name="Slow Down"><span class="col movenamecol">Slow Down</span> <span class="col typecol"></span> <span class="col labelcol"></span> <span class="col widelabelcol"></span> <span class="col pplabelcol"></span> <span class="col movedesccol">Removes 8 PP. Lowers damage by 15%. Gets disabled after use.</span> </a></li><li></li></ul>';
			break;
		case 'healingtouch':
		case 'aromaticmist':
			buffer += '<ul class="utilichart"><li class="result"><a data-name="Healing Touch"><span class="col movenamecol">Healing Touch</span> <span class="col typecol"></span> <span class="col labelcol"></span> <span class="col widelabelcol"></span> <span class="col pplabelcol"></span> <span class="col movedesccol">Heals target by 60% of its max HP.</span> </a></li><li></li></ul>';
			break;
		case 'penance':
		case 'healbell':
			buffer += '<ul class="utilichart"><li class="result"><a data-name="Penance"><span class="col movenamecol">Penance</span> <span class="col typecol"></span> <span class="col labelcol"></span> <span class="col widelabelcol"></span> <span class="col pplabelcol"></span> <span class="col movedesccol">Heals all team by 12.5% and places a shield that will heal them for 6.15% upon being hit.</span> </a></li><li></li></ul>';
			break;
		case 'stop':
		case 'fakeout':
			buffer += '<ul class="utilichart"><li class="result"><a data-name="Stop"><span class="col movenamecol">Stop</span> <span class="col typecol"></span> <span class="col labelcol"></span> <span class="col widelabelcol"></span> <span class="col pplabelcol"></span> <span class="col movedesccol">Target won\'t move. Has priority. User is disabled after use.</span> </a></li><li></li></ul>';
			break;
		case 'laststand':
		case 'endure':
			buffer += '<ul class="utilichart"><li class="result"><a data-name="Last Stand"><span class="col movenamecol">Last Stand</span> <span class="col typecol"></span> <span class="col labelcol"></span> <span class="col widelabelcol"></span> <span class="col pplabelcol"></span> <span class="col movedesccol">User will survive the next hit. Damage taken is halved for the turn. User is disabled after use.</span> </a></li><li></li></ul>';
			break;
		case 'barkskin':
		case 'withdraw':
			buffer += '<ul class="utilichart"><li class="result"><a data-name="Barkskin"><span class="col movenamecol">Barkskin</span> <span class="col typecol"></span> <span class="col labelcol"></span> <span class="col widelabelcol"></span> <span class="col pplabelcol"></span> <span class="col movedesccol">Reduces damage taken by 25% by 2 turns.</span> </a></li><li></li></ul>';
			break;
		case 'punishment':
		case 'seismictoss':
			buffer += '<ul class="utilichart"><li class="result"><a data-name="Punishment"><span class="col movenamecol">Punishment</span> <span class="col typecol"></span> <span class="col labelcol"></span> <span class="col widelabelcol"></span> <span class="col pplabelcol"></span> <span class="col movedesccol">Base damage is 33% of user\'s current HP.</span> </a></li><li></li></ul>';
			break;
		case 'flamestrike':
		case 'flamethrower':
			buffer += '<ul class="utilichart"><li class="result"><a data-name="Flamestrike"><span class="col movenamecol">Flamestrike</span> <span class="col typecol"></span> <span class="col labelcol"><em>Power</em><br />30%</span> <span class="col widelabelcol"></span> <span class="col pplabelcol"></span> <span class="col movedesccol">Base damage is 40% if the target is burned.</span> </a></li><li></li></ul>';
			break;
		case 'conflagration':
		case 'fireblast':
			buffer += '<ul class="utilichart"><li class="result"><a data-name="Conflagration"><span class="col movenamecol">Conflagration</span> <span class="col typecol"></span> <span class="col labelcol"><em>Power</em><br />20%</span> <span class="col widelabelcol"></span> <span class="col pplabelcol"></span> <span class="col movedesccol">Burns target.</span> </a></li><li></li></ul>';
			break;
		case 'moonfire':
		case 'thunderbolt':
			buffer += '<ul class="utilichart"><li class="result"><a data-name="Moonfire"><span class="col movenamecol">Moonfire</span> <span class="col typecol"></span> <span class="col labelcol"><em>Power</em><br />20%</span> <span class="col widelabelcol"></span> <span class="col pplabelcol"></span> <span class="col movedesccol">Applies Moonfire for 4 turns, it deals 6% damage.</span> </a></li><li></li></ul>';
			break;
		case 'starfire':
		case 'thunder':
			buffer += '<ul class="utilichart"><li class="result"><a data-name="Starfire"><span class="col movenamecol">Starfire</span> <span class="col typecol"></span> <span class="col labelcol"><em>Power</em><br />30%</span> <span class="col widelabelcol"></span> <span class="col pplabelcol"></span> <span class="col movedesccol">Base damage is 40% if the target is moonfired.</span> </a></li><li></li></ul>';
			break;
		case 'corruption':
		case 'toxic':
			buffer += '<ul class="utilichart"><li class="result"><a data-name="Corruption"><span class="col movenamecol">Corruption</span> <span class="col typecol"></span> <span class="col labelcol"></span> <span class="col widelabelcol"></span> <span class="col pplabelcol"></span> <span class="col movedesccol">Deals 10% damage every turn for 4 turns.</span> </a></li><li></li></ul>';
			break;
		case 'soulleech':
		case 'leechseed':
			buffer += '<ul class="utilichart"><li class="result"><a data-name="Soul Leech"><span class="col movenamecol">Soul Leech</span> <span class="col typecol"></span> <span class="col labelcol"></span> <span class="col widelabelcol"></span> <span class="col pplabelcol"></span> <span class="col movedesccol">Drains 8% HP every turn for 4 turns.</span> </a></li><li></li></ul>';
			break;
		case 'icelance':
		case 'icebeam':
			buffer += '<ul class="utilichart"><li class="result"><a data-name="Ice Lance"><span class="col movenamecol">Ice Lance</span> <span class="col typecol"></span> <span class="col labelcol"><em>Power</em><br />30%</span> <span class="col widelabelcol"></span> <span class="col pplabelcol"></span> <span class="col movedesccol">Base damage is 40% if the target is chilled.</span> </a></li><li></li></ul>';
			break;
		case 'frostbite':
		case 'freezeshock':
			buffer += '<ul class="utilichart"><li class="result"><a data-name="Frostbite"><span class="col movenamecol">Frostbite</span> <span class="col typecol"></span> <span class="col labelcol"><em>Power</em><br />20%</span> <span class="col widelabelcol"></span> <span class="col pplabelcol"></span> <span class="col movedesccol">Chills target. It will be slower.</span> </a></li><li></li></ul>';
			break;
		case 'hurricane':
		case 'aircutter':
			buffer += '<ul class="utilichart"><li class="result"><a data-name="Hurricane"><span class="col movenamecol">Hurricane</span> <span class="col typecol"></span> <span class="col labelcol"><em>Power</em><br />20%</span> <span class="col widelabelcol"></span> <span class="col pplabelcol"></span> <span class="col movedesccol">Damage all adjacent foes.</span> </a></li><li></li></ul>';
			break;
		case 'storm':
		case 'muddywater':
			buffer += '<ul class="utilichart"><li class="result"><a data-name="Storm"><span class="col movenamecol">Storm</span> <span class="col typecol"></span> <span class="col labelcol"><em>Power</em><br />20%</span> <span class="col widelabelcol"></span> <span class="col pplabelcol"></span> <span class="col movedesccol">Damage all adjacent foes.</span> </a></li><li></li></ul>';
			break;
		case 'fury':
		case 'furyswipes':
			buffer += '<ul class="utilichart"><li class="result"><a data-name="Fury"><span class="col movenamecol">Fury</span> <span class="col typecol"></span> <span class="col labelcol"><em>Power</em><br />15%</span> <span class="col widelabelcol"></span> <span class="col pplabelcol"></span> <span class="col movedesccol">Disables user. Next use will have 100% base power.</span> </a></li><li></li></ul>';
			break;
		case 'garrote':
		case 'scratch':
			buffer += '<ul class="utilichart"><li class="result"><a data-name="Garrote"><span class="col movenamecol">Garrote</span> <span class="col typecol"></span> <span class="col labelcol"><em>Power</em><br />20%</span> <span class="col widelabelcol"></span> <span class="col pplabelcol"></span> <span class="col movedesccol">Causes bleeding. It deals 6.15% damage for 5 turns.</span> </a></li><li></li></ul>';
			break;
		case 'poisongas':
		case 'smog':
			buffer += '<ul class="utilichart"><li class="result"><a data-name="Poison Gas"><span class="col movenamecol">Poison Gas</span> <span class="col typecol"></span> <span class="col labelcol"></span> <span class="col widelabelcol"></span> <span class="col pplabelcol"></span> <span class="col movedesccol">Poisons the target.</span> </a></li><li></li></ul>';
			break;
		case 'mutilate':
		case 'slash':
			buffer += '<ul class="utilichart"><li class="result"><a data-name="Mutilate"><span class="col movenamecol">Mutilate</span> <span class="col typecol"></span> <span class="col labelcol"><em>Power</em><br />27%</span> <span class="col widelabelcol"></span> <span class="col pplabelcol"></span> <span class="col movedesccol">Increases power by 10% or 20% if target is psn or/and bld.</span> </a></li><li></li></ul>';
			break;
		case 'sacredshield':
		case 'matblock':
			buffer += '<ul class="utilichart"><li class="result"><a data-name="Sacred Shield"><span class="col movenamecol">Sacred Shield</span> <span class="col typecol"></span> <span class="col labelcol"></span> <span class="col widelabelcol"></span> <span class="col pplabelcol"></span> <span class="col movedesccol">Shields team greatly, losses HP.</span> </a></li><li></li></ul>';
			break;
		default:
			buffer = "No Pokemon, item, move, ability or nature named '" + target + "' was found on this seasonal.";
		}
		if (targetId === 'evasion' || targetId === 'protect') {
			return this.parse('/data protect');
		} else if (!targetId) {
			return this.sendReply("Please specify a valid Pokemon, item, move, ability or nature in this seasonal.");
		} else {
			this.sendReply(buffer);
		}
	},
	seasonaldatahelp: ["/seasonaldata [pokemon/item/move/ability] - Get details on this pokemon/item/move/ability/nature for the current seasonal.",
		"!seasonaldata [pokemon/item/move/ability] - Show everyone these details. Requires: + % @ & ~"]
};
