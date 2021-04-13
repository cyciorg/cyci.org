exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
    message.delete();
    const msg = await message.channel.send("Ping?");
    msg.edit(`Pong! Latency is ${msg.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ws.ping)}ms`);
  };
  
  exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: [],
    permLevel: "User",
    cooldown: 3
  };
  
  exports.help = {
    name: "ping",
    category: "System",
    description: "Get bots ping",
    usage: "ping"
  };