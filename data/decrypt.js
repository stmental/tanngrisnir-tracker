
var fs = require('fs');
var crypto = require('crypto');
//var shell = require('shelljs');

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

function decrypt(text){
  var decipher = crypto.createDecipher(algorithm,password)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}

// Read the file
var contents = fs.readFileSync(fileName, {encoding: 'utf-8'});
var decrypted = decrypt(contents);
//console.log(decrypted);
fs.writeFile(fileName, decrypted, (err) => {
  if (err) throw err;
  //console.log('The file has been saved!');
});
console.log(`Decrypted file ${fileName}`)

// If any *userToken files exist, decrypt them too
// shell.find('.').forEach((file) => {
//     var regex = new RegExp(/.*UserToken$/);
// 	if (regex.test(file)){
//         var contents = fs.readFileSync(file, {encoding: 'utf-8'});
//         var decrypted = decrypt(contents);
//         fs.writeFile(file, decrypted);
//         console.log(`Decrypted user token file ${file}`)
// 	}
// });