

$('#button-forward').click(function (event) {
    event.preventDefault();
    var filter = getParameterByName('filter');
    $('#search').val('');
    setSidebarActiveButton($(this), filter);
    (function () {
        if(/^year/.test(filter) ||/^authorId/.test(filter)){
            let sortArray = filter.split("$");
            var data = {
                [sortArray[0]]: sortArray[1],             
                offset: getParameterByName('count'),  
                limit: global.number_of_items_onscroll
            };
        } else {
            var data = {
                filter: filter || 'new',             
                offset: getParameterByName('count'),  
                limit: global.number_of_items_onscroll
            };
        };
        loadIndexPage(data, false);
        isScrollRunning = false;
    }());
});

$('#button-backward').click(function (event) {
    event.preventDefault();
    var filter = getParameterByName('filter');
    $('#search').val('');
    setSidebarActiveButton($(this), filter);   
    (function () {
        if(/^year/.test(filter) ||/^authorId/.test(filter)){
            let sortArray = filter.split("$");
            var data = {
                [sortArray[0]]: sortArray[1],             
                offset: 0,  
                limit: Math.max(getParameterByName('count')-global.number_of_items_onscroll, 
                global.items_limit_on_page_load)
            };
        } else {
            var data = {
                filter: filter || 'new',              
                offset: 0,                            
                limit: Math.max(getParameterByName('count')-global.number_of_items_onscroll, 
                                            global.items_limit_on_page_load) 
            };
        }
        loadIndexPage(data, true);
        isScrollRunning = false;
    }());
});

function changeHistoryStateWithParams(action, filter, offset) {
    console.log(`Изменить историю filter: ${filter}, offset:${offset}`); 
    if (action = ''){
        return;
    }

    offset = parseInt(offset);   
    var count = offset ? offset : global.items_limit_on_page_load; 
    var queryString = '?filter=' + filter + '&count=' + count;          
    if (action === 'push') {
        window.history.pushState('','',queryString);
    } else {
        window.history.replaceState('','',queryString);
    }
}
