module.exports = (isProd) => ({
    important: true,
    prefix: '',
    purge: {
        enabled: isProd,
        content: [
            '**/*.{html,ts}',
        ]
    },
    darkMode: false, // or 'media' or 'class'
    theme: {
        backgroundSize: {
            'auto': 'auto',
            'cover': 'cover',
            'contain': 'contain',
            '60': '60%',
            '70': '70%',
            '100': '100%',
        },
        extend: {
            backgroundImage: theme => ({
                'verifier': "url('../assets/imgs/Open-Capture_Verifier.svg')",
                'splitter': "url('../assets/imgs/Open-Capture_Splitter.svg')",
            }),
            width:{
                '30': '30%'
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
        },
    },
    variants: {
        extend: {
            backgroundColor: ['hover'],
            ringOffsetColor: ['hover'],
            ringOffsetWidth: ['hover'],
            ringOpacity: ['hover'],
            ringColor: ['hover'],
            ringWidth: ['hover']
        }
    },
    plugins: [],
});
