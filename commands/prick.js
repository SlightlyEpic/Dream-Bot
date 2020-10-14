module.exports = {
    name: "prick",
    description: "Declares a user a prick",
    usage: "prick <@mention>",
    execute: function(message) {
        let target = message.mentions.users.first();
        if(target) {
            message.channel.send(`${target.toString()} was declared a prick.`);
        } else {
            message.channel.send("You need to mention someone.")
        }
    }
}