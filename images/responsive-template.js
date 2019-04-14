

var responsiveTemplateUtils = responsiveTemplateUtils || {},
    resizeTimeOut;

(function (o) {

    var resizeBase = $(window).width(),
        triggerResize = false,
        spyLocation;

    o.modalExperience = checkForModalParam();

    function checkForModalParam(p) {
        var results = new RegExp('[\?&]openModal=([^&#]*)').exec(window.location.href);
        results = results !== null ? { popModal: true, modalId: results[1] } : { popModal: false, modalId: null }
        return results;
    };

    o.hasSizeChange = function () {
        var viewportWidth = $(window).width() + 17;
        if ((resizeBase < 768 && viewportWidth < 768) || resizeBase > 767 && viewportWidth > 767) {
            triggerResize = false;

        } else {
            triggerResize = true;

        }
        resizeBase = viewportWidth;
        return triggerResize;
    };

    o.recalculateFeatureTop = function () {
        var newTop = $('section.hero').outerHeight() - $('#feature-bar').outerHeight();
        if ($('#feature-bar').data('bs.affix') !== null) {
            $('#feature-bar').data('bs.affix').options.offset = newTop
        }
    };


    o.recalculateStickyButtonTop = function () {
        var stickyButtonTop = $('#sticky-button-anchor').offset().top - 109;
        if ($('#sticky-button').data('bs.affix') !== null) {
            $('#sticky-button').data('bs.affix').options.offset = stickyButtonTop
        }
    };

    o.carouselToAccordian = function () {
        console.log("in");
        if (($(window).width() + 17) > 767) {
            if ($("section.carousel-accordian .collapse").hasClass("in")) {
                $("section.carousel-accordian .collapse.in").parent().addClass("active");
            } else {
                $("section.carousel-accordian div.carousel-inner div.item:first-of-type").addClass("active");
            }
            var index = $("section.carousel-accordian div.carousel-inner div.active").index()
            var carouselIndicatorsSelector = "section.carousel-accordian .carousel-indicators li[data-slide-to=" + index + "]";
            $(carouselIndicatorsSelector).addClass("active");
            $("section.carousel-accordian .collapse").addClass("in");
            $("section.carousel-accordian .collapse").css("height", "auto");
        } else {
            if ($("section.carousel-accordian .item").hasClass("active")) {
                $("section.carousel-accordian .item:not(.active) .collapse").removeClass("in");
                $("section.carousel-accordian .item:not(.active) .collapse").css("height", "0");
            } else {
                $("section.carousel-accordian .carousel-inner div.item:first-of-type .collapse").addClass("in");
            }
            $("section.carousel-accordian .carousel-indicators li[data-slide-to]").removeClass("active");
            $("section.carousel-accordian div.carousel-inner div.item.active").removeClass("active");
        }
    };

    o.heroNavSpy = function (e) {
        heroNavArray = e.data;
        $.each(heroNavArray, function (k, v) {

            var docViewTop = $(window).scrollTop(),
                docViewBottom = docViewTop + $(window).height(),
                elemTop = v !== "#" ? $(v).offset().top + 133 : 0,
                elemBottom,
                navElement;

            if (heroNavArray[k + 1] !== undefined) {
                elemBottom = ($(heroNavArray[k + 1]).offset().top + 250 + ($(window).height() / 2))
            } else {
                elemBottom = docViewBottom
            }

            if (((elemTop >= docViewTop) || (elemBottom >= docViewBottom))) {
                if (spyLocation != v) {
                    $("#hero-nav-bar a").removeClass("selected");
                    navElement = v === "#" ? $("#link-to-top") : $("#hero-nav-bar a[href*=" + v.substr(1) + "]");
                    navElement.addClass("selected");
                    $("#hero-nav-bar #listToggle").text(navElement.text());
                    spyLocation = v;
                }
                return false
            }
        })
    };

    o.heroNavStick = function (e) {
        var headerHeight = $("#top-shelf").outerHeight() + $("#main-site-nav").outerHeight() - 2,
            scrollToPos = $(".new-design.hero").outerHeight(),
            y = $(window).scrollTop();

        if (y >= scrollToPos) {
            $("#hero-nav-bar").css({
                "position": "fixed",
                "top": headerHeight,
                "z-index": "10000",
                "border-top": "none",
                "bottom": "auto"
            });
        }
        else {
            $("#hero-nav-bar").removeAttr("style");
        }
    };






})(responsiveTemplateUtils);

/* onload Initilizations */
$(window).on("load", function () {

    var hasFeatureBar = $('#feature-bar').length > 0 && $('#feature-bar.no-stick').length == 0 ? true : false,
        hasHeroNav = $('#hero-nav-bar').length > 0 ? true : false,
        hasStickyButton = $('#sticky-button').length > 0 ? true : false;

    if (hasHeroNav) {
        var heroNavArray = [],
            dataParam = {};

        dataParam.data = heroNavArray;
        if ($(window).width() <= 747) {
            $("ul.hero-sub-nav").addClass("mobile-hero-nav")
        }

        $.each($(".hero-sub-nav a[href]"), function (k, v) {


            if (!$(v).hasClass("dont-index")) {
                heroNavArray[k] = $(v).attr("href");
            }

        });

        $(window).on("scroll", heroNavArray, responsiveTemplateUtils.heroNavSpy)

        responsiveTemplateUtils.heroNavSpy(dataParam);
    }

    if (hasFeatureBar) {
        var newTop = $('section.hero').outerHeight() - $('#feature-bar').outerHeight();
        $('#feature-bar').affix({
            offset: {
                top: function () {
                    return (this.top = newTop)
                }
            }
        })
    }

    if (hasStickyButton) {
        setTimeout(function () {
            var stickyButtonTop = $('#sticky-button-anchor').offset().top - 109;
            $('#sticky-button').affix({
                offset: {
                    top: function () {
                        return (this.top = stickyButtonTop)
                    }
                }
            })
        }, 100)
    }

    $(window).on("orientationchange", function () {
        if (hasFeatureBar) {
            responsiveTemplateUtils.recalculateFeatureTop();
        }
        if (hasStickyButton) {
            responsiveTemplateUtils.recalculateStickyButtonTop();
        }
        responsiveTemplateUtils.carouselToAccordian
    });

    $(window).resize(function () {
        if (responsiveTemplateUtils.hasSizeChange()) {
            if (hasFeatureBar) {
                responsiveTemplateUtils.recalculateFeatureTop();
            }
            responsiveTemplateUtils.carouselToAccordian();
            triggerResize = false;
        }
        if (hasStickyButton) {
            clearTimeout(resizeTimeOut);
            resizeTimeOut = setTimeout(function () {
                responsiveTemplateUtils.recalculateStickyButtonTop();
            }, 1000)
        }

        if (hasHeroNav) {
            if ($(window).width() <= 747) {
                $("ul.hero-sub-nav").addClass("mobile-hero-nav")
            } else {
                $("ul.hero-sub-nav").removeClass("mobile-hero-nav")

            }
        }
    });

    $('.panel-group').on('show.bs.collapse', function () {
        $("section.carousel-accordian .collapse.in").collapse("hide");
    })

    if (responsiveTemplateUtils.modalExperience.popModal === true) {
        $("section[data-modal-name=" + responsiveTemplateUtils.modalExperience.modalId + "] div.modal").modal('show')
    }

    //Full Box Links
    $("[data-link-url]").each(function (key, value) {
        $(value).on("click", function (e) {
            document.location.href = $(e.currentTarget).attr("data-link-url");
        })
    })


    //Platform Graphic Links
    $.each($("[data-url]"), function (k, v) {
        var element = $(v),
            url = element.attr("data-url");

        element.click(url, function (e) {
            document.location.href = e.data;
        })
    })

    //Hero Filter Bar
    $("#hero-nav-bar a").on('click', function (e) {
        var selected = $(e.target),
            selectedText = selected.text()
        $("#listToggle").text(selectedText);
        $("#hero-nav-bar a").removeClass("selected");
        selected.addClass("selected");
    });

    $("ul.hero-sub-nav").on("click", function () {
        $("ul.hero-sub-nav").toggleClass("hero-nav-open");
    })


    //Scrolling Drop List
    $(".scrolling-dropdown-toggle.active").on("click", null, { selector: "li.dropdownLink" }, menuUtils.initializecascadingMenus);






    //carouselToAccordian
    responsiveTemplateUtils.carouselToAccordian();

});