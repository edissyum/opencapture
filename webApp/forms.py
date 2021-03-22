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
# is_date_type : needed if you want to have a type=date input and not type=text for CustomStringField
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
        },
    )
    address = CustomStringField(
        lazy_gettext('ADDRESS'),
        [validators.required()],
        new_row=True,
        form_group_class='col-md-6',
        table='suppliers',
        column='adress1',
        use_ratio=True,
        render_kw={
            'onfocusout': "ocrOnFly(true, this); removeRectangle()",
            'onfocusin': "ocrOnFly(false, this)"
        }
    )
    address2 = CustomStringField(
        lazy_gettext('ADDRESS_COMPLEMENT'),
        table='suppliers',
        form_group_class='col-md-6',
        column='adress2',
        use_ratio=False,
        end_row=True,
        render_kw={
            'onfocusout': "ocrOnFly(true, this); removeRectangle()",
            'onfocusin': "ocrOnFly(false, this)"
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
            'onfocusout': "ocrOnFly(true, this); removeRectangle()",
            'onfocusin': "ocrOnFly(false, this, true, true)"
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
            'onfocusout': "ocrOnFly(true, this); removeRectangle()",
            'onfocusin': "ocrOnFly(false, this)"
        }
    )
    vat_number = CustomStringField(
        lazy_gettext('VAT_NUMBER'),
        [validators.required()],
        table='suppliers',
        column='vat_number',
        is_position=True,
        render_kw={
            'onfocusout': "ocrOnFly(true, this, true); removeRectangle()",
            'onfocusin': "ocrOnFly(false, this, true)",
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
        new_row=True,
        table='suppliers',
        column='siret',
        form_group_class='col-md-6',
        is_position=True,
        render_kw={
            'onfocusout': "ocrOnFly(true, this); removeRectangle()",
            'onfocusin': "ocrOnFly(false, this, true, true)"
        }
    )
    siren_number = CustomStringField(
        lazy_gettext('SIREN_NUMBER'),
        end_row=True,
        table='suppliers',
        column='siren',
        form_group_class='col-md-6',
        is_position=True,
        render_kw={
            'onfocusout': "ocrOnFly(true, this); removeRectangle()",
            'onfocusin': "ocrOnFly(false, this, true, true)"
        }
    )


class FacturationForm(Form):
    # The xml_index is mandatory when you create a new input class
    xml_index = 'facturationInfo'

    order_number_1 = CustomStringField(
        lazy_gettext('ORDER_NUMBER'),
        new_row=True,
        form_group_class="main_order_1 col-md-6",
        table='invoices',
        column='order_number_1',
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

    delivery_number_1 = CustomStringField(
        lazy_gettext('DELIVERY_FORM_NUMBER'),
        end_row=True,
        form_group_class="main_delivery_1 col-md-6",
        table='invoices',
        column='delivery_number_1',
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

    invoice_number = CustomStringField(
        lazy_gettext('INVOICE_NUMBER'),
        [validators.required()],
        table='invoices',
        column='invoice_number',
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
        new_row=True,
        table='invoices',
        column='invoice_date',
        form_group_class='col-md-6',
        is_position=True,
        is_date_type=True,
        render_kw={
            'x1_original': '',
            'y1_original': '',
            'x2_original': '',
            'y2_original': '',
            'page': '',
            'placeholder': 'dd/mm/YYYY',
            'onfocusin': "ocrOnFly(false, this, false, false, true)",
            'onfocusout': "ocrOnFly(true, this); removeRectangle()",
        }
    )

    due_date = CustomStringField(
        lazy_gettext('DUE_DATE'),
        end_row=True,
        table='invoices',
        column='invoice_due_date',
        form_group_class='col-md-6',
        is_position=True,
        is_date_type=True,
        render_kw={
            'x1_original': '',
            'y1_original': '',
            'x2_original': '',
            'y2_original': '',
            'page': '',
            'placeholder': 'dd/mm/YYYY',
            'onfocusin': "ocrOnFly(false, this, false, false, true)",
            'onfocusout': "ocrOnFly(true, this); removeRectangle()",
        }
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
            'page': '',
            'onfocusout': "ocrOnFly(true, this, true); removeRectangle()",
            'onfocusin': "ocrOnFly(false, this, true, true)"
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
            'page': '',
            'onfocusout': "ocrOnFly(true, this, true); removeRectangle()",
            'onfocusin': "ocrOnFly(false, this, true, true)"
        }
    )
    financial_account_1 = CustomSelectField(
        lazy_gettext('LOAD_ACCOUNT'),
        end_row=True,
        form_group_class='col-md-4',
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
    total_ht = CustomStringField(
        lazy_gettext('TOTAL_NO_RATE'),
        new_row=True,
        add_calc=True,
        form_group_class='col-md-3 text-center',
        form_row_class='justify-content-md-center'
    )
    total_ttc = CustomStringField(
        lazy_gettext('TOTAL_TTC'),
        form_group_class='col-md-3 text-center',
        form_row_class='justify-content-md-center'
    )
    total_vat_1 = CustomStringField(
        lazy_gettext('VAT_AMOUNT'),
        end_row=True,
        form_group_class='col-md-3 text-center',
        form_row_class='justify-content-md-center'
    )


class AnalyticsForm(Form):
    # The xml_index is mandatory when you create a new input class
    xml_index = 'analyticsInfo'

    ht_1 = CustomStringField(
        lazy_gettext('NO_RATE_AMOUNT'),
        new_row=True,
        form_group_class='col-md-4',
        form_row_class='structure_1',
        render_kw={
            'onkeyup': "verifyTotalAnalytics()"
        }
    )
    structure_selection_1 = CustomSelectField(
        lazy_gettext('BUDGET'),
        form_group_class='col-md-4',
        choices=['get_structure'],
        render_kw={
            'data-placeholder': lazy_gettext('SELECT_STRUCTURE')
        }
    )
    budget_selection_1 = CustomSelectField(
        lazy_gettext('OUTCOME'),
        end_row=True,
        form_group_class='col-md-4',
        choices=['get_outcome'],
        render_kw={
            'data-placeholder': lazy_gettext('SELECT_OUTCOME')
        }
    )
