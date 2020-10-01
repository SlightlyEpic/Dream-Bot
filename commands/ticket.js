const config = require("../misc/config.json");
const {MessageEmbed} = require("discord.js");
const debug = require("../misc/debugging.js");

module.exports = {
    name: "ticket",
    description: "Open a support ticket!",
    usage: "ticket [reason]",
    execute: function(message, arguments, database) {
        //get ticket category
        let ticket_category = message.guild.channels.cache.find(ch => {
            return ch.name.toLowerCase() == config.ticket_category && ch.type == "category";
        })
    
        //create the ticket channel
        let ticketID = Math.floor(Math.random() * 100000);
        let reason = arguments.join(" ");
        if(reason == "") {reason = "No reason provided"}
    
        while(database.keys("tickets").includes(ticketID)) {
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
    
            let out = new MessageEmbed()
            .setColor("RANDOM")
            .setTitle(`Ticket-${ticketID}`)
            .setAuthor(message.member.nickname == null ? message.author.username : message.member.nickname)
            .addField("Reason", reason)
            .addField("How do i close the ticket?", `Simply type \`${config.default_prefix}close\` to close the ticket`)
            .setTimestamp()
            .setFooter(config.bot_name, message.client.user.avatarURL());
    
            ch.send(out);       //send info embed
            ch.send(message.guild.roles.cache.find(r => r.name === config.ticket_role_name).toString());    //Ping staff
            ch.send(`<@${message.author.id}>`);        //Ping ticket creator
            message.channel.send(
                new MessageEmbed()
                .setTitle("Successfully created a ticket!")
                .setColor("RANDOM")
                )
    
            //tickets.activeTickets[ticketID] = message.author.id;
            database.set("tickets", ticketID, [message.author.id, reason, "OPEN"]);
    
            console.log(`New ticket opened by ${message.author.username} (${message.author.id}). Ticket ID: ${ticketID}. Reason: ${reason}`);
        })
        .catch(e => {
            console.error(e);
            message.channel.send("Something went wrong. Do I have permissions to create a channel?");
        })
        
    }
}