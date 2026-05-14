module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        "babel-preset-expo",
        {
          jsxImportSource: "nativewind",
          // We don't use Reanimated in Phase 0; disabling its plugin avoids
          // having to ship react-native-worklets (which requires RN 0.81+).
          reanimated: false,
        },
      ],
      "nativewind/babel",
    ],
  };
};
