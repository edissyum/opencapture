-- Global sequences
SELECT setval('users_id_seq', (SELECT max(id)+1 FROM users), false);
SELECT setval('regex_id_seq', (SELECT max(id)+1 FROM regex), false);
SELECT setval('roles_id_seq', (SELECT max(id)+1 FROM roles), false);
SELECT setval('status_id_seq', (SELECT max(id)+1 FROM status), false);
SELECT setval('history_id_seq', (SELECT max(id)+1 FROM history), false);
SELECT setval('outputs_id_seq', (SELECT max(id)+1 FROM outputs), false);
SELECT setval('ai_models_id_seq', (SELECT max(id)+1 FROM ai_models), false);
SELECT setval('languages_id_seq', (SELECT max(id)+1 FROM languages), false);
SELECT setval('workflows_id_seq', (SELECT max(id)+1 FROM workflows), false);
SELECT setval('privileges_id_seq', (SELECT max(id)+1 FROM privileges), false);
SELECT setval('docservers_id_seq', (SELECT max(id)+1 FROM docservers), false);
SELECT setval('monitoring_id_seq', (SELECT max(id)+1 FROM monitoring), false);
SELECT setval('form_models_id_seq', (SELECT max(id)+1 FROM form_models), false);
SELECT setval('users_forms_id_seq', (SELECT max(id)+1 FROM users_forms), false);
SELECT setval('custom_fields_id_seq', (SELECT max(id)+1 FROM custom_fields), false);
SELECT setval('outputs_types_id_seq', (SELECT max(id)+1 FROM outputs_types), false);
SELECT setval('configurations_id_seq', (SELECT max(id)+1 FROM configurations), false);
SELECT setval('users_customers_id_seq', (SELECT max(id)+1 FROM users_customers), false);
SELECT setval('roles_privileges_id_seq', (SELECT max(id)+1 FROM roles_privileges), false);
SELECT setval('accounts_customer_id_seq', (SELECT max(id)+1 FROM accounts_customer), false);
SELECT setval('form_models_field_id_seq', (SELECT max(id)+1 FROM form_models_field), false);

-- Verifier sequences
SELECT setval('documents_id_seq', (SELECT max(id)+1 FROM documents), false);
SELECT setval('addresses_id_seq', (SELECT max(id)+1 FROM addresses), false);
SELECT setval('accounting_plan_id_seq', (SELECT max(id)+1 FROM accounting_plan), false);
SELECT setval('positions_masks_id_seq', (SELECT max(id)+1 FROM positions_masks), false);
SELECT setval('accounts_supplier_id_seq', (SELECT max(id)+1 FROM accounts_supplier), false);

-- Splitter sequences
SELECT setval('doctypes_id_seq', (SELECT max(id)+1 FROM doctypes), false);
SELECT setval('metadata_id_seq', (SELECT max(id)+1 FROM metadata), false);
SELECT setval('splitter_pages_id_seq', (SELECT max(id)+1 FROM splitter_pages), false);
SELECT setval('splitter_batches_id_seq', (SELECT max(id)+1 FROM splitter_batches), false);
SELECT setval('splitter_documents_id_seq', (SELECT max(id)+1 FROM splitter_documents), false);
