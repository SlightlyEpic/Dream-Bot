module.exports = class Database{

    //⟷

    /*
     * PROPERTIES
     *
     * this.Discord;
     * this.client;
     * this.data;
     * this.events;
     * this.main_guild;
     * this.parent_channel;
     * this.fields_per_embed;
     * this.has_started;
     * this.guildID;
     * this.channelID
    */

    /*
     * EVENTS
     *
     * ready();
     * ---this.retrieve_all() is successful
    */

    /* 
     * METHODS

     * start();
     *
     * on(event, callback);
     * ---event -> String: name of the event
     * ---callback -> Function: the callback function
     * 
     * retrieve_all(); #ASYNC
     * 
     * get(folder, address);
     * ---folder -> String: name of the folder
     * ---address -> String: name of the address
     * 
     * set(folder, address, value); #ASYNC
     * ---folder -> String: name of the folder
     * ---address -> String: name of the address
     * ---value -> Array<String>: values to be stored at the address
     * 
     * update(folder, address, value);
     * ---folder -> String: name of the folder
     * ---address -> String: name of the address
     * ---value -> Array<String>: values to be stored at the address
     * 
     * create_folder(folder);
     * ---folder -> String: name of the folder
     * 
     * delete_folder(folder);
     *  ---folder -> String: name of the folder
     * 
     * dispose(folder, address);
     * ---folder -> String: name of the folder
     * ---address -> String: name of the address
     * 
     * new_embed(folder, address, value); #ASYNC
     * ---folder -> String: name of the folder
     * ---address -> String: name of the address
     * ---value -> Array<String>: values to be stored at the address
     * 
     * keys(folder);
     * ---folder -> String: name of the folder
    */

    constructor(client, guildID, channelID, Discord) {
        this.Discord = Discord;
        this.client = client;
        this.guildID = guildID;
        this.channelID = channelID;
        this.fields_per_embed = 25;
        this.data = {};
        this.events = {
            ready: () => {}
        };
        this.has_started = false;
        this.main_guild = null;
        this.parent_channel = null;

    }
    
    start() {
        this.client.guilds.fetch(this.guildID, true, true)
        .then(guild => {
            this.main_guild = guild;
            this.parent_channel = this.main_guild.channels.cache.get(this.channelID);
    
            if(this.parent_channel !== undefined) { 
                if(!this.parent_channel.viewable) throw("Cannot access the given channel");
            } else {
                throw("Invalid channel ID");
            }
    
            this.retrieve_all()
            .then(was_succesful => {
                try{
                    this.events.ready(this);
                } catch(error) {
                    throw(error);
                }
            })
            
            this.has_started = true;
        })
        .catch(e => {
            throw(`Could not fetch guild! \n${e}`);
        })
    }

    on(event, callback) {
        if(typeof event !== "string") throw("event must be of type string");
        if(typeof callback !== "function") throw("callback must be of type function");

        this.events[event] = callback;
    }

    async retrieve_all() {
        this.main_guild.channels.cache.each(c => {
            if(c.parentID === this.parent_channel.id && c.type === "text" && c.viewable) {
                this.data[c.name] = {};
                this.data[c.name]["_CHANNEL"] = c;
                c.messages.fetch({limit: 100})
                .then(messages => {
                    console.log(`Fetched messages for ${c.name}`);
                    messages.each(message => {
                        if(message.author.id === this.client.user.id) {
                            message.embeds[0].fields.forEach(field => {
                                this.data[c.name][field.name] = {};
                                this.data[c.name][field.name].value = field.value.split("⟷");
                                this.data[c.name][field.name]["_MESSAGEID"] = message.id; 
                            })
                        }
                    })
                    return true;
                })
                .catch(e => {
                    console.error("Could not fetch all messages.");
                    console.error(e);
                    return false;
                })
            }
        })
    }

    get(folder, address) {
        //paths look like this "folder/address"
        if(this.data[folder] !== undefined) {
            if(this.data[folder][address] !== undefined) {
                return this.data[folder][address].value;
            } else {
                return undefined;
            }
        } else {
            return undefined;
        }
    }

    set(folder, address, value) {
        return new Promise((resolve, reject) => {
            if(this.data[folder] == undefined) reject(Error("Folder  does not exist"));
            if(this.data[folder][address] !== undefined) {
                this.update(folder, address, value)
                .then(() => {
                    resolve();
                })
                .catch(e => {
                    reject(e);
                })
            } else {  //had to use else because in the time update() resolves, this function proceeds resulting in copies key value pairs

                const current_entries = Object.keys(this.data[folder]).length - 1 //minus one because it has an extra _CHANNEL property
                const fields_in_last_embed = current_entries % this.fields_per_embed;

                this.data[folder][address] = {}

                if(fields_in_last_embed > 0) { //when field is being added to existing message
                    if(this.data[folder]["_CHANNEL"].lastMessage !== null) {
                        this.data[folder]["_CHANNEL"].messages.fetch({limit: 1})
                        .then(m => {
                            m = m.first();
                            let new_m = new this.Discord.MessageEmbed(m.embeds[0]);
                            new_m.addField(address, value.join("⟷"))

                            m.edit(new_m)
                            .then(m_ => {
                                this.data[folder][address].value = value;
                                this.data[folder][address]["_MESSAGEID"] = m_.id;
                                resolve();
                            })
                            .catch(e => {
                                console.log("Could not edit embed");
                                console.log(e);
                                reject(Error(`Could not edit embed \n${e}`));
                            })
                        })
                        .catch(e => {
                            console.log("Could not fetch messages");
                            console.log(e);
                            reject(Error(`Could not fetch messages \n${e}`));
                        })
                    } else {
                        this.new_embed(folder, address, value)
                        .then(() => {resolve();})
                        .catch(e => {reject(e);})
                    }
                } else {
                    this.new_embed(folder, address, value)
                    .then(() => {resolve();})
                    .catch(e => {reject(e);})
                }
            }
        })
    }

    update(folder, address, value) {
        return new Promise((resolve, reject) => {
            const message_id = this.data[folder][address]["_MESSAGEID"]
            this.data[folder]["_CHANNEL"].messages.fetch(message_id)
            .then(emb => {
                /*
                let new_emb = new this.Discord.MessageEmbed(emb.embeds[0]);
                new_emb.fields.forEach(field => {
                    console.log(field.name);
                    console.log(address);
                    if(field.name == address) {
                        field.value = value.join("⟷");
                    }
                })
                */
               let new_emb = new this.Discord.MessageEmbed();
               emb.embeds[0].fields.forEach(field => {
                   if(field.name !== address) {
                       new_emb.addField(field.name, field.value);
                   } else {
                       new_emb.addField(field.name, value.join("⟷"));
                   }
               })
                emb.edit(new_emb)
                .then(emb_ => {
                    this.data[folder][address].value = value;
                    resolve();
                })
                .catch(e => {
                    reject(Error(`Could not edit embed \n${e}`));
                })
            })
            .catch(e => {
                reject(Error(`Could not fetch messages \n${e}`));
            })
        })
    }

    create_folder(folder) {
        return new Promise((resolve, reject) => {
            this.main_guild.channels.create(folder, {parent: this.parent_channel.id})
            .then(c => {
                c.lockPermissions()
                .then((c_) => {
                    this.data[folder] = {};
                    this.data[folder]["_CHANNEL"] = c_;
                    console.log(`Created folder ${folder}(${c.id}) in ${this.main_guild.name}(${this.main_guild.id})`);
                    resolve(c_);
                })
                .catch(e => {
                    reject(Error(`Could not sync permissions \n${e}`));
                })
            })
            .catch(e => {
                reject(Error(`Could not create channel \n${e}`));
            })
        })
    }

    delete_folder(folder) {
        return new Promise((resolve, reject) => {
            this.data[folder]["_CHANNEL"].delete()
            .then(c => {
                delete this.data[folder];
                console.log(`Deleted folder ${folder}(${c.id}) in ${this.main_guild.name}(${this.main_guild.id})`);
                resolve(c);
            })
            .catch(e => {
                console.error(e);
                reject(Error(`Could not delete folder \n${e}`));
            })
        })
    }

    folder_exists(folder) {
        if(this.data[folder] !== undefined) {
            return true;
        } else {
            return false;
        }
    }

    dispose(folder, address) {
        return new Promise((resolve, reject) => {
            if(this.data[folder] == undefined) resolve();
            if(this.data[folder][address] == undefined) resolve();

            const message_id = this.data[folder][address]["_MESSAGEID"];
            this.data[folder]["_CHANNEL"].messages.fetch(message_id)
            .then(emb => {
                let new_emb = new this.Discord.MessageEmbed(emb.embeds[0]);

                //grab newest message
                const last_message_id = this.data[folder]["_CHANNEL"].lastMessageID;
                this.data[folder]["_CHANNEL"].messages.fetch(last_message_id)
                .then(last_message => {
                    if(emb.id === last_message_id) {
                        new_emb.fields.splice(new_emb.fields.indexOf(address), 1); //x.splice(x.indexOf(thing), 1);
                        if(new_emb.fields.length == 0) {
                            emb.delete()
                            .then(emb_ => {
                                delete this.data[folder][address];
                                resolve();
                            })
                            .catch(e => {
                                console.error(e);
                                reject(Error(`Could not delete embed \n${e}`));
                            })
                        } else {
                            emb.edit(new_emb)
                            .then(emb_ => {
                                delete this.data[folder][address];
                                resolve();
                            })
                            .catch(e => {
                                console.error(e);
                                reject(Error(`Could not edit embed \n${e}`));
                            })
                        }
                    } else {
                        let new_last_message = new this.Discord.MessageEmbed(last_message.embeds[0]);
                        let element_to_shift = new_last_message.fields.pop();

                        const index = new_emb.fields.indexOf(address);
                        new_emb.fields.splice(index, 1); //x.splice(x.indexOf(thing), 1);
                        new_emb.fields.splice(index, 0, element_to_shift);
                        emb.edit(new_emb)
                        .then(emb_ => {
                            if(new_last_message.fields.length == 0) {
                                last_message.delete()
                                .then(last_message_ => {
                                    this.data[folder][element_to_shift.name]["_MESSAGEID"] = emb_.id;
                                    delete this.data[folder][address];
                                    resolve();
                                })
                                .catch(e => {
                                    console.error(e);
                                    reject(Error(`Could not delete embed \n${e}`));
                                })
                            } else {
                                last_message.edit(new_last_message)
                                .then(last_message_ => {
                                    this.data[folder][element_to_shift.name]["_MESSAGEID"] = emb_.id;
                                    delete this.data[folder][address];
                                    resolve();
                                })
                                .catch(e => {
                                    console.error(e);
                                    reject(Error(`Could not edit embed \n${e}`));
                                })
                            }
                        })
                        .catch(e => {
                            console.error(e);
                            reject(Error(`Could not edit embed \n${e}`))
                        })
                    }
                })
                .catch(e => {
                    console.error(e);
                    reject(Error(`Could not fetch messages \n${e}`));
                })
            })
            .catch(e => {
                console.error(e);
                reject(Error(`Could not fetch messages \n${e}`));
            })
        })
    }

    new_embed(folder, address, value) {
        return new Promise((resolve, reject) => {
            this.data[folder]["_CHANNEL"].send(
                new this.Discord.MessageEmbed()
                .setColor("RANDOM")
                .addField(address, value.join("⟷"))
            )
            .then((m) => {
                this.data[folder][address].value = value;
                this.data[folder][address]["_MESSAGEID"] = m.id;
                this.data[folder]["_CHANNEL"].fetch(true)
                .then(c => {this.data[folder]["_CHANNEL"] = c});
                resolve();
            })
            .catch(e => {
                reject(Error(`Could not create an embed \n${e}`));
            })
        })
    }

    keys(folder) {
        if(this.data[folder] !== undefined) {
            return Object.keys(this.data[folder]);
        } else {
            return [];
        }
    }
}