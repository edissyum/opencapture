$(window).on('load', function() { // makes sure the whole site is loaded
    $('#status').delay(1000).fadeOut('slow'); // will first fade out the loading animation
    $('#preloader').delay(500).fadeOut('slow'); // will fade out the white DIV that covers the website.
    $('body').delay(500).css({'overflow':'visible'});

    let previous        = $('.previous');
    let previousLink    = $('.previous a');
    let next            = $('.next');
    let nextLink        = $('.next a');

    if (previousLink !== undefined){
        previousLink.html('').html("<i class='fa fa-caret-square-left'></i>");
    }else{
        previous.html('').html("<i class='fa fa-caret-square-left'></i>");
    }

    if (nextLink !== undefined){
        nextLink.html('').html("<i class='fa fa-caret-square-right'></i>");
    }else{
        next.html('').html("<i class='fa fa-caret-square-right'></i>");
    }
});

function loadPageFiltered(status){
    let actualUrl   = window.location.href.split('/');
    if(status === '') {
        actualUrl.pop();
        window.location.href = actualUrl.join('/');
    }else
        window.location.href = status
}

function changeLanguage(value) {
    if (value !== ''){
        fetch('/ws/changeLanguage/' + value, {
            method  : 'GET',
        }).then(function () {
            window.location.reload();
        });
    }
}

function deleteInvoice(id){
    let res = confirm(gt.gettext('_CONFIRM_DELETE'));
    if (res === true){
        window.location.href = '/list/delete/' + id + '/returnpath=' + (window.location.pathname).replace(/\//g, '%');
    }
}

function submitForm(){
    event.preventDefault();
    let search  = $('#search').val();
    if (search !== ''){
        let currentUrl       = window.location.pathname.split('?')[0];
        window.location.href = currentUrl + '?search=' + search;
    }
}

