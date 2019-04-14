function GetJQContext() {
    var ctx;
    if ($.mobile !== undefined && $.mobile.activePage !== undefined) {
        ctx = $.mobile.activePage;
    }
    else {
        ctx = $(document);
    }
    return ctx;
}
function GotoNextContent() {
    var ctx = GetJQContext();
    var oRelated = $(ctx).find('div.related-item a[href!="#"]').filter(':first');
    if (oRelated != null && oRelated.length > 0) {
        var newUrl = $(oRelated).attr('href')
        if (newUrl !== undefined && newUrl != "") {
            window.location.href = newUrl;
        }
    }
}

function GotoPreviousContent() {
    parent.history.back();
}

function WireHandlers() {
    var ctx = GetJQContext();

    var nextArt = $(ctx).find('a.nextArticle :first');
    if (nextArt !== undefined) {
        $(nextArt).off('click').on('click', function (ev) {
            GotoNextContent();
            ev.preventDefault();
        });
    }

    var prevArt = $(ctx).find('a.prevArticle :first');
    if (prevArt !== undefined) {
        $(prevArt).off('click').on('click', function (ev) {
            GotoPreviousContent();
            ev.preventDefault();
        });
    }

    var swipeArea = $('.swipeArea'); // GetJQContext();
    if (swipeArea !== undefined) {
        $(swipeArea).on('swipeleft', function (ev) {
            GotoNextContent();
            ev.preventDefault();
        });

        $(swipeArea).on('swiperight', function (ev) {
            GotoPreviousContent();
            ev.preventDefault();
        });
    }
}

$(document).ready(function () {
    WireHandlers();
});

