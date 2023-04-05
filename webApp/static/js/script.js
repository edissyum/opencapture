$(window).on('load', function() { // makes sure the whole site is loaded
    $('#status').delay(1000).fadeOut('slow'); // will first fade out the loading animation
    $('#preloader').delay(500).fadeOut('slow'); // will fade out the white DIV that covers the website.
    $('body').delay(500).css({'overflow':'visible'});

    const cookie_date = getCookie('verifier_date')
    const cookie_status = getCookie('verifier_status')
    const previous_url = document.referrer
    if (cookie_date && previous_url.includes('/list/view/')) {
        if (cookie_date !== 'TODAY' && cookie_status) {
            tmp_location = window.location.href.replace('/TODAY/NEW', '')
            tmp_location = tmp_location.replace('/TODAY/END', '')
            tmp_location = tmp_location.replace('/TODAY/ERR', '')
            tmp_location = tmp_location.replace('/TODAY/ERR_GED', '')
            tmp_location = tmp_location.replace('/TODAY/WAIT_SUP', '')
            tmp_location = tmp_location.replace('/YESTERDAY/NEW', '')
            tmp_location = tmp_location.replace('/YESTERDAY/END', '')
            tmp_location = tmp_location.replace('/YESTERDAY/ERR', '')
            tmp_location = tmp_location.replace('/YESTERDAY/ERR_GED', '')
            tmp_location = tmp_location.replace('/YESTERDAY/WAIT_SUP', '')
            tmp_location = tmp_location.replace('/OLDER/NEW', '')
            tmp_location = tmp_location.replace('/OLDER/END', '')
            tmp_location = tmp_location.replace('/OLDER/ERR', '')
            tmp_location = tmp_location.replace('/OLDER/ERR_GED', '')
            tmp_location = tmp_location.replace('/OLDER/WAIT_SUP', '')
             window.location.href = tmp_location + '/' + cookie_date + '/' + cookie_status
        }
    }

    const status = document.getElementById('pickStatus').options[document.getElementById('pickStatus').selectedIndex].value
    if (window.location.href.includes('YESTERDAY')) {
        setCookie('verifier_date', 'YESTERDAY', 0.1)
        setCookie('verifier_status', status ? status : 'NEW', 0.1)
    } else if (window.location.href.includes('OLDER')) {
        setCookie('verifier_date', 'OLDER', 0.1)
        setCookie('verifier_status', status ? status : 'NEW', 0.1)
    } else {
        setCookie('verifier_date', 'TODAY', 0.1)
        setCookie('verifier_status', status ? status : 'NEW', 0.1)
    }

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
                if ($('.card').length === 1){
                    let urlParams = new URLSearchParams(window.location.search);
                    let page = urlParams.get('page');
                    if (page !== null && parseInt(page) !== 1){
                        urlParams.set("page", (parseInt(page) - 1).toString());
                        history.replaceState(null, null, "?" + urlParams.toString());
                    }
                }
                window.location.reload();
            }
        });
    }
}

function submitForm(){
    event.preventDefault();
    let search  = $('#search').val();
    let currentUrl = window.location.pathname.split('?')[0];
    if (search !== ''){
        window.location.href = currentUrl + '?search=' + search;
    }else{
        window.location.href = currentUrl;
    }
}

if (!window.location.href.includes('splitter')){
    $(document).ready(function() {
        $(".checkBox_list").each(function() {
            this.checked=false;
        });

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

        $("#trashAll").click(function () {
            if ($(".checkBox_list").length) {
                let res = confirm(gt.gettext('_CONFIRM_DELETE_BATCH'));
                if (res) {
                    $('#status').delay(200).fadeIn('slow'); // will first fade out the loading animation
                    $('#preloader').fadeIn('slow'); // will fade out the white DIV that covers the website.
                    let cpt = 1
                    let totalChecked = $('input[class=checkBox_list]:checked').length;
                    $(".checkBox_list").each(function () {
                        if (this.checked) {
                            let invoice_id = parseInt(this.id.split('_')[0])
                            deleteInvoice(invoice_id, false, res)
                            if (cpt === totalChecked) {
                                if (parseInt($('#cptTrash').html()) === $('.card').length){
                                    let urlParams = new URLSearchParams(window.location.search);
                                    let page = urlParams.get('page');
                                    if (page !== null && parseInt(page) !== 1){
                                        urlParams.set("page", (parseInt(page) - 1).toString());
                                        history.replaceState(null, null, "?" + urlParams.toString());
                                    }
                                }
                                setTimeout(function () {
                                    window.location.reload()
                                }, 800);
                            }
                            cpt += 1
                        }
                    });
                }
            }
        });

        $('.checkBox_list').click(function(){
            let totalChecked = $('input[class=checkBox_list]:checked').length;
            if (this.checked){
                if($('#trashAll')[0].style.display === 'none'){
                    $('#trashAll').fadeIn(500)
                    $('#checkAll')[0].innerHTML = gt.gettext('UNSELECT_ALL') + ' (<span id="cptTrash">' + parseInt(totalChecked) + '</span>)';
                }
                $('#cptTrash')[0].innerHTML = totalChecked
            }else{
                if(totalChecked === 0){
                    $('#trashAll').fadeOut(500)
                    $('#checkAll')[0].innerHTML = gt.gettext('SELECT_ALL')
                }else{
                    $('#cptTrash')[0].innerHTML = totalChecked
                }
            }
        });
    });
}
