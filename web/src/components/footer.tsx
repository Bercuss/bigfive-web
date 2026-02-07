import { Link as NextUILink } from '@nextui-org/link';
import { Link } from '../navigation';

import { TwitterIcon, GithubIcon, LinkedInIcon, FacebookIcon } from '@/components/icons';
import { siteConfig } from '@/config/site';

interface FooterProps {
  footerLinks: {
    label: string;
    href: string;
  }[];
}

export default function Footer({ footerLinks }: FooterProps) {
  const year = new Date().getFullYear();
  return (
    <footer className='container mx-auto max-w-7xl py-24 px-12'>
      <div className='container mx-auto flex justify-between' />

      <div className='w-full flex justify-center mt-12'>
        <ul className='flex mt-3 text-sm font-medium text-gray-500 dark:text-gray-400 sm:mt-0'>
          {footerLinks.map((item, index) => (
            <li key={index}>
              <Link href={item.href} className='hover:underline me-4 md:me-6'>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className='flex text-xs text-gray-500 mt-14 justify-center'>
        Created by Swan in 2026 under the MIT License.
      </div>
    </footer>
  );
}
