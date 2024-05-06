const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  provider: { type: String, required: true },
  email: { type: String, required: true },
  username: { type: String, required: true },
  fullName: { type: String },
  avatarUrl: { type: String },
  contactInfo: {
      phone: { type: String },
      address: { type: String }
  },
  preferences: {
      theme: { type: String },
      language: { type: String },
      timezone: { type: String }
  },
  activityLogs: [{
      timestamp: { type: Date, default: Date.now },
      action: { type: String }
  }],
  dashboardSettings: {
      layout: { type: String },
      widgetPreferences: { type: Object }
  },
  notificationSettings: {
      alerts: { type: Boolean, default: true },
      reminders: { type: Boolean, default: false }
  },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Favorite' }]
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
