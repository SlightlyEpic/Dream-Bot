module.exports = {
    name: "inviteme",
    description: "Gives a link to the bot invite!",
    usage: "inviteme",
    execute: function(message, args, context) {
        //message -> Discord.Message
        //args -> String[]
        //context -> Object
        //context.client -> Discord.Client()
        //context.config -> Object
        //context.Discrd -> discord.js

        message.channel.send(`Invite me using this link! \n\<${context.config.bot_invite}>`);
    }
}