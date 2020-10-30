from wtforms import Form, BooleanField, StringField, PasswordField, validators
from flask_babel import lazy_gettext
from .override_wtform import CustomStringField


# Construction of new input
# Unique_row is needed if you have one input on the line (aka col-md-12)
# table is the name of table where the field is located
# table_field is the name of the column using to retrieve data


# Supplier's input
class SupplierForm(Form):
    # the xml_index is mandatorywhen you create a new input class
    xml_index = 'supplierInfo'

    name = CustomStringField(
        lazy_gettext('NAME'),
        [validators.required()],
        unique_row=True,
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
        unique_row=True,
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
        unique_row=True,
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
