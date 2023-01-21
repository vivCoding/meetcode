/** @type {import('next').NextConfig} */
const nextConfig = {
  // NOTE to disable double rerendering/console logs
  reactStrictMode: false,
  webpack(config, options) {
    config.resolve.alias["@mui/material"] = "@mui/joy"
    return config
  }
}

module.exports = nextConfig
