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

function deleteInvoice(id, reload = true, res = false){
    if (reload){
        res = confirm(gt.gettext('_CONFIRM_DELETE'));
    }
    if (res === true){
        fetch('/ws/deleteInvoice/' + id, {
            method  : 'GET',
        }).then(function () {
            if (reload){
                window.location.reload();
            }
        });
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

$(document).ready(function() {
    $(".checkBox_list").each(function() {
        this.checked=false;
    });

    if(!$('#checkAll').length && $('.pdf_list').length){
        $('.pagination-page-info').prepend('<i id="trashAll" class="position-absolute fas fa-trash" style="display: none; cursor: pointer; left: 190px; margin-top: 4px;"></i>')
        $('.pagination-page-info').prepend('<p id="checkAll" class="checkAll position-absolute " style="cursor: pointer">' + gt.gettext("SELECT_ALL") + '</p>')
    }
    if ($('.checkAll').length == 2)
        $('.checkAll')[1].style.display = 'none'

    $("#checkAll").click(function() {
        let label = $('#checkAll')[0].innerHTML
        if (label === gt.gettext('SELECT_ALL')) {
            $(".checkBox_list").each(function() {
                $('#checkAll')[0].innerHTML = gt.gettext('UNSELECT_ALL') + ' (<span id="cptTrash">' + parseInt($('input[class=checkBox_list]:checked').length + 1) + '</span>)';

                $('#trashAll').fadeIn(500)
                this.checked=true;
            });
        } else {
            $(".checkBox_list").each(function() {
                $('#checkAll')[0].innerHTML = gt.gettext('SELECT_ALL')
                $('#trashAll').fadeOut(500)
                this.checked=false;
            });
        }
    })

    $("#trashAll").click(function() {
        if($(".checkBox_list").length){
            $('#status').delay(200).fadeIn('slow'); // will first fade out the loading animation
            $('#preloader').fadeIn('slow'); // will fade out the white DIV that covers the website.
            let cpt = 1
            let totalChecked = $('input[class=checkBox_list]:checked').length;

            let res = confirm(gt.gettext('_CONFIRM_DELETE_BATCH'));
            if (res){
                $(".checkBox_list").each(function() {
                    if (this.checked){
                        let invoice_id = parseInt(this.id.split('_')[0])
                        deleteInvoice(invoice_id, false, res)
                        if (cpt === totalChecked){
                             setTimeout(function(){ window.location.reload() }, 800);
                        }
                        cpt += 1
                    }
                });
            }
        }
    });

    $('.checkBox_list').click(function(){
       if (this.checked){
           if($('#trashAll')[0].style.display == 'none'){
               $('#trashAll').fadeIn(500)
               $('#checkAll')[0].innerHTML = gt.gettext('UNSELECT_ALL')
           }
       }else{
           let totalChecked = $('input[class=checkBox_list]:checked').length;
           if(totalChecked == 0){
               $('#trashAll').fadeOut(500)
               $('#checkAll')[0].innerHTML = gt.gettext('SELECT_ALL')
           }else{
               $('#cptTrash')[0].innerHTML = totalChecked
           }
       }
    });
});
