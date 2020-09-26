const utility = require("../misc/utility");

module.exports = {
    name: "avatar",
    description: "Displays a user's profile picture.",
    usage: "avatar [@mention]",
    execute: function(message, args, context) {
        let target = message.mentions.users.first() || message.author;
        let out = new context.Discord.MessageEmbed()
        .setColor(context.utility.random_hex_colour())
        .setTitle(`${target.username}'s avatar`)
        .setImage(target.displayAvatarURL({dynamic: true}))
        .setFooter(context.config.bot_name)
        .setTimestamp();
        message.channel.send(out);
    }
}