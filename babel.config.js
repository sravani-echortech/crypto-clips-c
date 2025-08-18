module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      // 'nativewind/babel', // Disabled for now
      [
        'module-resolver',
        {
          root: ['./'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@screens': './src/screens',
            '@navigation': './src/navigation',
            '@services': './src/services',
            '@store': './src/store',
            '@utils': './src/utils',
            '@types': './src/types',
            '@hooks': './src/hooks',
            '@constants': './src/constants',
            '@assets': './assets'
          }
        }
      ]
    ]
  };
};