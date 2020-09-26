module.exports = {
    name: "usage",
    description: "Provides the usage a specified command.",
    usage: "usage <command name>",
    execute: function(message, args, context) {
        const command = args[0]
        if(context.client.commands.has(command)) {
            if(!context.client.commands.get(command).developer_only) {
                let out = new context.Discord.MessageEmbed()
                .setColor(context.utility.random_hex_colour())
                .addField(command, `${context.config.default_prefix}${context.client.commands.get(command).usage}`)

                message.channel.send(out);
                return;
            } else if(context.client.commands.get(command).developer_only && context.config.devs.includes(message.author.id)) {
                let out = new context.Discord.MessageEmbed()
                .setColor(context.utility.random_hex_colour())
                .addField(command, `${context.config.default_prefix}${context.client.commands.get(command).usage}`)

                message.channel.send(out);
                return;
            }
        }
        message.channel.send("Could not find the command provided!");
    }
}