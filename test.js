
const db = require('./src/bot/database/mysql');
db.query("select * from cyciTempSignup", function(err, data) {

    console.log(data);
});