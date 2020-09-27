const ticket = require("./ticket");

module.exports = {
    name: "close",
    description: "Close a support ticket!",
    usage: "close",
    is_visible: false,
    execute: function(message, arguments, context) {
        if(message.channel.parent.name === context.config.ticket_category) {

            let ticketID = message.channel.name.split("-")[1];
            let archiveCategory = message.guild.channels.cache.find(c => c.name.toLowerCase() == `archived ${context.config.ticket_category}`);
            //message.channel.delete(`Ticket closed by ${message.author.username}`)
            message.channel.setParent(archiveCategory, {lockPermissions: true, reason: `Ticket closed by ${message.author.username}`})
            .then(c => {
                //let troubledPerson = message.guild.members.cache.get(tickets.activeTickets[ticketID])
                let db_ticket_info = context.database.get("tickets", ticketID);
                let troubledPerson = message.guild.members.cache.get(db_ticket_info[0])
    
                if(troubledPerson !== undefined) {
                    //troubledPerson.send(`Your support ticket in ${message.guild.name} was closed by ${message.author.username}.`)
    
                    let out = new context.Discord.MessageEmbed()
                    .setColor("RANDOM")
                    .setTitle(`Support ticket closed in ${message.guild.name}`)
                    .setAuthor(`Ticket id - ${ticketID}`)
                    .addField("Ticket closed by", message.author.username)
                    .setTimestamp()
                    .setFooter(context.config.bot_name, context.client.user.avatarURL())
    
                    troubledPerson.send(out);
                }
    
                //delete tickets.activeTickets[ticketID];
                context.database.set("tickets", ticketID, [db_ticket_info[0], db_ticket_info[1], `CLOSED BY ${message.member.displayName} - ${message.author.id}`]);
            })
        }
    }
}