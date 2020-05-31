module.exports = {
  assetPrefix: process.env.NODE_ENV === "production" ? "." : "",
  webpack: config =>
    Object.assign(config, {
      target: "electron-renderer"
    })
};
