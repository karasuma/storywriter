const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
    pluginOptions: {
        electronBuilder: {
            nodeIntegration: true,
            builderOptions: {
                productName: "Storywriter",
                appId: "com.crowolf.storywriter",
                win: {
                    icon: 'src/assets/icon.ico',
                    target: [
                        {
                            target: 'portable',
                            arch: ['x64', 'ia32']
                        }
                    ]
                },
                mac: {
                    icon: 'src/assets/icon.icns',
                    category: 'public.app-category.utilities',
                    target: 'tar.gz',
                    electronLanguages: ['ja', 'en', 'cn'],
                    strictVerify: false
                }
            }
        }
    }
});