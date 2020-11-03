from wtforms import Form, validators
from flask_babel import lazy_gettext

from .override_wtform import CustomStringField, CustomBooleanField, CustomSelectField


# Construction of new input
#
# new_row : needed if you start a new line with multiple input. The last input need last_row attribute. If it's empty, the input will be displayed alone in the line
# form_group_class : if new_row or end_row is True, you can use a bootstrap class (e.g col-md-4)
# is_position : if true, create an hidden input using XX_original position and page from render_kw
# use_ratio : used for adress inputs. If True, add div to display the ratio of adresse between the given one and the one from the BAN
# table : name of table where the field is located
# table_field : name of the column using to retrieve data
# is_footer : needed for facturationInfo field that uses the footer_page column in database to store the page number
# footer_class : If is_footer is True, you could use footer_class to add specific class to the form-row (needed to VAT input, order_number and delivery_order for example)
# is_date : needed if you want to have a type=date input and not type=text
# choices : if you need a select, put into this arg the name of function to retrieve data. The function need to be input pdf.py file (e.g : get_financial)

# Supplier's input
class SupplierForm(Form):
    # the xml_index is mandatorywhen you create a new input class
    xml_index = 'supplierInfo'

    name = CustomStringField(
        lazy_gettext('NAME'),
        [validators.required()],
        table='suppliers',
        column='name',
        render_kw={
            'autocomplete': 'off',
            'onfocus': "searchSupplier()",
            'onfocusout': "ocrOnFly(true, this); removeRectangle()",
            'onfocusin': "ocrOnFly(false, this)"
        },
    )
    address = CustomStringField(
        lazy_gettext('ADDRESS'),
        [validators.required()],
        table='suppliers',
        column='adress1',
        use_ratio=True,
        render_kw={
            'readonly': True
        }
    )
    postal_code = CustomStringField(
        lazy_gettext('ZIP_CODE'),
        [validators.required()],
        new_row=True,
        table='suppliers',
        column='postal_code',
        form_group_class='col-md-6',
        use_ratio=True,
        render_kw={
            'readonly': True
        }
    )
    city = CustomStringField(
        lazy_gettext('CITY'),
        [validators.required()],
        end_row=True,
        table='suppliers',
        column='city',
        form_group_class='col-md-6',
        use_ratio=True,
        render_kw={
            'readonly': True
        }
    )
    vat_number = CustomStringField(
        lazy_gettext('VAT_NUMBER'),
        [validators.required()],
        table='suppliers',
        column='vat_number',
        is_position=True,
        render_kw={
            'readonly': True,
            'onkeyup': "checkVAT();",
            'x1_original': '',
            'y1_original': '',
            'x2_original': '',
            'y2_original': '',
            'page': ''
        }
    )
    siret_number = CustomStringField(
        lazy_gettext('SIRET_NUMBER'),
        [validators.required()],
        new_row=True,
        table='suppliers',
        column='siret',
        form_group_class='col-md-6',
        is_position=True,
        render_kw={
            'readonly': True,
        }
    )
    siren_number = CustomStringField(
        lazy_gettext('SIREN_NUMBER'),
        [validators.required()],
        end_row=True,
        table='suppliers',
        column='siren',
        form_group_class='col-md-6',
        is_position=True,
        render_kw={
            'readonly': True,
        }
    )


class FacturationForm(Form):
    # The xml_index is mandatory when you create a new input class
    xml_index = 'facturationInfo'

    noCommands = CustomBooleanField(
        lazy_gettext('INVOICE_WITHOUT_ORDER'),
        render_kw={
            'checked': '',
            'onclick': "removeAllOrderNumber($(this), $('.MAIN_ORDER_0'))"
        },
    )
    noDelivery = CustomBooleanField(
        lazy_gettext('INVOICE_WITHOUT_DELIVERY_FORM'),
        render_kw={
            'checked': '',
            'onclick': "removeAllDeliveryNumber($(this), $('.MAIN_ORDER_0'))"
        },
    )

    invoice_number = CustomStringField(
        lazy_gettext('INVOICE_NUMBER'),
        [validators.required()],
        new_row=True,
        table='invoices',
        column='invoice_number',
        form_group_class='col-md-6',
        is_position=True,
        render_kw={
            'x1_original': '',
            'y1_original': '',
            'x2_original': '',
            'y2_original': '',
            'page': '',
            'onfocusout': "ocrOnFly(true, this, true); removeRectangle()",
            'onfocusin': "ocrOnFly(false, this, true)"
        }
    )
    invoice_date = CustomStringField(
        lazy_gettext('INVOICE_DATE'),
        [validators.required()],
        end_row=True,
        table='invoices',
        column='invoice_date',
        form_group_class='col-md-6',
        is_position=True,
        is_date=True,
        render_kw={
            'x1_original': '',
            'y1_original': '',
            'x2_original': '',
            'y2_original': '',
            'page': ''
        }
    )

    order_number_1 = CustomStringField(
        lazy_gettext('ORDER_NUMBER'),
        form_group_class="MAIN_order_1",
        hidden=True,
    )

    vat_1 = CustomStringField(
        lazy_gettext('VAT_RATE'),
        [validators.required()],
        new_row=True,
        table='invoices',
        column='vat_1',
        form_group_class='col-md-4',
        is_position=True,
        is_footer=True,
        footer_class="MAIN_vat_1",
        render_kw={
            'x1_original': '',
            'y1_original': '',
            'x2_original': '',
            'y2_original': '',
            'page': ''
        }
    )
    no_taxes_1 = CustomStringField(
        lazy_gettext('NO_RATE_AMOUNT'),
        [validators.required()],
        table='invoices',
        column='no_taxes_1',
        form_group_class='col-md-4',
        is_position=True,
        is_footer=True,
        render_kw={
            'x1_original': '',
            'y1_original': '',
            'x2_original': '',
            'y2_original': '',
            'page': ''
        }
    )
    financial_account_1 = CustomSelectField(
        lazy_gettext('LOAD_ACCOUNT'),
        end_row=True,
        form_group_class='col-md-4',
        is_position=True,
        is_footer=True,
        choices=['get_financial'],
        render_kw={
            'x1_original': '',
            'y1_original': '',
            'x2_original': '',
            'y2_original': '',
            'page': '',
            'data-placeholder': lazy_gettext('SELECT_LOAD_ACCOUNT')
        }
    )
