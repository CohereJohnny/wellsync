// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  // reactStrictMode: true,
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  images: {
    unoptimized: true,
  },
  output: 'standalone',
  experimental: {
    outputFileTracingExcludes: {
      '*': [
        'node_modules/@swc/core-linux-x64-gnu',
        'node_modules/@swc/core-linux-x64-musl',
        'node_modules/@esbuild/linux-x64',
      ],
    },
  },
  // Add webpack configuration to handle the punycode deprecation warning
  webpack: (config, { isServer, dev }) => {
    // This is to suppress the punycode deprecation warning
    config.ignoreWarnings = [
      { module: /node_modules\/punycode/ },
    ];
    
    return config;
  },
};

// Since we're dealing with ESM/CommonJS interoperability issues, use dynamic imports
const withNextIntlAndMDX = async () => {
  const { default: createNextIntlPlugin } = await import('next-intl/plugin');
  const { default: createMDX } = await import('@next/mdx');
  
  // Dynamic imports for ESM packages
  const { default: remarkGfm } = await import('remark-gfm');
  const { default: rehypeSlug } = await import('rehype-slug');
  const { default: rehypeHighlight } = await import('rehype-highlight');

  const withNextIntl = createNextIntlPlugin('./i18n/request.js');
  
  const withMDX = createMDX({
    options: {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [rehypeSlug, rehypeHighlight],
    },
  });
  
  return withNextIntl(withMDX(nextConfig));
};

// Export a promise-based configuration for Next.js
module.exports = withNextIntlAndMDX(); 