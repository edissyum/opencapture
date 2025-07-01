UPDATE regex SET content = '(EU|GB|SI|HU|D[EK]|PL|CHE|(F|H)R|B(E|G)0?|A[TU]|C[YZ]|E[ELS]|F[EI]|H[RU]|I[ET]|L[UVT]|M[TL]|NL|PT|RO|S[EKK]|XI)[0-9A-Z]{6,12}' WHERE regex_id = 'vat_number';
