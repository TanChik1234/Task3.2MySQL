/* ----------------------------- begin view ----------------------------------*/
var view = {
    fillFields: function(obj, fields, func) {
        fields = fields.split(/, */);
        fields.map(function(f) {
            ($('#' + f)[func])(obj[f]);
        });
        let authors = $(`#authors`);
        let authorsHTML = authors.html();
        authorsHTML += `<a href="#" data-author-id="${obj.authorID1}" class="authors" style="color: #2c3e50;">${obj.author1}</a>`
        if(obj.author2) authorsHTML += `<a href="#" data-author-id="${obj.authorID2}" class="authors" style="color: #2c3e50;">, ${obj.author2}</a>`;
        if(obj.author3) authorsHTML += `<a href="#" data-author-id="${obj.authorID3}" class="authors" style="color: #2c3e50;">, ${obj.author3}</a>`;
        authors.html(authorsHTML);
        let year = $('#year');
        let yearHTML = `${year.html()} <a href="#" data-year="${obj.year}" class="year" style="color: #2c3e50;">${obj.year}</a>`
        year.html(yearHTML);
    },
    selectFields: function(fields, func) {
        var obj = {};
        fields = fields.split(/, */);
        fields.map(function(f) {
            var v = ($('#' + f)[func])();
            obj[f] = (v);
        });
        return obj;
    },
    showErrEmail: function() {
        var c = '.input-group';
        $(c).removeClass('has-success');
        $(c).addClass('has-error');
        view.hideElement('.glyphicon-ok');
        view.showElement('.glyphicon-remove');
    },
    showSuccessEmail: function() {
        var c = '.input-group';
        $(c).removeClass('has-error');
        $(c).addClass('has-success');
        view.hideElement('.glyphicon-remove');
        view.showElement('.glyphicon-ok');
    },
    addBookItem: function(book) {
        let authors = book.author1;
        if(book.author2) authors += `, ${book.author2}`;
        if(book.author3) authors += `, ${book.author3}`;
        return $('#pattern').html()
            .replace(/{id}/g, book.id)
            .replace(/{title}/g, book.title)
            .replace(/{authors}/g, authors)
            .replace(/{image}/g, book.image_name);
    },
    addBooksItems: function(books, doClean) {
        var content = $('#content');
        var contentHTML = ((doClean) ? '' : content.html());
        for (var i in books) {
            contentHTML += view.addBookItem(books[i]);
        }

        content.html(contentHTML);
        $('.blockI').matchHeight(); // Aligns all the height of the book
    },
    showNot_found: function(searchText, pathUrl) {
        var contentNotFound = $('#not_found').html()
            .replace(/{searchText}/g, searchText);
        $('#content').html(contentNotFound);
    },
    nullToDash: function(string) {
        return (((string == null) || (string == 0)) ? '-' : string);
    },
    addBooksListRow: function(book, serialNumber) {
        var isChecked = book.deleted === 0 ? "" : "checked"
        let authors = book.author1;
        if(book.author2) authors += `, ${book.author2}`;
        if(book.author3) authors += `, ${book.author3}`;

        return $('#pattern').html()
            .replace(/{serialNumber}/g, serialNumber)
            .replace(/{id}/g, book.id)
            .replace(/{title}/g, book.title)
            .replace(/{authors}/g, authors)
            .replace(/{year}/g, book.year)
            .replace(/{pages}/g, book.pages)
            .replace(/{description}/g, book.description)
            .replace(/{image-name}/g, book.image_name)
            .replace(/{clicks}/g, book.clicks)
            .replace(/{views}/g, book.views)
            .replace(/{checked}/g, isChecked)
    },
    addBookListPage: function (res, numberPage) {
        var countRowOnPage = 20;
        var display = numberPage === 1 ? "" : 'style="display: none;"'
        var pageHTML = '';

        var startIndex = (numberPage-1)*countRowOnPage;
        for(var i = startIndex; i <= startIndex+countRowOnPage-1 && i < res.data.books.length; i++){
            pageHTML += view.addBooksListRow(res.data.books[i], i+1);
        }

        var tbodyHTML = $('#row-pattern').html()
        .replace(/{number-page}/g, numberPage)
        .replace(/{display}/g, display);


        return tbodyHTML.replace('{page-rows}', pageHTML);  
    },
    addBooksList: function(res) {
        var content = $('#table_content');
        var contentHTML ="";
        var countRowOnPage = 20;
        var countPage = Math.ceil(res.data.books.length / countRowOnPage);
        contentHTML += $('#thead-pattern').html();
        for(var i = 1; i <= countPage; i++){
            contentHTML += view.addBookListPage(res, i);
        }

        content.html(contentHTML);

        var pagination = $('#pagination');
        var allPage = "";
        allPage += `<li class="page-item">
        <a class="page-link disabled" href="#" aria-label="Предыдущая" id="btn-previous-page" >
          <span aria-hidden="true">&laquo;</span>
        </a>
      </li>`
        for(var i = 1; i <= countPage; i++){
            var isActive = i === 1 ? "active" : ""
            allPage += $('#page-link-pattern').html()
                            .replace(/{number}/g, i)
                            .replace(/{active}/g, isActive);
        }
        var isDisabled = countPage <= 1 ? "disabled" : "";
        allPage += `<li class="page-item" >
        <a class="page-link ${isDisabled}" href="#" aria-label="Следующая" id="btn-next-page">
          <span aria-hidden="true">&raquo;</span>
        </a>
      </li>`

        pagination.html(allPage);
    },
    fillBookInfo: function(book) {
        view.fillFields(book, 'title,pages,isbn,description,image', "html");
        $('#id').attr({
            'book-id': book.id,
            'busy': book.event
        });
        $(".btnBookID").attr("value", book.id);
        $('#bookImg img').attr('src', '/uploads/' + book.image);
        $('.description').html(book.description);
    },
    normalDateFormat: function(date) {
        return date.toISOString().substring(0, 10);
    },
    addPopUpBlock: function(title, text) {
        $('#main').after('<div id="test-modal" class="mfp-hide white-popup-block"><h1>' + title + '</h1><p>' + text + '</p><p><a class="popup-modal-dismiss" href="#">X</a></p></div>');
    },
    showError: function(text) {
        // swal('Ооопс!', text, 'error');
        alert(`Ооопс! ${text} error`)
    },
    showSuccess: function(text) {
        // console.log(text);
        swal('Отлично!', text, 'success');
    },
    showSubscribe: function(text, bookId) {
        swal({
                title: 'Хотите почитать?',
                text: text,
                type: 'input',
                showCancelButton: true,
                closeOnConfirm: false,
                animation: 'slide-from-top',
                inputPlaceholder: 'Введите свой e-mail',
                confirmButtonColor: '#27AE60',
                showLoaderOnConfirm: true
            },
            function(inputValue) {
                if (inputValue === false) {
                    return false;
                }
                if (!controller.validateEmail(inputValue)) {
                    swal.showInputError('Вы где-то ошиблись. Проверьте введенные данные.');
                    return false;
                }
                doAjaxQuery('GET', '/books/' + bookId + '/order', {
                    'email': inputValue
                }, function(res) {
                    view.showSuccess('Ваш e-mail ' + inputValue + '\nдобавлен в список ожидания.');
                });
            });
    },
    showConfirm: function(bookId) {
        swal({
                title: 'Вы уверены?',
                text: 'Согласие приведет к невозвратимому удалению книги',
                type: 'warning',
                showCancelButton: true,
                cancelButtonText: 'Льолик, не надо!',
                confirmButtonColor: '#27AE60',
                confirmButtonText: 'Да, уверен!',
                closeOnConfirm: false
            },
            function() {
                doAjaxQuery('GET', '/admin/books/' + bookId + '/remove', null, function(res) {
                    swal({
                            title: 'Удалено!',
                            text: 'Надеюсь, вы осознаете что сейчас произошло ))',
                            type: 'success'
                        },
                        function() {
                            window.location.href = '/admin';
                        });
                });
            });
    },
    addMiniItemSearch: function(pathUrl, book) {
        let authors = book.author1;
        if(book.author2) authors += `, ${book.author2}`;
        if(book.author3) authors += `, ${book.author3}`;
        var id = (book.id == 'no-cover') ? '#not_found' : '#miniItem';
        return $(id).html()
            .replace(/{id}/g, book.id)
            .replace(/{path}/g, pathUrl)
            .replace(/{title}/g, book.title)
            .replace(/{authors}/g, authors)
            .replace(/{image}/g, book.image_name);;
    },
    addMiniItemsSearch: function(pathUrl, books, text) {
        var content = $('#list');
        content.html('');
        var contentHTML = content.html();
        var limitImetsInSearch = 3;
        var n = 0;
        for (var i in books) {
            n++;
            if (i <= limitImetsInSearch) {
                contentHTML += view.addMiniItemSearch(pathUrl, books[i]);
                content.attr('size', n);
            }
        }
        if (n > limitImetsInSearch) {
            contentHTML += $('#more').html()
                .replace(/{text}/g, text)
                .replace(/{pathUrl}/g, pathUrl);
        }
        content.html(contentHTML);
        content.show('fast');
        if(n > limitImetsInSearch){
            $('#more-link').on('click', function (event) {
                event.preventDefault();
                requestBooksSearchAdmin(function(res) {
                    view.addBooksList(res);
                    msgResultSearchText(text, res.data.books.length);
                    $('.found').show();
                    $('#list').hide(200);
                    $('#btn-all-books').show();
                });
            });
        }
    }

};
/* ------------------------------- end view ----------------------------------*/

/* --------------------------- begin controller ------------------------------*/
var controller = {
    validateEmail: function(value) {
        var regex = /^[-\w.]+@([A-z0-9][-A-z0-9]+\.)+[A-z]{2,10}$/;
        return regex.test(value);
    }
};
/* --------------------------- end controller --------------------------------*/


/* ------------------------ Jquery Ajax function ---------------------------- */

function doAjaxQuery(method, url, data, callback) {
    $.ajax({
        type: method,
        url: url,
        contentType: 'application/json',
        dataType: 'json',
        data: ((method == 'POST') ? JSON.stringify(data) : data),
        success: function(res) {
            if (!res.success) {
                view.showError(res.msg);
                return;
            }
            callback(res);
        },
        error: function(jqXHR, textStatus) {
            view.showError('Ошибка ' + textStatus);
        }
    });
}

$(function() {
    $('.popup-modal').magnificPopup({
        type: 'inline',
        preloader: false,
        focus: '#username',
        modal: true
    });
    $(document).on('click', '.popup-modal-dismiss', function(e) {
        e.preventDefault();
        $.magnificPopup.close();
    });
});

var global = {
    items_limit_on_page_load: 12,
    number_of_items_onscroll: 6,
    filter: 'new'
};

function htmlspecialchars(html) {
    html = html.replace(/&/g, "&amp;");
    html = html.replace(/</g, "&lt;");
    html = html.replace(/>/g, "&gt;");
    html = html.replace(/"/g, "&quot;");
    return html;

}
