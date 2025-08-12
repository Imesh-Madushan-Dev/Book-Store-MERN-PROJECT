import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "makeenbooks.com",
      "cms.sarasavi.lk",
      "makeenbooks.s3.us-east-1.amazonaws.com",
      "covers.openlibrary.org",
      "openlibrary.org",
    ],
  },
};

export default nextConfig;
