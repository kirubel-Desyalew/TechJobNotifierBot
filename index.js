require("dotenv").config();

const express = require("express");
const TelegramBot = require("node-telegram-bot-api");

const botToken = process.env.BOT_TOKEN;
const bot = new TelegramBot(botToken, { polling: true });

const app = express();

app.get("/", (req, res) => {
  res.send("Telegram Bot is running!");
});

const subscriptions = new Set();

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    "Welcome! Click a button to manage your subscription:",
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Subscribe", callback_data: "subscribe" }],
          [{ text: "Unsubscribe", callback_data: "unsubscribe" }],
        ],
      },
    }
  );
});

bot.on("callback_query", (query) => {
  const chatId = query.message.chat.id;
  const command = query.data;

  if (command === "subscribe") {
    subscriptions.add(chatId);
    bot.sendMessage(chatId, "You have been subscribed to job notifications.");
  } else if (command === "unsubscribe") {
    subscriptions.delete(chatId);
    bot.sendMessage(
      chatId,
      "You have been unsubscribed from job notifications."
    );
  }

  bot.answerCallbackQuery(query.id);
});

bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;

  // Check if the message is from the desired group
  if (msg.chat.type === "group") {
    // Check if the message contains any tech-related keyword
    const techKeywords = [
      "software engineering",
      "full stack",
      "back end",
      "front end",
      "nodejs",
      "remote job",
    ];
    const containsTechKeyword = techKeywords.some((keyword) =>
      messageText.toLowerCase().includes(keyword)
    );

    if (containsTechKeyword) {
      // Send the message to all subscribed users
      subscriptions.forEach((subscription) => {
        bot.sendMessage(subscription, messageText);
      });
    }
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
