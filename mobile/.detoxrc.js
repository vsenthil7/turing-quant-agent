/** DESKTOP: adjust device + build paths for your environment. */
module.exports = {
  testRunner: { args: { config: "e2e/jest.config.js" } },
  apps: { "ios.debug": { type: "ios.app", binaryPath: "ios/build/Build/Products/Debug-iphonesimulator/app.app" } },
  devices: { simulator: { type: "ios.simulator", device: { type: "iPhone 15" } } },
  configurations: { "ios.sim.debug": { device: "simulator", app: "ios.debug" } }
};
