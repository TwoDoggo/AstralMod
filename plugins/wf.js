const Discord = require('discord.js');
const staffChannelID = "283109848693080064";
var client;
var consts;
let messages = {};

var currentWarnings = {};

function processCommand(message, isMod, command) {
    if (settings.guilds[message.guild.id] == null) {
        settings.guilds[message.guild.id] = {};
    }

    if (settings.guilds[message.guild.id].roles == null) {
        settings.guilds[message.guild.id].roles = [];
    }

    if (settings.guilds[message.guild.id].prizes == null) {
        settings.guilds[message.guild.id].prizes = [];
    }


    if (settings.guilds[message.guild.id].users == null) {
        settings.guilds[message.guild.id].users = {};
    }

    if (settings.guilds[message.guild.id].users[message.author.id] == null) {
        settings.guilds[message.guild.id].users[message.author.id] = {};
    }

    if (settings.guilds[message.guild.id].users[message.author.id].points == null) {
        settings.guilds[message.guild.id].users[message.author.id].points = 0;
    }

    if (isMod) {
        if (command.startsWith("togglerole ")) {
            let roleText = command.substr(11);

            let selectedRole = null;
            for (let [id, role] of message.guild.roles) {
                if (role.name.toLowerCase().indexOf(roleText.toLowerCase()) != -1) {
                    selectedRole = role;
                    break;
                }
            }

            if (selectedRole == null) {
                message.reply("Couldn't toggle that role");
            } else {
                if (settings.guilds[message.guild.id].roles.includes(selectedRole.id)) {
                    settings.guilds[message.guild.id].roles.splice(settings.guilds[message.guild.id].roles.indexOf(selectedRole.id), 1);
                    message.reply(selectedRole.name + " has been disabled for self-role.");
                } else {
                    settings.guilds[message.guild.id].roles.push(selectedRole.id);
                    message.reply(selectedRole.name + " has been enabled for self-role.");
                }
            }
        } else if (command.startsWith("addprize ")) {
            let prizeArgs = command.substr(9);
            let prizePrice = prizeArgs.substr(0, prizeArgs.indexOf(" "));
            let prizeName = prizeArgs.substr(prizeArgs.indexOf(" ") + 1);

            if (parseInt(prizePrice) != prizePrice) {
                message.reply("Invalid Price");
                return;
            }
            prizePrice = parseInt(prizePrice);

            for (let key in settings.guilds[message.guild.id].prizes) {
                let prize = settings.guilds[message.guild.id].prizes[key];
                if (prize.name.toLowerCase() == prizeName.toLowerCase()) {
                    message.reply(prizeName + " already exists");
                    return;
                }
            }

            settings.guilds[message.guild.id].prizes.push({
                name: prizeName,
                value: prizePrice
            });

            message.reply(prizeName + " was added with a value of " + prizePrice + " points.");
        } else if (command.startsWith("rmprize ")) {
            let prizeName = command.substr(8);

            for (let key in settings.guilds[message.guild.id].prizes) {
                let prize = settings.guilds[message.guild.id].prizes[key];
                if (prize.name.toLowerCase() == prizeName.toLowerCase()) {
                    settings.guilds[message.guild.id].prizes.splice(key, 1);
                    message.reply(prizeName + " removed");
                    return;
                }
            }

            message.reply(prizeName + " doesn't exist.");
        } else if (command.startsWith("addpoints ")) {
            let prizeArgs = command.substr(10);
            let prizePrice = prizeArgs.substr(0, prizeArgs.indexOf(" "));
            let user = prizeArgs.substr(prizeArgs.indexOf(" ") + 1);

            if (parseInt(prizePrice) != prizePrice) {
                message.reply("Invalid Price");
                return;
            }
            prizePrice = parseInt(prizePrice);

            var users = parseUser(user, message.guild);
            if (users.length > 0) {
                let user = null;

                //Filter out members
                for (var i = 0; i < users.length; i++) {
                    if (message.guild.members.has(users[i].id)) {
                        user = users[i].id;
                        i = users.length;
                    }
                }

                if (user == null) {
                    throw new CommandError("No user found with that name on this server");
                } else {
                    message.channel.send("**" + client.users.get(user).tag + "**: " + settings.guilds[message.guild.id].users[user].points + " + " + prizePrice + " = " + (settings.guilds[message.guild.id].users[user].points + prizePrice));
                    settings.guilds[message.guild.id].users[user].points += prizePrice;
                }
            } else {
                throw new CommandError("No user found with that name");
            }
        }
    }

    if (command.startsWith("addrole ")) {
        let desiredRoleName = command.substr(8);
        for (key in settings.guilds[message.guild.id].roles) {
            let roleId = settings.guilds[message.guild.id].roles[key];
            let role = message.guild.roles.get(roleId);
            if (role.name.toLowerCase().indexOf(desiredRoleName) != -1) {
                //Add role
                if (message.member.roles.has(roleId)) {
                    message.reply("You already have this role");
                } else {
                    message.member.addRole(role, "User Requested");
                    message.reply("You now have the " + role.name + " role.");
                }
                return;
            }
        }

        message.reply("Couldn't find a role to add you to.");
    } else if (command.startsWith("rmrole ")) {
        let desiredRoleName = command.substr(7);
        for (key in settings.guilds[message.guild.id].roles) {
            let roleId = settings.guilds[message.guild.id].roles[key];
            let role = message.guild.roles.get(roleId);
            if (role.name.toLowerCase().indexOf(desiredRoleName) != -1) {
                //Remove role
                if (!message.member.roles.has(roleId)) {
                    message.reply("You don't have this role");
                } else {
                    message.member.removeRole(role, "User Requested");
                    message.reply("You no longer have the " + role.name + " role.");
                }
                return;
            }
        }

        message.reply("Couldn't find a role to remove you from.");
    } else if (command.startsWith("prizes")) {
        let reply = "```";

        for (let key in settings.guilds[message.guild.id].prizes) {
            let prize = settings.guilds[message.guild.id].prizes[key];
            reply += prize.name + " - " + prize.value + " points \n"
        }

        reply += "```";

        message.channel.send(reply);
    } else if (command.startsWith("claim ")) {
        let prizeName = command.substr(6);
        
        for (let key in settings.guilds[message.guild.id].prizes) {
            let prize = settings.guilds[message.guild.id].prizes[key];
            if (prize.name.toLowerCase() == prizeName.toLowerCase()) {
                let points = settings.guilds[message.guild.id].users[message.author.id].points;

                if (prize.value > points) {
                    message.reply("You don't have enough points to redeem that prize");
                } else {
                    points -= prize.value;
                    client.channels.get(staffChannelID).send(message.author.tag + " claimed " + prize.name);
                    message.reply("You have claimed " + prize.name + " for " + prize.value + " points");
                }

                settings.guilds[message.guild.id].users[message.author.id].points = points;
                return;
            }
        }

        message.reply("Couldn't find the prize you wanted to claim");
    } else if (command.startsWith("bal")) {
        message.reply("You have " + settings.guilds[message.guild.id].users[message.author.id].points + " points");
    }
}

function newMessage(message) {
    if (settings.guilds[message.guild.id].users == null) {
        settings.guilds[message.guild.id].users = {};
    }

    if (settings.guilds[message.guild.id].users[message.author.id] == null) {
        settings.guilds[message.guild.id].users[message.author.id] = {};
    }

    if (settings.guilds[message.guild.id].users[message.author.id].points == null) {
        settings.guilds[message.guild.id].users[message.author.id].points = 0;
    }

    if (message.attachments && message.attachments.size > 0) {
        settings.guilds[message.guild.id].users[message.author.id].points += 2;
    } else {
        if (messages[message.author.id] == null) {
            messages[message.author.id] = 0;
        }

        messages[message.author.id]++;

        if (messages[message.author.id] == 10) {
            messages[message.author.id] = 0;
            settings.guilds[message.guild.id].users[message.author.id].points += 1;
        }
    }
}

module.exports = {
    name: "WorkFlow",
    constructor: function(discordClient, commandEmitter, constants) {
        client = discordClient;
        consts = constants;

        commandEmitter.on('processCommand', processCommand);
        commandEmitter.on('newMessage', newMessage);
    },
    destructor: function(commandEmitter) {
        commandEmitter.removeListener('processCommand', processCommand);
        commandEmitter.removeListener('newMessage', newMessage);
    },
    availableCommands: {
        general: {
            commands: [
                "addrole",
                "rmrole",
                "prizes",
                "bal",
                "claim"
            ],
            modCommands: [
                "togglerole"
            ]
        }
    },
    acquireHelp: function(helpCmd) {
        var help = {};

        switch (helpCmd) {
            case "togglerole":
                help.title = prefix + "togglerole";
                help.usageText = prefix + "togglerole [role]";
                help.helpText = "Toggles a role for self assign.";
                help.param1 = "The role to toggle";
                break;
            case "addrole":
                help.title = prefix + "addrole";
                help.usageText = prefix + "addrole [role]";
                help.helpText = "Add yourself to a role.";
                help.param1 = "The role to add yourself to";
                break;
            case "rmrole":
                help.title = prefix + "rmrole";
                help.usageText = prefix + "rmrole [role]";
                help.helpText = "Remove yourself from a role.";
                help.param1 = "The role to remove yourself from";
                break;
            case "claim":
                help.title = prefix + "claim";
                help.usageText = prefix + "claim [prize]";
                help.helpText = "Claim a prize.";
                help.param1 = "The prize you wish to claim";
                break;
            case "prizes":
                help.title = prefix + "prizes";
                help.usageText = prefix + "prizes";
                help.helpText = "Show available prizes.";
                break;
            case "bal":
                help.title = prefix + "bal";
                help.usageText = prefix + "bal";
                help.helpText = "Show your balance.";
                break;
        }

        return help;
    }
}
