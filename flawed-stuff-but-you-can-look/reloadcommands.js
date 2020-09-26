module.exports = {
    name: "reloadcommands",
    description: "Re-imports all command files.",
    usage: "reloadcommands",
    developer_only: true,
    is_visible: false,
    execute: function(message, args, context) {
        //message -> Discord.Message
        //args -> String[]
        //context -> Object
        //context.client -> Discord.Client()
        //context.config -> Object

        context.client.reload_commands(); //dosent work because call by reference :|
    }
}