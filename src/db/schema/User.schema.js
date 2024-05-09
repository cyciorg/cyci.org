const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    provider: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    fullName: {
        type: String
    },
    api_token: {
        type: String
    },
    roles: {
        type: [String]
    },
    avatarUrl: {
        type: String
    },
    contactInfo: {
        phone: {
            type: String
        },
        address: {
            type: String
        }
    },
    preferences: {
        theme: {
            type: String
        },
        language: {
            type: String
        },
        timezone: {
            type: String
        }
    },
    activityLogs: [{
        timestamp: {
            type: Date,
            default: Date.now
        },
        action: {
            type: String
        }
    }],
    dashboardSettings: {
        layout: {
            type: String
        },
        widgetPreferences: {
            type: Object
        }
    },
    notificationSettings: {
        alerts: {
            type: Boolean,
            default: true
        },
        reminders: {
            type: Boolean,
            default: false
        }
    },
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Favorite'
    }],
    usedStorage: {
        type: Number
    },
    storageQuota: {
        type: Number
    }
});

userSchema.statics.findByEmailOrId = async function findByEmailOrId(data, cb) {
    if (!data) return Promise.reject('No data provided');
    if (data.email) {
        let account = await this.findOne({
            email: data.email
        }).then().catch(err => {
            return new Error(err)
        });
        if ((account instanceof Error)) Promise.reject(new Error('No account found')).catch(err => {
            return err
        });
        if (!account) Promise.reject(new Error('No account found')).catch(err => {
            return err
        });
        return Promise.resolve(account);
    } else if (data.userid) {
        let account = await this.findOne({
            userid: data.userid
        }).then();
        if ((account instanceof Error)) Promise.reject(new Error('No account found')).catch(err => {
            return err
        });
        if (!account) Promise.reject(new Error('No account found')).catch(err => {
            return err
        });
        return Promise.resolve(account);
    }
};

userSchema.statics.checkApiToken = function checkApiToken(user, token, cb) {
    if (!user) Promise.reject(new Error('No user provided')).catch(err => {
        return err
    });
    if (!token) Promise.reject(new Error('No token provided')).catch(err => {
        return err
    });
    if (user.api_token !== token) Promise.reject(new Error('Invalid token')).catch(err => {
        return err
    });
    return Promise.resolve(true);
};

userSchema.statics.removeImageOrFile = function removeImageOrFile(user, data, cb) {
    if (!user) return cb(new Error('No user provided'));
    if (!data) return cb(new Error('No data provided'));
    if (data.name) {
        this.findOne({
            userid: user.userid
        }, function(err, result) {
            if (err) return cb(err);
            if (!result) return cb(null, false);
            for (let i = 0; i < result.data.length; i++) {
                if (result.data[i].name == data.name) {
                    result.data.splice(i, 1);
                    result.save(function(err, result) {
                        if (err) return cb(err);
                        return cb(null, result);
                    });
                }
            }
        });
    } else if (data.id) {
        this.findOne({
            userid: user.userid
        }, function(err, result) {
            if (err) return cb(err);
            if (!result) return cb(null, false);
            for (let i = 0; i < result.data.length; i++) {
                if (result.data[i]._id == data.id) {
                    result.data.splice(i, 1);
                    result.save(function(err, result) {
                        if (err) return cb(err);
                        return cb(null, result);
                    });
                }
            }
        });
    }
};

userSchema.statics.removeRole = function removeRole(user, role, cb) {
    if (!user) return cb(new Error('No user provided'));
    if (!role) return cb(new Error('No role provided'));
    this.findOne({
        userid: user.userid
    }, function(err, result) {
        if (err) return cb(err);
        if (!result) return cb(null, false);
        for (let i = 0; i < result.roles.length; i++) {
            if (result.roles[i] == role) {
                result.roles.splice(i, 1);
                result.save(function(err, result) {
                    if (err) return cb(err);
                    return cb(null, result);
                });
            }
        }
    });
};

userSchema.statics.getUser = function getUser(user, cb) {
    if (!user) return cb(new Error('No user provided'));
    this.findOne({
        userid: user.userid
    }, function(err, result) {
        if (err) return cb(err);
        if (!result) return cb(null, false);
        return cb(null, result);
    });
};

// Same as AppendRole, but for convenience its added as addRole
userSchema.statics.addRole = function addRole(user, role, cb) {
    if (!user) return cb(new Error('No user provided'));
    if (!role) return cb(new Error('No role provided'));
    this.findOne({
        userid: user.userid
    }, function(err, result) {
        if (err) return cb(err);
        if (!result) return cb(null, false);
        result.roles.push(role);
        result.save(function(err, result) {
            if (err) return cb(err);
            return cb(null, result);
        });
    });
};


userSchema.statics.appendRole = function appendRole(user, role, cb) {
    if (!user) return cb(new Error('No user provided'));
    if (!role) return cb(new Error('No role provided'));
    //if (roles.USER || roles.PREMIUM || roles.MOD || roles.ADMIN || roles.OWNER !== role) return cb(new Error('Invalid role'));
    this.findOne({
        userid: user.userid
    }, function(err, result) {
        if (err) return cb(err);
        if (user.roles.includes(role)) return cb(new Error('User already has that role'));
        if (!result) return cb(null, false);
        user.roles.push(role);
        user.save(function(err, result) {
            if (err) return cb(err);
            return cb(null, result);
        });
    });
};

userSchema.statics.generateApiToken = function generateApiToken(user, cb) {
    if (!user) return cb(new Error('No user provided'));
    user.api_token = crypto.randomBytes(32).toString('hex');
    user.save(function(err, result) {
        if (err) return cb(err);
        return cb(null, result);
    });
};

userSchema.statics.getImagesOrFiles = function getImagesOrFiles(user, cb) {
    if (!user) return cb(new Error('No user provided'));
    this.findOne({
        userid: user.userid
    }, function(err, result) {
        if (err) return cb(err);
        if (!result) return cb(null, false);
        return cb(null, result.data);
    });
};

userSchema.statics.getRoles = function getRoles(user, cb) {
    if (!user) return cb(new Error('No user provided'));
    this.findOne({
        userid: user.userid
    }, function(err, result) {
        if (err) return cb(err);
        if (!result) return cb(null, false);
        return cb(null, result.roles);
    });
};
userSchema.statics.purgeImagesOrFiles = function purgeImagesOrFiles(user, cb) {
    if (!user) return cb(new Error('No user provided'));
    this.findOne({
        userid: user.userid
    }, function(err, result) {
        if (err) return cb(err);
        if (!result) return cb(null, false);
        result.data = [];
        result.save(function(err, result) {
            if (err) return cb(err);
            return cb(null, result);
        });
    });
};
// Auto generated by CoPilot and modified by Phil K for use in the project
userSchema.statics.addImageOrFile = function addImageOrFile(user, data, cb) {
    if (!user) return cb(new Error('No user provided'));
    if (!data) return cb(new Error('No data provided'));
    if (!data.id) return cb(new Error('No userid provided'));
    if (!data.name) return cb(new Error('No name provided'));
    if (!data.value) return cb(new Error('No value provided'));
    if (!data.size) return cb(new Error('No size provided'));
    if (!data.type) return cb(new Error('No type provided'));
    this.findOne({
        userid: user.userid
    }, function(err, result) {
        if (err) return cb(err);
        if (!result) return cb(null, false);
        result.data.push({
            name: data.name,
            id: data.id,
            value: data.value,
            size: data.size,
            type: data.type,
            created_at: data.created_at
        });
        result.save(function(err, result) {
            if (err) return cb(err);
            return cb(null, result);
        });
    });
};
userSchema.statics.findOrCreate = function findOrCreate(profile, cb) {
    this.findOne({
        userid: profile.id
    }, function(err, result) {
        if (!result) {
            var userObj = new exportUser({
                userid: profile.id,
                email: profile.email,
                avatar: profile.avatar,
                api_token: '',
                roles: [0],
                data: [],
                account_type: '',
                date: now
            });
            userObj.save(function(err, result) {
                if (err) return cb(err);
                return cb(null, result);
            });
        } else {
            cb(err, result);
        }
    });
};

module.exports = userSchema;