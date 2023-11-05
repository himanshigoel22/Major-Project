const mongoose = require("mongoose");
const initData = require("./data.js");
const listing = require("../models/listing.js");

const connectionString = process.env.ATLASDB_URL;
mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });



async function main() {
  try {
    await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to DB");

    // Call the function to initialize the database
    await initDB();
  } catch (err) {
    console.error("Error connecting to the database:", err);
  }
}

async function initDB() {
  try {
    // Clear existing data in the database (deleteMany)
    await listing.deleteMany({});

    // Initialize data and insert it into the database (insertMany)
    const dataWithOwners = initData.data.map((item) => ({
      ...item,
      owner: "65477a991f8ff05fb504fd5b", // Replace with a valid owner ID
    }));
    await listing.insertMany(dataWithOwners);

    console.log("Data initialized");
  } catch (err) {
    console.error("Error initializing data:", err);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
}

main();
