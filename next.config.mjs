// next.config.js
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,   // new SW takes control immediately
  clientsClaim: true,  // activate updated SW without reload
  disable: process.env.NODE_ENV === "development", // disable in dev
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default withPWA(nextConfig);
