exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
    client.global.message.success(message, "channel", "Help", `__**Commands**__:\n\`help <- this\`\n\`ping\`\n\`upload <Category> <Link>\`\n\`categories\`\n\`token\``);
  };
  
  exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: [],
    permLevel: "User",
    cooldown: 3
  };
  
  exports.help = {
    name: "help",
    category: "System",
    description: "shows you the available commands",
    usage: "help"
  };