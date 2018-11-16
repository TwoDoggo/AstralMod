

var client;
var consts;

var currentGuild = 0;

var exec = require('child_process').exec;

function exit(channel) {
    releaseInput(currentGuild);
    currentGuild = 0;
    channel.send("Exited Arbitrary Code Execution mode.")
}

function serialise(object) {
    let m = "";

    switch (typeof(object)) {
        case "object":
            if (Promise.resolve(object) == object) {
                m = "[unresolved promise]";
                break;
            } else {
                for (key in object) {
                    m += "`" + key + "`: " + typeof(object[key]) + "\n";
                }
            }
            break;
        case "array":
            m += "[\n";
            for (key in array) {
                m += "    `" + typeof(ojb   [key]) + "`\n";
            }
            m += "]"
            break;
        case "function":
            m = "```js\n" + String(object) + "```";
            break;
        default:
            m = String(object);
    }
    return m;
}

async function processEval(message) {
    try {
        let forceOutput = false;
        let command = message.content;
        if (command.startsWith("$")) {
            command = command.substr(1);
            forceOutput = true;
        }

        let asyncFuncConstructor = Object.getPrototypeOf(async function(){}).constructor;
        let func = asyncFuncConstructor('message', 'client', 'exit', command);
        let ret = await func(message, client, () => exit(message.channel));
        let type = typeof(ret);
        let m = serialise(ret);

        if (currentGuild === 0)
            return;

        if (m == "undefined") {
            m = "[generated function had no return value]";
        }

        if ((m.length > 500 || m.split("\n").length > 5) && !forceOutput) {
            m = "[" + type + " output suppressed]";
        }

        let splitOptions = {};
        if (m.startsWith("```js")) {
            splitOptions.append = "```";
            splitOptions.prepend = "```js\n";
        }

        let mess = await message.channel.send(m, {
            split: splitOptions
        })

    } catch (err) {
        await message.channel.send(":large_orange_diamond: " + err.message.replace(client.token, "[client token redacted]"));
    }
}

function processCommand(message, isMod, command) {
    if (command == "exec") {
        if (message.author.id == "278805875978" || "123261299864895489" || "165445824090865665") {
            captureInput(processEval, message.guild.id, message.author.id);

            if (currentGuild != 0) {
                exit();
            }

            currentGuild = message.guild.id;
            message.reply("Welcome to Arbitrary Code Execution mode. Any messages from here on will be interpreted as code. To exit, use the `exit()` command.");
        } else {
            message.reply("Arbitrary code execution mode is reserved.");
        }
    }
}

module.exports = {
    name: "Evaluation",
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
                "exec"
            ]
        }
    },
    acquireHelp: function(helpCmd) {
        var help = {};

        switch (helpCmd) {
            case "eval":
                help.title = prefix + "eval";
                help.usageText = prefix + "pic user";
                help.helpText = "Returns the user's profile picture";
                help.param1 = "A user to retrieve the profile picture";
        }

        return help;
    }
}
