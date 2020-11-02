$(function() {
    // Drag and drop between lists
    $(".facet-list").sortable({
        connectWith: "div",
        placeholder: "placeholder",
        delay: 150,
        update: function( ) {
            deleteInvoicesIfEmpty();
        },
        start: function(e, ui){
        // Det responsive placeholder height and width
         let image_dimensions = $('.image-page-invoice');
        ui.placeholder.height(image_dimensions.height());
        ui.placeholder.width(image_dimensions.width());
        }
    }).disableSelection();

    // Image invoice hover effect
    $('.image-page-invoice, #image-invoice-zoom').hover(
        function () {
            $(this).parent().children('a').css("display", "block")
        }).mouseout(
        function () {
            $(this).parent().children('a').css("display", "none")
        });
        $('.placeholder').css("height", "" + $('.image-page-invoice').height() );
});

// Invoice zoom button
$(document).on('click','#image-invoice-zoom',function(e) {
    // disable scroll up when click
    e.preventDefault();
    $('#zoom-image').attr('src',$(this).prop('rel')).css({
        "visibility":"visible"
    })
});

// Invoices control menu
$(document).on('click','.btn-delete-selected',function(e) {
    e.preventDefault();
    $('input:checkbox').each(function () {
           if(this.checked) {
               $('#invoices-history-list').append($(this).parent().parent().closest('div'))
           }
      });
    deleteInvoicesIfEmpty();
});

$(document).on('click','.btn-send-selected',function(e) {
    e.preventDefault();
    $('input:checkbox').each(function () {
           if(this.checked) {
               $('#list_' + $('#input-send-invoice').val().split(' ').pop()).append($(this).parent().parent().closest('div'))
           }
      });
    deleteInvoicesIfEmpty();
});

function checkAllCheckBox(){
    $('input:checkbox').each(function () {
        $(this).prop("checked", true);
    })
}

function unCheckAllCheckBox(){
    $('input:checkbox').each(function () {
        $(this).prop("checked", false);
    })
}

function refresh(){
    location.reload();
}

// Check or uncheck if image clicked
$('.image-page-invoice').click(function(e) {
    let $checkbox = $(this).parent().find('input:checkbox')
    if($checkbox.is(":checked")){
        $checkbox.prop("checked", false);
    }
    else {
        $checkbox.prop("checked", true);
    }
});

// Save new order of invoices
function submitSplit(){
     // Disable scroll up when click
    let count_id_len = $("#invoices-list").find('[id^=row_]').length;
    let list_ids = JSON.parse('[]');

    for (let i = 1; i <= count_id_len; i++) {
        let ids = $('#list_' + i + ' .invoice-page').map(function() { return this.id; }).get();
        if (typeof ids !== 'undefined' && ids.length > 0)
            list_ids.push(ids);
    }

    fetch('/submitSplit', {
        method  : 'POST',
        headers : {
            'Content-Type': 'application/json'
        },
        body    : JSON.stringify({
            ids:list_ids
        })
    }).then(function(response) {
        response.json().then(function(res){
            if (JSON.parse(res.ok)) {
                window.location = "/splitterManager";
            }else {
            }
        });
    });
}

// Hide image zoom when
$(document).mouseup(function (e){
  let container = $("#zoom-image") // YOUR CONTAINER SELECTOR
  if (!container.is(e.target) // if the target of the click isn't the container...
      && container.has(e.target).length === 0) // ... nor a descendant of the container
  {
    container.attr('src','');
    container.css({
        "visibility":"hidden"
    })
  }
});

// Add new invoice list
function add_invoice(){
    // get the new invoice index
    let invoices_ids = $("#invoices-list").find('[id^=row_]');
    let count_id_len = invoices_ids.length + 1;
    let invoice_in_view;
    let isElementInView100;
    let isElementInView200;
    let $element;
    let new_invoice = '\t\t\t<div class="row delete-if-empty change-row-id-on-invoice-add" id="row_'+ count_id_len + '">\n' +
                        '\t\t\t\t<div class="col-xl">\n' +
                        '\t\t\t\t\t <div class="card">\n' +
                        '\t\t\t\t\t\t<div class="card-header">\n' +
                        '\t\t\t\t\t\t\t<label>' + gt.gettext('INVOICE') + ' ' + count_id_len + '</label>\n' +
                        '\t\t\t\t\t\t\t<a id="delete-invoice" href="#" rel="' + count_id_len + '">\n' +
                        '\t\t\t\t\t\t\t\t<i class="fas fa-trash"></i>\n' +
                        '\t\t\t\t\t\t\t</a>' +
                        '\t\t\t\t\t\t</div>\n' +
                        '\t\t\t\t\t\t <div class="card-body">\n' +
                        '\t\t\t\t\t\t\t<div id="list_' + count_id_len + '" class="row facet-list ui-sortable change-list-id-on-invoice-add">\n' +
                        '\t\t\t\t\t\t\t</div>\n' +
                        '\t\t\t\t\t\t </div>\n' +
                        '\t\t\t\t\t </div>\n' +
                        '\t\t\t\t</div>\n' +
                        '\t\t\t</div>';

    // Append in the current scroll position
    for(let invoice of invoices_ids){
        $element = $('#' + invoice.id);
        isElementInView100 = isScrolledIntoView($element, 100);
        isElementInView200 = isScrolledIntoView($element, 200);
        if (isElementInView100 || isElementInView200) {
            invoice_in_view = invoice;
        }
    }
    if(invoice_in_view !== undefined) {
        $('#' + invoice_in_view.id).after(new_invoice);
    }
    else {
        // If all invoices were deleted
        $('.container-fluid').append(new_invoice);
    }

    $('#row_' + count_id_len).hide().slideDown();
    orderInvoiceIds();
    $('#input-send-invoice').append(
         '<option class="invoice-number-option" id=\"option_invoice_' + count_id_len + '\"> ' + gt.gettext('INVOICE') + ' ' + count_id_len + '</option>'
    );

    // Delete invoice
    // Add new list to sortable
    $(".facet-list").sortable({
      connectWith: "div",
      placeholder: "placeholder",
      delay: 150
    })
    .disableSelection();

    return false;
}

// delete invoice
$(document).on('click','#delete-invoice',function(e) {
    // disable scroll up when click
    e.preventDefault();
    let invoice_index = $(this).prop('rel');
    removeInvoice(invoice_index);
});

// Pages delete hist
function show_hide_history(){
    $("#invoices-history-list").slideToggle();
}


// Hide history per default
$(document).ready(function() {
    $("#invoices-history-list").hide();
    $(".sortable").sortable({
           scroll: false
    });
});

// move image deleted to history
$(document).on('click','#delete-invoice-image',function(e) {
    // disable scroll up when click
    e.preventDefault();
    $('#invoices-history-list').append($(this).parent().closest('div'));
});

// remove invoice
function removeInvoice(index) {
        $('#row_' + index).slideUp("normal", function() { $(this).remove(); } );
        // Delete invoice from control menu option
        $('#input-send-invoice > #option_invoice_' + index).remove();
}

// Remove invoice if empty
function deleteInvoicesIfEmpty() {
    $('.remove-if-empty').each(function () {
        if ($(this).children().length === 0){
            removeInvoice(parseInt($(this).attr("id").split('_')[1]));
        }
    });
}

// Check if invoice is displayed
function isScrolledIntoView(elem, correct_scrolling){
    let docViewTop = $(window).scrollTop() - correct_scrolling;
    let docViewBottom = docViewTop + $(window).height();

    let elemTop = $(elem).offset().top;
    let elemBottom = elemTop + $(elem).height();

    return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
}

// Order invoices ids
function orderInvoiceIds(){
    $( ".change-row-id-on-invoice-add" ).each(function( index ) {
        index ++;
        $(this).attr("id", "row_" + index);
        $(this).find('label').text(gt.gettext('INVOICE') + ' ' + index);
        $(this).find('.change-list-id-on-invoice-add').attr("id", "list_" + index);
        //change delete index rel attribute
        $(this).find('#delete-invoice').attr("rel", index);
    });
    $( "#input-send-invoice > option" ).each(function( index ) {
        index ++;
        $(this).text(gt.gettext('INVOICE') + ' ' + index);
        $(this).attr("id", "option_invoice_" + index);
    });
}
