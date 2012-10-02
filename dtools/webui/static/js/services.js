function updateStatus() {
    $('.content_element').each( function(result) {
        var title = $(this).find('.title');
        var img = $(this).find('.status img');

        $.getJSON($SCRIPT_ROOT + '/status',
            {name: $(this).find('input[name="name"]').val()},
            function(data) {

                if (data.result) {
                    title.css('color', 'green');
                    img.attr('alt', 'stop');
                    img.attr('src', '/static/img/stop.png');
                    }
                else {
                    title.css('color', '#555');
                    img.attr('alt', 'start');
                    img.attr('src', '/static/img/start.png');
                    }

                });
        });
    };

$(function() {
    updateStatus();
    status_interval = window.setInterval(updateStatus, 2000);
    });

$(function() {
    var interval = null;
    var overlay_pre = null;
    var get_log = null;

    function update_log() {
        overlay_pre.load(get_log);
        };

    $('a[rel="#log_overlay"]').overlay({
        mask: 'black',
        top: 'center',
        onBeforeLoad: function() {
            overlay_pre = this.getOverlay().find('.contentWrap');
            get_log = this.getTrigger().attr('href');
            overlay_pre.load(get_log);

            interval = window.setInterval(update_log, 2000);
            },
        onClose: function() {
            window.clearInterval(interval);
            }
        });
    });

$(function() {
    $('.button').bind('click', function() {
        var action = this.value;
        var div = $(this).parents('.content_element')[0];
        var form = $(this).parents('form').serializeArray();
        // Add the submit button value
        form.push({'name': 'action', 'value': action});

        $.getJSON($SCRIPT_ROOT + '/action',
            form,
            function(data) {
                location.reload();
                });
        return false;
        });
    });

$(function() {
    $('.img_button[alt!="log"]').bind('click', function() {
        var action = $(this).attr('alt');
        var div = $(this).parents('.content_element')[0];
        var form = $(this).parents('form').serializeArray();
        // Add the submit button value
        form.push({'name': 'action', 'value': action});

        if (action == 'edit') {
            $(div).find('.element_edit').slideToggle();
            }
        else {
            $.getJSON($SCRIPT_ROOT + '/action',
                form,
                function(data) {
                    if (data.result == 'remove') {
                        $(div).fadeOut();
                        }
                    else if (data.result == 'add') {
                        location.reload();
                        }
                    });
            }
        return false;
        });
    });
