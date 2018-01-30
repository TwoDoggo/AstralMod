/****************************************
 *
 *   Warnings: Plugin for AstralMod that manages warnings
 *   Copyright (C) 2017 Victor Tran
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 *
 *   You should have received a copy of the GNU General Public License
 *   along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * *************************************/

const Discord = require('discord.js');
var client;
var consts;

var currentWarnings = {};

function processCommand(message, isMod, command) {
    if (settings[message.guild.id] == null) {
        settings[message.guild.id] = {};
    }

    if (settings[message.guild.id].roles == null) {
        settings[message.guild.id].roles = [];
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
                if (settings[message.guild.id].roles.includes(selectedRole.id)) {
                    settings[message.guild.id].roles.splice(settings[message.guild.id].roles.indexOf(selectedRole.id), 1);
                    message.reply(selectedRole.name + " has been disabled for self-role.");
                } else {
                    settings[message.guild.id].roles.push(selectedRole.id);
                    message.reply(selectedRole.name + " has been enabled for self-role.");
                }
            }
        }
    }

    if (command.startsWith("addrole ")) {
        let desiredRoleName = command.substr(8);
        for (key in settings[message.guild.id].roles) {
            let roleId = settings[message.guild.id].roles[key];
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
        for (key in settings[message.guild.id].roles) {
            let roleId = settings[message.guild.id].roles[key];
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
    }
}

module.exports = {
    name: "WorkFlow",
    constructor: function(discordClient, commandEmitter, constants) {
        client = discordClient;
        consts = constants;

        commandEmitter.on('processCommand', processCommand);
    },
    destructor: function(commandEmitter) {
        commandEmitter.removeListener('processCommand', processCommand);
    },
    availableCommands: {
        general: {
            commands: [
                "addrole",
                "rmrole"
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
        }

        return help;
    }
}
