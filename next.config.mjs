// @ts-check
import createNextIntlPlugin from 'next-intl/plugin';
import createMDX from '@next/mdx';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeHighlight from 'rehype-highlight';

const withNextIntl = createNextIntlPlugin('./i18n/request.js');

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeSlug, rehypeHighlight],
  },
});

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

export default withNextIntl(withMDX(nextConfig)); 