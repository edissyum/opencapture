/** This file is part of Open-Capture.

 Open-Capture is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 Open-Capture is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with Open-Capture. If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

 @dev : Nathan Cheval <nathan.cheval@outlook.fr> */

module.exports = {
    important: true,
    content: [
        'src/frontend/**/*.{html,ts}'
    ],
    darkMode: 'media', // or 'media' or 'class'
    theme: {
        backgroundSize: {
            'auto': 'auto',
            'cover': 'cover',
            'contain': 'contain',
            '50': '50%',
            '60': '60%',
            '70': '70%',
            '90': '90%',
            '100': '100%'
        },
        extend: {
            gridTemplateColumns: {
                '20': 'repeat(20, minmax(0, 1fr))',
                '21': 'repeat(21, minmax(0, 1fr))',
                '22': 'repeat(22, minmax(0, 1fr))',
                '24': 'repeat(24, minmax(0, 1fr))'
            },
            gridColumnStart: {
                '13': '13',
                '14': '14',
                '15': '15',
                '16': '16',
                '17': '17',
                '18': '18',
                '19': '19',
                '20': '20',
                '21': '21',
                '22': '22',
                '23': '23',
                '24': '24'
            },
            scale: {
                '103': '1.03',
                '105': '1.05'
            },
            backgroundImage: {
                'verifier': "url('../../assets/imgs/Open-Capture_Verifier.svg')",
                'splitter': "url('../../assets/imgs/Open-Capture_Splitter.svg')"
            },
            width: {
                '30': '30%',
                '1/7': '14.3%',
                '1/75': '13.3%'
            },
            height: {
                '100': '25rem',
                '104': '26rem',
                'full-overflow': 'calc(100vh - 8rem)'
            },
            maxWidth: {
                '11/12': '91.6%'
            },
            minWidth: {
                '56': '14rem'
            },
            colors: {
                green: {
                    400: '#97BF3D'
                },
                gray: {
                    900: '#4C4C4E',
                    600: '#A7A8AA'
                }
            }
        }
    },
    plugins: []
};
