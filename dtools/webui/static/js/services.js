var updateLogStatus = true;
var showDelay;

function updateLog(url) {
    if (hasFocus && updateLogStatus) {
        $('.contentWrap').load(url);
    }
};

function initLogOverlay() {
    var interval = null;

    $('div[rel="#log_overlay"]').overlay({
        mask: 'transparent',
        top: 'center',
        onBeforeLoad: function() {
            var logUrl = this.getTrigger().find('.log_url').val();
            updateLog(logUrl);
            interval = window.setInterval(function() { updateLog(logUrl); }, 5000);
        },
        onClose: function() {
            $('.contentWrap').empty();
            window.clearInterval(interval);
        }
    });
};

function initActions() {
    $('.content_element').mouseenter(function() {
        $(this).addClass('element_highlight');
        $(this).find('.element_actions').show();

        var logUrl = $(this).find('.log_url').val();
        $(this).find('.log').load(logUrl);

        var element = $(this).find('.element_info');
        showDelay = setTimeout(function () {
            element.slideDown('fast');
        }, 600);
    });
    $('.content_element').mouseleave(function() {
        clearTimeout(showDelay);
        $(this).removeClass('element_highlight');
        $(this).find('.element_actions').hide();
        $(this).find('.element_info').delay(2000).slideUp('slow');
    });

    $('.img_button[alt="add"]').mouseenter(function() {
        var content = $(this).parents('.content_new')[0];
        $(content).addClass('element_highlight', 200);
        $(content).find('.element_new').slideDown('fast');
    });
    $('.content_new').mouseleave(function() {
        $(this).find('.element_new').slideUp('slow', function() {
            $('.content_new').removeClass('element_highlight', 200);
        });
    });

    $('.img_button[alt="edit"]').bind('click', function() {
        var div = $(this).parents('.content_element')[0];
        $(div).find('.element_edit').slideToggle('fast');
        $(div).find('.save_action').fadeToggle('fast');
        return false;
    });

    $('.img_button[alt="add"]').bind('click', function() {
        var div = $(this).parents('.content_new')[0];
        $.getJSON($SCRIPT_ROOT + '/add',
            $(div).find('form').serializeArray(),
            function(data) {
                if (data.result) {
                    location.reload();
                }
            });
        return false;
    });

    $('.img_button[alt="update"]').bind('click', function() {
        var div = $(this).parents('.content_element')[0];
        $.getJSON($SCRIPT_ROOT + '/update',
            $(div).find('form').serializeArray(),
            function(data) {});
        return false;
    });

    $('.status').bind('click', function() {
        var div = $(this).parents('.content_element')[0];
        $.getJSON($SCRIPT_ROOT + '/set_status',
            {
                name: $(div).find('.element_name').html(),
                action: $(this).attr('alt'),
            },
            function(data) {});
        return false;
    });

    $('.img_button[alt="remove"]').bind('click', function() {
        var div = $(this).parents('.content_element')[0];
        $.getJSON($SCRIPT_ROOT + '/remove',
            {name: $(div).find('.element_name').html()},
            function(data) {
                if (data.result) {
                    $(div).fadeOut();
                }
            });
        return false;
    });

    $('.img_button[alt="log_action"]').bind('click', function() {
        updateLogStatus = ! updateLogStatus;
        if (updateLogStatus) {
            var file = '/static/img/stop.png';
        } else {
            var file = '/static/img/start.png';
        }
        $(this).attr('src', file);
        return false;
    });

};

function updateStatus() {
    if (hasFocus) {
        $('.content_element').each(function(result) {
            var name = $(this).find('.element_name');
            var status = $(this).find('.service_status');
            var img = $(this).find('img.status');

            $.getJSON($SCRIPT_ROOT + '/get_status',
                {name: name.html()},
                function(data) {
                    if (data.result) {
                        status.addClass('service_running');
                        status.removeClass('service_stopped');
                        status.html('running');
                        img.attr('alt', 'stop');
                        img.attr('src', '/static/img/stop.png');
                    } else {
                        status.addClass('service_stopped');
                        status.removeClass('service_running');
                        status.html('stopped');
                        img.attr('alt', 'start');
                        img.attr('src', '/static/img/start.png');
                    }
                });
        });
    }
};

$(function() {
    initLogOverlay();
    initActions();
    updateStatus();
    var statusInterval = window.setInterval(updateStatus, 2000);
});
