module.exports = {
    name: "ping",
    description: "Displays the bot's ping.",
    usage: "ping",
    execute: function(message) {
        message.channel.send("Hold up...")
        .then(m => {
            m.edit(`Ping is \`${m.createdTimestamp - message.createdTimestamp}ms\`!`);
        })
    }
}