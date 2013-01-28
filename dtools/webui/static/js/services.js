var updateLogStatus = true;
var showDelays = {};


function updateLog(url) {
    if (hasFocus && updateLogStatus) {
        $('.log-overlay-content').load(url);
    }
};

function toggleElementNew(element, direction, delay) {
    var id = 'new';
    clearTimeout(showDelays[id]);
    var info = $(element).find('.element-new');
    showDelays[id] = setTimeout(function () {
        if (direction == 'up') {
            info.slideUp('slow', function() {
                $(element).removeClass('element-highlight', 200);
            });
        } else {
            info.slideDown('fast', function() {
                $(element).addClass('element-highlight');
            });
        }
    }, delay);
};

function toggleElement(element, direction, delay) {
    var id = $(element).attr('data-id');
    clearTimeout(showDelays[id]);
    var info = $(element).find('.element-info');
    showDelays[id] = setTimeout(function () {
        if (direction == 'up') {
            info.slideUp('slow');
        } else {
            info.slideDown('fast');
        }
    }, delay);
};

function setStatus(element, status) {
    if (status == 'running') {
        var statusInv = 'stopped';
        var imgName = 'stop';
    } else {
        var statusInv = 'running';
        var imgName = 'start';
    }
    var statusElement = $(element).find('.service-status');
    var img = $(element).find('.img-status');
    statusElement.removeClass('service-' + statusInv).addClass('service-' + status);
    statusElement.html(status);
    img.attr('alt', imgName);
    img.attr('src', '/static/img/' + imgName + '.png');
};

function initLogOverlay() {
    var interval = null;

    $('div[rel="#log-overlay"]').overlay({
        mask: 'transparent',
        top: 'center',
        onBeforeLoad: function() {
            var logUrl = this.getTrigger().find('.log-url').val();
            updateLog(logUrl);
            interval = window.setInterval(function() { updateLog(logUrl); }, 5000);
        },
        onClose: function() {
            $('.log-overlay-content').empty();
            window.clearInterval(interval);
        }
    });
};

function initActions() {
    $('.content-new').mouseenter(function() {
        $(this).addClass('element-highlight');
        toggleElementNew(this, 'down', 600);
    });
    $('.content-new').mouseleave(function() {
        toggleElementNew(this, 'up', 600);
    });

    $('.content-element').mouseenter(function() {
        $(this).addClass('element-highlight');
        var logUrl = $(this).find('.log-url').val();
        $(this).find('.element-log').load(logUrl);
        toggleElement(this, 'down', 600);
    });
    $('.content-element').mouseleave(function() {
        $(this).removeClass('element-highlight');
        toggleElement(this, 'up', 2000);
    });

    if (isMobile) {
        $('.element-actions').each(function() {
            $(this).show();
        });
    } else {
        $('.content-element').mouseenter(function() {
            $(this).find('.element-actions').show();
        });
        $('.content-element').mouseleave(function() {
            $(this).find('.element-actions').hide();
        });
    }

    $('.img-button[alt="edit"]').click(function() {
        var div = $(this).parents('.content-element')[0];
        $(div).find('.element-edit').slideToggle('fast');
        $(div).find('.save-action').fadeToggle('fast');
        return false;
    });

    $('.img-button[alt="add"]').click(function() {
        var div = $(this).parents('.content-new')[0];
        var form = $(div).find('form');
        form.find('.default-text').each(function() {
            if ($(this).val() == this.title) {
                $(this).val("");
            }
        });

        $.getJSON($SCRIPT_ROOT + '/add',
            form.serializeArray(),
            function(data) {
                if (data.message) {
                    initInputFields();
                    $('.add-message').text(data.message);
                } else {
                    location.reload();
                }
            });
        return false;
    });

    $('.img-button[alt="update"]').click(function() {
        var div = $(this).parents('.content-element')[0];
        $.getJSON($SCRIPT_ROOT + '/update',
            $(div).find('form').serializeArray(),
            function(data) {});
        return false;
    });

    $('.img-status').click(function() {
        var div = $(this).parents('.content-element')[0];
        $.getJSON($SCRIPT_ROOT + '/set_status',
            {
                name: $(div).find('.element-name').html(),
                action: $(this).attr('alt'),
            },
            function(data) {});
        return false;
    });

    $('.img-button[alt="remove"]').click(function() {
        var div = $(this).parents('.content-element')[0];
        $.getJSON($SCRIPT_ROOT + '/remove',
            {name: $(div).find('.element-name').html()},
            function(data) {
                if (data.result) {
                    $(div).fadeOut();
                }
            });
        return false;
    });

    $('.img-button[alt="log-action"]').click(function() {
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
    if (!hasFocus) {
        return false;
    }
    $('.content-element').each(function(result) {
        var self = this;
        var name = $(this).find('.element-name');
        $.getJSON($SCRIPT_ROOT + '/get_status',
            {name: name.html()},
            function(data) {
                if (data.result) {
                    setStatus(self, 'running');
                } else {
                    setStatus(self, 'stopped');
                }
            });
    });
};

$(function() {
    initLogOverlay();
    initActions();
    updateStatus();
    var statusInterval = window.setInterval(updateStatus, 2000);
});
