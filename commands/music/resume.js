const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("devam")
    .setDescription("Duraklatılan şarkıyı devam ettirir"),

  async execute(interaction) {
    await interaction.deferReply();

    // resume the music
    await interaction.client.distube.resume(interaction);

    await interaction.followUp("Şarkı devam ettiriliyor!");
  },
};
