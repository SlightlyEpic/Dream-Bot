module.exports = {

    remove_empty_strings: function(arr) {

        if(!Array.isArray(arr)) return null

        let out = [];
        arr.forEach(e => {
            if(e !== "") out.push(e);
        })

        return out;
    },

    random_hex_colour: function() {
        let n = (Math.random() * 0xfffff * 1000000).toString(16);
        return '#' + n.slice(0, 6);
    },

    listening_to_spotify: function(presence) {
        let isSpotify = false;
        presence.activities.forEach(activity => {
            if(activity.name == "Spotify" && activity.type == "LISTENING") {
                isSpotify = true;
            }
        })
        return isSpotify;
    },

    checkTicketSetup: function (guild) {

        let tRole = guild.roles.cache.find(r => r.name === config.ticketRoleName);
    
        if(tRole == undefined) {
            guild.roles.create({
                data: {
                    name: config.ticketRoleName,
                    hoist: true,
                    mentionable: true,
                    color: "#31eb63"
                },
                reason: "Ticket Support role"
            }).then(r => {
                console.log(`Created ticket support role for ${guild.name} - ${guild.id}`);
                tRole = r;
            })
        } //create the Ticket Support Role
    
    
        if(guild.channels.cache.find(ch => ch.name.toLowerCase() == config.ticketCategory && ch.type == "category") == undefined) {
            guild.channels.create(config.ticketCategory, {
                type: "category"
            })
            .then(category => { //disable view for @everyone
                category.createOverwrite(guild.roles.everyone, {
                    VIEW_CHANNEL: false
                })
                .then(category_ => {
                    //enable view for Ticket Support
                    category_.createOverwrite(tRole, {
                        VIEW_CHANNEL: true
                    })
                })
                .catch(e => {
                    console.log("Couldnt change permissions for ticket category")
                })
            })
            .catch(e => {
                console.log("Couldnt create category");
            })
        }
    }

}