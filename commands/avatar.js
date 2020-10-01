const utility = require("../misc/utility");
const config = require("../misc/config.json");
const {MessageEmbed} = require("discord.js");

module.exports = {
    name: "avatar",
    description: "Displays a user's profile picture.",
    usage: "avatar [@mention]",
    execute: function(message) {
        let target = message.mentions.users.first() || message.author;
        let out = new MessageEmbed()
        .setColor(utility.random_hex_colour())
        .setTitle(`${target.username}'s avatar`)
        .setImage(target.displayAvatarURL({dynamic: true}))
        .setFooter(config.bot_name)
        .setTimestamp();
        message.channel.send(out);
    }
}