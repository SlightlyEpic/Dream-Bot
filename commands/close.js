const config = require("../misc/config.json");
const {MessageEmbed} = require("discord.js");

module.exports = {
    name: "close",
    description: "Close a support ticket!",
    usage: "close",
    is_visible: false,
    execute: function(message, arguments, database) {
        if(message.channel.parent.name === config.ticket_category) {

            let ticketID = message.channel.name.split("-")[1];
            let archiveCategory = message.guild.channels.cache.find(c => c.name.toLowerCase() == `archived ${config.ticket_category}`);
            //message.channel.delete(`Ticket closed by ${message.author.username}`)
            message.channel.setParent(archiveCategory, {lockPermissions: true, reason: `Ticket closed by ${message.author.username}`})
            .then(c => {
                //let troubledPerson = message.guild.members.cache.get(tickets.activeTickets[ticketID])
                let db_ticket_info = database.get("tickets", ticketID);
                let troubledPerson = message.guild.members.cache.get(db_ticket_info[0])
    
                if(troubledPerson !== undefined) {
                    //troubledPerson.send(`Your support ticket in ${message.guild.name} was closed by ${message.author.username}.`)
    
                    let out = new MessageEmbed()
                    .setColor("RANDOM")
                    .setTitle(`Support ticket closed in ${message.guild.name}`)
                    .setAuthor(`Ticket id - ${ticketID}`)
                    .addField("Ticket closed by", message.author.username)
                    .setTimestamp()
                    .setFooter(config.bot_name, message.client.user.avatarURL())
    
                    troubledPerson.send(out);
                }
    
                //delete tickets.activeTickets[ticketID];
                database.set("tickets", ticketID, [db_ticket_info[0], db_ticket_info[1], `CLOSED BY ${message.member.displayName} - ${message.author.id}`]);
            })
        }
    }
}