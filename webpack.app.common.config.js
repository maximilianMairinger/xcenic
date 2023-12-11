const InjectPlugin = require("webpack-inject-plugin")
const path = require("path")



module.exports = () => {
    return {
        entry: './app/app.ts',
        output: {
            filename: 'xcenic.js',
            chunkFilename: '[name].js',
            path: path.resolve(path.dirname(''), "public/dist"),
            publicPath: "/dist/"
        },
        resolve: {
            extensions: ['.ts', '.js']
        },
        module: {
            rules: [
                {
                    test: /([a-zA-Z0-9\s_\\.\-\(\):])+\.static\.([a-zA-Z0-9])+$/,
                    use: 'raw-loader',
                },
                {
                    test: /\.tsx?$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'ts-loader',
                        options: {
                            configFile: "tsconfig.app.json"
                        }
                    },
                },
                {
                    test: /\.css$/,
                    use: ['to-string-loader', 'css-loader'],
                },
                {
                    test: /\.(png|jpg|gif|jpeg|woff|woff2|eot|ttf|svg)$/,
                    use: 'url-loader?limit=100000000'
                },
                {
                    test: /\.pug$/,
                    use: ['raw-loader', 'pug-html-loader']
                }
            ]
        }
    }
};
