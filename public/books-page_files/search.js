var pathNameUrl = $(location).attr('pathname').split('/');
var pathUrl = (pathNameUrl[1] == 'admin') ? '/admin' : '';

/* ------------- The result of the search in autocomplete list --------------*/
var callbackQueryMiniItemsSearch = function(res, text) {
    $('.loader').show();
    if (res.data.total.amount > 0) {
        var books = res.data.books;
        view.addMiniItemsSearch(pathUrl, books, text);
    } else {
        view.addMiniItemsSearch(pathUrl, [{
            id: 'no-cover',
            title: 'По запросу "' + text + '" ничего не найдено :(',
            author: 'Миллионы натренированных обезьян облазили всю библиотеку и не нашли ничего подходящего, что могло бы соответствовать Вашему запросу.',
            image_name: "monkey.jpg"
        }]);
    }
    setTimeout(function() {
        $('.loader').hide();
    }, 200);
};

/*-------------------The message on the search result -----------------------*/
var msgResultSearchText = function(text, number_found) {
    $('.text_found').text(`Результаты поиска для "${text}"`);
    var titles = ['совпадение', 'совпадения', 'совпадений'];
    var cases = [2, 0, 1, 1, 1, 2];
    var coincidence = titles[(number_found % 100 > 4 && number_found % 100 < 20) ? 2 :
        cases[(number_found % 10 < 5) ? number_found % 10 : 5]];

    $('.number_found').text(`Найдено ${number_found} ${coincidence}`);
};

/* ----------------------- Search result on the page ------------------------*/
var callbackQueryItemsSearch = function(res, text) {
    view.addBooksItems(res.data.books, true);
    $('.breadcrumb .active').text('поиск');
    msgResultSearchText(text, res.data.total.amount);
    changeHistoryStateWithParams("replace", res.data.filter, Math.min(res.data.total.amount, global.items_limit_on_page_load))
    drawItemsOnScroll = initDrawButtonOnScroll(res.data.total.amount);
};

/* ----------------------- Sort result on the page ------------------------*/
var callbackQueryItemsSort = function(res) {
    view.addBooksItems(res.data.books, true);

    changeHistoryStateWithParams("replace", res.data.filter, Math.min(res.data.total.amount, global.items_limit_on_page_load))
    drawItemsOnScroll = initDrawButtonOnScroll(res.data.total.amount);
};

/* ------------------- Get the query in database searching -------------------*/
var requestBooksSearch = function(callback) {
    var text = htmlspecialchars($('#search').val());
    if (text.length > 0) {
        text = text.replace(/(^\s+|\s+$)/g, '');
        var textEncode = encodeURIComponent(text); // shielding request
        var data = {
            limit: global.items_limit_on_page_load 
        };
        doAjaxQuery('GET', '' + pathUrl + '/books?search=' + textEncode + '', data,
            function(res) {
                callback(res, text);
            });
    } else {
        $('#list').html('').hide();
    }
};

var requestBooksSearchAdmin = function(callback) {
    var text = htmlspecialchars($('#search').val());
    if (text.length > 0) {
        text = text.replace(/(^\s+|\s+$)/g, '');
        var textEncode = encodeURIComponent(text); // shielding request
        doAjaxQuery('GET', '' + pathUrl + '/search?search=' + textEncode + '', null,
            function(res) {
                callback(res, text);
            });
    } else {
        $('#list').html('').hide();
    }
};

/* ------------------------------- Hide auto search -------------------------*/
$('body').click(function(event) {
    if ($(event.target).attr('id') !== 'search' && $(event.target).attr('id') !== 'list') {
        $('#list').hide(200);
    }
});

/* ---------- Live search if the search did not introduced n time ----------- */
$('#search').keydown(function(event) {
    var text = $(this).val();
    if (event.keyCode === 13) {
        event.preventDefault();
        if (text.length > 0) {
            var encodeText = encodeURIComponent($('#search').val());
            if (pathUrl == '/admin') {
                requestBooksSearchAdmin(function(res) {
                    view.addBooksList(res);
                    msgResultSearchText(text, res.data.books.length);
                    $('.found').show();
                    $('#list').hide(200);
                    $('#btn-all-books').show();
                });
            } else {
                var url = 'http://' + window.location.host + pathUrl + '/search?search=' + encodeText + '';
                window.location = url;
            }
        }
    }
    if (text.length >= 0) {
        if (!(event.keyCode >= 33 && event.keyCode <= 40) &&
            !(event.keyCode >= 16 && event.keyCode <= 20) &&
            (event.keyCode !== 27) &&
            (event.keyCode !== 13)) {

            if (pathUrl == '/admin') {
                var task = setTimeout(function() {
                    requestBooksSearchAdmin(callbackQueryMiniItemsSearch);
                }, 500);
                $('#eAutoComplete_itemMore').find('a').on('click', function(event) {
                    event.preventDefault();
                    alert('yes');

                });
            } else {
                var task = setTimeout(function() {
                    requestBooksSearch(callbackQueryMiniItemsSearch);
                }, 500);
            }
        }

        $('#search').keydown(function(event) {
            if (!(event.keyCode >= 33 && event.keyCode <= 40) &&
                !(event.keyCode >= 16 && event.keyCode <= 20)) {
                clearTimeout(task);
            }
        });
    } else {
        $('#list').hide();
    }
});




$(document).ready(function() {
    (function() {
        if (pathNameUrl[1] == 'search' || pathNameUrl[2] == 'search') {
            var search_text = $(location).attr('search').split('=');
            search_text = decodeURIComponent((search_text[1] == null) ? ' ' : search_text[1]);
            $('#search').val(htmlspecialchars(search_text));
            text = search_text.replace(/(^\s+|\s+$)/g, '');
            var textEncode = encodeURIComponent(text); 
            if (pathNameUrl[1] == 'search') {
                var data = {
                    limit: global.items_limit_on_page_load 
                };
                doAjaxQuery('GET', '' + pathUrl + '/books?search=' + textEncode + '', data,
                    function(res) {
                        callbackQueryItemsSearch(res, text);
                    });
            } else if (pathNameUrl[1] == 'admin' && pathNameUrl[2] == 'search') {
                requestBooksSearch(function(res) {
                    view.addBooksList(res);
                    msgResultSearchText(text, res.data.books.length);
                    $('.found').show();
                    $('#list').hide(200);
                });
            }
        }
    }());

    (function() {
        if (pathNameUrl[1] == 'sort') {
            var queryParameters = $(location).attr('search').split('=');  //['?year',   '2009'] || ['?author', '11']
            var data = {
                limit: global.items_limit_on_page_load 
            };

            doAjaxQuery('GET', '' + pathUrl + `/books${queryParameters[0]}=` + queryParameters[1] + '', data,
                function(res) {
                    callbackQueryItemsSort(res);
                }
            );
        }
    }());
});