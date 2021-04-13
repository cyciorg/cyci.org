const config = {

    ownerIDS: ["393996898945728523", "188712985475284996"],
    staffIDS: [],
    uploaders: ["599607109986025502"],

    permLevels: [
        { level: 0,
          name: "User", 
          check: () => true
        },
        { level: 8,
          name: "Uploaders",
          check: (message) => config.uploaders.includes(message.author.id)
        },
        { level: 9,
          name: "Bot Staff",
          check: (message) => config.staffIDS.includes(message.author.id)
        },
        { level: 10,
          name: "Bot Owner", 
          check: (message) => config.ownerIDS.includes(message.author.id)
        }
      ]
    };

module.exports = config;