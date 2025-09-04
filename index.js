const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors');
const { Telegraf, Markup } = require("telegraf");
require("dotenv").config();
const app = express();
app.use(cors({
  origin: process.env.CLIENT_ORIGINS.split(','),
  methods: ['POST'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));
const bot = new Telegraf(process.env.BOT_TOKEN);

// Middleware
app.use(bodyParser.json());

// Панель команд в ТГ
async function setCommands() {
  await bot.telegram.setMyCommands([
    { command: 'start', description: 'Начать работу с ботом' },
    { command: 'info', description: 'Узнать информацию о боте' },
  ]);
  console.log('Панель команд обновлена');
}

setCommands();

// Form handler
app.post("/submit-form", async function (req, res) {
  try {
    console.log(req.body)
    const { company, contact, phone, email } = req.body;

    await bot.telegram.sendMessage(
      process.env.CHAT_ID,
      `📝 *Новая заявка*\n\n🏢 **Компания:** ${company}\n👤 **Контакт:** ${contact}\n📱 **Телефон:** ${phone}\n📧 **Email:** ${email}\n\nДата подачи: ${new Date().toLocaleString()}`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          Markup.button.url('🌐 Сайт компании', 'https://bleskoff.ru')
        ])
      }
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Ошибка отправки:", error);
    res.status(500).json({ success: false });
  }
});

app.get("/", (_, res) => {
  res.status(200).json({ message: "Бот работает" });
});

// Bot commands
bot.command('info', (ctx) => {
  ctx.replyWithHTML(`<b>Информация о боте</b>

Версия: 1.0
Разработчик: BleskOFF
Описание: Бот для обработки заявок о сотрудничестве`);
});

// Bot setup
bot.launch()
app.listen(process.env.PORT, () => {
    return console.log(`Сервер запущен на порту ${process.env.PORT}`)
});

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
