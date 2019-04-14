/*global $, jQuery, alert, console*/

//GLOBAL JSONOBJ & NAMESPACE VARIABLE /**/
var jsonObj = {},
	globalNavShelf = globalNavShelf || {},
	isMobileView = false,
    isresponsive = "responsive";

//IIFE FOR SHELF NAMESPACE
(function (o) {
    'use strict';

    //NAMESPACE OBJECT FOR MODULAR PROPERTIES THAT DEVIATE FROM DAFAULT SHELF DISPALY FRAMEWORK.
    var hm2k = {

        //CONSTANTS
        REGIONSWITHCOUNTRYDISPLAYEXCEPTIONS: ["asia", "unitedstates", "latinamerica"],
        AUDIENCELISTTOMOVE: ["a_zh-tw_obu", "a_en-au_retail"],
        COUNTRIESWITHAUDIENCETOORDER: ["en-hk", "en-sg"],
        ITEMSPERCOL: 9,
        PAIRARRAYLIST: [{
            first: 'en-HK',
            second: 'zh-HK'
        }, {
            first: 'en-CN',
            second: 'zh-CN'
        }],

        //GLOBAL VARIABLES
        pairArray: [],

        //DEFAULT PROPERTIES AND METHODS
        //DEFAULT FUNCTION TO CONFIGURE THE DIMENTIONS OF CONTAINERS BASED ON DISPALY CRITERIA
        configureShelfClasses: function () {
            $("#countries-container").removeClass("col-xs-8, col-sm-8");
            $("#countries-container").addClass("col-xs-4, col-sm-4");
            $("#countries-container #countries .nav-header").text("Select Your Country");
            $("#audiences-container").css("display", "block");
        },

        //FUNCTION TO CREATE THE EXCEPTION OBJECT FOR PAIRED ITEMS
        creatExceptionObj: function (svalue, countryArray) {
            var pos1,
				pos2;
            pos1 = countryArray.map(function (e) {
                return e.cultureId;
            }).indexOf(hm2k.pairArray[0]);
            pos2 = countryArray.map(function (e) {
                return e.cultureId;
            }).indexOf(hm2k.pairArray[1]);
            this.first = countryArray[pos1];
            this.second = countryArray[pos2];
            countryArray.splice(pos2, 1);
        },

        //FUNCTION TO CHECK OF PASSED ITEM IS A PAIRING MATCH FOR THOSE IN PAIRARRAYLIST
        isPairngMatch: function (svalue) {
            var result;
            $.each(hm2k.PAIRARRAYLIST, function (ckey, cvalue) {
                //SETS GLOBAL PAIRARRAY VALUE
                hm2k.pairArray = Object.keys(cvalue).map(function (key) {
                    return cvalue[key];
                });
                result = hm2k.pairArray.indexOf(svalue.cultureId) !== -1 ? true : false;
                if (result) {
                    return false;
                }
            });
            return result;
        },

        //FUNCTION TO ORDER COUNTRIES IN APAC DISPLAY
        orderCountriesArray: function (regionVars) {
            var temp = [],
				that = this,
				tempPos;
            $.each(that, function (key, value) {
                temp[key] = that.shift();
            });
            $.each(temp, function (key, value) {
                tempPos = temp.map(function (e) {
                    return e.uniqueId;
                }).indexOf(hm2k[regionVars].ORDERAPACCOUNTRIESARRAY[key]);
                that.push(temp[tempPos]);
            });
        },

        //FUNCTION TO ORDER AUDIENCES IN APAC DISPLAY
        orderAudienceArray: function (regionVars) {
            var temp = [],
				that = this,
				tempPos;


            switch (this[0].cultureId) {
                case "en-hk":
                    $.each(that, function (key, value) {
                        temp[key] = that.shift();
                    });
                    $.each(temp, function (key, value) {
                        tempPos = temp.map(function (e) {
                            return Object.keys(e)[0];
                        }).indexOf(hm2k[regionVars].ORDERHKARRAY[key]);
                        that.push(temp[tempPos]);
                    });
                    break;
                case "en-sg":
                    $.each(that, function (key, value) {
                        temp[key] = that.shift();
                    });
                    $.each(temp, function (key, value) {
                        tempPos = temp.map(function (e) {
                            return Object.keys(e)[0];
                        }).indexOf(hm2k[regionVars].ORDERSGARRAY[key]);
                        that.push(temp[tempPos]);
                    });
                    break;
            }
        },

        //APAC PROPERTIES AND METHODS
        apac2k: {
            //APAC CONSTANTS
            ITEMSPERCOL: 4,
            ORDERAPACCOUNTRIESARRAY: ["en-au20", "en-hk21", "ja-jp22", "en-sg24", "zh-tw25", "zh-tw000", "en-cn25"],
            ORDERHKARRAY: ["a_en-hk_financial_professionals", "a_en-hk_retail"],
            ORDERSGARRAY: ["a_en-sg_financial_professionals", "a_en-sg_retail"],

            //APAC GLOVAL VARIABLES
            apacObj: {},

            //APAC SPECIFIC FUNCTIONS
            //FUNCTION TO MOVE THE OBU AUDIENCE OUT OF TIAWAN AND INTO A SEPERATE COUNTRY LISTING FOR DISPLAY
            moveTaiwanAudience: function (that, regionID, ssvalue) {
                //IE11 CANT HANDLE COMPUTED PROPERTY KEYS
                var temp = {};
                temp[ssvalue.audienceId.toLowerCase()] = {
                    audienceTitle: ssvalue.audienceTitle,
                    audienceUrl: ssvalue.audienceUrl
                };
                temp.cultureId = "zh-tw";
                temp.languagePair = false;
                temp.audienceId = "a_zh-tw_obu";
                temp.uniqueId = "zh-tw000";
                that[regionID].countries.push({
                    name: "國際金融業務分行",
                    cultureId: "zh-tw",
                    uniqueId: "zh-tw000",
                    regionId: "asia",
                    audience: [temp],
                    languagePair: false
                });
            },

            //FUNCTION TO POPULATE NEW OPECT FOR PAIRED ITEMS
            populateApacObj: function (regionID, countriesPropVal) {
                var arrPos,
					that = this;

                that[regionID].countries.push({
                    first: {
                        audience: [],
                        name: hm2k.apac2k.apacObj.first.name,
                        cultureId: hm2k.apac2k.apacObj.first.cultureId.toLowerCase()
                    },
                    second: {
                        audience: [],
                        name: hm2k.apac2k.apacObj.second.name,
                        cultureId: hm2k.apac2k.apacObj.second.cultureId.toLowerCase()
                    },
                    languagePair: true,
                    uniqueId: countriesPropVal
                });
                arrPos = that[regionID].countries.map(function (e) {
                    return e.uniqueId;
                }).indexOf(countriesPropVal);
                $.each(hm2k.apac2k.apacObj, function (akey, avalue) {
                    $.each(avalue.audienceArr, function (askey, asvalue) {
                        //HORRIBLE HACK BECASUE IE11 CAN HANDLE COMPUTED PROPERTY KEYS
                        var temp = {};

                        temp[asvalue.audienceId.toLowerCase()] = {
                            audienceTitle: asvalue.audienceTitle,
                            audienceUrl: asvalue.audienceUrl
                        };
                        temp.cultureId = avalue.cultureId.toLowerCase();
                        temp.languagePair = false;
                        temp.audienceId = asvalue.audienceId.toLowerCase();
                        that[regionID].countries[arrPos][akey].audience.push(temp);

                    });
                });
            },

            //APAC FUNCTION TO CONFIGURE THE DIMENTIONS OF CONTAINERS BASED ON DISPALY CRITERIA
            configureShelfClasses: function () {
                $("#countries-container").removeClass("col-xs-4, col-sm-4");
                $("#countries-container").addClass("col-xs-8, col-sm-8");
                $("#countries-container #countries .nav-header").text("Select Your Site");
                $("#audiences-container").css("display", "none");
            }
        }
    };

    // FUNCTION TO BUILD AUDIENCE MENU
    function buildAudienceLinks(arr, isPaired, region, currRegion, currColumn, currCulture, currAudience, uniqueCultureId) {

        var keyNames,
			primaryCultureId,
			secondCultureId,
			that,
			counter,
			firstObjKey,
			secondObjKey,
			firstValue,
			secondValue,
			secondArrayPos,
            selectClass,
            firstNonSelect,
            secondNonSelect;

        //CHECK IF THE REQUEST TO BUILD AUDIENCE IS FOR A PAIRED AUDIENCE DISPLAY
        if (isPaired) {
            primaryCultureId = arr[0].first.cultureId;
            secondCultureId = arr[0].second.cultureId;
            that = arr[0].first.audience;
        } else {
            primaryCultureId = arr[0].cultureId;
            that = arr;
        }

        //CHECK TO SEE IF THE AUDIENCE UP FOR DISPLAY IS IN COUNTRIESWITHAUDIENCETOORDER
        $.each(hm2k.COUNTRIESWITHAUDIENCETOORDER, function (key, value) {
            if (primaryCultureId === value) {
                hm2k.orderAudienceArray.call(that, "apac2k");
            }
        });
        //CHECK IF THE AUDIENCE UP FOR DISPLAY IS FOR A PAIRED AUDIENCE DISPLAY
        if (isPaired) {
            counter = 0;
            $.each(arr[0].first.audience, function (key, value) {
                //console.log(currCulture, uniqueCultureId);
                firstObjKey = Object.keys(value)[0];
                secondObjKey = firstObjKey.replace(primaryCultureId, secondCultureId);
                secondArrayPos = arr[0].second.audience.map(function (e) {
                    return Object.keys(e)[0];
                }).indexOf(secondObjKey);
                firstValue = value[firstObjKey];
                secondValue = arr[0].second.audience[secondArrayPos][secondObjKey];

                // HIGHLIGHT AND GREY OUT LINKS BASED ON SELECTED
                if (currCulture === uniqueCultureId || (currRegion === "asia" && region === "asia")) {
                    selectClass = currAudience === firstObjKey || currAudience === secondObjKey ? "shelf-selected" : "not-selected";
                    firstNonSelect = currAudience === firstObjKey ? "" : "nonSelectPair";
                    secondNonSelect = currAudience === secondObjKey ? "" : "nonSelectPair";
                }

                $("#countries #countries-list #col-" + currColumn).append("<li class='apac-list-pair " + selectClass + "' ><a class='apac-link-pair-one " + firstNonSelect + "' id='" + firstObjKey +
                    "' data-metric-id='" + firstObjKey + "' href='" + firstValue.audienceUrl + "'>" + firstValue.audienceTitle +
                    "</a> / <a class='apac-link-pair-two " + secondNonSelect + "' data-metric-id='" + secondObjKey + "' id='" + secondObjKey + "' href='" + secondValue.audienceUrl
                    + "'>" + secondValue.audienceTitle + "</a></li>");
            });
        } else {
            $.each(arr, function (key, value) {

                var objKey = Object.keys(value)[0],
                    linkClassName,
                    listClassName,
                    selectClass;

                // HIGHLIGHT AND GREY OUT LINKS BASED ON SELECTED
                if (currCulture === uniqueCultureId || (currRegion === "asia" && region === "asia")) {
                    selectClass = currAudience === objKey ? "shelf-selected" : "not-selected";
                }

                //console.log(currRegion, region);
                // CHECK IF AUDIENCE UP FOR DISPLAY IS FROM REGION IN REGIONSWITHCOUNTRYDISPLAYEXCEPTIONS
                if ($.inArray(region, hm2k.REGIONSWITHCOUNTRYDISPLAYEXCEPTIONS) !== -1) {
                    if (region === "asia") {
                        linkClassName = "apac-link";
                        listClassName = "apac-list";
                    } else {
                        linkClassName = "";
                        listClassName = "";
                    }
                    $("#countries #countries-list #col-" + currColumn).append("<li class='" + listClassName + " " + selectClass + "'><a class='" + linkClassName + "' data-metric-id='" + objKey + "' id='" + objKey + "' href='" + value[objKey].audienceUrl + "'>" + value[objKey].audienceTitle + "</a></li>");
                    //GO ONTO THE NEXT VALUE OF $.EACH
                    return true;
                }
                $("#audience #audience-list").append("<li class='" + selectClass + "'><a data-metric-id='" + objKey + "' id='" + objKey + "' href='" + value[objKey].audienceUrl + "'>" + value[objKey].audienceTitle + "</a></li>");
            });
        }
    }

    //FUNCTION TO BUILD COUNTRIES MENU INCLUDING COUNTRY ADUIENCE COMBINATION DISPLAY
    function buildCountryLinks(arr, region, currRegion, currCulture, currAudience) {

        var itemsPerCol,
			numOfCountries,
			columns,
			counter,
			className,
			i,
			multiListClass;
        //SWITCH TO PERFORM REGION SPECIFIC FUNCTIONS IN NEEDED
        switch (region) {
            case hm2k.REGIONSWITHCOUNTRYDISPLAYEXCEPTIONS[0]:
                //CASE FOR ASIA
                hm2k.apac2k.configureShelfClasses();
                hm2k.orderCountriesArray.call(arr, "apac2k");
                itemsPerCol = hm2k.apac2k.ITEMSPERCOL;
                break;
            case hm2k.REGIONSWITHCOUNTRYDISPLAYEXCEPTIONS[1]:
                //CASE FOR UNITEDSTATES
                hm2k.apac2k.configureShelfClasses();
                itemsPerCol = hm2k.ITEMSPERCOL;
                break;
            case hm2k.REGIONSWITHCOUNTRYDISPLAYEXCEPTIONS[2]:
                //CASE FOR LATINAMERICA
                hm2k.apac2k.configureShelfClasses();
                itemsPerCol = hm2k.ITEMSPERCOL;
                break;
            default:
                //CASE FOR DEFAULT
                hm2k.configureShelfClasses();
                itemsPerCol = hm2k.ITEMSPERCOL;
        }
        numOfCountries = Object.keys(arr).length;
        columns = Math.ceil(numOfCountries / itemsPerCol);
        counter = 0;
        className = "column-" + columns;
        i = 0;
        multiListClass = "";
        //BUILD MULTIPLE UL IF NEEDED FOR MULTICOLUMN DISPLAY
        for (i = 1; i <= columns; i += 1) {
            $("#countries #countries-list").append("<ul class='" + region + "' id='col-" + i + "'></ul>");
        }

        $.each(arr, function (key, value) {
            counter += 1;
            $("#countries").attr("class", className);
            var currColumn = Math.ceil(counter / itemsPerCol);
            if ((counter % itemsPerCol) === 1) {
                multiListClass = "column-top";
            } else {
                multiListClass = "column-sub";
            }
            // IF REGION IS IN REGIONSWITHCOUNTRYDISPLAYEXCEPTIONS
            if ($.inArray(region, hm2k.REGIONSWITHCOUNTRYDISPLAYEXCEPTIONS) !== -1) {

                if ("first" in value) {
                    $("#countries #countries-list #col-" + currColumn).append("<li class='" + multiListClass + "'><span>" + value.first.name + " / " + value.second.name + "</span></li>");

                    buildAudienceLinks([value], true, region, currRegion, currColumn, currCulture, currAudience, value.uniqueId);
                } else {
                    if (value.name !== "United States" && value.name !== "Latin America") {
                        $("#countries #countries-list #col-" + currColumn).append("<li class='" + multiListClass + "'><span>" + value.name + "</span></li>");
                    }

                    buildAudienceLinks(value.audience, false, region, currRegion, currColumn, currCulture, currAudience, value.uniqueId);
                }
                //GO ONTO THE NEXT VALUE OF $.EACH
                return true;
            }
            $("#countries #countries-list #col-" + currColumn).append("<li><a id='" + value.uniqueId + "' data-metric-id = '" + value.uniqueId + "'href='#'>" + value.name + "</a></li>");


            $("#countries a[data-metric-id=" + value.uniqueId + "]").click(function (e) {
                e.preventDefault();
                //if (isMobileView) {
                //    //SCROLL TO 'BOTTOM' (1000PX) ON CLICK OF COUNTRY IF IN MOBILE.
                //    $("body").animate({
                //        scrollTop: 1000
                //    }, 1000);
                //}
                $("#countries #countries-list ul li").removeClass("shelf-selected");
                $("#countries #countries-list ul li").addClass("not-selected");
                $(this).closest("li").addClass("shelf-selected");
                $(this).closest("li").removeClass("not-selected");
                $("#audience").animate({
                    opacity: 0
                }, 150, function () {
                    $("#audience #audience-list li").remove();
                    buildAudienceLinks(value.audience, false, region, currRegion, currColumn, currCulture, currAudience, value.uniqueId);
                    $("#audience").animate({
                        opacity: 1,
                        //height: ($("#audience-list").outerHeight() + 25) + "px"
                    }, 150);
                });
            });
            //CHECK OF AUDIENCE IS THE CURRENTLY SELECTE CULTURE AND IF SO HIGHLIGHT
            //console.log(region, value.regionId)
            if (value.uniqueId === currCulture) {

                $("#countries #countries-list ul li a#" + value.uniqueId).parent().addClass("shelf-selected");
                $("#countries #countries-list ul li a#" + value.uniqueId).trigger("click");

            } else if (currRegion === value.regionId) {
                $("#countries #countries-list ul li a#" + value.uniqueId).parent().addClass("not-selected");
            }
        });
    }

    //FUNCTION TO BUILD REGION MENUS
    function buildRegionLinks(arr, currRegion, currCulture, currAudience) {

        $.each(arr, function (xkey, xvalue) {
            $.each(xvalue, function (key, value) {
                $("#regions #region-list").append("<li><a  data-metric-id='" + key + "' id='" + key + "' href='#'>" + value.heading + "</a></li>");
                $("#regions a#" + key).click(function (e) {
                    e.preventDefault();
                    $("#regions #region-list li").removeClass("shelf-selected");
                    $("#regions #region-list li").addClass("not-selected");
                    $(this).closest("li").addClass("shelf-selected");
                    $(this).closest("li").removeClass("not-selected");
                    $("#audience").animate({
                        opacity: 0,
                        //height: 0
                    }, 150, function () {
                        $("#countries").animate({
                            opacity: 0,
                        }, 150, function () {
                            $("#audience #audience-list li").remove();
                            $("#audiences-container div.shelf-callout").remove();
                            $("#countries #countries-list ul").remove();
                            buildCountryLinks(value.countries, key, currRegion, currCulture, currAudience);
                            $("#countries").animate({
                                opacity: 1,
                                //height: ($("#countries-list").outerHeight() + 25) + "px"
                            }, 150, function () {
                                //if (isMobileView) {
                                //    $(window).scrollTop(500)
                                //}
                            });
                        });
                    });
                });
                //console.log(xvalue[currRegion]);
                if (value.regionId === currRegion) {
                    $("#regions #region-list a#" + key).parent().addClass("shelf-selected");
                    $("#regions a#" + key).trigger("click");
                } else if (xvalue[currRegion] === undefined && currRegion !== "global") {
                    $("#regions #region-list a#" + key).parent().addClass("not-selected");
                }
            })
        });
    }

    //FUNCTION TO COLLECT CURRENT REGION,COUNTRY,AUDIENCE DATA AND KICKOFF BUILD PROCESSes
    function buildShelf(arr) {

        var selectedRegion = $("#toggle-shelf").attr("data-region").toLowerCase(),
			selectedCulture = $("#toggle-shelf").attr("data-culture").toLowerCase(),
			selectedAudience = $("#toggle-shelf").attr("data-audience").toLowerCase();
        $("#audience").css("opacity", 0);
        //$("#audience").css("height", 0);
        $("#countries").css("opacity", 0);
        //$("#countries").css("height", 0);
        buildRegionLinks(arr, selectedRegion, selectedCulture, selectedAudience);
    }

    //FUNCTION TO CLEAR THE HTML OF THE SHELF LISTS
    function clearSelector() {
        $("#region-list").html("");
        $("#countries-list").html("");
        $("#audience-list").html("");
        $("#audience").css("opacity", 1);
    }



    function reorderLoationData(regionID, countryArray, audienceArray, countriesPropVal, key) {
        var that = this;

        if (regionID === "unitedstates") {
            that[regionID] = {
                heading: countryArray[0].name,
                countries: [],
                regionId: regionID
            };
        }
        else if (regionID === "latinamerica") {
            that[regionID] = {
                heading: countryArray[0].name,
                countries: [],
                regionId: regionID
            };
        } else {
            that[regionID] = {
                heading: jsonObj[key].regcontent.heading,
                countries: [],
                regionId: regionID
            };
        }

        $.each(countryArray, function (skey, svalue) {
            if (svalue === undefined) {
                return true;
            }
            audienceArray = countryArray[skey].audienceArr;

            countriesPropVal = svalue.cultureId.toLowerCase() + svalue.countryId;
            //CHECK hm2k.REGIONSWITHCOUNTRYDISPLAYEXCEPTIONS FOR REGION EXCEPTIPONS
            if ($.inArray(regionID.toLowerCase(), hm2k.REGIONSWITHCOUNTRYDISPLAYEXCEPTIONS) !== -1) {
                //CHECK IF COUNTRY IN EXCEPTION REGION IS hm2k.isPairngMatch(svalue) FOR PAIRING
                if (hm2k.isPairngMatch(svalue)) {
                    hm2k.creatExceptionObj.call(hm2k.apac2k.apacObj, svalue, countryArray);
                    hm2k.apac2k.populateApacObj.call(that, regionID, countriesPropVal);
                    return true;
                }
            }
            that[regionID].countries.push({
                name: svalue.name,
                audience: [],
                cultureId: svalue.cultureId.toLowerCase(),
                uniqueId: countriesPropVal,
                languagePair: false,
                regionId: regionID
            });
            $.each(audienceArray, function (sskey, ssvalue) {
                // CHECK IF CURRENT AUDIENCE IS hm2k.AUDIENCELISTTOMOVE
                if ($.inArray(ssvalue.audienceId.toLowerCase(), hm2k.AUDIENCELISTTOMOVE) !== -1) {
                    // SWITCH ON INDIVIDUAL AUDIENCES TO PERFORM UNIQUE CONDITIONS
                    switch (ssvalue.audienceId.toLowerCase()) {
                        case hm2k.AUDIENCELISTTOMOVE[0]:
                            hm2k.apac2k.moveTaiwanAudience(that, regionID, ssvalue);
                            break;
                        case hm2k.AUDIENCELISTTOMOVE[1]:
                            break;
                    }
                    return true;
                }
                var arrPos = that[regionID].countries.map(function (e) {
                    return e.uniqueId;
                }).indexOf(countriesPropVal),
                    temp = {
                    };
                //HORRIBLE HACK BECASUE IE11 CAN HANDLE COMPUTED PROPERTY KEYS
                temp[ssvalue.audienceId.toLowerCase()] = {
                    audienceTitle: ssvalue.audienceTitle,
                    audienceUrl: ssvalue.audienceUrl,
                    audienceId: ssvalue.audienceId.toLowerCase()
                };
                temp.cultureId = svalue.cultureId.toLowerCase();
                temp.uniqueId = countriesPropVal;
                temp.audienceId = ssvalue.audienceId.toLowerCase();
                temp.languagePair = false;
                that[regionID].countries[arrPos].audience.push(temp);
            });
        });
    }



    //FUNCTION TO TAKE JSONOBJ AND PARSE INTO USABLE OBJECT FOR SHELF CREATION
    function parseLocationData() {
        var that = this;
        $.each(jsonObj, function (key, value) {
            var regionID,
                countryArray = [],
                audienceArray = [],
                countriesPropVal;
            if (value.regionId.toLowerCase() === "americas") {
                var orgCountryArray = jsonObj[key].regcontent.countryArr
                $.each(orgCountryArray, function (skey, svalue) {
                    countryArray[0] = jsonObj[key].regcontent.countryArr[skey];
                    regionID = svalue.name.replace(/ /g, '').toLowerCase()
                    reorderLoationData.call(that, regionID, countryArray, audienceArray, countriesPropVal, key);
                })
            } else {
                countryArray = jsonObj[key].regcontent.countryArr;
                regionID = jsonObj[key].regionId.toLowerCase();
                reorderLoationData.call(that, regionID, countryArray, audienceArray, countriesPropVal, key);
            }
        });
    }

    o.shelfExperience = checkForShelfParam();

    function checkForShelfParam(p) {
        var results = new RegExp('[\?&]openShelf=([^&#]*)').exec(window.location.href);
        results = results !== null ? { openShelf: true } : { openShelf: false }
        return results;
    }

    //INITIALIZATION FUNCTION FOR CONSTRUCTING SHELF
    o.navShelfInit = function () {

        var dataObj = {},
            detachedHTML,
            dataArray = [];

        parseLocationData.call(dataObj);
        //console.log(dataObj);
        dataArray[0] = {
            "unitedstates": dataObj.unitedstates
        }
        dataArray[1] = {
            "emea": dataObj.emea
        }
        dataArray[2] = {
            "latinamerica": dataObj.latinamerica
        }
        dataArray[3] = {
            "asia": dataObj.asia
        }


        $("#toggle-shelf, .close-shelf").click(function (e) {
            e.preventDefault();
            //$("#navbar").collapse('hide');
            //$("body").removeClass("menu-open");
            //$("main").removeClass("fixed");
        })
        $("#navbar").on("show.bs.dropdown", function (e) {
            if (isMobileView) {
                $("#country-audience-shelf").collapse("hide");
            }
        });
        $("#country-audience-shelf").on("show.bs.collapse", function (e) {
            if ($(e.target).attr("id") === "country-audience-shelf") {
                $(".jumbotron.location #shelf-background").toggleClass("fade-bg");
            }
        });
        $("#country-audience-shelf").on("hide.bs.collapse", function (e) {
            if ($(e.target).attr("id") === "country-audience-shelf") {
                $(".jumbotron.location #shelf-background").toggleClass("fade-bg");
                clearSelector();
                buildShelf(dataArray);
            }
        });
        isresponsive = $("#top-shelf").attr("data-non-responsive-page");

        if (isresponsive === false || typeof isresponsive === typeof undefined) {
            isMobileView = window.innerWidth < 992 ? true : false;
            //if (isMobileView) {
            //    detachedHTML = $("#country-audience-shelf").detach();
            //    $("#mobile-change-country").append(detachedHTML);
            //    $("#toggle-shelf").attr("data-toggle", "");
            //}
            //$(window).resize(function () {
            //    if (window.innerWidth < 992 && !isMobileView) {
            //        $("#country-audience-shelf").collapse('hide');
            //        isMobileView = true;
            //        detachedHTML = $("#country-audience-shelf").detach();
            //        $("#mobile-change-country").append(detachedHTML);
            //        $("#toggle-shelf").attr("data-toggle", "");
            //    }
            //    if (window.innerWidth > 992 && isMobileView) {
            //        $("#country-audience-shelf").collapse('hide');
            //        isMobileView = false;
            //        detachedHTML = $("#country-audience-shelf").detach();
            //        $("#desktop-change-country").prepend(detachedHTML);
            //        $("#toggle-shelf").attr("data-toggle", "collapse");
            //    }
            //});
        }


        buildShelf(dataArray);
    };
}(globalNavShelf));


//ON READY
$(window).on("load", function () {
    'use strict';
    //PARSE DATA FROM HIDDEN FORM FIELD
    jsonObj = JSON.parse($("#ctl00_hfTopShelfFeed").val());
    //CALL INITILIZATION FUNCTION FOR CONSTRUCTING THE SHELF
    globalNavShelf.navShelfInit();
    if (globalNavShelf.shelfExperience.openShelf === true) {
        $("#country-audience-shelf").collapse("show");
    }
});