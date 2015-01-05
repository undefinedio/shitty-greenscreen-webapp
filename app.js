var express = require('express')
    , fs = require('fs')
    , path = require('path')
    , bodyParser = require('body-parser');
var port = process.env.PORT || 9000; // set our port

var app = express();
const GREENSCREEN_DIR = 'public/images/greenscreens/';
const BACKGROUND_DIR = 'public/images/backgrounds/';


var express = require('express');
var app = express();

app.use(express.static(__dirname + '/public'));

function getRandom(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
}

var count = 0;

app.get('/randomImage', function (req, res) {

    var count = req.query.count;

    fs.readdir(GREENSCREEN_DIR, function (err, files) {
        var randomIndex = count;
        var randomimage = files[randomIndex];
        console.log('serving ' + GREENSCREEN_DIR + randomimage);
        fs.readFile(GREENSCREEN_DIR + randomimage, function (err, data) {
            res.writeHead(200, {'Content-Type': 'image/jpeg'});
            res.end(data); // Send the file data to the browser.
        });
    });
});

app.get('/randomBackground', function (req, res) {

    fs.readdir(BACKGROUND_DIR, function (err, files) {
        var randomIndex = getRandom(0, (files.length - 1));
        var randomimage = files[randomIndex];
        console.log('serving ' + BACKGROUND_DIR + randomimage);
        fs.readFile(BACKGROUND_DIR + randomimage, function (err, data) {
            if (path.extname(randomimage) == ".gif") {
                res.writeHead(200, {'Content-Type': 'image/gif'});
            } else {
                res.writeHead(200, {'Content-Type': 'image/jpeg'});
            }
            res.end(data); // Send the file data to the browser.
        });
    });
});


app.listen(port);
console.log('Magic happens on port ' + port);