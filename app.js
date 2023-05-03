// Require the necessary discord.js classes
const fs = require("node:fs");
const path = require("node:path");
const { DisTube } = require("distube");
const {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  ActivityType,
} = require("discord.js");
require("dotenv").config();
token = process.env.TOKEN;

// MongoDB
const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = process.env.MONGO_URI;
const clientMongo = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await clientMongo.connect();
    // Send a ping to confirm a successful connection
    await clientMongo.db("admin").command({ ping: 1 });
    console.log("Database connection established.");
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
  ],
});

client.distube = new DisTube(client, {
  leaveOnStop: false,
  leaveOnFinish: true,
  emitNewSongOnly: true,
  emitAddSongWhenCreatingQueue: false,
  emitAddListWhenCreatingQueue: false,
});

// Create a new collection for commands
client.commands = new Collection();
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
  c.user.setActivity("/yardım", { type: ActivityType.Playing });
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction, clientMongo);
  } catch (error) {
    console.error(error);
  }
});

// When any song is end and skipped the other song will play
client.distube.on("finishSong", async (queue, song) => {
  if (queue) {
    const chosenSong = queue.songs[1];
    if (!chosenSong) {
      return;
    }
    const embed = {
      author: {
        name: "Salt-AI - Müzik",
        icon_url:
          "https://cdn3.iconfinder.com/data/icons/2018-social-media-logotypes/1000/2018_social_media_popular_app_logo_youtube-512.png",
      },
      // red  youtube
      color: 0xff0000,
      // icon
      thumbnail: {
        url: chosenSong.thumbnail,
      },
      title: chosenSong.name,
      // If the another song is already playing
      description: `Şu anda çalınıyor: ${chosenSong.name}`,
      fields: [
        {
          name: "Süre",
          value: chosenSong.formattedDuration,
          inline: true,
        },
        {
          name: "Görüntülenme",
          value: chosenSong.views,
          inline: true,
        },
        {
          name: "Kanal",
          value: chosenSong.uploader.name,
          inline: true,
        },
      ],
      timestamp: new Date(),
      footer: {
        text: "Salt.AI",
      },
    };
    // send discord.js v 14
    await queue.textChannel.send({ embeds: [embed] });
  }
});

// Log in to Discord with your client's token
client.login(token);
