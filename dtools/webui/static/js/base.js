var has_focus = true;

function handleFocus() {
    $(window).blur(function(){
        has_focus = false;
        });
    $(window).focus(function(){
        has_focus = true;
        });
    };

function updateLog(url) {
    if (has_focus) {
        $('.contentWrap').load(url);
        }
    };

function initLogOverlay() {
    var interval = null;

    $('a[rel="#log_overlay"]').overlay({
        mask: 'black',
        top: 'center',
        onBeforeLoad: function() {
            var get_log_url = this.getTrigger().attr('href');
            updateLog(get_log_url);
            interval = window.setInterval(function() { updateLog(get_log_url); }, 5000);
            },
        onClose: function() {
            window.clearInterval(interval);
            }
        });
    };

$(function() {
    handleFocus();
    initLogOverlay();
    });
