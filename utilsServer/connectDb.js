const mongoose = require("mongoose");

async function connectDb() {
  if (!process.env.MONGO_URI) {
    console.error(
      "Missing MONGO_URI. Copy config.env.example to config.env and add your MongoDB connection string."
    );
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });
    console.log("Mongodb connected");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

module.exports = connectDb;
