module.exports = {
    name: "ticket",
    description: "Contact the support team!",
    usage: "ticket [reason]",
    is_visible: false,
    execute: function(message, arguments, context) {
        if(message.channel.parent.name === config.ticket_category) {

            let ticketID = message.channel.name.split("-")[1];
            message.channel.delete(`Ticket closed by ${message.author.username}`)
            .then(c => {
                let troubledPerson = message.guild.members.cache.get(tickets.activeTickets[ticketID])
    
                if(troubledPerson !== undefined) {
                    //troubledPerson.send(`Your support ticket in ${message.guild.name} was closed by ${message.author.username}.`)
    
                    let out = new context.Discord.MessageEmbed()
                    .setColor(config.embedColour)
                    .setTitle(`Support ticket closed in ${message.guild.name}`)
                    .setAuthor(`Ticket id - ${ticketID}`)
                    .addField("Ticket closed by", message.author.username)
                    .setTimestamp()
                    .setFooter(config.bot_name, context.client.user.avatarURL())
    
                    troubledPerson.send(out);
                }
    
                delete tickets.activeTickets[ticketID];
            })
        }
    }
}