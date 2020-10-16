module.exports = {

    remove_empty_strings: function(arr) {
        if(!Array.isArray(arr)) return null;

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
        let isListening = false;
        presence.activities.forEach(activity => {
            if(activity.name == "Spotify" && activity.type == "LISTENING") {
                isListening = true;
            }
        })
        return isListening;
    },

    wait: function(ms) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve()
            }, ms)
        })
    }
}