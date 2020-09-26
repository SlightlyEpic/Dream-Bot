module.exports = {
    name: "ticket",
    description: "Contact the support team!",
    usage: "ticket [reason]",
    execute: function(message, arguments, context) {
        let Discord = context.Discord;

        //get ticket category
        let ticket_category = message.guild.channels.cache.find(ch => ch.name.toLowerCase() == context.config.ticket_category && ch.type == "category");

        //create the ticket channel
        let ticketID = Math.floor(Math.random() * 100000);
        let reason = arguments.join(" ");
        if(reason == "") {reason = "No reason provided"}

        while(Object.keys(tickets.activeTickets).includes(ticketID)) {
            ticketID = Math.floor(Math.random() * 100000);
        } //gets rid of duplicate ticket ids

        message.guild.channels.create(`ticket-${ticketID}`, {
            type: "text",
            topic: `Ticket id <${ticketID}>. Ticket support team is on their way!`,
            parent: ticket_category
        })
        .then(ch => {
            ch.lockPermissions()
            .then(ch_ => {
                ch_.updateOverwrite(message.author, {
                    'SEND_MESSAGES': true,
                    'EMBED_LINKS': true,
                    'ATTACH_FILES': true,
                    'VIEW_CHANNEL': true
                   })
            })

            let out = new Discord.MessageEmbed()
            .setColor(context.config.embedColour)
            .setTitle(`Ticket-${ticketID}`)
            .setAuthor(message.member.nickname == null ? message.author.username : message.member.nickname)
            .addField("Reason", reason)
            .addField("How do i close the ticket?", `Simply type \`${context.config.prefix}close\` to close the ticket`)
            .setTimestamp()
            .setFooter(context.config.bot_name, config.client.user.avatarURL());

            ch.send(out);       //send info embed
            ch.send(message.guild.roles.cache.find(r => r.name === context.config.ticket_role_name).toString());    //Ping staff
            ch.send(`<@${message.author.id}>`);        //Ping ticket creator
            message.channel.send(
                new Discord.MessageEmbed()
                .setTitle("Successfully created a ticket!")
                .setColor(context.config.embedColour)
                )

            //tickets.activeTickets[ticketID] = message.author.id;
            context.database.set("tickets", ticketID, [message.author.id]);

            console.log(`New ticket opened by ${message.author.username} (${message.author.id}). Ticket ID: ${ticketID}. Reason: ${reason}`);
        })
        .catch(e => {
            console.error(e);
            message.channel.send("Something went wrong. Do I have permissions to create a channel?");
        })
    }
}