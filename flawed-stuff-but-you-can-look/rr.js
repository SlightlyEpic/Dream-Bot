module.exports = {
    name: "rr",
    description: "Create a reaction role on a message! This is incomplete rn, dont use this.",
    usage: "rr <message id> <role id>",
    execute: function(message, args, context) {
        if(message.member.hasPermission("MANAGE_GUILD")) {
            const message_id = args[0];
            if(message_id !== undefined) {
                message.channel.messages.fetch(message_id)
                .then(m => {
                    const role_id = args[1];
                    if(role_id !== undefined) {
                        let role = message.guild.roles.cache.get(role_id);
                        if(role !== undefined) {
                            message.channel.send("React to the message you want to have the reaction role on with the desired emote!")
                            .then(msg => {
                                const collector1 = m.createReactionCollector((reaction, user) => user.id === message.author.id, {max: 1})
                                collector1.on("collect", (reaction, user) => {
                                    m.react(reaction.emoji);
                                    const collector2 = m.createReactionCollector((reaction2, user2) => reaction2.emoji.id === reaction.emoji.id && !user2.bot, {dispose: true})
                                    
                                    if(context.database.folder_exists("rr")) {
                                        context.database.set("rr", m.id, [role_id, message.channel.id, reaction.emoji.id]);
                                    } else {
                                        context.database.create_folder("rr");
                                        setTimeout(() => {context.database.set("rr", m.id, [role_id, message.channel.id, reaction.emoji.id])}, 2000);
                                    }

                                    msg.edit("Successfully created a reaction role!");

                                    collector2.on("collect", (reaction2, user2) => {
                                        let member = message.guild.members.cache.get(user2.id);
                                        if(!member.roles.cache.has(role.id)) {
                                            member.roles.add(role)
                                            .then(() => {
                                                user2.send(`You were given the ${role.name} role in ${message.guild.name}!`)
                                            })
                                            .catch((e) => {
                                                user2.send(`Could not give you the ${role.name} role in ${message.guild.name}!`);
                                                reaction2.users.remove(user2);
                                            })
                                        }
                                    })
                                    collector2.on("remove", (reaction2, user2) => {
                                        let member = message.guild.members.cache.get(user2.id);
                                        member.roles.remove(role);
                                        user2.send(`You were removed from the ${role.name} role in ${message.guild.name}!`);
                                    })

                                    collector1.stop()
                                })
                            })
                        } else {
                            message.channel.send("Could not find the role.")
                        }
                    } else {
                        message.channel.send("Please mention the role ID.");
                    }
                })
                .catch(e => {
                    message.channel.send("Could not find message.");
                })
            } else {
                message.channel.send("Please mention the message ID.");
            }
        }
    }
}