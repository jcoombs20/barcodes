var express = require('express');
var app = express();
var compression = require('compression');

app.use(compression());

app.use(express.static('/home/jason/www/qrcodes'));

app.listen(3416);

console.log("Running on 3416...");

