// eslint-disable-next-line @typescript-eslint/no-var-requires
const { defineConfig } = require("electron-builder");

module.exports = defineConfig({
  appId: "com.kozmonot.viaHealt",
  productName: "viaHealt",
  directories: {
    output: "release",
    buildResources: "resources",
  },
  files: ["dist/**/*", "electron/**/*", "images/**/*"],
  extraResource: ["./dist", "./images"],
  mac: {
    category: "public.app-category.utilities",
    target: ["dmg", "zip"],
    hardenedRuntime: true,
    gatekeeperAssess: false,
    entitlements: "build/entitlements.mac.plist",
    entitlementsInherit: "build/entitlements.mac.plist",
    extendInfo: {
      NSMicrophoneUsageDescription: "Please give us access to your microphone",
    },
  },
  win: {
    target: ["nsis"],
  },
  linux: {
    target: ["AppImage", "deb"],
    category: "Utility",
  },
});
