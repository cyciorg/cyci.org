const w = require('wumpfetch');
const isUrl = require('./isUrl');
const truncate = require('./truncate');



async function sendWebhook(webhook, { title = "LOG - Default", color = "", info = ""} = {}) {
  if (!webhook) throw new Error("WebHook empty.");
  if (!isUrl(webhook)) return;
  this.options = {title, color, info}
  if (!this.options) throw new Error("Options null.");
  if (process.env.NODE_ENV == "development") return;

    await w({
        url: webhook,
        method: 'POST',
        headers: {
            'User-Agent': `Cyci Index/Main (${require('../../package.json').version}) 2021`
        },
    }).body({
      "embeds": [
        {
          "title": `${this.options.title}`,
          "url": "https://cyci.org",
          "description": `\`\`\`${truncate(this.options.info)}\`\`\``,
          "color": this.options.color,
          "footer": {
            "text": `${new Date(Date.now())}`
          }
        }
      ]
    }).send();
}
module.exports = sendWebhook;