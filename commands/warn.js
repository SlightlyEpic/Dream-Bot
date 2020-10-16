let {MessageEmbed, Message} = require("discord.js")
let config = require("../misc/config.json")
let utility = require("../misc/utility.js")

module.exports = {
    name: "warn",
    description: "Warns the mentioned user",
    usage: "warn <@mention> [reason]",
    permissions: ["MANAGE_GUILD"],
    is_visible: false,
    execute: async function(message, args, database) {
        let executor = message.member

        if(executor.hasPermission(this.permissions)) {
            let target = message.mentions.members.first();

            if(target !== undefined) {
                if(!target.user.bot) {
                    let reason = args;
                    reason.shift();
                    reason = reason.join(" ");
                    if(reason == "") {reason = "No reason given";}

                    let warnLogID = database.get("config", "warn-log-channel")[0];
                    let warnLog = message.guild.channels.cache.get(warnLogID);
                    delete warnLogID;

                    let dmed = null;
                    let logged = null;

                    let caseID = utility.random_hex_colour();
                    let keys = database.keys("warn-log")
                    while(keys.includes(caseID)) {
                        caseID = utility.random_hex_colour();
                    }
                    delete keys

                    let dmEmb = new MessageEmbed()
                    .setColor("RANDOM")
                    .setTitle(`You were warned in ${message.guild.name}`)
                    .addField("Warned by:", `${message.author.tag} - ${message.author.toString()}`)
                    .addField("Reason:", reason)
                    .addField("Case ID:", caseID)
                    .setFooter(config.bot_name, message.client.user.avatarURL())
                    .setTimestamp()
                    target.user.send(dmEmb)
                    .then(() => {dmed = true})
                    .catch(() => {dmed = false})

                    // targetID, authorID, Reason, Time
                    database.set("warn-log", caseID, [target.user.id, message.author.id, reason, new Date().toGMTString(), reason])
                    .then(() => {logged = true;})
                    .catch(() => {logged = false;})

                    for(i = 0; i < 10; i++) {
                        if(dmed !== null && logged !== null) {
                            let mainEmb = new MessageEmbed()
                            .setColor("RANDOM")
                            .setTitle(`${target.user.tag} was warned`)
                            .addField("Reason:", reason)
                            .addField("Case ID:", caseID)
                            .addField("DM Alert:", dmed ? "Successful" : "Failed")
                            .addField("Logged:", logged ? "Successful" : "Failed")
                            .setFooter(config.bot_name, message.client.user.avatarURL())
                            .setTimestamp();
                            message.channel.send(mainEmb);
                            break;
                        }
                        await utility.wait(1000);
                    }

                } else {
                    message.channel.send("Cannot warn a bot")
                }
            } else {
                message.channel.send("You need to mention a user.")
            }
        } else {
            message.channel.send("no.")
        }
    }
}