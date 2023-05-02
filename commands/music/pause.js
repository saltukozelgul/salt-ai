const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("duraklat")
    .setDescription("Çalan şarkıyı duraklatır"),

  async execute(interaction) {
    await interaction.deferReply();

    // pause the music
    await interaction.client.distube.pause(interaction);

    await interaction.followUp("Şarkı duraklatıldı!");
  },
};
