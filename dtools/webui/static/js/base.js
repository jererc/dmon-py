var has_focus = true;

function handleFocus() {
    $(window).blur(function(){
        has_focus = false;
        });
    $(window).focus(function(){
        has_focus = true;
        });
    };

$(function() {
    handleFocus();
    });
