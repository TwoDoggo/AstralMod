var client;
var consts;

function processCommand(message, isMod, command) {
    if (command == "retrsettings") {
        if (message.author.id == 123261299864895489 || message.author.id == 165445824090865665 || message.author.id == 278805875978928128) {
            var contents = JSON.stringify(settings, null, 4);
            message.author.send("Here are the settings for AstralMod at the moment.", {
                files: [
                    {
                        attachment: Buffer.from(contents, "utf8"),
                        name: "settings.json"
                    }
                ]
            });
            message.reply("Ok, I'm sending you my settings in your DMs.");
        } else {
            message.reply("I can't send you my settings file.");
        }
    }
}

module.exports = {
    name: "Settings Retrieval",
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

            ],
            modCommands: [
                
            ],
            hiddenCommands: [
                "retrsettings"
            ]
        }
    },
    acquireHelp: function(helpCmd) {
        var help = {};

        switch (helpCmd) {
            case "retrsettings":
                help.title = "am:retrsettings";
                help.usageText = "am:retrsettings";
                help.helpText = "Retrieves AstralMod settings in a DM";
                help.remarks = "Only vicr123#5096 can use this command.";
                break;
        }

        return help;
    }
}
