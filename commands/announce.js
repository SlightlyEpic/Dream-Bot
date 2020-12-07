let { MessageEmbed } = require("discord.js")
let config = require("../misc/config.json")
let utility = require("../misc/utility.js")

module.exports = {
    name: "announce",
    description: "Sends an announcement message in the specified channel",
    usage: "announce [#channel]",
    permissions: ["MANAGE_GUILD"],
    is_visible: false,
    execute: async function(message, args, database) {
        if(message.member.hasPermission(this.permissions)) {
            message.channel.send('It is higly recommended that you use Lipid\'s webhook sender instead of this.');
            let channel = message.mentions.channels.first();
            message.channel.send('Will this message be an embed? (y/n)');
            if(channel) {
                message.channel.awaitMessages(m => m.author.id == message.author.id, {
                    max: 1, time: 20000, errors: ['time']
                })
                .then(collected => {
                    let m = collected.first();
                    switch(m.content.toLowerCase()) {
                        case 'y':
                            this.constructEmbed(message)
                            .then(emb => {
                                channel.send(emb);
                            })
                            .catch(err => {
                                message.channel.send(err);
                            })
                            break;
                        case 'n':
                            message.channel.send(`Please send the message you would like sent to ${channel.toString()}`);
                            message.channel.awaitMessages(m => m.author.id == message.author.id, {
                                max: 1, time: 20000, errors: ['time']
                            })
                            .then(collected => {
                                let toSend = collected.first()
                                channel.send(toSend.content, {files: toSend.attachments});
                            })
                            .catch(collected => {
                                message.channel.send('Timed out. Please start over.');
                            })
                            break;
                        default:
                            message.channel.send('Invalid input. Please start over.');
                            break;  
                    }
                })
            }
        }
    },

    constructEmbed: function(message) {
        return new Promise((resolve, reject) => {
            let out = new MessageEmbed();
            let currentStep = 0;
            let fields = []; 
            let steps = [
                {
                    q: 'What should be the embed title? (\`none\` to skip)', cb: (em, inp) => {
                        if(inp.toLowerCase() == 'none') {
                            currentStep++;
                        } else {
                            em.setTitle(inp);
                            currentStep++;
                        }
                    }
                },
                {
                    q: 'What should be the embed description? (\`none\` to skip)', cb: (em, inp) => {
                        if(inp.toLowerCase() == 'none') {
                            currentStep++;
                        } else {
                            em.setDescription(inp);
                            currentStep++;
                        } 
                    }
                },
                {
                    q: 'Field name? (\`none\` to skip)', cb: (em, inp) => {
                        if(inp.toLowerCase() == 'none') {
                            currentStep += 3;
                        } else {
                            fields.push(inp);
                            currentStep++;
                        }
                    }
                },
                {
                    q: 'Field value?', cb: (em, inp) => {
                        fields.push(inp);
                        currentStep++;
                    }
                },
                {
                    q: 'Do you want to add another field? (y/n)', cb: (em, inp) => {
                        switch(inp.toLowerCase()) {
                            case 'y':
                                currentStep -= 2;
                                break;
                            case 'n':
                                currentStep++;
                                break;
                            default:
                                message.channel.send('Invalid input');
                                break;
                        }
                    }
                },
                {
                    q: 'What should the footer be? (\`none\` to skip)', cb: (em, inp) => {
                        if(inp.toLowerCase() == 'none') {
                            currentStep++;
                        } else {
                            em.setFooter(inp);
                            currentStep++;
                        }
                    }
                },
                {
                    q: 'Do you want it to have a timestamp? (y/n)', cb: (em, inp) => {
                        switch(inp.toLowerCase()) {
                            case 'y':
                                em.setTimestamp();
                                currentStep++
                                break;
                            case 'n':
                                currentStep++;
                                break;
                            default:
                                message.channel.send('Invalid input.');
                                return;
                        }
                        for(i = 0; i < fields.length; i += 2) {
                            let name = fields[i];
                            let value = fields[i+1];
                            out.addField(name, value);
                        }
                    }
                },
                {
                    q: 'This is what the embed looks like, do you wish to send it? (y/n)', cb: (em, inp) => {
                        switch(inp.toLowerCase()) {
                            case 'y':
                                currentStep = -1;
                                collector.stop();
                                resolve(out);
                                break;
                            case 'n':
                                currentStep = -1;
                                collector.stop();
                                reject(Error('Cancelled'));
                                break;
                            default:
                                message.channel.send('Invalid input.');
                        }
                    }, e: out
                }
            ];
            let collector = message.channel.createMessageCollector(m => m.author.id == message.author.id, {time: 900000}); //15 mins
            message.channel.send(steps[currentStep].q);
            collector.on('collect', m => {
                if(currentStep != -1) {
                    steps[currentStep].cb(out, m.content);
                    let cur = steps[currentStep];
                    if(!cur.e) message.channel.send(cur.q)
                    else message.channel.send(cur.q, {embed: cur.e})
                }
            })
            collector.on('end', reason => {
                if(reason == 'time') {
                    message.channel.send(`Timed out. Terminating construction sequence.`);
                    reject('time');
                }
            })
        })
    }
}