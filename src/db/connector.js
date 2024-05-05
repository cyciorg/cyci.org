const mongoose = require('mongoose');
const UserSchema = require('./schema/User.schema.js');
const User = mongoose.model('User', UserSchema);

const connectDb = async () => {
  return await mongoose.connect(process.env.MONGO_URI);
};


module.exports = {models: {User: User}, connectDb};