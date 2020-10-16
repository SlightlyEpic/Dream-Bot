const { MessageEmbed } = require("discord.js");
const config = require("../misc/config.json")

module.exports = {
    name: "warninfo",
    description: "Get the details of a warn",
    usage: "warninfo <case ID>",
    permissions: ["MANAGE_GUILD"],
    is_visible: false,
    execute: async function(message, args, database) {
        let caseID = args[0];
        if(caseID) {
            let d = database.get("warn-log", caseID);
            if(d !== undefined) {
                let targetID = d[0];
                let modID = d[1];
                let reason = d[2];
                let time = d[3];

                let emb = new MessageEmbed()
                .setTitle(`Warn info for ${caseID}`)
                .addField("User warned:", `<@${targetID}>`)
                .addField("Warned by:", `<@${modID}>`)
                .addField("Time:", time)
                .addField("Reason:", reason)
                .setFooter(config.bot_name, message.client.user.avatarURL())
                .setTimestamp();
                message.channel.send(emb);
            } else {
                message.channel.send("Invalid case ID.")
            }
        } else {
            message.channel.send("Please provide a case ID.")
        }
    }
}