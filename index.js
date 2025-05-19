const mineflayer = require('mineflayer');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

let botConnected = false; // Bot bağlantı durumu

// Bot yapılandırma ayarları
const config = {
  botAccount: {
    username: "Eymanbey",
    password: "2141124",
    type: "legacy"
  },
  server: {
    ip: "play.projects.gg",
    port: 25565,
    version: "1.19.3"
  },
  utils: {
    autoAuth: {
      enabled: true,
      password: "2141124"
    },
    chatMessages: {
      enabled: true,
      messages: [      
        { text: "/g 2141124", delay: 10 },
        { text: "/gaia", delay: 10 },
        { text: "/afk", delay: 30 },                  
        { text: "", delay: 500 }
      ]
    },
    antiAfk: {
      enabled: false
    },
    autoReconnect: true,
    autoReconnectDelay: 5000
  },
  position: {
    enabled: true,
    x: 100,
    y: 64,
    z: 100
  },
  chatLog: true
};

let bot;

// Bot başlatma fonksiyonu
function startBot() {
  bot = mineflayer.createBot({
    host: config.server.ip,
    port: config.server.port,
    username: config.botAccount.username,
    password: config.botAccount.password,
    version: config.server.version,
    auth: config.botAccount.type
  });

  // Bot olay dinleyicileri
  bot.on('spawn', () => {
    console.log('Bot bağlandı!');
    botConnected = true;

    if (config.utils.autoAuth.enabled) {
      bot.chat(`/g ${config.utils.autoAuth.password}`);
      console.log(`Otomatik giriş: /g ${config.utils.autoAuth.password}`);
    }

    // Mesaj gönderme işlevi
    if (config.utils.chatMessages.enabled) {
      config.utils.chatMessages.messages.forEach((messageObj, index) => {
        setInterval(() => {
          bot.chat(messageObj.text);
          console.log(`Gönderildi: ${messageObj.text}`);
        }, messageObj.delay * 1000);
      });
    }

    // Anti-AFK işlevi
    if (config.utils.antiAfk.enabled) {
      setInterval(() => {
        const moveDirections = ['forward', 'back', 'left', 'right'];
        const randomDirection = moveDirections[Math.floor(Math.random() * moveDirections.length)];
        
        // Rastgele bir yön seç ve kısa süre hareket et
        bot.setControlState(randomDirection, true);
        setTimeout(() => {
          bot.setControlState(randomDirection, false);
        }, 100); // 0.5 saniye hareket et
        
        console.log(`Bot ${randomDirection} yönüne hareket etti.`);
      }, 30000); // Her 10 saniyede bir hareket et
    }
  });

  // Sohbet mesajlarını dinleme
  bot.on('message', (message) => {
    console.log(message.toString());
  });

  // Bağlantı kesildiğinde yeniden bağlanma
  bot.on('end', () => {
    console.log('Bot bağlantısı kesildi. Yeniden bağlanacak...');
    botConnected = false;
    setTimeout(startBot, config.utils.autoReconnectDelay); // Botu yeniden başlat
  });
}

// Botu başlat
startBot();

// Web sunucusu
app.get('/', (req, res) => {
  if (botConnected) {
    res.send('Bot başarıyla bağlandı ve sohbetleri dinliyor.');
  } else {
    res.send('Bot bağlantı kurmaya çalışıyor...');
  }
});

// Sunucu bağlantısını başlat
app.listen(port, () => {
  console.log(`Sunucu ${port} numaralı bağlantı noktasında yürütülüyor.`);
});
