var express = require('express')
    , fs = require('fs')
    , path = require('path')
    , Jimp = require('jimp')
    , bodyParser = require('body-parser');
var port = process.env.PORT || 9000; // set our port

var app = express();
const GREENSCREEN_DIR = 'public/images/greenscreens/';
const BACKGROUND_DIR = 'public/images/backgrounds/';

const GREENSCREEN_DIR_WAF = 'public/images/greenscreens_maf/';
const BACKGROUND_DIR_WAF = 'public/images/backgrounds_maf/';


const SHARE_DIR = 'public/images/share/';

var express = require('express');
var app = express();

app.use(express.static('public'));

function getRandom(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
}

var count = 0;

function startsWith(str, prefix) {
    return str.lastIndexOf(prefix, 0) === 0;
}

app.get('/shareImage.jpg', function (req, res) {
    fs.readdir(SHARE_DIR, function (err, files) {
        var randomIndex = getRandom(0, (files.length - 1));
        var randomimage = files[randomIndex];
        fs.readFile(SHARE_DIR + randomimage, function (err, data) {
            console.log('serving ' + SHARE_DIR + randomimage);
            res.writeHead(200, {'Content-Type': 'image/jpeg'});
            res.end(data); // Send the file data to the browser.
        });
    });
});

app.get('/randomImage', function (req, res) {

    var count = req.query.count;

    fs.readdir(GREENSCREEN_DIR, function (err, files) {

        if (count === 'false') {
            count = getRandom(0, (files.length - 1));
        }
        var randomIndex = count;
        var randomimage = files[randomIndex];
//        console.log('serving ' + GREENSCREEN_DIR + randomimage);
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
        if (randomimage == '.DS_Store') {
            randomimage = files[randomIndex + 1];
        }
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

app.get('/randomImageWAF', function (req, res) {
    var DIR = GREENSCREEN_DIR_WAF;

    fs.readdir(DIR, function (err, files) {
        var randomIndex = getRandom(0, (files.length - 1));
        var randomimage = files[randomIndex];
        console.log('serving ' + DIR + randomimage);
        if (randomimage == '.DS_Store') {
            randomimage = files[randomIndex + 1];
        }
        var image = new Jimp(DIR + randomimage, function (err, image) {

            res.writeHead(200, {'Content-Type': 'image/jpeg'});
            this.clone().resize(720, Jimp.AUTO).getBuffer('image/jpeg', function (err, buffer) {
                // buffer is JPEG as a buffer
                res.end(buffer);
            });
        });
    });
});


app.get('/randomBackgroundWAF', function (req, res) {
    var targetHeight = 1000,
        targetWidth = Jimp.AUTO;

    fs.readdir(BACKGROUND_DIR_WAF, function (err, files) {
        var randomIndex = getRandom(0, (files.length - 1));
        var randomimage = files[randomIndex];
        console.log('serving ' + BACKGROUND_DIR + randomimage);
        if (randomimage == '.DS_Store') {
            randomimage = files[randomIndex + 1];
        }

        var image = new Jimp(BACKGROUND_DIR_WAF + randomimage, function (err, image) {

            if (err) throw err;

            if (path.extname(randomimage) == ".gif") {
                res.writeHead(200, {'Content-Type': 'image/gif'});
                this.clone().resize(targetWidth, targetHeight).getBuffer('image/gif', function (err, buffer) {
                    // buffer is JPEG as a buffer
                    res.end(buffer);
                });

            } else {
                res.writeHead(200, {'Content-Type': 'image/jpeg'});
                this.clone().resize(targetWidth, targetHeight).getBuffer('image/jpeg', function (err, buffer) {
                    // buffer is JPEG as a buffer
                    res.end(buffer);
                });
            }
        });
    });
});


app.get('/shareImage.png', function (req, res) {
    var image = req.query.image,
        background = req.query.background;

    phantom.create(function (ph) {
        ph.createPage(function (page) {
            page.open("http://localhost:9000", function (status) {
                setTimeout(function () {
                    console.log("opened partypics? ", status);
                    page.render('shareImage.png', {format: 'png', quality: '100'});
                    ph.exit();
                }, 500);
            });
        });
    });
});

app.listen(port);
console.log('Magic happens on port ' + port);