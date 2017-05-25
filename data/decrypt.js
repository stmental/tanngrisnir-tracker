
var fs = require('fs');
var crypto = require('crypto');
var algorithm = 'aes-256-ctr';
var fileName = 'strava_config';

// password is passed as first parameter
if (process.argv.length < 3){
    console.log("The password must be passed as a parameter");
    return;
}
var password = process.argv[2];

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
fs.writeFile(fileName, decrypted);