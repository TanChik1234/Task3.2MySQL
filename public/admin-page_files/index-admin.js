/**
 * The method is responsible for providing a preview of the image when loading an image into the form.
 */
function previewImage() {
  var input = document.getElementById('customFile');
  var preview = document.getElementById('imagePreview');
  var file = input.files[0];
  var reader = new FileReader();

  reader.onloadend = function () {
      preview.src = reader.result;
  };

  if (file) {
      reader.readAsDataURL(file);
  } else {
      preview.src = '#';
  }
}

/**
 * This section of code is responsible for displaying and hiding the form for adding a book to the library.
 */
const btnShowForm = document.getElementById("btn-show-form");
const listContainer = document.getElementById("list-container");
const formContainer = document.getElementById("form-container");
const btnShowAllBook = document.getElementById('btn-all-books');
btnShowForm.addEventListener("click", () => {
  btnShowForm.style.display = "none"
  listContainer.style.display = "none";
  formContainer.style.display = "block";
  btnShowAllBook.style.display = "none";
})
const btnCloseForm = document.getElementById('btn-close-form');
btnCloseForm.addEventListener("click", () => {
  btnShowForm.style.display = "block"
  listContainer.style.display = "block";
  formContainer.style.display = "none";
  btnShowAllBook.style.display = "block";
})

/**
 * The code that is executed upon the full loading of the page.
 */
document.addEventListener('DOMContentLoaded', function () {
  logOut();

  (function () { 
    doAjaxQuery('GET', '/admin/books', null, function (res) {
        view.addBooksList(res);
        createPageNavigation();
        addCheckboxEventsListener();
        let arrayPropertyForSort = ['title','author1','year','pages',
        'description','image_name','clicks','views','deleted'];
        for(let i of arrayPropertyForSort){
          addSortEventListener(i);
        }
    });
  }());


});

/**
 * The method that tracks changes in the checkbox (marking for deletion/hiding of the book).
 */
function addCheckboxEventsListener(){
  let checkboxes = document.querySelectorAll('.form-check-input');

  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', function () {
      let dataToSend = {
          id: checkbox.value,
          check: checkbox.checked ? 1 : 0
      };

      fetch(`http://localhost:3000/admin/deleteBook`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataToSend)
      }).catch(error => {
          console.error(error.message);
      });

      
    });
  })  
}

/**
 * The method is responsible for logging out in basic authentication.
 */
function logOut(){
  var logoutButton = document.querySelector('.btn-success');
  logoutButton.addEventListener('click', ()=>{
    jQuery.ajax({
          type: "GET",
          url: "/admin",
          async: false,
          username: "logmeout",
          password: "123456",
          headers: { "Authorization": "Basic xxx" }
    }).done(function(){
      // If we don't get an error, we actually got an error as we expect an 401!
    }).fail(function(){
      // We expect to get an 401 Unauthorized error! In this case we are successfully 
          // logged out and we redirect the user.
      window.location = "/admin";
    });
    return false; 
  })
}

/**
 * The method is responsible for navigating between pages on the admin page.
 */
function createPageNavigation(){
    let pageLists = document.querySelectorAll('.page-link');
    let activePage = 1;
    let btnPreviousPage = document.getElementById('btn-previous-page');
    let btnNextPage = document.getElementById('btn-next-page');
  
    for(let i = 0; i < pageLists.length; i++){
      pageLists[i].addEventListener('click', () => {
        showSpecifiedPage(i)
      })
    }
  
    function showSpecifiedPage(index){
      document.getElementById(`page-link${activePage}`).classList.remove('active');
      document.getElementById(`tbody${activePage}`).style.display = 'none';
      if(index === 0){
        activePage = --activePage;
      } else if(index === pageLists.length-1){
        activePage = ++activePage;
      } else {
        activePage = +pageLists[index].id.match(/\d+$/)[0];
      }
      document.getElementById(`page-link${activePage}`).classList.add('active');
      document.getElementById(`tbody${activePage}`).style.display = 'contents';
      if(activePage > 1 && btnPreviousPage.classList.contains('disabled')) {
        btnPreviousPage.classList.remove('disabled');
      }
      if(activePage === 1 && !btnPreviousPage.classList.contains('disabled')) {
        btnPreviousPage.classList.add('disabled');
      }
      
      if(activePage < pageLists.length-2 && btnNextPage.classList.contains('disabled')) {
        btnNextPage.classList.remove('disabled');
      }
      if(activePage === pageLists.length-2 && !btnNextPage.classList.contains('disabled')) {
        btnNextPage.classList.add('disabled');
      }
    }
}

/**
 * The method is responsible for adding an event listener to the column headers in the table.
 * When the table header is clicked, the data in the table is sorted based on the data in that column
 * (in ascending or descending order depending on the value of the data-value attribute of the element, 
 * ASC or DSC, respectively).
 * @param {string} propertyForSorting - The attribute by which the table will be sorted.
 */

function addSortEventListener(propertyForSorting){
  let property = $(`#th-${propertyForSorting}`);
  let value = property.data("value");
  property.click(() => {
    let data = {
      sortingOrder: value
    }
    doAjaxQuery('GET', `/admin/sort/${propertyForSorting}`, data, function (res) {
      view.addBooksList(res);
      createPageNavigation();
      addCheckboxEventsListener();
      $(`#th-${propertyForSorting}`).data('value', value === 'ASC' ? 'DESC' : 'ASC');

      let arrayPropertyForSort = ['title','author1','year','pages',
      'description','image_name','clicks','views','deleted'];
      for(let i of arrayPropertyForSort){
        addSortEventListener(i);
      }
    })
  })

  property.mouseover(function() {
    $(this).css('cursor', 'pointer'); 
  });

  property.mouseout(function() {
    $(this).css('cursor', 'auto'); 
  });
}


