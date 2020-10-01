const utility = require("../misc/utility");
const config = require("../misc/config.json");
const {MessageEmbed} = require("discord.js");

module.exports = {
    name: "usage",
    description: "Provides the usage a specified command.",
    usage: "usage <command name>",
    execute: function(message, args) {
        const command = args[0]
        if(message.client.commands.has(command)) {
            if(!message.client.commands.get(command).developer_only) {
                let out = new MessageEmbed()
                .setColor(utility.random_hex_colour())
                .addField(command, `${config.default_prefix}${message.client.commands.get(command).usage}`)

                message.channel.send(out);
                return;
            } else if(message.client.commands.get(command).developer_only && config.devs.includes(message.author.id)) {
                let out = new MessageEmbed()
                .setColor(utility.random_hex_colour())
                .addField(command, `${config.default_prefix}${message.client.commands.get(command).usage}`)

                message.channel.send(out);
                return;
            }
        }
        message.channel.send("Could not find the command provided!");
    }
}