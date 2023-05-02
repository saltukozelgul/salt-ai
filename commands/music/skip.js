const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("atla")
    .setDescription("Çalan şarkıyı atlar"),

  async execute(interaction) {
    await interaction.deferReply();

    // get the queue
    const queue = interaction.client.distube.getQueue(interaction);

    // if no queue, return error
    if (!queue) return interaction.followUp("Çalan şarkı yok!");

    // get song infos to display
    const chosenSong = queue.songs[1];

    // skip the song
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

    await interaction.client.distube.skip(interaction);

    await interaction.followUp({ embeds: [embed] });
  },
};
