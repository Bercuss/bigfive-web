'use client';

import { Select, SelectItem } from '@nextui-org/select';
import { ChangeEvent } from 'react';
import { Language } from '@bigfive-org/results';
import { useRouter } from '@/navigation';

export const ReportLanguageSwitch = ({
  language
}: {
  language: string;
}) => {
  const router = useRouter();

  // Csak angol és magyar
  const fixedLanguages = [
    { id: 'hu', text: 'Hungarian' },
    { id: 'en', text: 'English' }
  ];

  function onSelectChange(event: ChangeEvent<HTMLSelectElement>) {
    const selectedLanguage = event.target.value;
    router.push(`?lang=${selectedLanguage}`);
    router.refresh();
  }

  return (
    <div className='w-30'>
      <Select
        defaultSelectedKeys={[language]}
        onChange={onSelectChange}
        aria-label='Select language'
        name='localeSelectSmall'
        className='w-48'
        size='sm'
        label='Report language'
      >
        {fixedLanguages.map((lang) => (
          <SelectItem key={lang.id} value={lang.id} textValue={lang.text}>
            {lang.text}
          </SelectItem>
        ))}
      </Select>
    </div>
  );
};
