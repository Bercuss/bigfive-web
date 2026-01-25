'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@nextui-org/button';
import { RadioGroup, Radio } from '@nextui-org/radio';
import { Progress } from '@nextui-org/progress';
import confetti from 'canvas-confetti';
import { useRouter } from '@/navigation';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter
} from '@nextui-org/modal';
import { Input } from '@nextui-org/input';

import { CloseIcon, InfoIcon } from '@/components/icons';
import { type Question } from '@bigfive-org/questions';
import { sleep, formatTimer, isDev } from '@/lib/helpers';
import useWindowDimensions from '@/hooks/useWindowDimensions';
import useTimer from '@/hooks/useTimer';
import { type Answer } from '@/types';
import { Card, CardHeader } from '@nextui-org/card';

interface SurveyProps {
  questions: Question[];
  nextText: string;
  prevText: string;
  resultsText: string;
  saveTest: Function;
  language: string;
}

export const Survey = ({
  questions,
  nextText,
  prevText,
  resultsText,
  saveTest,
  language
}: SurveyProps) => {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionsPerPage, setQuestionsPerPage] = useState(1);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(false);
  const [restored, setRestored] = useState(false);
  const [inProgress, setInProgress] = useState(false);
  const [showIdModal, setShowIdModal] = useState(true);
  const [customId, setCustomId] = useState('');
  const [idError, setIdError] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const { width } = useWindowDimensions();
  const seconds = useTimer();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setQuestionsPerPage(window.innerWidth > 768 ? 3 : 1);
    };
    handleResize();
  }, [width]);

  useEffect(() => {
    const restoreData = () => {
      if (dataInLocalStorage()) {
        console.log('Restoring data from local storage');
        restoreDataFromLocalStorage();
      }
    };
    restoreData();
  }, []);

  const currentQuestions = useMemo(
    () =>
      questions.slice(
        currentQuestionIndex,
        currentQuestionIndex + questionsPerPage
      ),
    [currentQuestionIndex, questions, questionsPerPage]
  );

  const isTestDone = questions.length === answers.length;

  const progress = Math.round((answers.length / questions.length) * 100);

  const nextButtonDisabled =
    inProgress ||
    currentQuestionIndex + questionsPerPage > answers.length ||
    (isTestDone &&
      currentQuestionIndex === questions.length - questionsPerPage) ||
    loading;

  const backButtonDisabled = currentQuestionIndex === 0 || loading;

  async function handleAnswer(id: string, value: string) {
    const question = questions.find((question) => question.id === id);
    if (!question) return;

    const newAnswer: Answer = {
      id,
      score: Number(value),
      domain: question.domain,
      facet: question.facet
    };

    setAnswers((prevAnswers) => [
      ...prevAnswers.filter((a) => a.id !== id),
      newAnswer
    ]);

    const latestAnswerId = answers.slice(-1)[0]?.id;

    if (
      questionsPerPage === 1 &&
      questions.length !== answers.length + 1 &&
      id !== latestAnswerId
    ) {
      setInProgress(true);
      await sleep(700);
      setCurrentQuestionIndex((prev) => prev + 1);
      window.scrollTo(0, 0);
      setInProgress(false);
    }
    populateDataInLocalStorage();
  }

  function handlePreviousQuestions() {
    setCurrentQuestionIndex((prev) => prev - questionsPerPage);
    window.scrollTo(0, 0);
  }

  function handleNextQuestions() {
    if (inProgress) return;
    setCurrentQuestionIndex((prev) => prev + questionsPerPage);
    window.scrollTo(0, 0);
    if (restored) setRestored(false);
  }

  function skipToEnd() {
    const randomAnswers = questions
      .map((question) => ({
        id: question.id,
        score: Math.floor(Math.random() * 5) + 1,
        domain: question.domain,
        facet: question.facet
      }))
      .slice(0, questions.length - 1);

    setAnswers([...randomAnswers]);
    setCurrentQuestionIndex(questions.length - 1);
  }

  async function submitTest() {
    setLoading(true);
    confetti({});
    const result = await saveTest({
      testId: 'b5-120',
      lang: language,
      invalid: false,
      timeElapsed: seconds,
      dateStamp: new Date(),
      answers,
      customId: customId || undefined
    });
    localStorage.removeItem('inProgress');
    localStorage.removeItem('b5data');
    localStorage.removeItem('testCustomId');
    console.log(result);
    localStorage.setItem('resultId', result.id);
    router.push(`/result/${result.id}`);
  }

  function handleStartTest() {
    if (!customId.trim()) {
      setIdError('Identifier is required!');
      return;
    }
    if (customId.length < 3) {
      setIdError('Identifier must be at least 3 characters long!');
      return;
    }
    localStorage.setItem('testCustomId', customId);
    setShowIdModal(false);
    setIdError('');
  }

  function dataInLocalStorage() {
    return !!localStorage.getItem('inProgress');
  }

  function populateDataInLocalStorage() {
    localStorage.setItem('inProgress', 'true');
    localStorage.setItem(
      'b5data',
      JSON.stringify({ answers, currentQuestionIndex })
    );
  }

  function restoreDataFromLocalStorage() {
    const data = localStorage.getItem('b5data');
    const savedCustomId = localStorage.getItem('testCustomId');
    if (data) {
      const { answers, currentQuestionIndex } = JSON.parse(data);
      setAnswers(answers);
      setCurrentQuestionIndex(currentQuestionIndex);
      setRestored(true);
    }
    if (savedCustomId) {
      setCustomId(savedCustomId);
      setShowIdModal(false);
    }
  }

  function clearDataInLocalStorage() {
    console.log('Clearing data from local storage');
    localStorage.removeItem('inProgress');
    localStorage.removeItem('b5data');
    location.reload();
  }

  return (
    <div className='mt-2'>
      {isMounted && (
        <Modal isOpen={showIdModal} backdrop='blur' isDismissable={false}>
          <ModalContent>
            <ModalHeader className='flex flex-col gap-1'>
              Test Identifier
            </ModalHeader>
            <ModalBody>
              <p>
                Please enter a unique identifier for this test. You can use this identifier later to retrieve your results.
              </p>
              <Input
                type='text'
                label='Identifier'
                placeholder='e.g. John_Smith_2024'
                value={customId}
                onChange={(e) => {
                  setCustomId(e.target.value);
                  setIdError('');
                }}
                isInvalid={!!idError}
                errorMessage={idError}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleStartTest();
                  }
                }}
              />
            </ModalBody>
            <ModalFooter>
              <Button
                color='primary'
                onPress={handleStartTest}
                disabled={!customId.trim()}
              >
                Start Test
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
      <Progress
        aria-label='Progress bar'
        value={progress}
        className='max-w'
        showValueLabel={true}
        label={formatTimer(seconds)}
        minValue={0}
        maxValue={100}
        size='lg'
        color='secondary'
      />
      {restored && (
        <Card className='mt-4 bg-warning/20 text-warning-600 dark:text-warning'>
          <CardHeader className='justify-between'>
            <Button isIconOnly variant='light' color='warning'>
              <InfoIcon />
            </Button>
            <p>
              Your answers has been restored. Click here to&nbsp;
              <a
                className='underline cursor-pointer'
                onClick={clearDataInLocalStorage}
                aria-label='Clear data'
              >
                start a new test
              </a>
              .
            </p>
            <Button
              isIconOnly
              variant='light'
              color='warning'
              onClick={() => setRestored(false)}
            >
              <CloseIcon />
            </Button>
          </CardHeader>
        </Card>
      )}
      {currentQuestions.map((question) => (
        <div key={'q' + question.num}>
          <h2 className='text-2xl my-4'>{question.text}</h2>
          <div>
            <RadioGroup
              onValueChange={(value) => handleAnswer(question.id, value)}
              value={answers
                .find((answer) => answer.id === question.id)
                ?.score.toString()}
              color='secondary'
              isDisabled={inProgress}
            >
              {question.choices.map((choice, index) => (
                <Radio
                  key={index + question.id}
                  value={choice.score.toString()}
                >
                  {choice.text}
                </Radio>
              ))}
            </RadioGroup>
          </div>
        </div>
      ))}
      <div className='my-12 space-x-4 inline-flex'>
        <Button
          color='primary'
          isDisabled={backButtonDisabled}
          onClick={handlePreviousQuestions}
        >
          {prevText.toUpperCase()}
        </Button>

        <Button
          color='primary'
          isDisabled={nextButtonDisabled}
          onClick={handleNextQuestions}
        >
          {nextText.toUpperCase()}
        </Button>

        {isTestDone && (
          <Button
            color='secondary'
            onClick={submitTest}
            disabled={loading}
            isLoading={loading}
          >
            {resultsText.toUpperCase()}
          </Button>
        )}

        {isDev && !isTestDone && (
          <Button color='primary' onClick={skipToEnd}>
            Skip to end (dev)
          </Button>
        )}
      </div>
    </div>
  );
};
