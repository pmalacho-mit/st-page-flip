const path = require('path');

module.exports = {
    entry: './src/flipflow.ts',
    output: {
        path: path.resolve(__dirname, 'dist/js'),
        filename: 'flipflow.browser.js',
        library: 'St',
    },
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.css/,
                use: [
                    {
                        loader: 'style-loader',
                    },
                    {
                        loader: 'css-loader',
                    },
                ],
            },
            { test: /\.ts$/, use: 'ts-loader' },
        ],
    },
    resolve: {
        extensions: ['.ts'],
    },
    watch: true,
};