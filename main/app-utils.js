/*global $, jQuery, alert, console, videojs, getVideoHeight, getEmbededTagType, window, setTimeout, closeVideoPlayer, initilizeVideo **/
/*!
 * app-utils.js Start
 */
/**/

var backToTop = backToTop || {},
    mobileUtils = mobileUtils || {},
    modalUtils = modalUtils || {},
    captchaUtils = captchaUtils || {},
    resizingUtils = resizingUtils || {},
    menuUtils = menuUtils || {},
    callbackUtils = callbackUtils || {},
    animationUtils = animationUtils || {};

//BACKTOTOP
(function (o) {
    'use strict';
    $(function () {
        $(".back-to-top").click(function () {
            $("html, body").animate({
                scrollTop: 0
            });
        });
    });
}(backToTop));


//CAPTCHA UTILITIES
(function (o) {
    o.IsCaptchaValid = function () {
        var one = $("#recaptcha_challenge_field").val();
        var two = $("#recaptcha_response_field").val();

        var result = "";
        var status = false;
        $.ajax({
            type: "POST",
            url: "/_Layouts/WWW/WebMethods.aspx/CheckCaptcha",
            data: "{'challengeField': '" + one + "', 'responseField': '" + two + "'}",
            async: false,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (msg) {
                result = msg.d;
                if (result == "1") {
                    status = true;
                } else {
                    status = false;
                }
            },
            failure: function (msg) {
                //alert('Error: ' + msg);
                status = false;
            },
            error: function (xhr, ajaxOptions, thrownError) {
                //alert("In Error -> status: " + xhr.status + " statusText: " + xhr.statusText);
                status = false;
            }
        });
        return status;
    }

}(captchaUtils));


//MOBILE UTILITIES
(function (o) {
    o.isMobile = function () {
        var agents = ['Windows Phone', 'Nokia', 'KFAPWI', 'Android', 'iPad', 'iPhone', 'iPod'],
            userAgent = navigator.userAgent || navigator.vendor || window.opera,
            pattern = "",
                result = false;

        agents.forEach(function (c, i, a) {
            pattern = new RegExp(c, "i");
            if (userAgent.match(pattern)) {
                result = true;
            }
        });
        return result;
    };
}(mobileUtils));


//MODAL UTILITIES
(function (o) {

    o.exitMessage = function () {
        var linkVal = $(this).attr("href"),
            exitExceptionArray = ["dyalcapital.com", "financialtrans.com", "nb.com", "nbalternatives.com", "myneuberger.com", "webcasts.com"];
        if (linkVal !== undefined && !linkVal.search(/^(http[s]?:\/\/|\/\/)/)) {
            var domainIndex = linkVal.indexOf("//") + 2,
                linkDomain = linkVal.slice(domainIndex).slice(0, linkVal.slice(domainIndex).search(/\/|\?/ig)),
                linkDomainArr = linkDomain.split("."),
                linkDomainArrLn = linkDomainArr.length - 1,
                linkDomainFinal = linkDomainArr[linkDomainArrLn - 1] + "." + linkDomainArr[linkDomainArrLn],
                hostname = document.location.hostname,
                hostnameArr = hostname.split("."),
                hostnameArrLn = hostnameArr.length - 1,
                hostFinal = hostnameArr[hostnameArrLn - 1] + "." + hostnameArr[hostnameArrLn];


            if (linkDomainFinal !== hostFinal && exitExceptionArray.indexOf(linkDomainFinal) === -1) {
                $('#exitModal').modal('show');
                $('#exitModal').attr("data-exit-url", linkVal);
                $('#exitModal .modal-footer button').one("click", function (e) {
                    if ($(e.target).attr("data-action") !== "stay") {
                        var win = window.open($('#exitModal').attr("data-exit-url"), '_blank');
                        win.focus();
                    }
                });
                return false;
            }
        }
    }

    o.getModalContent = function (modalName) {
        var returnValue;
        try {
            if (modalName.length == 0) {
                return false;
            }
            var result = "";
            $.ajax({
                type: "POST",
                url: "/_Layouts/WWW/WebMethods.aspx/GetDynamicModal",
                data: "{'modalName': '" + modalName + "'}",
                async: false,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (msg) {
                    result = msg.d;
                    // For Eloqua forms to take modal name for ID and Name to keep identifiers consistant.
                    result = result.replace(/FORM_TOKEN_PLACEHOLDER/g, modalName);
                    if (result.length == 0) {
                        returnValue = {};
                    } else {
                        returnValue = result;
                    }
                },
                error: function (e) {
                    returnValue = {};
                }
            });
        } catch (e) {
            console.log(e);
        }
        return returnValue;
    }

    o.appendModalContent = function (result, modalContainer) {
        try {
            var jsonModal = JSON.parse(result);
            $(modalContainer).html(jsonModal.modal_content);
            $(modalContainer).append(jsonModal.modal_script);
        } catch (e) {
            console.log(e);

            var errorMessage =
            "<div class='modal-dialog' role='document'>" +
            "<div class='modal-content'>" +
            "<div class='modal-header'>" +
            "<button type='button' class='close' data-dismiss='modal' aria-label='Close'>" +
            "<span aria-hidden='true'>&times;</span>" +
            "</button>" +
            "<div class='modal-header-content'>" +
            "<div class='modal-title'>Sorry an Error Occured</div>" +
            "</div>" +
            "</div>" +
            "<div class='modal-body' style='text-align:center'>" +
            "<p>Please try again later</p>" +
            "</div>" +
            "<div class='modal-footer'></div>" +
            "</div>" +
            "</div>"

            $(modalContainer).html(errorMessage);

        }
    }

    o.initOnDemandModalLinks = function () {
        var commonModalHandle = $("section[data-modal-name=Common_Reusable_Modal] div.modal");

        $.each($("[data-target*=Common_Reusable_Modal]"), function (key, value) {
            var cmsModalData = $(value).attr("data-modal-cms-name"),
                htmlModalData = $(value).attr("data-modal-html-id");

            if (cmsModalData) {
                $(value).on("click", null, cmsModalData, function (e) {
                    e.preventDefault();
                    commonModalHandle.empty();
                    o.appendModalContent(o.getModalContent(e.data), commonModalHandle);
                    $(commonModalHandle).modal('show');
                })
            } else if (htmlModalData) {
                $(value).on("click", null, htmlModalData, function (e) {
                    e.preventDefault();
                    commonModalHandle.empty();
                    $("#" + e.data).clone().appendTo(commonModalHandle)
                    $(commonModalHandle).modal('show');
                })
            }
        })
    }

    o.populateInlineModals = function () {
        $.each($("section[data-modal-name]"), function (key, value) {

            if ($(value).attr("data-modal-name") !== "Common_Reusable_Modal") {
                var modalName = $(value).attr("data-modal-name");
                var modalContainer = $(value).find("div.modal");
                $("body").append($(value).detach());
                o.appendModalContent(o.getModalContent(modalName), modalContainer);
            }


        });
    }


    o.getSelfIdentificationModalData = function () {



        //o.selfIdentObj = {
        //    "countryList": [
        //        {
        //            "regionName": "Americas",
        //            "locationList": [
        //                {
        //                    "name": "United States",
        //                    "uid": "en-US"
        //                },
        //                {
        //                    "name": "Latin America",
        //                    "uid": "en-AR"
        //                }
        //            ]
        //        },
        //        {
        //            "regionName": "Asia Pacific",
        //            "locationList": [
        //                {
        //                    "name": "Australia",
        //                    "uid": "en-AU"
        //                },
        //                {
        //                    "name": "Hong Kong/香港",
        //                    "uid": "en-HK"
        //                },
        //                {
        //                    "name": "日本",
        //                    "uid": "ja-JP"
        //                },
        //                {
        //                    "name": "Singapore",
        //                    "uid": "en-SG"
        //                },
        //                {
        //                    "name": "台灣",
        //                    "uid": "zh-TW"
        //                },
        //                {
        //                    "name": "Asia Institutions/亚洲机构投资者",
        //                    "uid": "en-CN"
        //                }
        //            ]
        //        },
        //        {
        //            "regionName": "Europe and the Middle East",
        //            "locationList": [
        //                {
        //                    "name": "Austria",
        //                    "uid": "en-AT"
        //                },
        //                {
        //                    "name": "Belgium",
        //                    "uid": "en-BE"
        //                },
        //                {
        //                    "name": "Denmark",
        //                    "uid": "en-DK"
        //                },
        //                {
        //                    "name": "Finland",
        //                    "uid": "en-FI"
        //                },
        //                {
        //                    "name": "France",
        //                    "uid": "en-FR"
        //                },
        //                {
        //                    "name": "Germany",
        //                    "uid": "en-DE"
        //                },
        //                {
        //                    "name": "Iceland",
        //                    "uid": "en-is"
        //                },
        //                {
        //                    "name": "Israel",
        //                    "uid": "en-IL"
        //                },
        //                {
        //                    "name": "Italia",
        //                    "uid": "it-IT"
        //                },
        //                {
        //                    "name": "Luxembourg",
        //                    "uid": "en-LU"
        //                },
        //                {
        //                    "name": "Middle East",
        //                    "uid": "en-AE"
        //                },
        //                {
        //                    "name": "Netherlands",
        //                    "uid": "en-NL"
        //                },
        //                {
        //                    "name": "Norway",
        //                    "uid": "en-NO"
        //                },
        //                {
        //                    "name": "Spain",
        //                    "uid": "en-ES"
        //                },
        //                {
        //                    "name": "Sweden",
        //                    "uid": "en-SE"
        //                },
        //                {
        //                    "name": "Switzerland",
        //                    "uid": "en-CH"
        //                },
        //                {
        //                    "name": "United Kingdom",
        //                    "uid": "en-GB"
        //                }
        //            ]
        //        }
        //    ],
        //    "audiences": [{
        //        "cultureId": "en-US",
        //        "audienceList": [{
        //            "audienceId": "a_en-US_Financial_Professionals",
        //            "audienceName": "Financial Professionals",
        //            "destination": "/pages/public/en-de/de-ucits.aspx#filter=*"
        //        }, {
        //            "audienceId": "a_en-US_Institutional_Consultants",
        //            "audienceName": "Institutions",
        //            "destination": "/pages/public/en-de/de-ucits.aspx#filter=*"
        //        }, {
        //            "audienceId": "a_en-US_Institutions",
        //            "audienceName": "Institutions",
        //            "destination": "/pages/public/en-de/de-ucits.aspx#filter=*"
        //        }, {
        //            "audienceId": "a_en-US_Mutual_Fund_Investor",
        //            "audienceName": "Individuals and Families",
        //            "destination": "/pages/public/en-de/de-ucits.aspx#filter=*"
        //        }, {
        //            "audienceId": "a_en-US_Wealth_Management",
        //            "audienceName": "Individuals and Families",
        //            "destination": "/pages/public/en-de/de-ucits.aspx#filter=*"
        //        }]
        //    }, {
        //        "cultureId": "en-AR",
        //        "audienceList": [{
        //            "audienceId": "a_en-AR_Financial_Professionals",
        //            "audienceName": "Financial Professionals",
        //            "destination": "/pages/public/en-de/de-ucits.aspx#filter=*"
        //        }, {
        //            "audienceId": "a_en-AR_Institutions",
        //            "audienceName": "Institutional Investors",
        //            "destination": "/pages/public/en-de/de-ucits.aspx#filter=*"
        //        }]
        //    }, {
        //        "cultureId": "en-AU",
        //        "audienceList": [{
        //            "audienceId": "a_en-AU_Institutions",
        //            "audienceName": "Wholesale investors",
        //            "destination": "/pages/public/en-de/de-ucits.aspx#filter=*"
        //        }, {
        //            "audienceId": "a_en-AU_Retail",
        //            "audienceName": "Retail",
        //            "destination": "/pages/public/en-de/de-ucits.aspx#filter=*"
        //        }]
        //    }, {
        //        "cultureId": "en-HK",
        //        "audienceList": [{
        //            "audienceId": "a_en-HK_Financial_Professionals",
        //            "audienceName": "Professional Investors",
        //            "destination": "/Pages/Public/en-hk/Products/us-strategic-income-fund-advisor.aspx"
        //        }, {
        //            "audienceId": "a_en-HK_Retail",
        //            "audienceName": "Retail Investors ",
        //            "destination": "/Pages/Public/en-hk/Products/us-strategic-income-fund.aspx"
        //        }, {
        //            "audienceId": "a_zh-HK_Retail",
        //            "audienceName": "零售投資者",
        //            "destination": "/Pages/Public/zh-hk/Products/us-strategic-income-fund.aspx"
        //        }, {
        //            "audienceId": "a_zh-HK_Financial_Professionals",
        //            "audienceName": "專業投資者",
        //            "destination": "/Pages/Public/zh-hk/Products/us-strategic-income-fund-advisor.aspx"
        //        }]
        //    }, {
        //        "cultureId": "ja-JP",
        //        "audienceList": [{
        //            "audienceId": "a_ja-JP_Financial_Professionals",
        //            "audienceName": "Financial Professionals",
        //            "destination": "/pages/public/en-de/de-ucits.aspx#filter=*"
        //        }, {
        //            "audienceId": "a_ja-JP_Institutions",
        //            "audienceName": "機関投資家・個人投資家",
        //            "destination": "/pages/public/en-de/de-ucits.aspx#filter=*"
        //        }]
        //    }, {
        //        "cultureId": "en-SG",
        //        "audienceList": [{
        //            "audienceId": "a_en-SG_Financial_Professionals",
        //            "audienceName": "Accredited Investors",
        //            "destination": "/pages/public/en-de/de-ucits.aspx#filter=*"
        //        }, {
        //            "audienceId": "a_en-SG_Retail",
        //            "audienceName": "Retail Investors",
        //            "destination": "/pages/public/en-de/de-ucits.aspx#filter=*"
        //        }]
        //    }, {
        //        "cultureId": "zh-TW",
        //        "audienceList": [{
        //            "audienceId": "a_zh-TW_DBU",
        //            "audienceName": "零售投資人",
        //            "destination": "/pages/public/zh-tw/ucits-funds-retail.aspx#filter=.global-non-investment-grade-credit"
        //        }]
        //    }, {
        //        "cultureId": "en-CN",
        //        "audienceList": [{
        //            "audienceId": "a_en-CN_Institutions",
        //            "audienceName": "Institutions",
        //            "destination": "/pages/public/en-de/de-ucits.aspx#filter=*"
        //        }, {
        //            "audienceId": "a_zh-CN_Institutions",
        //            "audienceName": "机构投资者",
        //            "destination": "/pages/public/en-de/de-ucits.aspx#filter=*"
        //        }]
        //    }, {
        //        "cultureId": "en-AT",
        //        "audienceList": [{
        //            "audienceId": "a_en-AT_Financial_Professionals",
        //            "audienceName": "Financial Professionals",
        //            "destination": "/pages/public/en-de/de-ucits.aspx#filter=*"
        //        }, {
        //            "audienceId": "a_en-AT_Institutions",
        //            "audienceName": "Institutional Investors",
        //            "destination": "/pages/public/en-de/de-ucits.aspx#filter=*"
        //        }]
        //    }, {
        //        "cultureId": "en-BE",
        //        "audienceList": [{
        //            "audienceId": "a_en-BE_Financial_Professionals",
        //            "audienceName": "Financial Professionals",
        //            "destination": "/pages/public/en-de/de-ucits.aspx#filter=*"
        //        }, {
        //            "audienceId": "a_en-BE_Institutions",
        //            "audienceName": "Institutional Investors",
        //            "destination": "/pages/public/en-de/de-ucits.aspx#filter=*"
        //        }]
        //    }, {
        //        "cultureId": "en-DK",
        //        "audienceList": [{
        //            "audienceId": "a_en-DK_Financial_Professionals",
        //            "audienceName": "Financial Professionals",
        //            "destination": "/pages/public/en-de/de-ucits.aspx#filter=*"
        //        }, {
        //            "audienceId": "a_en-DK_Institutions",
        //            "audienceName": "Institutional Investors",
        //            "destination": "/pages/public/en-de/de-ucits.aspx#filter=*"
        //        }]
        //    }, {
        //        "cultureId": "en-FI",
        //        "audienceList": [{
        //            "audienceId": "a_en-FI_Financial_Professionals",
        //            "audienceName": "Financial Professionals",
        //            "destination": "/pages/public/en-de/de-ucits.aspx#filter=*"
        //        }, {
        //            "audienceId": "a_en-FI_Institutions",
        //            "audienceName": "Institutional Investors",
        //            "destination": "/pages/public/en-de/de-ucits.aspx#filter=*"
        //        }]
        //    }, {
        //        "cultureId": "en-FR",
        //        "audienceList": [{
        //            "audienceId": "a_en-FR_Financial_Professionals",
        //            "audienceName": "Financial Professionals",
        //            "destination": "/pages/public/en-de/de-ucits.aspx#filter=*"
        //        }, {
        //            "audienceId": "a_en-FR_Institutions",
        //            "audienceName": "Institutional Investors",
        //            "destination": "/pages/public/en-de/de-ucits.aspx#filter=*"
        //        }]
        //    }, {
        //        "cultureId": "en-DE",
        //        "audienceList": [{
        //            "audienceId": "a_en-DE_Financial_Professionals",
        //            "audienceName": "Financial Professionals",
        //            "destination": "/pages/public/en-de/de-ucits.aspx#filter=*"
        //        }, {
        //            "audienceId": "a_en-DE_Institutions",
        //            "audienceName": "Institutional Investors",
        //            "destination": "/pages/public/en-de/de-ucits.aspx#filter=*"
        //        }]
        //    }, {
        //        "cultureId": "en-is",
        //        "audienceList": [{
        //            "audienceId": "a_en-IS_Financial_Professionals",
        //            "audienceName": "Financial Professionals",
        //            "destination": "/pages/public/en-de/de-ucits.aspx#filter=*"
        //        }, {
        //            "audienceId": "a_en-IS_Institutions",
        //            "audienceName": "Institutional Investors",
        //            "destination": "/pages/public/en-de/de-ucits.aspx#filter=*"
        //        }]
        //    }, {
        //        "cultureId": "en-IL",
        //        "audienceList": [{
        //            "audienceId": "a_en-IL_Financial_Professionals",
        //            "audienceName": "Financial Professionals",
        //            "destination": "/pages/public/en-de/de-ucits.aspx#filter=*"
        //        }, {
        //            "audienceId": "a_en-IL_Institutions",
        //            "audienceName": "Institutional Investors",
        //            "destination": "/pages/public/en-de/de-ucits.aspx#filter=*"
        //        }]
        //    }, {
        //        "cultureId": "it-IT",
        //        "audienceList": [{
        //            "audienceId": "a_it-IT_Institutions",
        //            "audienceName": "Clienti Istituzionali",
        //            "destination": "/pages/public/en-de/de-ucits.aspx#filter=*"
        //        }, {
        //            "audienceId": "a_it-IT_Financial_Professionals",
        //            "audienceName": "Investitori Professionali",
        //            "destination": "/pages/public/en-de/de-ucits.aspx#filter=*"
        //        }]
        //    }, {
        //        "cultureId": "en-LU",
        //        "audienceList": [{
        //            "audienceId": "a_en-LU_Financial_Professionals",
        //            "audienceName": "Financial Professionals",
        //            "destination": "/pages/public/en-de/de-ucits.aspx#filter=*"
        //        }, {
        //            "audienceId": "a_en-LU_Institutions",
        //            "audienceName": "Institutional Investors",
        //            "destination": "/pages/public/en-de/de-ucits.aspx#filter=*"
        //        }]
        //    }, {
        //        "cultureId": "en-AE",
        //        "audienceList": [{
        //            "audienceId": "a_en-AE_Financial_Professionals",
        //            "audienceName": "Financial Professionals",
        //            "destination": "/pages/public/en-de/de-ucits.aspx#filter=*"
        //        }, {
        //            "audienceId": "a_en-AE_Institutions",
        //            "audienceName": "Institutional Investors",
        //            "destination": "/pages/public/en-de/de-ucits.aspx#filter=*"
        //        }]
        //    }, {
        //        "cultureId": "en-NL",
        //        "audienceList": [{
        //            "audienceId": "a_en-NL_Financial_Professionals",
        //            "audienceName": "Financial Professionals",
        //            "destination": "/pages/public/en-de/de-ucits.aspx#filter=*"
        //        }, {
        //            "audienceId": "a_en-NL_Institutions",
        //            "audienceName": "Institutional Investors",
        //            "destination": "/pages/public/en-de/de-ucits.aspx#filter=*"
        //        }]
        //    }, {
        //        "cultureId": "en-NO",
        //        "audienceList": [{
        //            "audienceId": "a_en-NO_Financial_Professionals",
        //            "audienceName": "Financial Professionals",
        //            "destination": "/pages/public/en-de/de-ucits.aspx#filter=*"
        //        }, {
        //            "audienceId": "a_en-NO_Institutions",
        //            "audienceName": "Institutional Investors",
        //            "destination": "/pages/public/en-de/de-ucits.aspx#filter=*"
        //        }]
        //    }, {
        //        "cultureId": "en-ES",
        //        "audienceList": [{
        //            "audienceId": "a_en-ES_Financial_Professionals",
        //            "audienceName": "Financial Professionals",
        //            "destination": "/pages/public/en-de/de-ucits.aspx#filter=*"
        //        }, {
        //            "audienceId": "a_en-ES_Institutions",
        //            "audienceName": "Institutional Investors",
        //            "destination": "/pages/public/en-de/de-ucits.aspx#filter=*"
        //        }]
        //    }, {
        //        "cultureId": "en-SE",
        //        "audienceList": [{
        //            "audienceId": "a_en-SE_Financial_Professionals",
        //            "audienceName": "Financial Professionals",
        //            "destination": "/pages/public/en-de/de-ucits.aspx#filter=*"
        //        }, {
        //            "audienceId": "a_en-SE_Institutions",
        //            "audienceName": "Institutional Investors",
        //            "destination": "/pages/public/en-de/de-ucits.aspx#filter=*"
        //        }]
        //    }, {
        //        "cultureId": "en-CH",
        //        "audienceList": [{
        //            "audienceId": "a_en-CH_Financial_Professionals",
        //            "audienceName": "Financial Professionals",
        //            "destination": "/pages/public/en-de/de-ucits.aspx#filter=*"
        //        }, {
        //            "audienceId": "a_en-CH_Institutions",
        //            "audienceName": "Institutional Investors",
        //            "destination": "/pages/public/en-de/de-ucits.aspx#filter=*"
        //        }]
        //    }, {
        //        "cultureId": "en-GB",
        //        "audienceList": [{
        //            "audienceId": "a_en-GB_Financial_Professionals",
        //            "audienceName": "Financial Professionals",
        //            "destination": "/pages/public/en-de/de-ucits.aspx#filter=*"
        //        }, {
        //            "audienceId": "a_en-GB_Institutions",
        //            "audienceName": "Institutional Investors",
        //            "destination": "/pages/public/en-de/de-ucits.aspx#filter=*"
        //        }]
        //    }],
        //    "akamaiLocation": "en-AR"
        //};
        //o.assembleSelfIdentificationModalMenu.createCountryMarkup("culture-toggle");


        var pageName = $("#Self_Identification_Modal").attr("data-origin-key"),
            spoofRegion = document.location.search.indexOf("spoofRegion=true") !== -1 ? true : false,
            domain = document.location.origin,
            url = spoofRegion ? "/_layouts/WWW/Service/dsvc.aspx/GetSpotLightDataTest" : "/_layouts/WWW/Service/dsvc.aspx/GetSpotLightData",
            countryCode = document.location.search.replace(/(^\?)/, '').split("&").map(function (n) { return n = n.split("="), this[n[0]] = n[1], this }.bind({}))[0].countryCode,
            data = spoofRegion ? "{'pageName': '" + pageName + "', 'countryCode': '" + countryCode + "'}" : "{'pageName': '" + pageName + "'}";

        $.ajax({
            type: "POST",
            url: domain + url,
            data: data,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (result) {
                o.selfIdentObj = JSON.parse(result.d);
                o.assembleSelfIdentificationModalMenu.createCountryMarkup("culture-toggle");
            },
            failure: function (result) {
                alert('Error Loading Menu Data: ' + result);
            }
        });

    }


    o.assembleSelfIdentificationModalMenu = {
        createCountryMarkup: function (menu) {
            var countryList = "";

            $.each(modalUtils.selfIdentObj.countryList, function (key, value) {
                countryList += "<li class='dropdownHeader'>" + value.regionName + "</li>";
                countryList += "<ul>"
                $.each(value.locationList, function (skey, svalue) {
                    var selectedClass = "";
                    if (modalUtils.selfIdentObj.akamaiLocation == svalue.uid) {
                        selectedClass = "selected";
                        $("#" + menu).text(svalue.name);
                    }
                    countryList += "<li class='dropdownLink " + selectedClass + "' id='" + svalue.uid + "'>" + svalue.name + "</li>";
                })
                countryList += "</ul>"
            })
            $("[data-target='" + menu + "']").html(countryList);
            menuUtils.addScrollingMenuEvents($("[data-target*='" + menu + "'].scrolling-dropdown li.dropdownLink"));

            if (modalUtils.selfIdentObj.akamaiLocation !== "") {
                $("[data-target='" + menu + "']").toggleClass("open");
                $("#" + modalUtils.selfIdentObj.akamaiLocation).trigger("click");
            }
        },
        createAudienceMarkup: function (menu, cultureId) {
            var audienceList = "";

            $.each(modalUtils.selfIdentObj.audiences, function (key, value) {
                if (value.cultureId === cultureId) {
                    $.each(value.audienceList, function (skey, svalue) {
                        audienceList += "<li class='dropdownLink' id='" + svalue.audienceId + "' data-destination='" + svalue.destination + "'>" + svalue.audienceName + "</li>";
                    })
                }
            })
            $("[data-target*='" + menu + "']").html(audienceList);
            menuUtils.addScrollingMenuEvents($("[data-target*='" + menu + "'].scrolling-dropdown li"));
        },

        populateAudienceMenu: function (cultureId, siblingId, attrs) {
            modalUtils.assembleSelfIdentificationModalMenu.createAudienceMarkup("audience-toggle", cultureId);

            $("#" + siblingId).off("click");
            $("#" + siblingId).on("click", function (e) {
                $("[data-target='culture-toggle']").removeClass("open");
                $("[data-target='" + e.currentTarget.id + "'].scrolling-dropdown").toggleClass("open");
            });
            $("#modal-submit").addClass("disabled");
            $("#" + siblingId).removeClass("disabled");
            $("[data-target*='" + siblingId + "'].scrolling-dropdown").removeClass("open");
            $("#" + siblingId).text($("#" + siblingId).attr("data-default-text"));
        },

        selectAudience: function (audienceId, siblingId, attrs) {
            $("#" + siblingId).removeClass("disabled");
            $("#" + siblingId).attr("data-selected-url", attrs["data-destination"].value);
            $("#" + siblingId).off("click");
            $("#" + siblingId).on("click", function (e) {
                var targetId = e.currentTarget.id;
                document.location.href = document.location.origin + $("#" + targetId).attr("data-selected-url");
            });
        }

    }

}(modalUtils));


//MENU UTILITIES
(function (o) {
    o.initializecascadingMenus = function (e) {
        var sibling = $("[data-target='" + e.currentTarget.id + "'].scrolling-dropdown").attr("data-sibling");
        $("[data-target='" + e.currentTarget.id + "'].scrolling-dropdown").toggleClass("open");
        $("[data-target='" + sibling + "']").removeClass("open");
        menuUtils.addScrollingMenuEvents($("[data-target='" + e.currentTarget.id + "'] " + e.data.selector));
    },

  o.addScrollingMenuEvents = function (selector) {
      selector.on("click", function (e) {
          var toggleId = $(e.currentTarget).parents("[data-target]").attr("data-target"),
              listContainer = $("[data-target='" + toggleId + "'].scrolling-dropdown"),
              callback = listContainer.attr("data-callback"),
              targetId = e.currentTarget.id,
              siblingId = listContainer.attr("data-sibling"),
              attrs = $("#" + targetId)[0].attributes;
          listContainer.removeClass("open");
          $("#" + toggleId).addClass("selected");
          $("#" + siblingId).removeClass("selected");
          $("#" + toggleId).text($("#" + targetId).text());
          $("[data-target='" + toggleId + "'] li").removeClass("selected");
          $("#" + targetId).addClass("selected");

          if (callback !== undefined && callback !== "") {
              var namespaces = callback.split(".");
              var func = namespaces.pop();
              var context = window;
              for (var i = 0; i < namespaces.length; i++) {
                  context = context[namespaces[i]];
              }
              context[func].call(context, targetId, siblingId, attrs);
          }
      })
  }

}(menuUtils));


//RESIZE UTILITIES
(function (o) {
    var resizeTimeOut;
    o.onResizeStop = function (callBack) {
        clearTimeout(resizeTimeOut);
        resizeTimeOut = setTimeout(function () {
            callBack()
        }, 300)
    }
}(resizingUtils));


(function (o) {

    o.heroHide = function () {
        var headerHeight = $("#top-shelf").outerHeight() + $("#main-site-nav").outerHeight(),
            rawScrollTop = $(window).scrollTop() + headerHeight,
            heroHeight = headerHeight + $("section.hero").outerHeight();
        if (heroHeight + 50 < rawScrollTop) {
            $(".hero").css("opacity", 0);
        }
        if (heroHeight + 50 > rawScrollTop) {
            $(".hero").css("opacity", 1);
        }
    };


    o.slideContent = function () {

        if ($(".spotlight-box").length > 0) {

            var windowH = $(window).height(),
                headerHeight = $("#top-shelf").outerHeight() + $("#main-site-nav").outerHeight(),
                rawScrollTop = $(window).scrollTop() + headerHeight,
                heroHeight = headerHeight + $("section.hero").outerHeight(),
                elementTop = $(".spotlight-box").offset().top,
                elementBottom = $(".spotlight-box").offset().top + $(".spotlight-box").height(),
                rawScrollBottom = rawScrollTop + windowH - headerHeight,
                topElementOffset = elementTop + 225,
                bottomElementOffset = elementBottom;


            if (!$(".spotlight-box").hasClass('above') && (rawScrollBottom >= topElementOffset && bottomElementOffset <= rawScrollTop)) {
                $(".spotlight-box").addClass("above").removeClass("below");
            }
            if (!$(".spotlight-box").hasClass('below') && (bottomElementOffset >= rawScrollTop && rawScrollBottom <= topElementOffset)) {
                $(".spotlight-box").addClass("below").removeClass("above");
            }


            if (!$(".spotlight-box").hasClass('in') && (rawScrollBottom >= topElementOffset && bottomElementOffset >= rawScrollTop)) {
                if ($(".spotlight-box").hasClass('above')) {
                    $(".spotlight-box").addClass("fade-slide-in-above").addClass('in');
                }
                else if ($(".spotlight-box").hasClass('below')) {
                    $(".spotlight-box").addClass("fade-slide-in-below").addClass('in');
                }
                else {
                    $(".spotlight-box").addClass("fade-slide-in-below").addClass('in');
                }
            }
            if ($(".spotlight-box").hasClass('in') && (rawScrollBottom) <= elementTop) {
                $(".spotlight-box").removeClass("fade-slide-in-above").removeClass("fade-slide-in-below").removeClass('in');
            }
            if (elementBottom <= rawScrollTop && $(".spotlight-box").hasClass('in')) {
                $(".spotlight-box").removeClass("fade-slide-in-below").removeClass("fade-slide-in-above").removeClass('in');
            }

        }
    };

    o.imageZoom = function (e) {
        var id = $(e.currentTarget).attr("data-img-zoom-trigger");
        $("#" + id).toggleClass("force-hover");
    }

}(animationUtils))


$(function () {
    /*Initialization Functions*/
    modalUtils.populateInlineModals();
    modalUtils.initOnDemandModalLinks();
    $("a").click(modalUtils.exitMessage);
    $('#Self_Identification_Modal').on('shown.bs.modal', modalUtils.getSelfIdentificationModalData);
    $("[data-img-zoom-trigger]").hover(animationUtils.imageZoom)


});








/*!
 * app-utils.js End
 */
