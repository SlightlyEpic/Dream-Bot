const utility = require("../misc/utility");
const config = require("../misc/config.json");
const {MessageEmbed} = require("discord.js");

module.exports = {
    name: "help",
    description: "Provides information on commands!",
    usage: "help [command]",
    help_config: {
        commands_per_page: 4
    },
    execute: function(message, args) {
        if(args.length == 0) {
            this.help1(message)
        } else {
            this.help2(message, args)
        }
    },
    help1: function(message) {
        //help without any arguments
        const commands_per_page = this.help_config.commands_per_page;

        const commands = message.client.commands.filter(c => c.is_visible).keyArray();
        const pages = [];
        let current_page_number = 0;

        for(page_number = 0; page_number < Math.ceil(commands.length / commands_per_page); page_number++) {
            pages[page_number] = commands.slice(commands_per_page * page_number, commands_per_page * (page_number + 1))
        }

        let out = new MessageEmbed()
        .setTitle("Help")
        .setColor(utility.random_hex_colour())
        .setDescription(`Page ${current_page_number + 1}`)
        .setFooter(config.bot_name)
        .setTimestamp()

        pages[current_page_number].forEach(c => {
            out.addField(c, message.client.commands.get(c).description)
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

                let edit = new MessageEmbed()
                    .setTitle("Help")
                    .setColor(utility.random_hex_colour())
                    .setDescription(`Page ${current_page_number + 1}`)
                    .setFooter(config.bot_name)
                    .setTimestamp()

                pages[current_page_number].forEach(c => {
                    edit.addField(c, message.client.commands.get(c).description)
                })
                m.edit(edit);
            })

            collector.on("end", () => {
                m.reactions.removeAll();
            })
        })
    },
    help2: function(message, args) {
        let command = args[0];
        if(message.client.commands.has(command)) {
            if(message.client.commands.get(command).is_visible) {
                let queried_command = message.client.commands.get(command);

                let out = new MessageEmbed()
                .setTitle("Help")
                .setColor(utility.random_hex_colour())
                .setDescription(command)
                .addField("Description", queried_command.description)
                .addField("Usage", `${config.default_prefix}${queried_command.usage}`)
                .setFooter(config.bot_name)
                .setTimestamp()
                message.channel.send(out);
                return;
            }
        }
        message.channel.send("Command does not exist.");
    }
}