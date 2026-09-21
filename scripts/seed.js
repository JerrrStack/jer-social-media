/**
 * Fresh migrate + seed
 * Usage: npm run seed
 * 10 users: Jerome + 5 mutual friends (trend posts) + 4 suggestions
 * Demo login: Jerome@sayHi.app / test123
 */
require("dotenv").config({ path: "./config.env" });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

const User = require("../models/User");
const Profile = require("../models/Profile");
const Follower = require("../models/Follower");
const Notification = require("../models/Notification");
const Chat = require("../models/Chat");
const Post = require("../models/Post");

const DEMO_PASSWORD = "test123";

/** Generated initials avatars — not real photos */
const AVATAR_COLORS = [
  "1877f2",
  "e11d48",
  "059669",
  "7c3aed",
  "ea580c",
  "0891b2",
  "4f46e5",
  "db2777",
  "0d9488",
  "ca8a04",
];

function avatarUrl(name, index) {
  const bg = AVATAR_COLORS[index % AVATAR_COLORS.length];
  return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(
    name
  )}&backgroundColor=${bg}&fontSize=42`;
}

/** Local public images — each trend image used once */
const IMG = {
  gaming: "/img/gaming.jpg",
  music: "/img/music.jpg",
  jobHiring: "/img/job-hiring.jpg",
  movie: "/img/movie.jpg",
  quotes: "/img/quotes.jpg",
  cover: fs.existsSync(path.join(__dirname, "../public/img/bg.jpg"))
    ? "/img/bg.jpg"
    : "/img/gaming.jpg",
};

/**
 * 10 users total
 * - jeromeb: demo
 * - 5 circle: mutual follow + one trend post each
 * - 4 others: People you may know (friends-of-friends)
 */
const SEED_USERS = [
  { name: "Jerome B", username: "jeromeb", email: "jerome@sayhi.app" },
  // Circle (following + followers)
  { name: "Maya Santos", username: "mayasantos", email: "maya.santos@sayhi.app" },
  { name: "Kai Mendoza", username: "kaimendoza", email: "kai.mendoza@sayhi.app" },
  { name: "Luna Cruz", username: "lunacruz", email: "luna.cruz@sayhi.app" },
  { name: "Sofia Lim", username: "sofialim", email: "sofia.lim@sayhi.app" },
  { name: "Ethan Park", username: "ethanpark", email: "ethan.park@sayhi.app" },
  // Suggestions
  { name: "Aria Villanueva", username: "ariavilla", email: "aria.villa@sayhi.app" },
  { name: "Leo Castillo", username: "leocastillo", email: "leo.castillo@sayhi.app" },
  { name: "Mia Chen", username: "miachen", email: "mia.chen@sayhi.app" },
  { name: "Jordan Blake", username: "jordanblake", email: "jordan.blake@sayhi.app" },
];

const CIRCLE = [
  "mayasantos",
  "kaimendoza",
  "lunacruz",
  "sofialim",
  "ethanpark",
];

const SUGGESTIONS = ["ariavilla", "leocastillo", "miachen", "jordanblake"];

/** One post per trend — image used once — authors are Jerome's circle */
const SAMPLE_POSTS = [
  {
    username: "mayasantos",
    text:
      "Warzone night with the squad. Dropping into Call of Duty — who else is grinding #Gaming?",
    picUrl: IMG.gaming,
  },
  {
    username: "kaimendoza",
    text:
      "Still replaying that BTS concert energy. What a night. #Music",
    picUrl: IMG.music,
  },
  {
    username: "lunacruz",
    text:
      "Hiring tip: take time reviewing each applicant resume carefully. Quality > speed. #JobHiring",
    picUrl: IMG.jobHiring,
  },
  {
    username: "sofialim",
    text:
      "Spider-Man never gets old. That suit, that story — peak #Movie night.",
    picUrl: IMG.movie,
  },
  {
    username: "ethanpark",
    text:
      "Love is patient, love is kind. It does not envy, it does not boast. #Quotes",
    picUrl: IMG.quotes,
  },
  {
    username: "jeromeb",
    text: "Hey everyone - Jerome here. Welcome to SayHi!",
  },
];

async function wipe() {
  await Promise.all([
    User.deleteMany({}),
    Profile.deleteMany({}),
    Follower.deleteMany({}),
    Notification.deleteMany({}),
    Chat.deleteMany({}),
    Post.deleteMany({}),
  ]);
  console.log("Cleared users, profiles, followers, notifications, chats, posts");
}

async function createUser(seed, passwordHash, index) {
  const isJerome = seed.username === "jeromeb";
  const user = await new User({
    name: seed.name,
    username: seed.username,
    email: seed.email,
    password: passwordHash,
    profilePicUrl: avatarUrl(seed.name, index),
    coverPicUrl: isJerome ? IMG.cover : undefined,
    unreadMessage: isJerome,
    role: isJerome ? "root" : "user",
  }).save();

  await Promise.all([
    new Profile({
      user: user._id,
      bio: `Hi, I'm ${seed.name.split(" ")[0]} on SayHi.`,
      website: "",
    }).save(),
    new Follower({ user: user._id, followers: [], following: [] }).save(),
    new Notification({ user: user._id, notifications: [] }).save(),
    new Chat({ user: user._id, chats: [] }).save(),
  ]);

  return user;
}

async function linkFollow(a, b) {
  const aDoc = await Follower.findOne({ user: a._id });
  const bDoc = await Follower.findOne({ user: b._id });
  if (!aDoc.following.some((f) => f.user.toString() === b._id.toString())) {
    aDoc.following.push({ user: b._id });
    await aDoc.save();
  }
  if (!bDoc.followers.some((f) => f.user.toString() === a._id.toString())) {
    bDoc.followers.push({ user: a._id });
    await bDoc.save();
  }
}

async function seedFollows(usersByUsername) {
  const jerome = usersByUsername.jeromeb;

  // Jerome <-> 5 circle (mutual = following 5 + followers 5)
  for (const username of CIRCLE) {
    const friend = usersByUsername[username];
    await linkFollow(jerome, friend);
    await linkFollow(friend, jerome);
  }

  // Suggestions: friends-of-friends (mutual with circle, not with Jerome)
  // so they appear in People you may know and profiles are viewable
  const bridges = [
    ["ariavilla", "mayasantos"],
    ["ariavilla", "kaimendoza"],
    ["leocastillo", "lunacruz"],
    ["leocastillo", "sofialim"],
    ["miachen", "ethanpark"],
    ["miachen", "mayasantos"],
    ["jordanblake", "kaimendoza"],
    ["jordanblake", "sofialim"],
  ];

  for (const [aName, bName] of bridges) {
    await linkFollow(usersByUsername[aName], usersByUsername[bName]);
    await linkFollow(usersByUsername[bName], usersByUsername[aName]);
  }
}

async function seedPosts(usersByUsername) {
  for (const sample of SAMPLE_POSTS) {
    const author = usersByUsername[sample.username];
    if (!author) continue;
    const doc = {
      user: author._id,
      text: sample.text,
      likes: [],
      comments: [],
    };
    if (sample.picUrl) doc.picUrl = sample.picUrl;
    await new Post(doc).save();
  }
}

async function seedChats(usersByUsername) {
  const jerome = usersByUsername.jeromeb;
  const now = Date.now();

  const inbound = [
    {
      from: usersByUsername.sofialim,
      msg: "Hi Jerome — ready for a quick intro call this week about a frontend role?",
      minsAgo: 25,
    },
    {
      from: usersByUsername.ethanpark,
      msg: "Saw your profile. Ready for an opportunity? We have an opening that fits.",
      minsAgo: 55,
    },
    {
      from: usersByUsername.mayasantos,
      msg: "Are you available for a hiring screen tomorrow? Ready for call?",
      minsAgo: 120,
    },
    {
      from: usersByUsername.kaimendoza,
      msg: "Recruiter here. Ready for opportunity details if you're open to remote work.",
      minsAgo: 200,
    },
    {
      from: usersByUsername.lunacruz,
      msg: "Following up — still ready for a call to discuss the role?",
      minsAgo: 360,
    },
  ];

  const jeromeChats = [];

  for (const item of inbound) {
    const messages = [
      {
        msg: item.msg,
        sender: item.from._id,
        receiver: jerome._id,
        date: new Date(now - 1000 * 60 * item.minsAgo),
        read: false,
      },
    ];

    jeromeChats.push({
      messagesWith: item.from._id,
      messages,
    });

    await Chat.findOneAndUpdate(
      { user: item.from._id },
      {
        chats: [
          {
            messagesWith: jerome._id,
            messages,
          },
        ],
      }
    );
  }

  await Chat.findOneAndUpdate({ user: jerome._id }, { chats: jeromeChats });
}

async function run() {
  if (!process.env.MONGO_URI) {
    console.error("Missing MONGO_URI in config.env");
    process.exit(1);
  }

  const requiredImgs = [
    "gaming.jpg",
    "music.jpg",
    "job-hiring.jpg",
    "movie.jpg",
    "quotes.jpg",
  ];
  for (const file of requiredImgs) {
    const full = path.join(__dirname, "../public/img", file);
    if (!fs.existsSync(full)) {
      console.error(`Missing image: public/img/${file}`);
      process.exit(1);
    }
  }

  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  });

  console.log("Connected. Starting fresh migrate...");
  await wipe();

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const created = [];
  for (let i = 0; i < SEED_USERS.length; i++) {
    created.push(await createUser(SEED_USERS[i], passwordHash, i));
  }

  const usersByUsername = {};
  for (const u of created) {
    usersByUsername[u.username] = u;
  }

  await seedFollows(usersByUsername);
  await seedPosts(usersByUsername);
  await seedChats(usersByUsername);

  console.log(`\nSeeded ${created.length} users`);
  console.log("Circle (5 mutual):", CIRCLE.join(", "));
  console.log("Suggestions:", SUGGESTIONS.join(", "));
  console.log("Demo login:");
  console.log("  email:    Jerome@sayHi.app");
  console.log("  password: test123");
  console.log("  username: jeromeb");

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
