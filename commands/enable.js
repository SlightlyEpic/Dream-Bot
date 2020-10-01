module.exports = {
    name: "enable",
    description: "Enables a certain command's usage on the server.",
    usage: "enable <command name>",
    permissions: ["MANAGE_GUILD"],
    is_visible: false,
    execute: function(message, args, database) {
        //check for permissions
        let executor = message.member;
        if(executor.hasPermission(this.permissions, {checkAdmin: true, checkOwner: true})) {
            //check if arguments are valid
            let targetCommand = args[0];
            if(message.client.commands.has(targetCommand)) {
                if(!message.client.commands.get(targetCommand).developer_only) {
                    //enable command
                    database.set("config", `commands-${targetCommand}`, ["1"])
                    .then(wasSuccessful => {
                        //if(wasSuccessful) message.channel.send(`Successfully enabled ${targetCommand}!`);
                        //else message.channel.send(`Could not enable ${targetCommand}. Failed to write to db.`);
                        message.channel.send(`Successfully enabled ${targetCommand}!`);
                    })
                } else {
                    message.channel.send("Could not find that command")
                }
            } else {
                message.channel.send("Could not find that command")
            }
        } else {
            message.channel.send("You do not have sufficient permissions");
        }
    }
}