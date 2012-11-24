var update_log = true;

function updateLog(url) {
    if (has_focus && update_log) {
        $('.contentWrap').load(url);
        }
    };

function initLogOverlay() {
    var interval = null;

    $('a[rel="#log_overlay"]').overlay({
        mask: 'transparent',
        top: 'center',
        onBeforeLoad: function() {
            var get_log_url = this.getTrigger().attr('href');
            updateLog(get_log_url);
            interval = window.setInterval(function() { updateLog(get_log_url); }, 5000);
            },
        onClose: function() {
            $('.contentWrap').empty();
            window.clearInterval(interval);
            }
        });
    };

function initActions() {
    $('.content_element').mouseover(function() {
        $(this).addClass('element_highlight');
        $(this).find('.element_actions').show();
        });
    $('.content_element').mouseleave(function() {
        $(this).removeClass('element_highlight');
        $(this).find('.element_actions').hide();
        });

    $('.content_new').mouseover(function() {
        $(this).addClass('element_highlight');
        $(this).find('.element_new').slideDown('fast');
        });
    $('.content_new').mouseleave(function() {
        $(this).find('.element_new').slideUp('fast', function() {
            $('.content_new').removeClass('element_highlight');
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
        update_log = ! update_log;
        if (update_log) {
            var file = '/static/img/stop.png';
            }
        else {
            var file = '/static/img/start.png';
            }
        $(this).attr('src', file);;
        return false;
        });

    };

function updateStatus() {
    if (has_focus) {
        $('.content_element').each( function(result) {
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
                        }
                    else {
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
    var status_interval = window.setInterval(updateStatus, 2000);
    });
