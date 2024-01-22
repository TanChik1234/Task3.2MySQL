var drawItemsOnScroll ;
var isScrollRunning = false;

$(document).ready(function () {
    if (pathNameUrl[1] != 'search' && pathNameUrl[2] != 'search' &&
        pathNameUrl[1] != 'sort' && pathNameUrl[2] != 'sort') {
        (function () {
                data = {
                    filter: getParameterByName('filter') || "new",
                    offset: getParameterByName('offset'),
                    limit: getParameterByName('count') || global.items_limit_on_page_load
                };

                setSidebarActiveButton(null, data.filter);
                doAjaxQuery('GET', '/books', data, function (res) {
                    view.addBooksItems(res.data.books, true);
                    drawItemsOnScroll = initDrawButtonOnScroll(res.data.total.amount);

                    if (localStorage.getItem('h')) {
                        $(window).scrollTop(localStorage.getItem('h'));
                        localStorage.removeItem('h');
                    }
                });
        }());
    }

    $('#content').on('click', '.book', function () {
        localStorage.setItem('h', $(window).scrollTop());
    });

    $(document).scroll(function () {
        if ((( $(document).height() - $(window).scrollTop() ) < ( 2 * $(window).height() )) && !isScrollRunning) {
            if(!drawItemsOnScroll){
                return;
            }
            isScrollRunning = true;
            drawItemsOnScroll();
    
        } 
    });
});

function getParameterByName(name, url) {
    if (!url) url = $(location).attr('href');
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

var initDrawButtonOnScroll = function (maxItems) {
    var maxNumOfItems = maxItems,                              //24                                    
        offset = parseInt(getParameterByName('count')) || global.items_limit_on_page_load; //18   || count
        console.log(`инициация рисовки кнопки при прокрутке maxItems ${maxItems}  offset: ${offset}`);
    return function () {
        if(offset === maxNumOfItems && maxNumOfItems <= global.items_limit_on_page_load){
            console.log(`offset === maxNum`);
            $("#button-forward").hide();
            $("#button-backward").hide();
            return;
        }
        if (offset < maxNumOfItems) {
            console.log(`offset < maxNum`);
            $("#button-forward").show();
            changeHistoryStateWithParams("replace", getParameterByName('filter') || "new", offset);
        } else {
            $("#button-forward").hide();
        }
        if(offset > global.items_limit_on_page_load) {
            console.log(`offset > maxNum`);
            $("#button-backward").show();
        } else {
            $("#button-backward").hide();
        }
    }
};

var initDrawItemsOnScroll = function (maxItems) {
    var maxNumOfItems = maxItems,
        limit = global.number_of_items_onscroll,
        offset = parseInt(getParameterByName('count')) || global.items_limit_on_page_load;

    return function () {
        if (offset < maxNumOfItems) {
            var data = {
                'filter': getParameterByName('filter') || "new",
                'limit': limit,
                'offset': offset
            };
            $("#loading").slideDown();
            doAjaxQuery('GET', '/books', data,
                function (res) {
                    $("#loading").slideUp();
                    isScrollRunning = false;
                    view.addBooksItems(res.data.books, false);
                    changeHistoryStateWithParams("replace", res.data.filter, res.data.offset);
                });
            offset += limit;
        }
    }
};

function loadIndexPage(reqData, doCleanContent) {
    doAjaxQuery('GET', '/books', reqData, function (res) {
        console.log(`loadIndex:  ${JSON.stringify(res)}`);
        view.addBooksItems(res.data.books, doCleanContent);
        changeHistoryStateWithParams('push', res.data.filter, res.data.offset+res.data.limit);
        drawItemsOnScroll = initDrawButtonOnScroll(res.data.total.amount);
    });
}


function setSidebarActiveButton(activeElem, filterStringValue) {
    $('.sidebar_item').removeClass('active');
    if (activeElem) {
        activeElem.closest('a').addClass('active');
        return;
    } else {
        $('a[data-filter=' + filterStringValue + ']').addClass('active');
    }
}
