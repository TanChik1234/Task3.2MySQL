var pathname = $(location).attr('pathname');
var bookIdPosition = pathname.lastIndexOf('/') + 1;
var isBookInUse = false;
var bookId;

doAjaxQuery('GET', '/books/' + pathname.substr(bookIdPosition), null, function(res) {
    view.fillBookInfo(res.data);
    if (res.data.event) {
        isBookInUse = true;
        bookId = res.data.id;
    }
    $('.authors').click(function(event){
        event.preventDefault();
        var url = 'http://' + window.location.host + '/sort?author=' + $(this).data("author-id") + '';
                    window.location = url;
    })
    $('.year').click(function(event){
        event.preventDefault();
        var url = 'http://' + window.location.host + '/sort?year=' + $(this).data("year") + '';
                    window.location = url;
    })
});

/* --------------------Show the result, for sending the -----------------------
----------------------email in the queue for the book ---------------------- */
// var showResultSendEmailToQueue = function(email, result) {
//     var busy = $('#bookID').attr('busy');
//     $('.form-queue', '.btnBookID', (busy === null) ? '.freeBook' : '.busyBook').css('display', 'none');
//     $('.response').css('display', 'block');
//     $('span.youEmail').text(' ' + email);
// };

/*--------------- Send email. Get in Queue in for a book ---------------------*/
// var sendEmailToQueue = function(id, email) {
//     doAjaxQuery('GET', '/books/' + id + '/order?email=' + email, null, function(res) {
//         showResultSendEmailToQueue(email, res.success);
//     });
// };

/* --------------- Checking validity of email when typing in input -----------*/
// $('.orderEmail').keyup(function(event) {
//     var email = $(this).val();
//     var isEmail = controller.validateEmail(email);
//     if (email === '') {
//         $('.input-group').removeClass('has-error has-success');
//         view.hideElement('.glyphicon-remove', '.glyphicon-ok');
//     } else {
//         if (isEmail) {
//             view.showSuccessEmail();
//             if (event.keyCode == 13) {
//
//                 var id = $('#bookID').attr('book-id');
//                 sendEmailToQueue(id, email);
//             }
//         } else {
//             view.showErrEmail();
//         }
//     }
// });
/*------------------ Sending email by clicking on the button ----------------*/
$('.btnBookID').click(function(event) {
    // var email = $('.orderEmail').val();
    // var isEmail = controller.validateEmail(email);
    // if (isEmail) {
    //     view.showSuccessEmail();
    //     var id = $('#bookID').attr('book-id');
    //     sendEmailToQueue(id, email);
    // } else {
    //     view.showErrEmail();
    // }
    // if (isBookInUse) {
    //     view.showSubscribe(
    //         "Сейчас эта книга находится на руках, у одного из наших учеников." +
    //         " Оставь свой email и мы сообщим, как только книга вновь" +
    //         " появится в библиотеке", bookId);
    // } else 
    {
        let data = {
            id: $(this).val()
        }
        doAjaxQuery('POST', '/book/increaseClicks/', data, function (){
            console.log('increaseClicks');
        } )
        alert(
            "Книга свободна и ты можешь прийти за ней." +
            " Наш адрес: г. Кропивницкий, переулок Васильевский 10, 5 этаж." +
            " Лучше предварительно прозвонить и предупредить нас, чтоб " +
            " не попасть в неловкую ситуацию. Тел. 099 196 24 69"
        );
    }
});



