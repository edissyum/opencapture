function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function setCookie(cname, cvalue, exdays) {
    let d = new Date();
    if (exdays !== 0) {
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        let expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    } else {
        document.cookie = cname + "=" + cvalue;
    }
}

function save_form_to_cookies(form_id, invoice_id) {
    let data = [];
    $("#" + form_id + " input[name*='facturationInfo']").each(function () {
        console.log(this)
        if (this) {
            data.push({
                'name': this.name,
                'id': this.id,
                'value': this.value
            });
        }
    });
    setCookie('invoice_data_' + invoice_id, JSON.stringify(data), 0);
}

function retrieve_form_cookies(form_id, invoice_id){
    let data = getCookie('invoice_data_' + invoice_id);
    if (data){
        data = JSON.parse(data)
        console.log(data)
        $("#" + form_id + " input[name*='facturationInfo']").each(function () {
            if (this) {
                for(let i = 0; i < data.length; i++){
                    if(data[i].id === this.id){
                        this.value = data[i].value
                        let position = $("#" + form_id + " input[name*='" + this.name + "_position']")
                        let page = $("#" + form_id + " input[name*='" + this.name + "_page']")

                        if (!position.length){
                            let element = $('#' + data[i].id)
                            let position_value = get_value(data[i].id + '_position', data);
                            if (position_value){
                                element.parent().append('<input type="hidden" id="' + data[i].id + '_position" name="' + data[i].name + '_position"/>')
                                $('#' + data[i].id + '_position').val(position_value);

                                let real_value = position_value.replaceAll('(', '').replaceAll(')', '').split(',')
                                element.attr('x1', real_value[0])
                                element.attr('y1', real_value[1])
                                element.attr('x2', real_value[2])
                                element.attr('y2', real_value[3])

                                element.prev('div').show()
                            }
                        }

                        if (!page.length){
                            let page_value = get_value(data[i].id + '_page', data)
                            if (page_value){
                                $('#' + data[i].id).parent().append('<input type="hidden" id="' + data[i].id + '_page" name="' + data[i].name + '_page"/>')
                                $('#' + data[i].id + '_page').val(page_value);
                            }
                        }
                    }
                }
            }
        });
        calculTotal();
    }
}

function get_value(id, array){
    for(let i = 0; i < array.length; i++){
        if (array[i].id === id){
            if(array[i].value){
                return array[i].value
            }
        }
    }
}