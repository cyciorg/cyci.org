/* eslint-disable no-inner-declarations */
/* eslint-disable no-undef */
module.exports = async (client, message) => {

    if (message.author.bot) return;
    let prefix = [`<@!${client.user.id}> `,`cy!`].find(p => message.content.toLowerCase().indexOf(p) === 0)

    if (!prefix) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if (message.guild && !message.member) await message.guild.fetchMember(message.author);
    const level = client.permlevel(message);

    const cmd = client.commands.get(command) || client.commands.get(client.aliases.get(command));

    if (!cmd) return;

    if (cmd && !message.guild) return;

    if (level < client.levelCache[cmd.conf.permLevel]) return client.global.message.error(message, "channel", "(LEVEL_NOT_MET)", `You do not have permission to run this.`)
    const Discord = require('discord.js');
    if (!client.cooldown.has(cmd.help.name)) {
        client.cooldown.set(cmd.help.name, new Discord.Collection());
    }
    const now = Date.now(),timestamps = client.cooldown.get(cmd.help.name),cooldownAmount = (cmd.conf.cooldown || 3) * 1000;
    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return client.message.error(message, `please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${cmd.help.name}\` command.`, "(COMMAND_ON_COOLDOWN)")
        }
    }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    message.author.permLevel = level;

    //if (client.global.getGuild(message.guild.id).channel === null) {
        client.log.log(`${client.config.permLevels.find(l => l.level === level).name} ${message.author.username} (${message.author.id}) ran command [${cmd.help.name}] in (${message.guild.id})`);
        cmd.run(client, message, args, level);
};