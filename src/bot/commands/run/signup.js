exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  const {MailcowApiClient } = require("../../functions/cyciAPI")
  const {WebhookClient, MessageEmbed} = require('discord.js');
  
  const web = new WebhookClient(process.env.WEBHOOK_EMAIL_ID, process.env.WEBHOOK_EMAIL_TOKEN);
// too lazy to make my own client for early app stages
//create new mailcow api client with endpoint/baseurl and the api key
const mcc = new MailcowApiClient(process.env.MAILCOW_API_BASEURL, process.env.MAILCOW_API_KEY);


  const isUrl = require('../../../utils/isUrl');
  if (!args[0]) return client.message.error(message, `You did not provide any arguments! \`cy!signup <prefix='username'> <suffix='cyci.org'> <fullName='My Name the 3rd' < max of 30 characters>\``, "(NO_ARG)", );
  if (!args[1]) return client.message.error(message, `You did not provide any arguments! \`cy!signup <prefix='username'> <suffix='cyci.org'> <fullName='My Name the 3rd' < max of 30 characters>\``, "(NO_ARG)");
  if (!client.categories.includes(args[1].toLowerCase())) return client.message.error(message, `Not a valid domain suffix!\n do \`cy!domains\` to see a list!`, "(NOT_A_DOMAIN)");
  let testing = args.slice(2).join(' ');
  if (testing.length == 0 || testing.length > 30) return client.message.error(message, `Bad arg! \`cy!signup <prefix='username'> <suffix='cyci.org'> <fullName='My Name the 3rd' < max of 30 characters>\``, "(NO_ARG)");
  var profanity = require('profanity-util');
  var checkProfanity = profanity.check(args.join(' '))

  if (checkProfanity.length >= 1) return client.message.error(message, 'No profanity!\n You are not allowed to use profanity within cyci.org or its subsidiary companies!', "(PROFANITY_FOUND)");
  const prefix = args[0].toLowerCase(), suffix = args[1].toLowerCase(), fullName = args.slice(2).join(' ');
  const checkUser = await mcc.getUser(`${prefix}@${suffix}`);
  if (checkUser[0].username != undefined) return client.message.error(message, `Existing user! \`An exisiting user was found please choose a new prefix and or suffix domain!\``, "(EXISTING_USER)");
  console.log("its hitting username check");
  client.db.query(`SELECT * FROM cyciTempSignup`, function(err, data) {
    console.log("its hitting DB query");
        if (data.length > 1) return client.message.error(message, "Too many requests", "You are being ratelimited due to having an excess amount of requests\nplease wait for us to look at them!", "(RATE_LIMITED)");
        const prefix = args[0].toLowerCase(), suffix = args[1].toLowerCase(), fullName = args.slice(2).join(' ');
        var dayjs = require('dayjs')
        
        const timestamp = dayjs(new Date()).format("YYYY,MM,DD");
        console.log("its hitting insert query");
        client.db.query(`INSERT INTO cyciTempSignup (id, prefix, suffix, name, dateAdded, fileLink) VALUES (${message.author.id}, "${prefix}", "${suffix}", "${fullName}", ${timestamp}, "${data.length+1}")`)
        console.log("Its hitting success message");
        
        
        client.message.success(message, "channel", `Requested email - ${prefix}@${suffix}-${fullName}`, `Do not fret you have been put on the waiting list\ngive us some time to look this over and soon you\nwill have your own personal email!`)
        console.log("webhook");
        const embed = new MessageEmbed().setTitle(`Requested email - ${prefix}@${suffix} [${fullName}]`).setTimestamp(timestamp).setColor("BLUE").setFooter("Give it like 2d bro");
        web.send({embed});

    })
    
  
   
    };
    
    exports.conf = {
      enabled: true,
      guildOnly: false,
      aliases: [],
      permLevel: "User",
      cooldown: 3
    };
    
    exports.help = {
      name: "signup",
      category: "Email",
      description: "Signup got an email on our service",
      usage: "signup <prefix='username'> <suffix='cyci.org'> <fullName='My Name the 3rd'>"
    };