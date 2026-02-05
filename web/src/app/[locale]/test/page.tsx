import { getItems, getInfo } from '@bigfive-org/questions';
import { Survey } from './survey';
import { saveTest } from '@/actions';
import { unstable_setRequestLocale, getTranslations } from 'next-intl/server';
import { TestLanguageSwitch } from './test-language-switch';

const questionLanguages = getInfo().languages;

interface Props {
  params: { locale: string };
  searchParams: { lang?: string };
}

export default async function TestPage({
  params: { locale },
  searchParams: { lang }
}: Props) {
  unstable_setRequestLocale(locale);
  const language =
    lang || (questionLanguages.some((l) => l.code === locale) ? locale : 'en');
  const questions = await getItems(language as any);
  const t = await getTranslations({ locale, namespace: 'test' });
  return (
    <>
      <div className='flex'>
        <TestLanguageSwitch
          availableLanguages={questionLanguages}
          language={language}
        />
      </div>
      <Survey
        questions={questions}
        nextText={t('next')}
        prevText={t('back')}
        resultsText={t('seeResults')}
        saveTest={saveTest}
        language={language}
      />
    </>
  );
}
