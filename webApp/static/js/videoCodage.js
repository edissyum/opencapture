// noinspection ES6ConvertVarToLetConst
var isOCRRunning        = false;
// noinspection ES6ConvertVarToLetConst
var isSIRETRunning      = false;
// noinspection ES6ConvertVarToLetConst
var isSIRENRunning      = false;
// noinspection ES6ConvertVarToLetConst
var isVATRunning        = false;
// noinspection ES6ConvertVarToLetConst
var isAdressRunning     = false;
// noinspection ES6ConvertVarToLetConst
var windowsWidth        = $('#my-image').width();
// noinspection ES6ConvertVarToLetConst
var originalWidth       = $('#width_original').val();
// noinspection ES6ConvertVarToLetConst
var currentPage         = $('#currentPage');
// noinspection ES6ConvertVarToLetConst
var maxPages            = parseInt($('.fa-arrow-left').data('pages'));
// noinspection ES6ConvertVarToLetConst
var token               = '';
// Var used to keep the size of the image when the ocr-on-the-fly is done and calculate a good ratio to draw rectangle
// Give it a default value
// noinspection ES6ConvertVarToLetConst
var imgSizeOnOCR        = windowsWidth;
// noinspection ES6ConvertVarToLetConst
var zoom                = false;
// noinspection ES6ConvertVarToLetConst
var loaded              = false;
// noinspection ES6ConvertVarToLetConst
var isDuplicate         = false;
// noinspection ES6ConvertVarToLetConst
var config              = '';
// noinspection ES6ConvertVarToLetConst
var banApiError         = false;
// noinspection ES6ConvertVarToLetConst
var pdfId               = $("#pdf_id").val()

/******** MAIN FUNCTIONS ********/

function readConfig() {
    return fetch('/ws/readConfig')
        .then(response => response.json())
        .then(function(response) {
            return response.text;
    })
}

function searchSupplier(){
    let supplierId = $('#supplier_id');
    let inputVAT = $('#vat_number');
    let inputSIRET = $('#siret_number');
    let inputSIREN = $('#siren_number');
    let inputCity = $('#city');
    let inputAdress = $('#address');
    let inputAdressCompletement = $('#address2');
    let inputZip = $('#postal_code');
    let buttonAddSupplier = $('#add_supplier');
    let buttonEditSupplier = $('#edit_supplier');

    $('#name').autocomplete({
        serviceUrl: '/ws/supplier/retrieve',
        deferRequestBy: 300,
        noSuggestionNotice: gt.gettext('NO_RESULTS'),
        showNoSuggestionNotice: true,
        onSearchComplete: function (query, suggestions) {
            if (suggestions.length === 0){
                if(buttonAddSupplier.is(":hidden")) {
                    buttonAddSupplier.show();
                    buttonEditSupplier.hide();
                    // Icon effect
                    setTimeout(function () {
                        $(".supplier-action-icon").fadeOut(150).fadeIn(150);
                    }, 150);
                }
                supplierId.val('');
                inputVAT.val('');
                inputZip.val('');
                inputCity.val('');
                inputSIRET.val('');
                inputSIREN.val('');
                inputAdress.val('');

                $('.is-valid').each(function(){
                    $(this).removeClass('is-valid')
                });

                $('.is-invalid').each(function(){
                    $(this).removeClass('is-invalid')
                });

                $('.orangeRatioInput').each(function(){
                    $(this).removeClass('orangeRatioInput')
                });
            }
        },
        onSelect: function (suggestion) {
            if(buttonEditSupplier.is(":hidden")){
                buttonAddSupplier.hide();
                buttonEditSupplier.show();
                // Icon effect
                 setTimeout(function() {
                         $(".supplier-action-icon").fadeOut(150).fadeIn(150);
                 }, 150);
            }
            let data = JSON.parse(suggestion['data'])[0];
            let supplierIdValue = data['supplier_id'];
            let zip = data['zipCode'];
            let VAT = data['VAT'];
            let city = data['city'];
            let SIRET = data['siret'];
            let SIREN = data['siren'];
            let adress1 = data['adress1'];
            let adress2 = data['adress2'];

            supplierId.val(supplierIdValue);

            if(adress1 !== null && adress2 !== null && (inputAdress.val() === '' || inputAdress.val() !== adress1 + ' ' + adress2)){
                inputAdress.val(adress1.trim()).prev().fadeOut();
                inputAdressCompletement.val(adress2.trim()).prev().fadeOut();
            }else if(adress1 !== null && adress2 === null && (inputAdress.val() === '' || inputAdress.val() !== adress1)){
                inputAdress.val(adress1.trim()).prev().fadeOut();
            } else if(adress1 === 'nan'){
                inputAdress.val('').prev().fadeOut();
            }

            if(zip !== 'nan' && (inputZip.val() === '' || inputZip.val() !== zip)){
                inputZip.val(zip).prev().fadeOut();
            }else if(VAT === 'nan'){
                inputZip.val('').prev().fadeOut();
            }

            if(city !== 'nan' && (inputCity.val() === '' || inputCity.val() !== city)){
                inputCity.val(city.trim()).prev().fadeOut();
            }else if(city === 'nan'){
                inputCity.val('').prev().fadeOut();
            }

            if(VAT !== 'nan' && (inputVAT.val() === '' || inputVAT.val() !== VAT)){
                inputVAT.val(VAT.trim()).prev().fadeOut();
            }else if(VAT === 'nan'){
                inputVAT.val('').prev().fadeOut();
            }

            if(SIRET !== 'nan' && (inputSIRET.val() === '' || inputSIRET.val() !== SIRET)){
                inputSIRET.val(SIRET.trim()).prev().fadeOut();
            }else if(SIRET === 'nan'){
                inputSIRET.val('').prev().fadeOut();
            }

            if(SIREN !== 'nan' && (inputSIREN.val() === '' || inputSIREN.val() !== SIREN)){
                inputSIREN.val(SIREN).prev().fadeOut();
            }else if(SIREN === 'nan'){
                inputSIREN.val('').prev().fadeOut();
            }

            checkAdress();
            checkVAT();
            checkSIRET();
            checkSIREN();
        }
    });
}

function ocrOnFly(isRemoved, inputId, removeWhiteSpace = false, needToBeNumber = false, needToBeDate = false){
    let myImage = $('#my-image');
    let zoomImg = $('.zoomImg');
    // ratioImg is used to recalculate the (x,y) position when the ocr is done on the zoomed image
    let ratioImg = originalWidth / myImage.width();

    let isNotZoomed = (zoomImg.length === 0 || zoomImg.css('opacity') === '0');
    if (isNotZoomed){
        zoomImg.css({
            'z-index' : -99
        });
    }else {
        ratioImg = originalWidth / zoomImg.width();
        myImage = zoomImg;
    }

    let input = document.getElementById(inputId.id);
    myImage.imgAreaSelect({
        outerOpacity    : '0',
        borderWidth     : '1',
        fadeSpeed       : 400,
        autoHide        : false,
        handles         : true,
        borderColor1    : 'black',
        borderOpacity   : '0.5',
        selectionColor  : 'black',
        selectionOpacity: '0.2',
        remove          : isRemoved,
        maxWidth        : myImage.width(),
        maxHeight       : myImage.height() / 8,

        onSelectEnd     : function(img, selection){
            if(selection['width'] !== 0 && selection['height'] !== 0){
                if(!isOCRRunning) {
                    isOCRRunning = true;

                    fetch('/ws/pdf/ocr', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            selection: selection,
                            fileName: $('#my-image')[0].src.replace(/^.*[\\\/]/, ''),
                            thumbSize: {width: img.width, height: img.height}
                        })
                    }).then(function (response) {
                        response.json().then(function (res) {
                            if (!JSON.parse(res.ok)) {
                                $('#errors').text('').html(gt.gettext('WAIT_OCR_END'));
                            } else {
                                isOCRRunning = false;
                                imgSizeOnOCR = isNotZoomed ? myImage.width() : myImage.width() / ratioImg;
                                removeZoom();

                                let result = res['text'];

                                if (needToBeNumber) {
                                    if (isFloat(parseFloat(result.replace(/\s/g, '').replace(/\./g, '').replace(/,/g, '.')))) {
                                        result = parseFloat(result.replace(/\s/g, '').replace(/\./g, '').replace(/,/g, '.'));
                                    } else if (isInt(parseInt(result.replace(/\s/g, '').replace(/\./g, '')))) {
                                        result = parseInt(result.replace(/\s/g, '').replace(/\./g, ''));
                                    }

                                    // Remove non numeric char
                                    result = result.toString().replace(/[,]/g, ".").replace(/[^0-9.]/g, '');
                                }

                                if (needToBeDate === true){
                                    result = result.replace(/,/g, "/")
                                    result = result.replace(/\./g, "/")
                                }

                                if (removeWhiteSpace === true) {
                                    input.value = result.replace(/\s/g, "");
                                    input.dispatchEvent(new KeyboardEvent('keyup'));
                                } else {
                                    input.value = result;
                                    input.dispatchEvent(new KeyboardEvent('keyup'));
                                }

                                // Execute the function to check the value of the input using external API
                                // Do this triggering the function on the "onkeyup" attributes of the input
                                let attr = input.getAttribute('onkeyup');
                                if (attr !== null) {
                                    input.dispatchEvent(new KeyboardEvent('keyup'));
                                } else if (inputId.id === 'supplier') {
                                    $('#name').focus();
                                }

                                // Add the coordonates of selection to draw rectangle later
                                // Remove the _original because of the ratio issues
                                let x1 = selection.x1 * ratioImg;
                                let y1 = selection.y1 * ratioImg;
                                let x2 = selection.x2 * ratioImg;
                                let y2 = selection.y2 * ratioImg;

                                input.setAttribute('x1_original', '');
                                input.setAttribute('y1_original', '');
                                input.setAttribute('x2_original', '');
                                input.setAttribute('y2_original', '');
                                input.setAttribute('x1', x1.toFixed(2).toString());
                                input.setAttribute('y1', y1.toFixed(2).toString());
                                input.setAttribute('x2', x2.toFixed(2).toString());
                                input.setAttribute('y2', y2.toFixed(2).toString());
                                input.setAttribute('page', currentPage === undefined || Object.keys(currentPage).length === 0 ? 1 : currentPage.text());

                                let inputPosition = $('#' + input.id + '_position')
                                let inputPage = $('#' + input.id + '_page')

                                if (!inputPosition.length)
                                    $('#' + input.id).parent().append('<input type="hidden" id="' + input.id + '_position" name="' + input.name + '_position"/>')

                                if (!inputPage.length)
                                    $('#' + input.id).parent().append('<input type="hidden" id="' + input.id + '_page" name="' + input.name + '_page"/>')

                                document.getElementById(input.id + '_position').value = '((' + x1.toFixed(2) + ',' + y1.toFixed(2) + '),(' + x2.toFixed(2) + ',' + y2.toFixed(2) + '))'
                                document.getElementById(input.id + '_page').value = currentPage === undefined || Object.keys(currentPage).length === 0 ? 1 : currentPage.text()

                                // Show the eyes, on click on it, it will show the rectangle on the image
                                // .prev() allow us to display the input-group-text class, containing the eye
                                $('#' + inputId.id).prev().fadeIn();

                                // Flush error
                                $('#errors').text('');
                            }
                        })
                    });
                }
            }
        }
    });
}

/******** ONLOAD ********/

// On load, reload Insee token for SIRET/SIREN validation
// Also, do all the validation if the input aren't empty
// Also, control supplier edit and add button
$(document).ready(function() {
    if(!loaded){
        // Set supplier button to edit if id_supplier is set
        let buttonAddSupplier = $('#add_supplier');
        let buttonEditSupplier = $('#edit_supplier');

        let supplierId = $('#supplier_id');

        if(supplierId.val() !== ''){
            buttonAddSupplier.hide();
            buttonEditSupplier.show();
        }
        else {
            buttonAddSupplier.show();
            buttonEditSupplier.hide();
        }

        loaded = true;
        // Get the config
        readConfig().then((res) => {    // Put the rest of code into the 'then' to make synchronous API call
            config = res;
            token = getCookie('access_token');
            if(token === '' || token === undefined || token === 'undefined'){
                generateTokenInsee(config.GENERAL['siret-consumer'], config.GENERAL['siret-secret'])
                .then(function(res) {
                    if (!JSON.parse(res.ok)) {
                        loaded = false;
                        let invalidSIRET = $('.siret_number_invalid')
                        invalidSIRET.html(gt.gettext('SIRET_CONNECTION_ERROR'))

                    } else {
                        if (res.text.toString() === 'error') {
                            console.log('error')
                        }else{
                            let result = JSON.parse(res.text);
                            if (result){
                                setCookie('access_token', result['access_token'], 7)
                                token = getCookie('access_token');
                            }
                        }
                    }
                });
            }

            $('.chosen-select').chosen({
                max_shown_results: 200,
                search_contains: true,
                width: "100%"
            });

            // Focus supplier field to reload info thanks to VATNumber
            // Avoid the need to prefill all the field about supplier into HTML
            let supplier = $('#name')
            supplier.focus();

            checkAll();

            // Remove focus to avoid multiple call to the API
            supplier.delay(500).blur();

            // If there is a VAT rate and a notaxes amount, calcul the total
            $('#calculTotal').click();

            // Check if duplicate, to display a message after validation if duplicate
            checkIsDuplicate();

            $('#status_form').delay(1000).fadeOut('slow'); // will first fade out the loading animation
            $('#preloader_form').delay(500).fadeOut('slow'); // will fade out the white DIV that covers the website.

            retrieve_form_cookies('invoice_info', pdfId)
        })
        .catch((error) => {
            loaded = false;
            console.log(error)
            alert(gt.gettext('ERROR_WHILE_READING_CONFIGURATION_FILE'))
        });

    }
    // Reload image width if user zoom in the page
    $(window).resize(function(){
        windowsWidth = $('#my-image').width();
    });
});

function generateTokenInsee(consumer_key, consumer_secret){
    return fetch('/ws/insee/getToken', {
        method : 'POST',
        headers : {
            'Content-Type': 'application/json'
        },
        body : JSON.stringify({
            url : config.GENERAL['siret-url-token'],
            credentials : btoa(consumer_key + ':' + consumer_secret)
        })
    })
        .then(response => response.json())
        .then(function(response) {
            return response;
    })
}

/******** ZOOM FEATURES ********/

// Verify the CTRL CLICK EVENT
function isKeyPressed(event) {
    if (event.ctrlKey && zoom === false) {
        toggleZoom();
        zoom = true;
        $('.nb_pages').slideUp();
    }else{
        removeZoom();
        zoom = false;
        $('.nb_pages').slideDown();
    }
}

// Delete zoom on click
function removeZoom(){
    $('.img').trigger('zoom.destroy');
}

// Zoom on image while using CTRL+left click or destroy zoom if already zoomed
function toggleZoom(){
    if (zoom){
      removeZoom();
    }
    else{
        removeRectangle();
        $('.img').zoom({
            on : 'toggle',
            magnify : 0.7,
        });
    }
}

/******** FUNCTIONS TO MANIPULATE IMAGES ********/

// Replace src of image to display the next page as image (replace -0 at the end of the filename with the page number)
function nextPage(){
    let nbPage = parseInt(currentPage.text());
    if (nbPage < maxPages){
        let newCurrentPage = nbPage + 1;
        changeImage(newCurrentPage);
    }else{
        changeImage(1);
    }
    removeRectangle();
}

function previousPage(){
    let nbPage = parseInt(currentPage.text());
    if (nbPage > 1){
        let newCurrentPage = nbPage - 1;
        changeImage(newCurrentPage);
    }else{
        changeImage(maxPages)
    }
    removeRectangle();
}

function changeImage(pageToShow){
    if (pageToShow){
        let image = $('#my-image');
        let currentSrc = image.attr('src');
        let filename = currentSrc.replace(/^.*[\\\/]/, '');
        let fileNameArray = filename.split('.');
        let onlySrc = currentSrc.substr(0, currentSrc.length - filename.length);

        let newFileName = onlySrc + fileNameArray[0].substr(0, fileNameArray[0].length - 1) + (pageToShow).toString() + '.' + fileNameArray[1];

        image.attr('src', newFileName);
        currentPage.text(pageToShow);
        removeZoom();
    }
}

/******** FUNCTIONS TO ADD OR REMOVE INPUT AND RECTANGLES ********/

function addVAT(input){
    let lastVAT = $('#' + input.id).prev()[0];
    let cptVAT = parseInt(lastVAT.className.split('_')[2]);
    let newClassName = 'vat_' + (cptVAT + 1);
    let lastVATAmount = $('.AMOUNT_vat_' + cptVAT);
    let optionsFinancial = document.getElementById('financial_account_1').innerHTML;

    if(cptVAT < 5){
        $(
        '   <div class="form-row MAIN_' + newClassName + '" style="display: none">' +
        '       <div class="form-group col-md-4">' +
        '           <label for="' + newClassName + '">' + gt.gettext('VAT_RATE') + ' ' + (cptVAT + 1) + ' <a href="#removeVAT" class="vat_' + (cptVAT + 1) + '" onclick="removeVAT(this)"><i class="fa fa-minus-square" aria-hidden="true"></i></a></label>' +
        '           <div class="input-group mb-2">' +
        '               <div onclick="drawRectangle(document.getElementById(\'' + newClassName + '\'))" class="input-group-prepend" style="display:none;">' +
        '                    <div class="input-group-text"><i class="fas fa-eye" aria-hidden="true"></i></div>' +
        '                </div>' +
        '                <input autocomplete="off" required name="facturationInfo_VAT_' + (cptVAT + 1) + '" id="vat_' + (cptVAT + 1) + '" onfocusout="ocrOnFly(true, this, false, true); removeRectangle()" onfocusin="ocrOnFly(false, this, false, true)" type="text" class="form-control" x1="" y1="" x2="" y2="">' +
        '           </div>' +
        '       </div>' +
        '       <div class="form-group col-md-4">' +
        '           <label for="no_taxes_' + (cptVAT + 1) + '">' + gt.gettext('NO_RATE_AMOUNT') + ' ' + (cptVAT + 1) + '</label>' +
        '           <div class="input-group mb-2">' +
        '               <div onclick="drawRectangle(document.getElementById(\'no_taxes_' + (cptVAT + 1) +'\'))" class="input-group-prepend" style="display:none;">' +
        '                   <div class="input-group-text"><i class="fas fa-eye" aria-hidden="true"></i></div>' +
        '               </div>' +
        '               <input autocomplete="off" required name="facturationInfo_no_taxes_' + (cptVAT + 1) +'" onfocusout="ocrOnFly(true, this, false, true); removeRectangle()" onfocusin="ocrOnFly(false, this, false, true)" type="text" step="0.01" class="form-control" id="no_taxes_' + (cptVAT + 1) + '" x1="" y1="" x2="" y2="" value="">' +
        '           </div>' +
        '       </div>' +
        '       <div class="form-group col-md-4">' +
        '           <label for="financialAccount_' + (cptVAT + 1) + '">' + gt.gettext('LOAD_ACCOUNT') + ' ' + (cptVAT + 1) + ' </label>' +
        '           <div class="input-group mb-2">' +
        '               <select name="facturationInfo_financialAccount_' + (cptVAT + 1) + '" id="financialAccount_' + (cptVAT + 1) + '" class="form-control chosen-select" data-placeholder="' + gt.gettext('SELECT_LOAD_ACCOUNT') + '">' +
        '                   <option value=""></option>' +
                            optionsFinancial +
        '               </select>' +
        '           </div>' +
        '       </div>' +
        '   </div>'
        ).insertAfter(lastVAT).slideToggle();

        $('.chosen-select').chosen({
            max_shown_results: 200,
            search_contains: true,
            width: "100%"
        });

        $(
        '   <div class="form-group col-md-3 text-center AMOUNT_vat_' + (cptVAT + 1) + '" style="display: none">' +
        '       <label for="total_vat_' + (cptVAT + 1) + '">' + gt.gettext('VAT_AMOUNT') + ' ' + (cptVAT + 1) + '</label>' +
        '       <div class="input-group mb-2">' +
        '           <input autocomplete="off" name="facturationInfo_TOTAL_TVA_' + (cptVAT + 1) + '" type="text" id="total_vat_' + (cptVAT + 1) + '" class="form-control">' +
        '           <div class="input-group-prepend">' +
        '               <div class="input-group-text"><i class="fas fa-euro-sign" aria-hidden="true"></i></div>' +
        '           </div>' +
        '       </div>' +
        '   </div>'
        ).insertAfter(lastVATAmount).slideToggle();
        $('#number_of_vat').val((cptVAT + 1));
    }
}

function removeVAT(input){
    let VATToRemove = $('.MAIN_' + input.className);
    let VATAmountToRemove = $('.AMOUNT_' + input.className);
    let currentCptVAT = parseInt(VATToRemove[0].className.split('_')[2]);

    // Avoid deletion of VAT rate if there is just one
    // And avoid deletion of the first, before the second (for example)
    if($('.MAIN_TVA_' + (currentCptVAT + 1)).length === 0 && currentCptVAT > 1){
        VATToRemove.slideToggle(400, 'swing', function(){
            VATToRemove.remove();
        });
        VATAmountToRemove.slideToggle(400, 'swing', function(){
            VATAmountToRemove.remove();
            calculTotal();
        });
    }

    $('#number_of_vat').val((currentCptVAT - 1));
}

function removeDeliveryNumber(input){
    let DeliveryNumberToRemove = $('.main_' + input.className);
    let currentCptDeliveryNumber = parseInt(DeliveryNumberToRemove[0].className.split('_')[2]);

    // Avoid deletion of delivery Number if there is just one
    // And avoid deletion of the first, before the second (for example)
    if($('.main_delivery_' + (currentCptDeliveryNumber + 1)).length === 0 && currentCptDeliveryNumber > 1){
        DeliveryNumberToRemove.slideToggle(400, 'swing', function(){
            DeliveryNumberToRemove.remove();
        });
        $('#number_of_delivery_number').val((currentCptDeliveryNumber - 1));
    }
}

function removeOrderNumber(input){
    let orderNumberToRemove = $('.main_' + input.className);
    let currentCptOrderNumber = parseInt(orderNumberToRemove[0].className.split('_')[2]);
    // Avoid deletion of delivery Number if there is just one
    // And avoid deletion of the first, before the second (for example)
    if($('.main_delivery_' + (currentCptOrderNumber + 1)).length === 0 && currentCptOrderNumber > 1){
        orderNumberToRemove.slideToggle(400, 'swing', function(){
            orderNumberToRemove.remove();
        });
        $('#number_order_number').val((currentCptOrderNumber - 1));
    }
}

function addStructure(input){
    let lastStructure = $('#' + input.id).prev()[0];
    let cptStructure = parseInt(lastStructure.className.split('_')[1]);
    let optionsStructure = document.getElementById('structure_selection_1').innerHTML;
    let optionsBudget = document.getElementById('budget_selection_1').innerHTML;

    if(cptStructure < 41){
        $(
            '<div class="structure_' + (cptStructure + 1) + ' form-row" style="display: none">' +
            '    <div class="form-group col-md-4">' +
            '        <label for="analytics_HT_' + (cptStructure + 1) + '">' + gt.gettext('NO_RATE_AMOUNT') + ' ' + (cptStructure + 1) + ' <a href="#removeStructure" class="structure_' + (cptStructure + 1) + '" onclick="removeStructure(this)"><i class="fa fa-minus-square" aria-hidden="true"></i></a></label>' +
            '        <div class="input-group mb-2">' +
            '            <input autocomplete="off" onkeyup="verifyTotalAnalytics()" required name="analyticsInfo_HT_' + (cptStructure + 1) + '" type="number" step="0.01" class="form-control" id="analytics_HT_' + (cptStructure + 1) + '" x1="" y1="" x2="" y2="" x1_original="" y1_original="" x2_original="" y2_original="" value="">' +
            '            </div>' +
            '    </div>' +
            '    <div class="form-group col-md-4">' +
            '        <label for="structure_selection_' + (cptStructure + 1) + '">' + gt.gettext('BUDGET') + '</label>' +
            '        <div class="input-group mb-2">' +
            '            <select name="structure_selection_' + (cptStructure + 1) + '" id="structure_selection_' + (cptStructure + 1) + '" class="form-control chosen-select" data-placeholder="' + gt.gettext('SELECT_STRUCTURE') + '">' +
                             optionsStructure +
            '            </select>' +
            '        </div>' +
            '    </div>' +
            '    <div class="form-group col-md-4">' +
            '        <label for="budget_selection_1">' + gt.gettext('OUTCOME') + '</label>' +
            '        <div class="input-group mb-2">' +
            '            <select name="budget_selection_' + (cptStructure + 1) + '" id="budget_selection_' + (cptStructure + 1) + '" class="form-control chosen-select" data-placeholder="' + gt.gettext('SELECT_BUDGET') + '">' +
                             optionsBudget +
            '            </select>' +
            '        </div>' +
            '    </div>' +
            '</div>'
        ).insertAfter(lastStructure).slideToggle();

        $('.chosen-select').chosen({
            max_shown_results: 200,
            search_contains: true,
            width: "100%"
        });
    }
}

function removeStructure(input){
    let structureToRemove = $('.' + input.className);

    structureToRemove.slideToggle(400, 'swing', function(){
        structureToRemove.remove();
    });
}

function addOrderNumber(input){
    let lastOrder = $('#' + input.id).prev()[0];
    let cptOrder = parseInt(lastOrder.className.split('_')[2]);

    $(
        '<div class="main_order_' + (cptOrder + 1) + '" style="display: none">' +
        '        <div class="form-group">' +
        '            <label for="order_number_' + (cptOrder + 1) + '">' + gt.gettext('ORDER_NUMBER') + ' ' + (cptOrder + 1) + ' <a href="#removeorder" class="order_' + (cptOrder + 1) + '" onclick="removeOrderNumber(this)"><i class="fa fa-minus-square" aria-hidden="true"></i></a> </label>' +
        '            <div class="input-group mb-2">' +
        '                <div onclick="drawRectangle(document.getElementById(\'order_number_' + (cptOrder + 1) + '\'))" class="input-group-prepend" style="display:none;">' +
        '                    <div class="input-group-text"><i class="fas fa-eye" aria-hidden="true"></i></div>' +
        '                </div>' +
        '                <input autocomplete="off" required name="facturationInfo_order_number_' + (cptOrder + 1) + '" id="order_number_' + (cptOrder + 1) + '" type="text" class="form-control" onfocusout="ocrOnFly(true, this, true); removeRectangle()" onfocusin="ocrOnFly(false, this, true)">\n' +
        '            </div>' +
        '        </div>' +
        '    </div>'
    ).insertAfter(lastOrder).slideToggle();

    $('#number_order_number').val(cptOrder + 1);
}

function removeUserInCharge(radioButton){
    let gedUser = $('.gedUser');
    let gedUserId = $('#ged_users');
    if (radioButton.prop("checked")) {
        gedUser.slideUp();
        gedUserId.prop('required', false);
    }else{
        gedUser.slideDown();
        gedUserId.prop('required', true);
    }
}

function addDeliveryNumber(input){
    let lastDelivery = $('#' + input.id).prev()[0];
    let cptDelivery = parseInt(lastDelivery.className.split('_')[2]);

    $(
        '<div class="main_delivery_' + (cptDelivery + 1) + '" style="display: none">' +
        '        <div class="form-group">' +
        '            <label for="delivery_number_' + (cptDelivery + 1) + '">' + gt.gettext('DELIVERY_FORM_NUMBER') + ' ' + (cptDelivery + 1) + ' <a href="#removedelivery" class="delivery_' + (cptDelivery + 1) + '" onclick="removeDeliveryNumber(this)"><i class="fa fa-minus-square" aria-hidden="true"></i></a></label>' +
        '            <div class="input-group mb-2">' +
        '                <div onclick="drawRectangle(document.getElementById(\'delivery_number_' + (cptDelivery + 1) + '\'))" class="input-group-prepend" style="display:none;">' +
        '                    <div class="input-group-text"><i class="fas fa-eye" aria-hidden="true"></i></div>' +
        '                </div>' +
        '                <input autocomplete="off" required name="facturationInfo_delivery_number_' + (cptDelivery + 1) + '" id="delivery_number_' + (cptDelivery + 1) + '" type="text" class="form-control" onfocusout="ocrOnFly(true, this, true); removeRectangle()" onfocusin="ocrOnFly(false, this, true)">\n' +
        '            </div>' +
        '        </div>' +
        '    </div>'
    ).insertAfter(lastDelivery).slideToggle();

    $('#number_of_delivery_number').val(cptDelivery + 1);
}

// Draw rectangle on image using the x1,y1 & x2,y2 tuple
function drawRectangle(input){
    let inputInfo = $('#' + input.id);
    let rectangle = $('#rectangle');

    removeZoom();
    if(inputInfo.attr('x1') !== '' && inputInfo.attr('y1') !== '' && inputInfo.attr('x2') !== '' && inputInfo.attr('y2') !== ''
    || inputInfo.attr('x1_original') !== '' && inputInfo.attr('y1_original') !== '' && inputInfo.attr('x2_original') !== '' && inputInfo.attr('y2_original') !== ''){
        let zoomImg = $('.zoomImg');
        let myImage = $('#my-image');
        if(maxPages > 1)
            if (inputInfo.attr('page') !== 1 && inputInfo.attr('page') !== 'None')
                changeImage(inputInfo.attr('page'));

        if(zoomImg.length === 0 || zoomImg.css('opacity') === '0') {
            let ratio = originalWidth / myImage.width()

            let _x1 = inputInfo.attr('x1_original') !== '' ? inputInfo.attr('x1_original') / ratio : inputInfo.attr('x1') / ratio;
            let _y1 = inputInfo.attr('y1_original') !== '' ? inputInfo.attr('y1_original') / ratio : inputInfo.attr('y1') / ratio;
            let _x2 = inputInfo.attr('x2_original') !== '' ? inputInfo.attr('x2_original') / ratio : inputInfo.attr('x2') / ratio;
            let _y2 = inputInfo.attr('y2_original') !== '' ? inputInfo.attr('y2_original') / ratio : inputInfo.attr('y2') / ratio;

            rectangle.css({
                'left': ((_x1 - 5) / myImage.width()) * 100 + '%',
                'top': ((_y1 - 5) / myImage.height()) * 100 + '%',
                'height': (((_y2 + 5) / myImage.height()) - ((_y1 - 5) / myImage.height())) * 100 + '%',
                'width': (((_x2 + 5) / myImage.width() * 100) - ((_x1 - 5) / myImage.width() * 100)) + '%'
            });

            rectangle.removeClass('rectangle-not-active');
            rectangle.addClass('rectangle-active');
        }
    }
}

// Remove rectangle
function removeRectangle(){
    let rectangle = $('#rectangle');
    rectangle.removeClass('rectangle-active');
    rectangle.addClass('rectangle-not-active');
}

function hideOrDisplay(input){
    $('form').find('.toggled').each(function (){
        let idName = $(this)[0].className.split(/\s+/)[0];
        if($(this).is(':hidden') && idName === input){
            $('#' + idName).html('<i class="fas fa-chevron-down" aria-hidden="true"></i>');
            $('.' + idName).slideToggle();
        }else{
            $('#' + idName).html(' <i class="fas fa-chevron-right" aria-hidden="true"></i>');
            $('.' + idName).slideUp();
        }
    });
}

/******** CHECK FUNCTION ********/

function checkAll(){
    // Loop through input
    $('#invoice_info *').filter(':input').not(':button').not('.chosen-search-input').each(function(){
        let input = $('#' + this.id);
        // Execute the function to check the value of the input using external API
        // Do this triggering the function on the "onkeyup" attributes of the input
        if(input.val() !== '') {
            let attr = input.attr('onkeyup');
            if (attr !== null){
                document.getElementById(this.id).dispatchEvent(new KeyboardEvent('keyup'));
            }

            // Show the eyes, on click on it, it will show the rectangle on the image
            // .prev() allow us to display the input-group-text class, containing the eye
            if(input.attr('x1') !== '' && input.attr('y1') !== '' && input.attr('x2') !== '' && input.attr('y2') !== '' &&
            input.attr('x1') !== undefined && input.attr('y1') !== undefined && input.attr('x2') !== undefined && input.attr('y2') !== undefined ||
            input.attr('x1_original') !== '' && input.attr('y1_original') !== '' && input.attr('x2_original') !== '' && input.attr('y2_original') !== '' &&
            input.attr('x1_original') !== undefined && input.attr('y1_original') !== undefined && input.attr('x2_original') !== undefined && input.attr('y2_original') !== undefined){
                input.prev().fadeIn();
            }
        }
    });

    // Launch the check adress
    if($('#address').val() !== '' && $('#postal_code').val() !== '' && $('#supplier_city').val() !== ''){
        checkAdress();
    }
}

// Check SIRET and display informations about the veracity (green or red input background)
function checkSIRET(){
    let sizeSIRET = 14;
    let apiUrl = config.GENERAL['siret-url'];
    let siretId = $('#siret_number');
    let sirenId = $('#siren_number');

    if(!isSIRETRunning && siretId[0].value !== ''){
        let invalidSIRET = $('.siret_number_invalid')
        if(verify(siretId[0].value, sizeSIRET)) {
            isSIRETRunning = true;
            $.ajax({
                url: apiUrl + siretId[0].value,
                headers: {"Authorization": "Bearer " + token}
            })
            .done(function (data) {
                $('#errors').text('');
                sirenId.addClass('is-valid');
                siretId.addClass('is-valid');
                sirenId.removeClass('is-invalid');
                siretId.removeClass('is-invalid');
                sirenId.val(data['etablissement']['siren']);

                isSIRETRunning = false;
            })
            .fail(function (data){
                siretId.addClass('is-invalid');
                siretId.removeClass('is-valid');

                invalidSIRET.html(gt.gettext('ERROR_OCCURED') + ' : (' + data['status'].toString() + ') ' + data['statusText'])

            })
        }else{
            siretId.addClass('is-invalid');
            sirenId.addClass('is-invalid');
            siretId.removeClass('is-valid');
            sirenId.removeClass('is-valid');
            siretId[0].setAttribute('x1', '');
            siretId[0].setAttribute('y1', '');
            siretId[0].setAttribute('x2', '');
            siretId[0].setAttribute('y2', '');

            invalidSIRET.html(gt.gettext('ERROR_OCCURED') + ' : ' + gt.gettext('WRONG_SIRET_FORMAT'))

            isSIRETRunning = false;
        }
    }else if(siretId[0].value === ''){
        siretId.removeClass('is-invalid');
        siretId.removeClass('is-valid');
    }
}

// Check SIREN and display informations about the veracity (green or red input background)
function checkSIREN(){
    let sizeSIREN = 9;
    let apiUrl = config.GENERAL['siren-url'];
    let sirenId = $('#siren_number');
    let invalidSIREN = $('.siren_number_invalid')

    if(!isSIRENRunning && sirenId[0].value !== '') {
        if (verify(sirenId[0].value, sizeSIREN)) {
            isSIRENRunning = true;
            $.ajax({
                url: apiUrl + sirenId[0].value,
                headers: {"Authorization": "Bearer " + token}
            })
                .done(function () {
                    $('#errors').text('');
                    sirenId.addClass('is-valid');
                    sirenId.removeClass('is-invalid');

                    isSIRENRunning = false;
                })
                .fail(function (data) {
                    sirenId.addClass('is-invalid');
                    sirenId.removeClass('is-valid');
                    invalidSIREN.html(gt.gettext('ERROR_OCCURED') + ' : (' + data['status'].toString() + ') ' + data['statusText'])
                })
        } else {
            sirenId.addClass('is-invalid');
            sirenId.removeClass('is-valid');
            invalidSIREN.html(gt.gettext('ERROR_OCCURED') + ' : ' + gt.gettext('WRONG_SIREN_FORMAT'))
            isSIRENRunning = false;
        }
    } else if (sirenId[0].value === '') {
        sirenId.removeClass('is-invalid');
        sirenId.removeClass('is-valid');
    }
}

function checkVAT(){
    let sizeVAT = 13;
    let VATId = $('#vat_number');

    if(!isVATRunning){
        if(verify(VATId[0].value, sizeVAT, true)) {
            isVATRunning = true;
            fetch('/ws/VAT/' + VATId[0].value, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            }).then(function(response) {
                response.json().then(function(res){
                    if (!JSON.parse(res.ok)) {
                        VATId.addClass('is-invalid');
                        VATId.removeClass('is-valid');
                        if ($('.invalidVAT').length === 0) {
                            $('<div class="invalid-feedback invalidVAT">' +
                                gt.gettext('ERROR_OCCURED') + ' : ' + res.text +
                                '</div>'
                            ).insertAfter(VATId);
                        }
                    }else{
                        VATId.addClass('is-valid');
                        VATId.removeClass('is-invalid');
                    }
                });
                isVATRunning = false
            })
        }else{
            VATId.addClass('is-invalid');
            VATId.removeClass('is-valid');
        }
    }
}

function checkAdress(){
    let apiUrl = config.GENERAL['ban-url'];
    let city = $('#city');
    let cityRatio = $('#cityRatio');
    let adress = $('#address');
    let adressRatio = $('#addressRatio');
    let postalCode = $('#postal_code');
    let postalRatio = $('#postal_codeRatio');
    let value = '';

    if(!isAdressRunning){
        isAdressRunning = true;
        value = adress[0].value + ' ' + postalCode[0].value + ' ' + city[0].value;
        $.get({
            url: apiUrl + value + '&limit=1'
        })
        .done(function (data) {
            if(data['features'][0] !== undefined){
                let infos = data['features'][0]['properties'];
                let ratioCity = calculateSCore(city[0].value, infos['city']);
                let ratioAdr = calculateSCore(adress[0].value, infos['name']);
                let ratioPostal = calculateSCore(postalCode[0].value, infos['postcode']);
                let ratioTotal = $('#ratioAdressTotal');

                cityRatio.addClass('input-group-text').html(ratioCity + '%');
                adressRatio.addClass('input-group-text').html(ratioAdr + '%');
                postalRatio.addClass('input-group-text').html(ratioPostal + '%');

                ratioTotal.val((ratioCity/100 + ratioAdr/100 + ratioPostal/100) / 3);

                processRatio(ratioCity, city, cityRatio, infos['city'], 'city_invalid');
                processRatio(ratioAdr, adress, adressRatio, infos['name'],'address_invalid');
                processRatio(ratioPostal, postalCode, postalRatio, infos['postcode'], 'postal_code_invalid');
            }
        })
        .fail(function(){
            banApiError = true;
            $('.address').html(gt.gettext('BAN_API_ERROR')).slideDown();
        });
        isAdressRunning = false;
    }
}

/******** VALIDATE or REFUSE FORM ********/

$('#refuseForm').on('click', function(){
    let modalBody = $('.modal-body');
    let modalBack = $('.modal-backdrop');

    let refuse_yes = $('#refuse_yes')
    let awaitAdress = $('#awaitAdress')
    let bypassBan = $('#bypassBan')
    bypassBan.remove()
    awaitAdress.remove()
    refuse_yes.remove()

    modalBack.toggle();
    modalBody.html('<span id="modalError">' +
            gt.gettext('REFUSE_CONFIRMATION') +
        '</span>');

    $('<button type="button" class="btn btn-danger" id="refuse_yes" onclick=\'changeStatus(pdfId, "ERR", false);\'>' +
                gt.gettext('YES') +
    '</button>').insertAfter($('#returnToValidate'));

    $('#validateModal').modal({
        backdrop: false,
        keyboard: false
    });
});

// Validate form before send it
$('#validateForm').on('click', function(){
    let form = $('#invoice_info');
    let ratioTotal = $('#ratioAdressTotal');
    let modalBack = $('.modal-backdrop');
    let modalBody = $('.modal-body');

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    var forms = document.getElementById('invoice_info');
    // Loop over them and prevent submission
    var validation = Array.prototype.filter.call(forms, function (form) {
        if (form.checkValidity() === false) {
            form.classList.add('is-invalid');
        }
    });

    // Verify the total analytics amount and the total HT amount
    let parsedStructure = $('#addStructure').prev()[0].className.split('_');
    let lastCPTStructure = parseInt(parsedStructure[1]);
    let className = parsedStructure[0];
    let totalStructure = 0;
    let total_ht = parseFloat($('#total_ht').val());

    let awaitAdress = $('#awaitAdress')
    let bypassBan = $('#bypassBan')
    let refuse_yes = $('#refuse_yes')
    awaitAdress.remove()
    bypassBan.remove()
    refuse_yes.remove()

    for (let i = 1; i <= lastCPTStructure; i++){
        let val = $('.' + className + '_' + i).find('input').val();
        totalStructure += parseFloat(val)
    }
    if(!form[0].checkValidity()){
        form.find(':submit').click();
        modalBody.html(
                '<span id="modalError">' +
                    gt.gettext('FORM_ERROR_OR_EMPTY_FIELD') +
                '</span>');
    }else if(form[0].checkValidity() && (ratioTotal.val() <= (config.CONTACT['total-ratio'] / 100) && banApiError === false)){ // the banApiError is used to do not block form in case the API isn't working
        modalBody.html('<span id="waitForAdress">' +
            gt.gettext('INCORRECT_BAN_ADDRESS') + ' ' +
            gt.gettext('PUT_FORM_TO_SUPPLIER_WAIT') +
            '</span>');

        $('<button type="button" class="btn btn-warning" onclick=\'changeStatus(pdfId, "WAIT_SUP", false); save_form_to_cookies("invoice_info", pdfId)\' id="awaitAdress">' +
                gt.gettext('PUT_ON_HOLD') +
        '</button>').insertAfter($('#returnToValidate'));

        if (config.GLOBAL['allowbypasssuppliebanverif'] === 'True') {
            $('<button type="button" class="btn btn-danger" onclick=\'changeStatus(pdfId, "END");\' id="bypassBan">' +
                    gt.gettext('_VALID_WIHTOUT_BAN_VERIFICATION') +
            '</button>').insertAfter($('#awaitAdress'));
        }

    }else if(form[0].checkValidity() && $('#vat_number').hasClass('is-invalid')){
        modalBody.html(
            '<span id="tvaError">' +
                '<br>' + gt.gettext('INVALID_VAT_NUMBER') +
            '</span>'
        );
        if ($('#bypassVat').length === 0 ) {
            $('<button type="button" class="btn btn-danger" onclick=\'changeStatus(pdfId, "END");\' id="bypassVat">' +
                    gt.gettext('_VALID_WIHTOUT_VAT_VERIFICATION') +
            '</button>').insertAfter($('#returnToValidate'));
        }

    }else if(form[0].checkValidity() && totalStructure !== total_ht){
        modalBody.html(
            '<span id="analyticsAmountError">' +
                gt.gettext('CALCUL_NOT_EQUAL_WOULD_YOU_VALIDATE') +
            '</span>'
        );
        if ($('#validateFacAnalyticsError').length === 0) {
            $('<button type="button" class="btn btn-info" onclick=\'changeStatus(pdfId, "END");\' id="validateFacAnalyticsError">' +
                gt.gettext('YES') +
                '</button>').insertAfter($('#returnToValidate'));
        }
    }else if(form[0].checkValidity() && isDuplicate && config.GLOBAL['allowduplicate'] === 'False'){
        modalBody.html(
            '<span id="analyticsAmountError">' +
                gt.gettext('INVOICE_ALREADY_EXIST') +
            '</span>'
        );

        if ($('#validateFacAnalyticsError').length === 0) {
            $('<button type="button" class="btn btn-info" onclick=\'changeStatus(pdfId, "END");\' id="validateFacAnalyticsError">' +
                gt.gettext('YES') +
                '</button>').insertAfter($('#returnToValidate'));
        }
    }else{
        changeStatus(pdfId, "END");
    }

    modalBack.toggle();
    $('#validateModal').modal({
        backdrop: false,
        keyboard: false
    });
});

// Replace commas with point because commas are'nt valid to operation
$(function() {
  $("input:text").keyup(function() {
        $(this).val($(this).val().replace(/[,]/g, "."));
  });
});

$('#returnToValidate, #closeModal').on('click', function(){
    let modalBack = $('.modal-backdrop');
    modalBack.toggle();

    $('#awaitAdress').remove();
    $('#waitForAdress').remove();
});

// Validate form even if there is some problems (The button is in the modal)
$('#submitForm').on('click', function(){
    $('#invoice_info').submit();
});

function changeStatus(idPdf, status, submitForm = true){
    fetch('/ws/database/updateStatus', {
        method : 'POST',
        headers : {
            'Content-Type': 'application/json'
        },
        body : JSON.stringify({
            id : idPdf,
            status : status
        })
    }).then(function(response) {
        response.json().then(function(res){
            if (!JSON.parse(res.ok)) {
                return false;
            }else {
                if (submitForm)
                    $("#invoice_info").submit();
                else {
                    window.history.back();
                    window.location.reload();
                }
                return true;
            }
        });
    });
}

/******** VALIDATION FUNCTIONS ********/

function calculTotal(){
    let lastVAT = $('#addVAT').prev();
    let lastVATCpt = parseInt(lastVAT[0].className.split('_')[2]);
    let structureHT = $('#ht_1');
    let analyticsHTInfo = $('#total_ht_info span');
    let ttc = 0;
    let ht = 0;

    for (let i = 1; i <= lastVATCpt; i++){
        let currentVat = $('#vat_' + i)[0]

        if (currentVat){
            let vatRate = currentVat.value / 100;

            let noTaxe  = $('#no_taxes_' + i)[0].value;

            // Check if it's a real number (because a float with point instead of comma, it's not recognized as a float)
            if (noTaxe !== '' && vatRate !== ''){
                ht += parseFloat(noTaxe);
                ttc += parseFloat(noTaxe) + (parseFloat(noTaxe) * parseFloat(vatRate));
                let vatAmount = parseFloat(noTaxe) * parseFloat(vatRate);
                $('#total_vat_' + i).val(vatAmount.toFixed(2));
                $('#total_ttc').val(ttc.toFixed(2));
                $('#total_ht').val(ht.toFixed(2));
                structureHT.val(ht.toFixed(2));
                analyticsHTInfo.html(ht.toFixed(2));
            }
        }
    }
}

function isInt(n){
    return Number(n) === n && n % 1 === 0;
}

function isFloat(n){
    return Number(n) === n && n % 1 !== 0;
}

// Function used to verify SIRET or SIREN using the Luhn algorithm
function verify(number, size, isVAT = false){
    if (isVAT){
        return number.length === size;
    }

    if (isNaN(number) || number.length !== size) return false;
    let bal     = 0;
    let total   = 0;
    for (let i = size - 1; i >= 0; i--){
        let step = (number.charCodeAt(i) - 48) * (bal + 1);
        total += (step > 9) ? step - 9:step;
        bal = 1 - bal;
    }
    return total % 10 === 0;
}

function calculateSCore(s1, s2){
    return parseInt(((new difflib.SequenceMatcher(null, s1.toUpperCase(), s2.toUpperCase())).ratio() * 100).toString());
}

function processRatio(percent, input, ratioClass, banInfo, invalidClass){
    let invalidFeed = $('.' + invalidClass);

    invalidFeed.removeClass('redRatio red_' + input[0].id);
    invalidFeed.removeClass('orangeRatio orange_' + input[0].id);
    invalidFeed.html('');

    input.removeClass('is-valid is-invalid orangeRatioInput redRatioInput');

    if (percent >= config.CONTACT['green-ratio']){
        input.addClass('is-valid');
    }else if(percent <= config.CONTACT['green-ratio'] && percent >= config.CONTACT['orange-ratio']){
        input.addClass('is-invalid orangeRatioInput ');
        invalidFeed.addClass('orangeRatio orange_' + input[0].id);
        invalidFeed.html(gt.gettext('FIELD_TO_CHECK') + ' <br>' +
            gt.gettext('BAN_VALUE') + ' : <span class="font-weight-bold"><a style="color:#ED8022; text-decoration: underline" href="#correct" onclick="replaceValue(' + input[0].id + ', \'' + banInfo + '\')">' + banInfo + '</a></span>');
    }else{
        input.addClass('is-invalid redRatioInput');
        invalidFeed.addClass('red_' + input[0].id);
        invalidFeed.html(gt.gettext('INVALID') + ' <br>' +
            gt.gettext('BAN_VALUE') + ' : <span class="font-weight-bold"><a style="color:#ED8022; text-decoration: underline" href="#correct" onclick="replaceValue(' + input[0].id + ', \'' + banInfo + '\')">' + banInfo + '</a></span>');
    }
}

function replaceValue(id, new_value){
    id.value = new_value
    checkAdress()
}

function verifyTotalAnalytics() {
    // Verify the total analytics amount and the total HT amount
    let parsedStructure = $('#addStructure').prev()[0].className.split('_');
    let lastCPTStructure = parseInt(parsedStructure[1]);
    let analyticsHTInfo = $('#total_ht_info span');
    let className = parsedStructure[0];
    let totalStructure = 0;
    let total_ht = parseFloat($('#total_ht').val());

    for (let i = 1; i <= lastCPTStructure; i++){
        let val = $('.' + className + '_' + i).find('input').val();
        totalStructure += parseFloat(val);
    }

    if (totalStructure > total_ht){
        analyticsHTInfo.removeClass('text-success');
        analyticsHTInfo.addClass('text-danger font-weight-bold');
    }else{
        analyticsHTInfo.removeClass('text-danger font-weight-bold');
        analyticsHTInfo.addClass('text-success');
    }
}

function checkIsDuplicate(){
    fetch('/ws/invoice/isDuplicate', {
        method : 'POST',
        headers : {
            'Content-Type': 'application/json'
        },
        body : JSON.stringify({
            'invoice_number' : $('#invoice_number').val(),
            'vat_number' : $('#vat_number').val(),
            'id' : $('#pdf_id').val()
        })
    }).then(function(response) {
        response.json().then(function(res){
            if (!JSON.parse(res.ok)) {
                alert(response.statusText);
            }else{
                if(JSON.parse(res.text)){
                    isDuplicate = true;
                    return true
                }
                isDuplicate = false;
                return false
            }
        });
    });
}
