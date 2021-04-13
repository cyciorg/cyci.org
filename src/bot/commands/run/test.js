exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars

  var profanity = require('profanity-util');
  var test = profanity.check(args.join(' '))
  console.log(test.length >= 1 ? "HEY": "HEY ??");
  };
  
  
  exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: [],
    permLevel: "User",
    cooldown: 3
  };
  
  exports.help = {
    name: "test",
    category: "System",
    description: "Get bots ping",
    usage: "ping"
  };