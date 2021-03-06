const Discord = require("discord.js");
const fs = require("fs")
const config = require("./misc/config.json");
const utility = require("./misc/utility.js");
const Database = require("./misc/database.js");
const debug = require("./misc/debugging.js")

const client = new Discord.Client();
let database;

let modules = {
	rr: false,
	spotifyRole: true
}

//------------------------------------------------------------------------------------------------------------//

//import commands

client.commands = new Discord.Collection();

client.reload_commands = function() {
	
	this.commands.sweep(e => true);
	const commandFiles = fs.readdirSync(__dirname + '/commands').filter(file => file.endsWith('.js'));

	for (const file of commandFiles) {
		const command = require(__dirname + `/commands/${file}`);
		this.commands.set(command.name, command);
		console.log(`\u001b[1;32m Imported ${file}`);
	}
}

client.reload_commands();

//default developer_only to false and is_visible to true for all commands

client.commands.each(c => {
	if(c.developer_only == undefined) c.developer_only = false;
	if(c.is_visible == undefined) c.is_visible = true;
})

//------------------------------------------------------------------------------------------------------------//

//bot listeners

client.on("ready", () => {
	console.log(`
	\u001b[1;34m
	---------------------------------------------------------------------------------------------------
	Successfully logged in as ${client.user.tag}
	Operating in ${client.guilds.cache.size} servers with ${client.users.cache.size} members
	---------------------------------------------------------------------------------------------------
	`)

	client.user.setPresence({
		activity: {
			name: `you! ${config.default_prefix}Help`,
			type: "WATCHING"
		},
		status: "online"
	})

	//database = new Database(client, "744951698547802222", "751063276741459969", Discord);
	database = new Database(client, "748436304223535105", "766136553855909898", Discord); //carleys server
	database.on("ready", (db) => {
		console.log("\u001b[1;32mDatabase is ready");

		//rr
		/*
		if(modules.rr) {
			Object.keys(db.data["rr"]).forEach(message_id => {
				if(message_id !== "_CHANNEL") {
					const role_id = db.get("rr", message_id)[0];
					const rr_channel_id = db.get("rr", message_id)[1];

					db.main_guild.channels.fetch(rr_channel_id)
					.then(rr_channel => {
						rr_channel.messages.fetch(message_id)
						.then(rr_message => {
							let role = db.main_guild.roles.cache.get(role_id);
							//continue from here
							//todo: get emoji, create collector
						})
					})

				}
			})
		}
		*/
	})
	database.start();
	   
	client.guilds.cache.each(guild => {
        if(!config.server_whitelist.includes(guild.id)) {
            guild.leave()
            .then(g => {
                console.log(`Left ${guild.name} - ${guild.id}`);
            })
        } else {
            checkTicketSetup(guild);
        }
    })

})

client.on("message", message => {
	if(message.author.bot) return;
	if(message.channel.type == "dm") return;

	if(message.content == "Fire" && message.channel.id == "748436304701685771") {
		message.guild.fetchWebhooks()
		.then(webhooks => {
			let whook = webhooks.find(webhook => webhook.channelID == "748436304701685771")
			if(whook) {
				whook.edit({
					avatar: message.author.displayAvatarURL(),
					name: message.author.username
				})
				.then(w => {
					message.delete()
					w.send("<a:Fire:766125911807623178>")
				})
			}
		})
	}

	if(message.content.trim().startsWith(config.default_prefix)) {
		const command = message.content.trim().split(" ")[0].toLowerCase().substring(config.default_prefix.length);
		const args = utility.remove_empty_strings(message.content.trim().split(" ").slice(1));

		if(client.commands.has(command)) { //if command exists
			if(!client.commands.get(command).developer_only) { //if command is not developer only
				let commandIsEnabled = database.get("config", `commands-${command}`);
				if(commandIsEnabled !== undefined) {
					commandIsEnabled = commandIsEnabled[0] === "0" ? false : true;
				} else {
					commandIsEnabled = true;
				}
				if(commandIsEnabled) { //if command is enabled in the guild
					client.commands.get(command).execute(message, args, database);
				} else { //if command is disabled in the guild
					message.channel.send("Command is disabled.");
				}
			} else if(config.developers.includes(message.author.id)) { //if command is developer only and author is a developer
				client.commands.get(command).execute(message, args, database);
			}
		}
	} else {
		//Do regex react here
	}
})

client.on("guildCreate", guild => {
	console.log(
	`\u001b[1;32m
	---------------------------------------------------------------------------------------------------
	Added to a guild -
	Name: ${guild.name}
	ID: ${guild.id}
	Member Count: ${guild.members.cache.size}
	---------------------------------------------------------------------------------------------------
	`)
})

client.on("guildDelete", guild => {
	console.log(
	`\u001b[1;31m
	---------------------------------
	Removed from a guild -
	Name: ${guild.name}
	ID: ${guild.id}
	Member Count: ${guild.members.cache.size}
	---------------------------------`
	)
})

/*
client.on("presenceUpdate", (oldPresence, newPresence) => {
	//spotify role
	if(database.has_started) {
		let spotifyRoleID = database.get("config", "spotifyRole")[0];
		if(spotifyRoleID) {
			let oldSpotify = oldPresence !== null && oldPresence !== undefined ? utility.listening_to_spotify(oldPresence) : false;
			let newSpotify = newPresence !== null && newPresence !== undefined ? utility.listening_to_spotify(newPresence) : false;
			if(!oldSpotify && newSpotify) {
				newPresence.member.roles.add(spotifyRoleID)
				.then(() => {console.log(`Added spotify role to ${newPresence.member.displayName}`)})
				.catch(e => {console.log(`Could not add spotify role to ${newPresence.member.displayName} \n${e}`);})
			} else if(oldSpotify && !newSpotify) {
				newPresence.member.roles.remove(spotifyRoleID)
				.then(() => {console.log(`Removed spotify role from ${newPresence.member.displayName}`)})
				.catch(e => {console.log(`Could not remove spotify role from ${newPresence.member.displayName} \n${e}`);})
			}
		}
	}
	//
})
*/

//------------------------------------------------------------------------------------------------------------//

function checkTicketSetup(guild) {

	let tRole = guild.roles.cache.find(r => r.name === config.ticket_role_name);

	if(tRole == undefined) {
		guild.roles.create({
			data: {
				name: config.ticket_role_name,
				hoist: true,
				mentionable: true,
				color: "#31eb63"
			},
			reason: "Ticket Support role"
		}).then(r => {
			console.log(`Created ticket support role for ${guild.name} - ${guild.id}`);
			tRole = r;
		})
	} //create the Ticket Support Role


	if(guild.channels.cache.find(ch => ch.name.toLowerCase() == config.ticket_category && ch.type == "category") == undefined) {
		guild.channels.create(config.ticket_category, {
			type: "category"
		})
		.then(category => { //disable view for @everyone
			category.createOverwrite(guild.roles.everyone, {
				VIEW_CHANNEL: false
			})
			.then(category_ => {
				//enable view for Ticket Support
				category_.createOverwrite(tRole, {
					VIEW_CHANNEL: true
				})
				.then(cat => {console.log(`Successfully initialized support ticket category for ${guild.name} - ${guild.id}`);})
				.catch(e => {console.log(`Could not initialize support ticket category for ${guild.name} - ${guild.id}`);})
			})
			.catch(e => {
				console.log("Couldnt change permissions for ticket category")
			})
		})
		.catch(e => {
			console.log("Couldnt create category");
		})
	}
}


//------------------------------------------------------------------------------------------------------------//

console.log("Logging in...");
client.login(process.env.TOKEN);