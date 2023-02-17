const w = require('wumpfetch');
const util = require('util');
const url = require('url');


var options = {
  method: 'GET',
  url: 'https://YOUR_DOMAIN/api/v2/users/USER_ID/roles',
  headers: {authorization: 'Bearer MGMT_API_ACCESS_TOKEN'}
};
async function requestRoles() {
    var logoutURL = new url.URL(
        util.format(`https://${process.env.AUTH0_ISSUER_URL}/api/v2/users/oauth2|discord|393996898945728523/roles`, "oauth2|discord|393996898945728523")
      );
const eew = await w({
    method: 'GET',
  url: `https://${process.env.AUTH0_ISSUER_URL}/api/v2/users/oauth2|discord|393996898945728523/roles`,
  headers: {
      authorization: `Bearer ${process.env.MGMT_API_KEY}`}}
  ).send();
    var temp = Buffer.from(eew.body)
    console.log(eew);
}
requestRoles();