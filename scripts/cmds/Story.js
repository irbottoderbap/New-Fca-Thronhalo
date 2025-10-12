const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "story",
    aliases: ["tale", "storytime"],
    version: "1.0",
    author: "Israfil ThronHalo",
    countDown: 5,
    role: 0,
    category: "fun",
    guide: {
      en: "{p}story [genre] - Available genres: fantasy, romance, mystery, scifi, horror, adventure"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    try {
      const genres = ['fantasy', 'romance', 'mystery', 'scifi', 'horror', 'adventure'];
      const genre = args[0]?.toLowerCase() || genres[Math.floor(Math.random() * genres.length)];
      
      if (!genres.includes(genre)) {
        return message.reply(`❌ Invalid genre! Available genres: ${genres.join(', ')}`);
      }

      // Show typing indicator
      api.setMessageReaction("⏳", event.messageID, (err) => {}, true);
      
      // Get a story
      const story = await generateStory(genre);
      
      // Get a matching image
      const imagePath = await generateStoryImage(story.keywords, genre);
      
      // Format the story message
      const messageText = `📖 𝗦𝗧𝗢𝗥𝗬 𝗧𝗜𝗠𝗘 📖\n\n` +
                         `✨ 𝗚𝗲𝗻𝗿𝗲: ${genre.toUpperCase()}\n` +
                         `📚 𝗧𝗶𝘁𝗹𝗲: ${story.title}\n\n` +
                         `${story.content}\n\n` +
                         `━━━━━━━━━━━━━━━━━\n` +
                         `📝 𝗚𝗲𝗻𝗲𝗿𝗮𝘁𝗲𝗱 𝗯𝘆 𝙔𝙤𝙪𝙧 𝙛𝙖𝙩𝙝𝙚𝙧 𝙄𝙨𝙧𝙖𝙛𝙞𝙡 `;

      // Send story with image
      await message.reply({
        body: messageText,
        attachment: fs.createReadStream(imagePath)
      });

      // Clean up temp file after sending
      setTimeout(() => {
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }, 5000);
      
    } catch (error) {
      console.error('Story command error:', error);
      message.reply('❌ Failed to generate story. Please try again later.');
    }
  }
};

// Story generation function
async function generateStory(genre) {
  const stories = {
    fantasy: {
      title: "The Crystal of Eldoria",
      content: `In the ancient kingdom of Eldoria, young apprentice Elara discovered she could communicate with the crystal spires that protected the city. While others saw them as mere decorations, Elara heard their whispers—warnings of an approaching darkness that only she could understand. With the help of a reluctant dragon named Pyro, she embarked on a journey to awaken the crystals' true power before the Shadow King could claim them for his evil purposes.`,
      keywords: "magic crystal dragon kingdom fantasy castle"
    },
    romance: {
      title: "The Bookstore Encounter",
      content: `It was raining when Liam stumbled into the cozy bookstore, seeking shelter from the storm. He didn't expect to find Sarah, the owner, who shared his love for classic literature. As they discussed their favorite novels over hot tea, the storm outside faded away. What started as a chance encounter turned into weekly meetings, each conversation revealing more about their pasts and dreams for the future. Sometimes, the best love stories begin where you least expect them.`,
      keywords: "bookstore romance rain couple love"
    },
    mystery: {
      title: "The Vanishing at Willow Manor",
      content: `Detective Miller arrived at Willow Manor to investigate the disappearance of Lord Harrington. The staff claimed he vanished from his locked study, leaving behind only a single cryptic note: "The raven flies at midnight." As Miller dug deeper, he uncovered family secrets, hidden passages, and a decades-old rivalry that might hold the key to solving the case. But time was running out, and the manor seemed determined to keep its secrets buried forever.`,
      keywords: "detective mystery mansion secret investigation"
    },
    scifi: {
      title: "Beyond the Event Horizon",
      content: `The starship Odyssey was the first vessel to approach a newly discovered wormhole. Commander Reyes and her crew prepared for humanity's greatest leap into the unknown. But when they emerged on the other side, they found themselves in a parallel universe where Earth never existed. Now they must navigate strange new civilizations while trying to find their way back home, all while being pursued by an alien race that sees them as interdimensional invaders.`,
      keywords: "spaceship future alien universe scifi"
    },
    horror: {
      title: "The Whispering Walls",
      content: `When the Thompson family moved into their dream home, they didn't know about its dark history. The previous owners disappeared without a trace, and the neighbors avoided talking about what happened. Soon, young Mia started hearing whispers coming from the walls at night—voices calling her name, telling her secrets about the house's past. As the whispers grew louder, the family realized they weren't alone in the house, and whatever shared their home didn't want them to leave.`,
      keywords: "haunted house horror ghost dark scary"
    },
    adventure: {
      title: "The Lost City of Zephyria",
      content: `Explorer Alex Morgan had spent years searching for the mythical city of Zephyria, said to be hidden deep in the Amazon rainforest. Following ancient maps and local legends, Alex and the team faced treacherous rivers, deadly predators, and mysterious traps left by an ancient civilization. When they finally discovered the golden city, they found it wasn't abandoned as legends claimed—and the guardians of Zephyria weren't happy about visitors.`,
      keywords: "adventure jungle exploration treasure ancient"
    }
  };

  return stories[genre];
}

// Image generation function
async function generateStoryImage(keywords, genre) {
  try {
    // Using reliable image URLs from Picsum with genre-specific images
    const imageUrls = {
      fantasy: "https://picsum.photos/800/600?random=1&blur=2",
      romance: "https://picsum.photos/800/600?random=2&blur=1", 
      mystery: "https://picsum.photos/800/600?random=3&grayscale",
      scifi: "https://picsum.photos/800/600?random=4",
      horror: "https://picsum.photos/800/600?random=5&grayscale",
      adventure: "https://picsum.photos/800/600?random=6"
    };

    const imageUrl = imageUrls[genre] || "https://picsum.photos/800/600";
    
    // Download image
    const response = await axios({
      method: 'GET',
      url: imageUrl,
      responseType: 'stream',
      timeout: 10000
    });

    // Ensure temp directory exists
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const imagePath = path.join(tempDir, `story_${Date.now()}.jpg`);
    const writer = fs.createWriteStream(imagePath);

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(imagePath));
      writer.on('error', (err) => {
        // If download fails, create fallback image
        createFallbackImage(genre).then(resolve).catch(reject);
      });
    });

  } catch (error) {
    console.error('Image download failed, using fallback:', error);
    // Fallback to colored canvas
    return createFallbackImage(genre);
  }
}

// Fallback image creation (fixed version)
async function createFallbackImage(genre) {
  try {
    const { createCanvas } = require('canvas');
    
    const width = 800;
    const height = 600;
    const canvasInstance = createCanvas(width, height);
    const ctx = canvasInstance.getContext('2d');

    // Background colors based on genre
    const colors = {
      fantasy: ['#4A154B', '#8A2BE2'],
      romance: ['#FF69B4', '#FFB6C1'], 
      mystery: ['#2F4F4F', '#696969'],
      scifi: ['#000080', '#00CED1'],
      horror: ['#2F0000', '#8B0000'],
      adventure: ['#228B22', '#32CD32']
    };

    const [color1, color2] = colors[genre] || ['#666666', '#999999'];
    
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Add genre text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(genre.toUpperCase(), width/2, height/2);
    
    ctx.font = '24px Arial';
    ctx.fillText('Story Time', width/2, height/2 + 50);

    // Add decorative elements based on genre
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    
    if (genre === 'fantasy') {
      // Draw stars
      for (let i = 0; i < 50; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 3 + 1;
        ctx.fillRect(x, y, size, size);
      }
    } else if (genre === 'romance') {
      // Draw hearts
      ctx.font = '30px Arial';
      ctx.fillText('💖', Math.random() * width, Math.random() * height);
    }

    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const imagePath = path.join(tempDir, `fallback_${Date.now()}.png`);
    const buffer = canvasInstance.toBuffer('image/png');
    fs.writeFileSync(imagePath, buffer);
    
    return imagePath;
  } catch (error) {
    console.error('Fallback image creation failed:', error);
    throw new Error('Image generation failed');
  }
}
