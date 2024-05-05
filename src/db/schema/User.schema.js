const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    provider: { type: String, required: true },
    email: { type: String, required: true },
    username: { type: String, required: true },
    roles: [Number],
    accessToken: { type: String }
});

userSchema.statics.findByEmailOrId = async function findByEmailOrId(data, cb){
    if (!data) return Promise.reject('No data provided');
    if (data.email) {
      let account = await this.findOne({email: data.email}).then().catch(err => {return new Error(err)});
      if ((account instanceof Error)) Promise.reject(new Error('No account found')).catch(err => {return err});
      if (!account) Promise.reject(new Error('No account found')).catch(err => {return err});
      return Promise.resolve(account);
    } else if (data.userid) {
      let account = await this.findOne({userid: data.userid}).then();
      if ((account instanceof Error)) Promise.reject(new Error('No account found')).catch(err => {return err});
      if (!account) Promise.reject(new Error('No account found')).catch(err => {return err});
      return Promise.resolve(account);
    }
  };

module.exports = userSchema;
