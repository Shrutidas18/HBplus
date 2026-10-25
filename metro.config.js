const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Firebase ships some CommonJS (.cjs) files.
config.resolver.sourceExts.push('cjs');

// If you ever see "Component auth has not been registered yet" on native,
// uncomment the next line (known Firebase + Metro package-exports issue):
// config.resolver.unstable_enablePackageExports = false;

module.exports = config;
