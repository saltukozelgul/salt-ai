const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("sıra")
    .setDescription("Müzik sırasını gösterir"),
  async execute(interaction) {
    await interaction.deferReply();
    // get the queue
    const queue = interaction.client.distube.getQueue(interaction);
    if (!queue) return interaction.followUp("Sırada şarkı yok!");

    // get the first 5 if there isnt  5 song take all
    // put them in a discord embed one field per song
    const embed = {
      author: {
        name: "Salt-AI - Müzik",
        icon_url:
          "https://cdn3.iconfinder.com/data/icons/2018-social-media-logotypes/1000/2018_social_media_popular_app_logo_youtube-512.png",
      },
      color: 0x0099ff,
      title: "Müzik Sırası",
      fields: [
        // add the first 5 songs
        ...queue.songs.slice(1, 6).map((song, index) => ({
          name: `${index + 1}. ${song.name}`,
          value: `Süre: ${song.formattedDuration}`,
        })),
      ],
      timestamp: new Date(),
    };

    // send the embed
    await interaction.followUp({ embeds: [embed] });
  },
};
