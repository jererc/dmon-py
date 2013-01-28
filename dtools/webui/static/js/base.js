var isMobile = isMobile();
var hasFocus = true;


function isMobile() {
    if (navigator.userAgent.match(/iPhone|iPod|iPad|Android|WebOS|Blackberry|Symbian|Bada/i)) {
        return true;
    } else {
        return false;
    }
};

function handleFocus() {
    $(window).blur(function() {
        hasFocus = false;
    });
    $(window).focus(function() {
        hasFocus = true;
    });
};

function initInputFields() {
    $('.default-text').focus(function() {
        if ($(this).val() == $(this)[0].title) {
            $(this).removeClass('default-text-active');
            $(this).val("");
        }
    });
    $('.default-text').blur(function() {
        if ($(this).val() == "") {
            $(this).addClass('default-text-active');
            $(this).val($(this)[0].title);
        }
    });
    $('.default-text').blur();
};

$(function() {
    if (isMobile) {
        $('body').addClass('wide');
    }
    handleFocus();
    initInputFields();
});
