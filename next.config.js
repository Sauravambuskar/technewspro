/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    // The category/sub-category URL structure moved from /insights/... to
    // /category/..., and three categories were renamed. Specific renamed-id
    // rules must come before the generic passthrough so they win the match.
    return [
      // The article listing lives at /category; this kept the old path working.
      { source: "/articles", destination: "/category", permanent: true },
      { source: "/insights", destination: "/category", permanent: true },
      { source: "/insights/financial-intelligence", destination: "/category/finance-and-fintech", permanent: true },
      { source: "/insights/financial-intelligence/:sub", destination: "/category/finance-and-fintech/:sub", permanent: true },
      { source: "/insights/information-technology", destination: "/category/technology-and-it", permanent: true },
      { source: "/insights/information-technology/:sub", destination: "/category/technology-and-it/:sub", permanent: true },
      { source: "/insights/marketing-and-brand", destination: "/category/marketing-and-growth", permanent: true },
      { source: "/insights/marketing-and-brand/:sub", destination: "/category/marketing-and-growth/:sub", permanent: true },
      { source: "/insights/:section", destination: "/category/:section", permanent: true },
      { source: "/insights/:section/:sub", destination: "/category/:section/:sub", permanent: true }
    ];
  }
};

module.exports = nextConfig;
