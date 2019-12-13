var express = require('express')
    , fs = require('fs')
    , path = require('path')
    , Jimp = require('jimp')
    , bodyParser = require('body-parser');
const fetch = require('node-fetch');

var port = process.env.PORT || 9000; // set our port


var app = express();
let country = "australia";
const GREENSCREEN_DIR = 'public/images/greenscreens/';
const BACKGROUND_DIR_CRUISE = 'public/images/background_cruise/';

const SHARE_DIR = 'public/images/share/';


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
        fs.readFile(GREENSCREEN_DIR + randomimage, function (err, data) {
            res.writeHead(200, {'Content-Type': 'image/jpeg'});
            res.end(data); // Send the file data to the browser.
        });
    });
});

app.get('/randomImageFromCloud', function (req, res) {
    fetch(`https://us-central1-shitty-radar.cloudfunctions.net/getImage`)
    .then(response => response.json())
        .then(data => {
            res.send(data.url); // Send the file data to the browser.
        })
});

app.get('/getCountry', function (req, res) {
    res.send(country); // Send the file data to the browser.
});

app.get('/randomBackground', function (req, res) {
    fetch(`https://us-central1-shitty-radar.cloudfunctions.net/getLocation`)
    .then(response => response.json())
        .then(data => {
            country = data.location;
        })

    const url = BACKGROUND_DIR_CRUISE + country + '/';

    fs.readdir(url, function (err, files) {
        var randomIndex = getRandom(0, (files.length - 1));
        var randomimage = files[randomIndex];
        if (randomimage == '.DS_Store') {
            randomimage = files[randomIndex + 1];
        }
        fs.readFile(url + randomimage, function (err, data) {
            if (path.extname(randomimage) == ".gif") {
                res.writeHead(200, {'Content-Type': 'image/gif'});
            } else {
                res.writeHead(200, {'Content-Type': 'image/jpeg'});
            }
            res.end(data); // Send the file data to the browser.
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
