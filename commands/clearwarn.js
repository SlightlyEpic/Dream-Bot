module.exports = {
    name: "clearwarn",
    description: "Remove a warning",
    usage: "clearwarn <case ID>",
    permissions: ["MANAGE_GUILD"],
    is_visible: false,
    execute: async function(message, args, database) {
        let caseID = args[0];
        if(caseID) {
            let d = database.get("warn-log", caseID);
            if(d !== undefined) {
                database.dispose("warn-log", caseID)
                .then(() => {message.channel.send(`Successfully removed the warning for case ${caseID}`)})
                .catch(() => {message.channel.send("An error occured while trying to remove the warning")})
            } else {
                message.channel.send("Invalid case ID.")
            }
        } else {
            message.channel.send("Please provide a case ID.")
        }
    }
}