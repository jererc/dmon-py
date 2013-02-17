var isMobile = isMobile();
var hasFocus = true;


function isMobile() {
    if (navigator.userAgent.match(/iPhone|iPod|iPad|Android|WebOS|Blackberry|Symbian|Bada/i)) {
        return true;
    } else {
        return false;
    }
};

function setFontSize() {
    if (!isMobile) {
        var size = screen.width;
        var ratio = 1;
    } else {
        if ($(window).width() > $(window).height()) {
            var size = Math.max(screen.width, screen.height);
            var ratio = 1.5;
        } else {
            var size = Math.min(screen.width, screen.height);
            var ratio = 3;
        }
    }
    if (size >= 1920) {
        var percent = 100;
    } else if (size >= 1600) {
        var percent = 80;
    } else if (size >= 1280) {
        var percent = 62.5;
    } else {
        var percent = 50;
    }
    $('body').css('font-size', ratio * percent + '%');
};

function handleFocus() {
    $(window).blur(function() {
        hasFocus = false;
    });
    $(window).focus(function() {
        hasFocus = true;
    });
};

$(function() {
    setFontSize();
    handleFocus();
});
