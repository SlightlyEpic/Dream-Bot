const config = require("../misc/config.json");

module.exports = {
    name: "inviteme",
    description: "Gives a link to the bot invite!",
    usage: "inviteme",
    execute: function(message) {
        //message -> Discord.Message

        message.channel.send(`Invite me using this link! \n\<${config.bot_invite}>`);
    }
}