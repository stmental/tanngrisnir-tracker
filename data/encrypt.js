var fs = require('fs');
var crypto = require('crypto');
var shell = require('shelljs');

var algorithm = 'aes-256-ctr';
var fileName = 'strava_config';

// password is passed as first parameter
if (process.argv.length < 4){
    console.log("The password must be passed as the third parameter");
    console.log("The filename must be passed as the fourth parameter");
    return;
}
var password = process.argv[2];
var fileName = process.argv[3];

function encrypt(text){
  var cipher = crypto.createCipher(algorithm,password)
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}

// Read the config file
var contents = fs.readFileSync(fileName, {encoding: 'utf-8'});
var encrypted = encrypt(contents);
//console.log(encrypted);
fs.writeFile(fileName, encrypted);
console.log(`Encrypted file ${fileName}`)

// If any *userToken files exist, encrypt them too
// shell.find('.').forEach((file) => {
//     var regex = new RegExp(/.*UserToken$/);
// 	if (regex.test(file)){
//         var contents = fs.readFileSync(file, {encoding: 'utf-8'});
//         var encrypted = encrypt(contents);
//         fs.writeFile(file, encrypted);
//         console.log(`Encrypted user token file ${file}`)
// 	}
// });
