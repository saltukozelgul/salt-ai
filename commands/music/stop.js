const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("durdur")
    .setDescription("Çalan şarkıyı durdurur"),

  async execute(interaction) {
    await interaction.deferReply();

    // stop the music
    await interaction.client.distube.stop(interaction);

    await interaction.followUp("Şarkı durduruldu!");
  },
};
