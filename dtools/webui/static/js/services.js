var showDelays = {};
var updateLogStatus = true;


function toggleElement(id, element, direction, delay) {
    clearTimeout(showDelays[id]);
    if (!element) {
        return false;
    }
    showDelays[id] = setTimeout(function() {
        if (direction == 'up') {
            element.slideUp(300);
        } else {
            element.slideDown(100);
        }
    }, delay);
};

function updateLog(url) {
    if (hasFocus && updateLogStatus) {
        $('.log-overlay-content').load(url);
    }
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
            var logUrl = this.getTrigger().attr('data-log-url');
            updateLog(logUrl);
            interval = window.setInterval(function() {
                updateLog(logUrl);
                }, 5000);
        },
        onClose: function() {
            $('.log-overlay-content').empty();
            window.clearInterval(interval);
        }
    });
};

function initActions() {
    $('.content-new-trigger, .content-new').mouseenter(function() {
        toggleElement('new', $('.content-new'), 'down', 500);
    });
    $('.content-new-trigger').mouseleave(function() {
        toggleElement('new');
    });
    $('.content-new').mouseleave(function() {
        toggleElement('new', $(this), 'up', 600);
    });

    $('.content-element').mouseenter(function() {
        $(this).addClass('element-highlight');
        var logUrl = $(this).find('div[rel="#log-overlay"]').attr('data-log-url');
        $(this).find('.element-log').load(logUrl);
        toggleElement($(this).attr('data-id'),
                $(this).find('.element-info'), 'down', 600);
    });
    $('.content-element').mouseleave(function() {
        $(this).removeClass('element-highlight');
        toggleElement($(this).attr('data-id'),
                $(this).find('.element-info'), 'up', 2000);
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
        $.getJSON($SCRIPT_ROOT + '/add',
            form.serializeArray(),
            function(data) {
                if (data.message) {
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
        updateLogStatus = !updateLogStatus;
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
