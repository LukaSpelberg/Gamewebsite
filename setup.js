// Setup script to create sample data for the GameNews website
const mongoose = require('mongoose');
const Post = require('./models/Post');
require('dotenv').config({ path: './config.env' });

// Sample posts data
const samplePosts = [
  {
    title: "Elden Ring DLC: Shadow of the Erdtree - Everything We Know",
    content: "FromSoftware's highly anticipated DLC for Elden Ring, Shadow of the Erdtree, is set to release in 2024. This massive expansion promises to bring new areas, bosses, weapons, and lore to the already expansive world of the Lands Between.\n\nPlayers can expect to explore new regions beyond the Erdtree, face challenging new bosses, and discover the mysteries surrounding Miquella, the Empyrean who was mentioned throughout the base game. The DLC will feature new weapon types, spells, and armor sets that will give players fresh ways to approach combat.\n\nWith the success of the base game, expectations are high for this expansion. Will it live up to the hype? Only time will tell, but if FromSoftware's track record is any indication, we're in for something special.",
    category: "News",
    author: "Gaming Editor",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=400&fit=crop",
    featured: true,
    likes: 42,
    views: 156
  },
  {
    title: "The Legend of Zelda: Tears of the Kingdom - A Masterpiece Review",
    content: "Nintendo has once again delivered an exceptional gaming experience with The Legend of Zelda: Tears of the Kingdom. Building upon the foundation of Breath of the Wild, this sequel manages to feel both familiar and completely fresh.\n\nOne of the standout features is the new Ultrahand ability, which allows players to create incredible contraptions using the game's physics system. The creativity on display is staggering, with players building everything from simple bridges to complex flying machines.\n\nThe story is more engaging than its predecessor, with deeper character development and a more compelling narrative arc. The world feels alive and reactive, with every action having consequences that ripple throughout the game world.\n\nWhile the game isn't without its minor flaws, the overall experience is nothing short of magical. This is a must-play for any fan of open-world games or the Zelda series.",
    category: "Reviews",
    author: "Review Team",
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=400&fit=crop",
    featured: false,
    likes: 38,
    views: 203
  },
  {
    title: "Why Indie Games Are the Future of Gaming",
    content: "In an industry increasingly dominated by massive AAA titles and corporate interests, indie games represent the beating heart of creativity and innovation in gaming. These smaller, often passion-driven projects are pushing boundaries and exploring new territories that larger studios are too risk-averse to attempt.\n\nIndie developers have the freedom to experiment with unique art styles, unconventional gameplay mechanics, and deeply personal narratives. Games like Celeste, Hollow Knight, and Hades have proven that you don't need a massive budget to create something truly special.\n\nMoreover, indie games often tackle themes and stories that mainstream games shy away from. They can be more experimental, more personal, and more willing to take creative risks. This diversity of voices and perspectives enriches the entire medium.\n\nAs development tools become more accessible and distribution platforms more open, we're seeing an explosion of creativity in the indie space. The future of gaming isn't just about bigger and more expensive games—it's about more diverse, creative, and meaningful experiences.",
    category: "Opinion",
    author: "Industry Analyst",
    image: "https://images.unsplash.com/photo-1556438064-2d7646166914?w=800&h=400&fit=crop",
    featured: false,
    likes: 29,
    views: 187
  },
  {
    title: "PlayStation 5 Pro Rumors: What to Expect in 2024",
    content: "Rumors are swirling about a potential PlayStation 5 Pro release in 2024, with leaked specifications suggesting significant performance improvements over the current PS5 model.\n\nAccording to various sources, the PS5 Pro could feature:\n- Enhanced CPU with higher clock speeds\n- Improved GPU with better ray tracing capabilities\n- Increased RAM for better multitasking\n- Better cooling system for sustained performance\n\nWhile Sony hasn't officially confirmed the existence of a Pro model, the timing would align with the company's previous console refresh patterns. The original PS4 Pro was released three years after the base PS4, and we're approaching that same timeframe for the PS5.\n\nIf these rumors prove true, the PS5 Pro could be the perfect console for gamers who want the best possible performance without waiting for the next generation. However, with the current PS5 still being relatively new, some may question the necessity of a Pro model so soon.",
    category: "News",
    author: "Tech Reporter",
    image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&h=400&fit=crop",
    featured: false,
    likes: 35,
    views: 142
  },
  {
    title: "Baldur's Gate 3: A New Standard for RPGs",
    content: "Larian Studios has set a new standard for what's possible in the RPG genre with Baldur's Gate 3. This massive, complex, and deeply engaging game proves that there's still room for innovation in the classic CRPG formula.\n\nWhat sets Baldur's Gate 3 apart is its incredible attention to detail and player agency. Every decision matters, every conversation can lead to unexpected outcomes, and the game respects the player's choices in ways that few other games do.\n\nThe turn-based combat is tactical and engaging, requiring players to think strategically about positioning, spell usage, and party composition. The character customization is deep and meaningful, with each class and race offering unique gameplay experiences.\n\nPerhaps most impressive is the game's writing and voice acting. The characters feel real and complex, with motivations and personalities that extend far beyond simple good or evil alignments. The story is epic in scope but personal in execution.\n\nBaldur's Gate 3 isn't just a great RPG—it's a game that will influence the genre for years to come.",
    category: "Reviews",
    author: "RPG Specialist",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop",
    featured: false,
    likes: 51,
    views: 278
  }
];

async function setupDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/game-news', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Clear existing posts
    await Post.deleteMany({});
    console.log('Cleared existing posts');

    // Insert sample posts
    await Post.insertMany(samplePosts);
    console.log(`Inserted ${samplePosts.length} sample posts`);

    console.log('Database setup complete!');
    console.log('You can now run "npm start" to start the server');
    
  } catch (error) {
    console.error('Setup failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;
