const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function checkUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const users = await User.find({}).limit(5);
        console.log('User count:', users.length);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkUsers();
