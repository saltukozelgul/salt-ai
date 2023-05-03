const { SlashCommandBuilder, Colors, ButtonStyle } = require("discord.js");
const { TriviaManager } = require("discord-trivia");

const trivia = new TriviaManager();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("bilgi-yarışması")
    .setDescription("Bilgi yarışması başlatır.")
    .addStringOption((option) =>
      option
        .setName("kategori")
        .setDescription("Bilgi yarışması kategorisi")
        .setRequired(true)
        .addChoices(
          {
            name: "Hayvanlar",
            value: "Animals",
          },
          {
            name: "Sanat",
            value: "Art",
          },
          {
            name: "Tarih",
            value: "History",
          },
          {
            name: "Politika",
            value: "Politics",
          },
          {
            name: "Spor",
            value: "Sports",
          },
          {
            name: "Genel Kültür",
            value: "General Knowledge",
          }
        )
    )
    .addStringOption((option) =>
      option
        .setName("zorluk")
        .setDescription("Bilgi yarışması zorluğu")
        .setRequired(true)
        .addChoices(
          {
            name: "Kolay",
            value: "easy",
          },
          {
            name: "Orta",
            value: "medium",
          },
          {
            name: "Zor",
            value: "hard",
          }
        )
    )
    .addIntegerOption((option) =>
      option
        .setName("soru")
        .setDescription("Bilgi yarışması soru sayısı")
        .setRequired(true)
    ),

  async execute(interaction) {
    const category = interaction.options.getString("kategori");
    const difficulty = interaction.options.getString("zorluk");
    const amount = interaction.options.getInteger("soru");
    const game = trivia
      .createGame(interaction)
      .decorate({
        embedColor: Colors.Green,
        buttonStyle: ButtonStyle.Primary,
      })
      .setQuestionOptions({
        amount: amount,
        category: category,
        difficulty: difficulty,
        type: "boolean",
      })
      .setGameOptions({
        showAnswers: true,
        timePerQuestion: 15_000,
        maxPoints: 100,
      });

    game.setGameTexts({
      alreadyQueued: (user) =>
        `❗ Zaten sıradasın, ${user.username} biraz sabırlı ol!`,
      preparingQuestion: () => "🕥 Soru hazırlanıyor...",
      notInMatch: () =>
        "❌ Bu komutu sadece bir trivia oyununda bulunurken kullanabilirsiniz!",
      alreadyChoseAnswer: (user) => `Zaten cevabını seçtin, ${user.username}!`,
      gameFailedRequirements: () => "Minumum oyuncu sayısına ulaşılamadı!",
      answerLockedInPrivate: (user, timeElapsed) =>
        `Cevabın kilitlendi, ${user.username}! (${timeElapsed}ms)`,
      memberJoinedGamePrivate: () => "Oyuna katıldın! Biraazdan soru gelecek.",
    });

    game.setGameOptions({
      queueTime: 30_000,
      minPlayerCount: 1,
      maxPlayerCount: 20,
      minPoints: 10,
      maxPoints: 100,
      timeBetweenRounds: 5_000,
      timePerQuestion: 15_000,
      streakDefinitionLevel: 3,
      pointsPerSteakAmount: 30,
      maximumStreakBonus: 300,
      showAnswers: true,
    });

    game.setup().catch(console.error);
  },
};
