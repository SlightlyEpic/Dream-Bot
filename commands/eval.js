const utility = require("../misc/utility");
const config = require("../misc/config.json");
const Discord = require("discord.js");

module.exports = {
    name: "eval",
    description: "Evaluate",
    usage: "yeet",
    developer_only: true,
    is_visible: false,
    execute: function(message, arguments, database) {
        if(config.developers.includes(message.author.id)) {
            const inp = message.content.substring(this.name.length + 1);
            
            const client = message.client;
            const db = database; //for abbreviation purposes
            try {
                eval(inp);
            } catch (error) {
                let out = new Discord.MessageEmbed()
                .setColor(utility.random_hex_colour())
                .setTitle("Evaluate")
                .addField("Input", `\`\`\`${inp}\`\`\``)
                .addField("Error", `\`\`\`${error}\`\`\``)
                .setFooter(config.bot_name)
                .setTimestamp();
                
                message.channel.send(out);
            }
        }
    }
}