const { DiscordAPIError } = require("discord.js");

module.exports = {
    name: "help",
    description: "Provides information on commands!",
    usage: "help [command]",
    help_config: {
        commands_per_page: 4
    },
    execute: function(message, args, context) {
        if(args.length == 0) {
            this.help1(message, context)
        } else {
            this.help2(message, args, context)
        }
    },
    help1: function(message, context) {
        //help without any arguments
        const commands_per_page = this.help_config.commands_per_page;
        const Discord = context.Discord;
        const utility = context.utility;

        const commands = context.client.commands.filter(c => c.is_visible).keyArray();
        const pages = [];
        let current_page_number = 0;

        for(page_number = 0; page_number < Math.ceil(commands.length / commands_per_page); page_number++) {
            pages[page_number] = commands.slice(commands_per_page * page_number, commands_per_page * (page_number + 1))
        }

        let out = new Discord.MessageEmbed()
        .setTitle("Help")
        .setColor(utility.random_hex_colour())
        .setDescription(`Page ${current_page_number + 1}`)
        .setFooter(context.config.bot_name)
        .setTimestamp()

        pages[current_page_number].forEach(c => {
            out.addField(c, context.client.commands.get(c).description)
        })

        message.channel.send(out)
        .then(m => {
            m.react("⏪"); //⏪U+23EA
            m.react("⏩"); //⏩U+23E9

            //create reaction listener and change page accordingly
            const collector = m.createReactionCollector(
                (reaction, user) => {
                    return (reaction.emoji.name === "⏪" || reaction.emoji.name === "⏩") && !user.bot
                }, {time: 120000, dispose: true, idle: 20000}
            )

            collector.on("collect", (reaction, user) => {
                switch(reaction.emoji.name) {
                    case "⏩":
                        current_page_number = (current_page_number + 1) % pages.length
                        break;
                    case "⏪":
                        current_page_number--
                        if(current_page_number < 0) {
                            //because -x % a = -(x % a)
                            current_page_number += pages.length
                        }
                        break;
                }

                let edit = new Discord.MessageEmbed()
                    .setTitle("Help")
                    .setColor(utility.random_hex_colour())
                    .setDescription(`Page ${current_page_number + 1}`)
                    .setFooter(context.config.bot_name)
                    .setTimestamp()

                pages[current_page_number].forEach(c => {
                    edit.addField(c, context.client.commands.get(c).description)
                })
                m.edit(edit);
            })

            collector.on("end", () => {
                m.reactions.removeAll();
            })
        })
    },
    help2: function(message, args, context) {
        let command = args[0];
        if(context.client.commands.has(command)) {
            if(context.client.commands.get(command).is_visible) {
                let queried_command = context.client.commands.get(command);

                let out = new context.Discord.MessageEmbed()
                .setTitle("Help")
                .setColor(context.utility.random_hex_colour())
                .setDescription(command)
                .addField("Description", queried_command.description)
                .addField("Usage", `${context.config.default_prefix}${queried_command.usage}`)
                .setFooter(context.config.bot_name)
                .setTimestamp()
                message.channel.send(out);
                return;
            }
        }
        message.channel.send("Command does not exist.");
    }
}