const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("yazı-tura")
    .setDescription("Yazı mı tura mı?"),
  async execute(interaction) {
    const result = Math.floor(Math.random() * 2);
    await interaction.deferReply();
    // Then wait 1 second before sending the result and edit the message
    const embed = {
      title: "Benim seçimim...",
      description: result === 0 ? "Yazı" : "Tura",
      thumbnail: {
        url:
          result === 0
            ? "https://i.hizliresim.com/qANl5V.png"
            : "https://i.hizliresim.com/Z5zV8z.png",
      },
      color: 0x2f3136,
      timestamp: new Date(),
      footer: {
        text: "Salt.AI",
      },
    };
    setTimeout(async () => {
      await interaction.editReply({ embeds: [embed] });
    }, 1000);
  },
};
