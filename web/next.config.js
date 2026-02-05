const path = require('path');
const createNextIntlPlugin = require('next-intl/plugin');
const { withContentlayer } = require('next-contentlayer');

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		externalDir: true
	},
	webpack: (config) => {
		config.resolve = config.resolve || {};
		config.resolve.alias = config.resolve.alias || {};

		// Ensure monorepo package is resolvable during build (including on Vercel)
		config.resolve.alias['@bigfive-org/score'] = path.join(
			__dirname,
			'..',
			'packages',
			'score',
			'build',
			'src'
		);

		return config;
	}
};

module.exports = withContentlayer(withNextIntl(nextConfig));
