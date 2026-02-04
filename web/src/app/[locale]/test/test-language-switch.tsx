'use client';

import { Select, SelectItem } from '@nextui-org/select';
import { ChangeEvent } from 'react';
import { Language } from '@bigfive-org/questions';
import { useRouter } from '@/navigation';

interface TestLanguageSwitchProps {
  availableLanguages: Language[];
  language: string;
}

export const TestLanguageSwitch = ({
  language
}: TestLanguageSwitchProps) => {
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
        aria-label='Select survey language'
        size='sm'
        name='localeSelectSmall'
        className='w-48'
        label='Survey language'
      >
        {fixedLanguages.map((lang) => (
          <SelectItem key={lang.id} value={lang.id}>
            {lang.text}
          </SelectItem>
        ))}
      </Select>
    </div>
  );
};
