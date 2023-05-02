const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("oynat")
    .setDescription("Herhangi bir şarkıyı oynatır")
    .addStringOption((option) =>
      option
        .setName("şarkı")
        .setDescription("Oynatılacak şarkının adını/urlini girin.")
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply();
    // Get the song name from the interaction's options
    const songName = interaction.options.getString("şarkı");
    // Check if the user is in a voice channel
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel)
      return await interaction.reply("Bir sesli kanalda olmalısın!");
    // Check url validation with regex
    const urlValidation =
      /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi;
    if (urlValidation.test(songName)) {
      // If the song name is a valid url, play it
      await interaction.client.distube.play(voiceChannel, songName);
      await interaction.followUp(`Şu anda ${songName} oynatılıyor`);
      return;
    }

    // get song infos
    const songInfo = await interaction.client.distube.search(songName);
    // Get first 5 results
    const first5Results = songInfo.slice(0, 5);
    // show results to user and let them choose
    const resultEmbed = {
      author: {
        name: "Salt-AI - Müzik",
        icon_url:
          "https://cdn3.iconfinder.com/data/icons/2018-social-media-logotypes/1000/2018_social_media_popular_app_logo_youtube-512.png",
      },
      color: 0x0099ff,
      title: "Şarkı Seçimi",
      description: "Aşağıdaki şarkılardan birini seçin",
      thumbnail: {
        url: first5Results[0].thumbnail,
      },

      fields: [
        {
          name: `1 - ${first5Results[0].name}`,
          value: `${first5Results[0].formattedDuration} - ${first5Results[0].views} görüntülenme`,
        },
        {
          name: `2 - ${first5Results[1].name}`,
          value: `${first5Results[1].formattedDuration} - ${first5Results[1].views} görüntülenme`,
        },
        {
          name: `3 - ${first5Results[2].name}`,
          value: `${first5Results[2].formattedDuration} - ${first5Results[2].views} görüntülenme`,
        },
        {
          name: `4 - ${first5Results[3].name}`,
          value: `${first5Results[3].formattedDuration} - ${first5Results[3].views} görüntülenme`,
        },
        {
          name: `5 - ${first5Results[4].name}`,
          value: `${first5Results[4].formattedDuration} - ${first5Results[4].views} görüntülenme`,
        },
      ],
      timestamp: new Date(),
      footer: {
        text: "Salt.AI",
      },
    };

    // Add 5 buttons to message and send it
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("1").setLabel("1").setStyle("Primary"),
      new ButtonBuilder().setCustomId("2").setLabel("2").setStyle("Primary"),
      new ButtonBuilder().setCustomId("3").setLabel("3").setStyle("Primary"),
      new ButtonBuilder().setCustomId("4").setLabel("4").setStyle("Primary"),
      new ButtonBuilder().setCustomId("5").setLabel("5").setStyle("Primary")
    );
    const message = await interaction.followUp({
      embeds: [resultEmbed],
      components: [row],
      fetchReply: true,
    });

    // wait for user to click a button
    const collectorFilter = (i) => i.user.id === interaction.user.id;
    try {
      const confirmation = await message.awaitMessageComponent({
        filter: collectorFilter,
        time: 60_000,
      });
      choice = confirmation.customId;
      // to int
      choice = parseInt(choice);
      // confirm message with the 5 buttons disabled
      const selectedRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("1")
          .setLabel("1")
          .setStyle(choice === 1 ? "Success" : "Primary")
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId("2")
          .setLabel("2")
          .setStyle(choice === 2 ? "Success" : "Primary")
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId("3")
          .setLabel("3")
          .setStyle(choice === 3 ? "Success" : "Primary")
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId("4")
          .setLabel("4")
          .setStyle(choice === 4 ? "Success" : "Primary")
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId("5")
          .setLabel("5")
          .setStyle(choice === 5 ? "Success" : "Primary")
          .setDisabled(true)
      );
      await confirmation.update({
        embeds: [resultEmbed],
        components: [selectedRow],
      });
    } catch (e) {
      console.log(e);
      await message.editReply({
        content: "1 dakika içinde seçim yapmadığınız için işlem iptal edildi.",
        components: [],
      });
    }

    // check if the choice is valid
    if (isNaN(choice) || choice < 1 || choice > 5) {
      await interaction.followUp("Geçersiz seçim!");
      return;
    }
    const chosenSong = first5Results[choice - 1];
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
      description: `Şarkıyı açan: ${interaction.user}`,
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

    // play the song
    await interaction.client.distube.play(voiceChannel, chosenSong.url);
    await interaction.followUp({ embeds: [embed] });
  },
};
