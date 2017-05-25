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

function encrypt(text){
  var cipher = crypto.createCipher(algorithm,password)
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}

// Read the file
var contents = fs.readFileSync(fileName, {encoding: 'utf-8'});
var encrypted = encrypt(contents);
//console.log(encrypted);
fs.writeFile(fileName, encrypted);
