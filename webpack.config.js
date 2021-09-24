const path = require('path');

module.exports = {
    target: 'web',
    entry: {
        index: './src/index.ts'
    },
    output: {
        path: path.resolve(__dirname, './lib'),
        filename: 'index.js',
        libraryTarget: 'umd',
        libraryExport: 'default',
        library: 'Titlebar',
        globalObject: 'this',
    },
    resolve: {
        extensions: ['.js', '.ts', '.tsx']
    },
    module: {
        rules: [
            { test: /\.tsx?$/, loader: "ts-loader" },
            { 
                test: /\.css$/,
                use: [
                    {
                        loader: "style-loader",
                        options: {
                            injectType:"lazyStyleTag"
                        },
                    },
                    "@teamsupercell/typings-for-css-modules-loader",
                    {
                        loader: "css-loader",
                        options: { modules: true }
                    }
                ]
            },
            {
                test: /\.scss$/,
                loader: '@teamsupercell/typings-for-css-modules-loader',
                options: {
                    modules: true,
                    sass: true
                }
            },
        ]
    }
}