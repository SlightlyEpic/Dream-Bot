module.exports = {
    name: "disable",
    description: "Disables a certain command's usage on the server.",
    usage: "disable <command name>",
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
                    //disable command
                    database.set("config", `commands-${targetCommand}`, ["0"])
                    .then(wasSuccesful => {
                        //if(wasSuccesful) message.channel.send(`Successfully disabled ${targetCommand}!`);
                        //else message.channel.send(`Could not disable ${targetCommand}. Failed to write to db.`);
                        message.channel.send(`Successfully disabled ${targetCommand}!`);
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