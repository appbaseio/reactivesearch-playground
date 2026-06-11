const webpack = require('webpack');

const FIREBASE_ENV_KEYS = [
  'REACT_APP_FIREBASE_API_KEY',
  'REACT_APP_FIREBASE_AUTH_DOMAIN',
  'REACT_APP_FIREBASE_PROJECT_ID',
  'REACT_APP_FIREBASE_STORAGE_BUCKET',
  'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
  'REACT_APP_FIREBASE_APP_ID',
  'REACT_APP_FIREBASE_MEASUREMENT_ID',
];

module.exports = {
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials'],
  typescript: {
    reactDocgen: false, // Disable react-docgen-typescript
  },
  webpackFinal: async (config) => {
    const firebaseEnvDefinitions = FIREBASE_ENV_KEYS.reduce(
      (definitions, key) => {
        definitions[`process.env.${key}`] = JSON.stringify(
          process.env[key] || ''
        );
        return definitions;
      },
      {}
    );

    config.plugins.push(new webpack.DefinePlugin(firebaseEnvDefinitions));

    return config;
  },
};
