const mongoose = require('mongoose');
const User = require('./User.schema.js');

const connectDb = () => {
  mongoose.set('strictQuery', true);
  return mongoose.connect(process.env.MONGO_URI);
};


module.exports = {models: {User: User}, connectDb};