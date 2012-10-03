function initAddAction() {
    $('.button').bind('click', function() {
        var action = this.value;
        var form = $(this).parents('form').serializeArray();
        form.push({'name': 'action', 'value': action});

        $.getJSON($SCRIPT_ROOT + '/action',
            form,
            function(data) {
                location.reload();
                });

        return false;
        });
    };

function initEditActions() {
    $('.img_button[alt!="log"]').bind('click', function() {
        var action = $(this).attr('alt');
        var div = $(this).parents('.content_element')[0];

        if (action == 'edit') {
            $(div).find('.element_edit').slideToggle();
            }
        else {
            var form = $(this).parents('form').serializeArray();
            form.push({'name': 'action', 'value': action});

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
    };

function updateStatus() {
    if (has_focus) {
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
        }
    };

$(function() {
    initAddAction();
    initEditActions();
    updateStatus();
    var status_interval = window.setInterval(updateStatus, 2000);
    });
