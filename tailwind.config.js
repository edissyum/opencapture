module.exports = (isProd) => ({
    prefix: '',
    purge: {
        enabled: isProd,
        content: [
            '**/*.{html,ts}',
        ]
    },
    darkMode: false, // or 'media' or 'class'
    theme: {
        extend: {
            colors: {
                green: {
                    400: '#97bf3d'
                },
                gray: {
                    900: '#4C4C4E',
                    600: '#A7A8AA'
                }
            }
        },
    },
    variants: {
        extend: {},
    },
    plugins: [],
});
