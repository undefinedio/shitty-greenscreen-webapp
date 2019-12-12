require.config({
    baseUrl: 'lib/seriouslyjs/',
})

require([
    'seriously',
    'effects/seriously.chroma',
    'effects/seriously.bleach-bypass',
    'effects/seriously.blend',
    'effects/seriously.ripple',
], function(Seriously) {
    var greenRGBvalues = 'rgb(30, 222, 32)'

    var foregroundImage = 1
    var backgroundImage = 1
    var $loadingPicture

    var foregroundTimer = 2000
    var backgroundTimerMultiplier = 3
    var updown, diff

    var seriously = new Seriously(), // the main object that holds the entire composition
        logo_image, // a wrapper object for our logo image
        original_image, // a wrapper object for our source image
        background_image,
        movedLogo,
        chroma = seriously.effect('chroma'),
        bleach = seriously.effect('bleach-bypass'),
        blend = seriously.effect('blend'),
        ripple = seriously.effect('ripple'),
        target, // a wrapper object for our target canvas
        x = 0,
        y = 0,
        vx = 0,
        vy = 0,
        lastFrameTime = Date.now()

    function resize() {
        var aspect = window.innerWidth / window.innerHeight
        target.width = Math.min(960, window.innerWidth)
        target.height = target.width / aspect
        reformatForOutput.width = target.width
        reformatForOutput.height = target.height

        // movedLogo.width = target.width / 100; // 494 x 256
        // movedLogo.height = (movedLogo.width / 494) * 256;

        // movedLogo.translateX = (-(target.width / 2) ) + (movedLogo.width / 2);
        // movedLogo.translateY = (target.height / 2) - ( movedLogo.height / 2);
    }

    function chromaMagic() {
        // Create a source object by passing a CSS query string.
        original_image = seriously.source('#original_image')
        logo_image = seriously.source('#logo')
        //logo_image_waf = seriously.source('#logo');
        //loading_image = seriously.source('#loading_image');

        scaleImage = seriously.transform('2d')
        scaleImage.source = original_image
        scaleImage.scale(1000 / 1000)
        original_image = scaleImage

        reformat = seriously.transform('reformat')
        reformatForOutput = seriously.transform('reformat')
        reformat.width = 1280
        reformat.height = 720
        reformat.mode = 'none'
        reformatForOutput.mode = 'cover'

        background_image = seriously.source('#background_image')

        target = seriously.target('#canvas')

        // Apply all sorts of freakin' awesome effects !!!

        //little bit of bleaching to remove oversaturated reds etc...
        bleach.source = scaleImage
        bleach.amount = 0.5

        chroma.weight = '#weight' //how much of the screen color to remove from semi-transparent
        chroma.balance = '#balance' //it's complicated. Play with it.
        chroma.screen = greenRGBvalues
        chroma.clipWhite = '#clipWhite' //The maximum resulting alpha value of keyed pixels
        chroma.clipBlack = '#clipBlack' //The minimum resulting alpha value of keyed pixels

        chroma.source = bleach

        var moveMask = seriously.transform()
        moveMask.source = chroma
        moveMask.translateX = 0
        moveMask.translateY = -100
        moveMask.scale(1)

        ripple.source = background_image

        blend.mode = 'normal'
        blend.bottom = ripple
        blend.top = moveMask

        // connect any node as the source of the target. we only have one.
        reformatForOutput.source = blend

        movedLogo = seriously.transform('2d')
        movedLogo.source = logo_image
        movedLogo.translateX = -500
        movedLogo.translateY = 500
        movedLogo.scale(0.7)

        //reinitialize blend to use it again to merge the logo onto the final image
        blend = seriously.effect('blend')

        blend.bottom = reformatForOutput
        blend.top = movedLogo
        target.source = blend

        seriously.go(function(now) {
            diff = (now - lastFrameTime) / 1000

            updown = Math.sin(diff) * 50
            moveMask.translateX = updown

            ripple.wave = Math.abs(Math.sin(now / 2000 / 4))
            ripple.distortion = Math.abs(Math.sin(now / 1000 / 4.5)) * 2
        })
    }

    var foregroundImage = 0,
        maxforegroundImages = 127

    function init($) {
        chromaMagic()
        resize()
        window.onresize = resize
        StartForegroundLoop()
        StartBackgroundLoop()
        //sharePic();
    }

    function getRandom(min, max) {
        return min + Math.floor(Math.random() * (max - min + 1))
    }

    function nextPic(cb) {
        if (foregroundImage < maxforegroundImages) {
            foregroundImage++
        } else {
            foregroundImage = 1
        }
        // TODO set image als foreground
        // window.history.pushState(null, null, '#' + foregroundImage);
        $.get('/randomImageFromCloud', function(data) {
            console.log(data);

          toDataURL(data, function(dataUrl) {
            $('#original_image').attr('src', dataUrl)
          })
        })
        // loadImage('/randomImageFromCloud', function () {
        //     $('#original_image').attr('src', '/randomImage?count=' + foregroundImage);
        // });
    }

    function prevPic(cb) {
        if (foregroundImage > 1) {
            foregroundImage--
        } else {
            foregroundImage = maxforegroundImages
        }

        //window.history.pushState(null, null, '#' + foregroundImage);

        loadImage('/randomImageFromCloud', function() {
            $('#original_image').attr(
                'src',
                '/randomImage?count=' + foregroundImage
            )
        })
    }

    function StartForegroundLoop() {
        var type = window.location.hash.substr(1)

        if (type === '') {
            foregroundImage = getRandom(foregroundImage, maxforegroundImages)
        } else {
            foregroundImage = type
        }

        // window.history.pushState(null, null, '#' + foregroundImage);
        $('#original_image').attr(
            'src',
            '/randomImage?count=' + foregroundImage
        )

        $('#next').on('click', function(e) {
            e.preventDefault()
            nextPic()
        })

        $('#back').on('click', function(e) {
            e.preventDefault()
            prevPic()
        })

        $(window).keydown(function(e) {
            if (e.keyCode === 39) {
                nextPic()
            }

            if (e.keyCode === 37) {
                prevPic()
            }
        })

        showLoading = false

        slideshow = setInterval(function() {
            nextPic()
        }, 3000)
    }

    function loadImage(src, loaded) {
        var image = new Image()

        showLoading ? $loadingPicture.fadeIn() : ''
        image.onload = function() {
            console.info('Image loaded !')
            //do something...
            showLoading ? $loadingPicture.fadeOut() : ''
            loaded()
        }
        image.onerror = function() {
            console.error('Cannot load image')
            //do something else...
        }
        image.src = src
        return image
    }

    function changeBackground() {
        $('#background_image').attr(
            'src',
            '/randomBackground?count=' + backgroundImage
        )
        backgroundImage++
    }

    function StartBackgroundLoop() {
        setInterval(
            changeBackground,
            foregroundTimer * backgroundTimerMultiplier
        ) // repeat myself
    }

    function startMusic() {
        var music = [
                'hvmKKPU3oJc', // celine dion
                'VGWlOSMmq5o', // dettweiler
                'w15oWDh02K4', // gigi
                'ZnBeTPpr98g', // push
                'pTtcMP87qz8', // 8 bit
                'GM5Kw6LVYlk', // nwagezani
                'g7uHLJOsU_4', // atakak
                'YK3ZP6frAMc', // popcorn
                'pgRUHIeaKOk', // omar
                'D3-vBBQKOYU', // windows error
            ],
            randMusic = music[getRandom(0, music.length - 1)]

        $('body').append(
            '<iframe style="display: none;" width="100%" height="100%" frameborder="0" scrolling="yes" allowtransparency="true" src="//www.youtube.com/embed/' +
                randMusic +
                '?autoplay=1&loop=1&playlist=PL759KJQCqtrxBXCyRgWw9w7plLCVsavBY"></iframe>'
        )
    }

    $(function($) {
        $loadingPicture = $('#loading_image')
        init()
        $loadingPicture.fadeOut()
    })
})

document.cancelFullScreen =
    document.webkitExitFullscreen ||
    document.mozCancelFullScreen ||
    document.exitFullscreen

var elem = document.querySelector('body'),
    slideshow = null,
    showLoading = true

document.addEventListener(
    'keydown',
    function(e) {
        switch (e.keyCode) {
            case 13: // ENTER. ESC should also take you out of fullscreen by default.
                e.preventDefault()
                document.cancelFullScreen() // explicitly go out of fs.
                break
            case 70: // f
                enterFullscreen()
                break
        }
    },
    false
)

$('.btn-play').on('click', function(e) {
    enterFullscreen()
})

function startSlideShow() {
    showLoading = false
    slideshow = setInterval(function() {
        console.log('test')
        nextPic()
    }, 3000)
}

function stopSlideShow() {
    showLoading = true
    console.log('SlideShow Stopped')
    clearTimeout(slideshow)
}

// Called whenever the browser exits fullscreen.
function onFullScreenExit() {
    console.log('Exited fullscreen')
    $('body').removeClass('full-screen')
    stopSlideShow()
}

function onFullScreenEnter() {
    console.log('Entered fullscreen!')
    elem.onwebkitfullscreenchange = onFullScreenExit
    elem.onmozfullscreenchange = onFullScreenExit
    startSlideShow()
}
// Note: FF nightly needs about:config full-screen-api.enabled set to true.
function enterFullscreen() {
    console.log('enterFullscreen()')
    $('body').addClass('full-screen')
    elem.onwebkitfullscreenchange = onFullScreenEnter
    elem.onmozfullscreenchange = onFullScreenEnter
    elem.onfullscreenchange = onFullScreenEnter
    if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT)
    } else {
        if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen()
        } else {
            elem.requestFullscreen()
        }
    }
    //    document.getElementById('enter-exit-fs').onclick = exitFullscreen;
}

function exitFullscreen() {
    console.log('exitFullscreen()')
    document.cancelFullScreen()
    document.getElementById('enter-exit-fs').onclick = enterFullscreen
}

function toDataURL(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function() {
    var reader = new FileReader();
    reader.onloadend = function() {
      callback(reader.result);
    }
    reader.readAsDataURL(xhr.response);
  };
  xhr.open('GET', url);
  xhr.responseType = 'blob';
  xhr.send();
}
