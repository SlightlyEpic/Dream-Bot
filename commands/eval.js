module.exports = {
    name: "eval",
    description: "Evaluate",
    usage: "yeet",
    developer_only: true,
    is_visible: false,
    execute: function(message, arguments, context) {
        if(context.config.developers.includes(message.author.id)) {
            const inp = message.content.substring(this.name.length + 1);
            
            const client = context.client;
            const Discord = context.Discord;
            const db = context.database;
            const utility = context.utility;
            try {
                eval(inp);
            } catch (error) {
                let out = new context.Discord.MessageEmbed()
                .setColor(context.utility.random_hex_colour())
                .setTitle("Evaluate")
                .addField("Input", `\`\`\`${inp}\`\`\``)
                .addField("Error", `\`\`\`${error}\`\`\``)
                .setFooter(context.config.bot_name)
                .setTimestamp();
                
                message.channel.send(out);
            }
        }
    }
}