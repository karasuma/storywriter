const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
    configureWebpack: config => {
        config.externals = {
            'better-sqlite3': 'commonjs better-sqlite3',
            sqlite3: 'commonjs sqlite3'
        };
    },
    pluginOptions: {
        electronBuilder: {
            nodeIntegration: true,
            chainWebpackMainProcess: config => {
                config.output.filename(file => {
                    if(file.chunk.name === 'index') {
                        return 'background.js';
                    }
                    return '[name].js';
                });
            },
            externals: ['better-sqlite3'],
            builderOptions: {
                productName: "Storywriter",
                appId: "com.crowolf.storywriter",
                win: {
                    icon: 'src/assets/icon.ico',
                    target: [
                        {
                            target: 'portable',
                            arch: ['x64']
                        },
                        {
                            target: 'portable',
                            arch: ['ia32']
                        }
                    ]
                }
            }
        }
    }
});