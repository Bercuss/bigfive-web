import { getTranslations } from 'next-intl/server';

export type SiteConfig = typeof siteConfig;

export const basePath = 'https://swan-test.vercel.app';

export const supportEmail = 'bigfive-test@rubynor.com';

export type Language = {
  code: string;
  name: string;
  countryCode?: string;
  map?: string[];
};

export const languages: Language[] = [
  { code: 'hu', name: 'Hungarian', countryCode: 'hu' },
  { code: 'en', name: 'English', countryCode: 'us', map: ['en-GB'] }
];

export const locales = languages.map((lang) => lang.code) as string[];

export const siteConfig = {
  name: 'Big Five Personality Test',
  creator: '@maccyber',
  description:
    'Learn to know yourself better with a free, open-source personality test.',
  navItems: [
    {
      label: 'home',
      href: '/'
    },
    {
      label: 'result',
      href: '/result'
    },
    {
      label: 'compare',
      href: '/compare'
    }
  ],
  navMenuItems: [
    {
      label: 'home',
      href: '/'
    },
    {
      label: 'see_results',
      href: '/result'
    },
    {
      label: 'compare_with',
      href: '/compare'
    }
  ],
  footerLinks: [],
  links: {
    github: 'https://github.com/rubynor/bigfive-web',
    twitter: 'https://twitter.com/rubynor',
    linkedIn: 'https://www.linkedin.com/company/rubynor-as/',
    facebook: 'https://www.facebook.com/rubynorno'
  }
};

export const getNavItems = async ({
  locale,
  linkType
}: {
  locale: string;
  linkType: 'navItems' | 'navMenuItems' | 'footerLinks';
}) => {
  const t = await getTranslations({ locale, namespace: 'toolbar' });
  return siteConfig[linkType].map((link) => ({
    label: t(`${link.label}`),
    href: link.href
  }));
};
