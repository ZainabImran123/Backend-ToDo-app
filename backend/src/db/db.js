import dns from 'node:dns/promises';
dns.setServers(['1.1.1.1', '8.8.8.8']);
import chalk from 'chalk';
import mongoose from "mongoose";

async function connectDB() {
  try {
    await mongoose.connect('mongodb+srv://zainabimran:parekhhouse@cluster0.ntgdgah.mongodb.net/');
    console.log(chalk.white.bgGreen.bold("Connected to DB"));
  } catch (err) {
    console.log(chalk.blue.bgRed.bold("Error connecting to DB"), err);
  }
}

export default connectDB;