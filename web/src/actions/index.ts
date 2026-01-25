'use server';

import { connectToDatabase } from '@/db';
import { ObjectId } from 'mongodb';
import { B5Error, DbResult, Feedback } from '@/types';
import calculateScore from '@bigfive-org/score';
import generateResult, {
  getInfo,
  Language,
  Domain
} from '@bigfive-org/results';

const collectionName = process.env.DB_COLLECTION || 'results';
const resultLanguages = getInfo().languages;

export type Report = {
  id: string;
  timestamp: number;
  availableLanguages: Language[];
  language: string;
  results: Domain[];
};

export async function getTestResult(
  id: string,
  language?: string
): Promise<Report | undefined> {
  'use server';
  try {
    const db = await connectToDatabase();
    const collection = db.collection(collectionName);
    
    // Try to find by custom ID first, then by MongoDB ObjectId
    let report = null;
    try {
      const query = { _id: new ObjectId(id) };
      report = await collection.findOne(query);
    } catch (e) {
      // If not a valid ObjectId, try custom ID
    }
    
    if (!report) {
      report = await collection.findOne({ customId: id });
    }
    
    if (!report) {
      console.error(`The test results with id ${id} are not found!`);
      throw new B5Error({
        name: 'NotFoundError',
        message: `The test results with id ${id} is not found in the database!`
      });
    }
    const selectedLanguage =
      language ||
      (!!resultLanguages.find((l) => l.id == report.lang) ? report.lang : 'en');
    const scores = calculateScore({ answers: report.answers });
    const results = generateResult({ lang: selectedLanguage, scores });
    return {
      id: report._id.toString(),
      timestamp: report.dateStamp,
      availableLanguages: resultLanguages,
      language: selectedLanguage,
      results
    };
  } catch (error) {
    if (error instanceof B5Error) {
      throw error;
    }
    throw new Error('Something wrong happend. Failed to get test result!');
  }
}

export async function saveTest(testResult: DbResult) {
  'use server';
  try {
    const db = await connectToDatabase();
    const collection = db.collection(collectionName);
    
    // If customId is provided, check if it already exists as _id
    let docToInsert = { ...testResult };
    if (testResult.customId) {
      const existing = await collection.findOne({ _id: testResult.customId });
      if (existing) {
        throw new B5Error({
          name: 'SavingError',
          message: `The identifier "${testResult.customId}" is already in use. Please choose a different identifier!`
        });
      }
      docToInsert = { ...testResult, _id: testResult.customId };
      delete docToInsert.customId;
    }
    const result = await collection.insertOne(docToInsert);
    return { id: (testResult.customId || result.insertedId.toString()) };
  } catch (error) {
    if (error instanceof B5Error) {
      throw error;
    }
    console.error(error);
    throw new B5Error({
      name: 'SavingError',
      message: 'Failed to save test result!'
    });
  }
}

export type FeebackState = {
  message: string;
  type: 'error' | 'success';
};

export async function saveFeedback(
  prevState: FeebackState,
  formData: FormData
): Promise<FeebackState> {
  'use server';
  const feedback: Feedback = {
    name: String(formData.get('name')),
    email: String(formData.get('email')),
    message: String(formData.get('message'))
  };
  try {
    const db = await connectToDatabase();
    const collection = db.collection('feedback');
    await collection.insertOne({ feedback });
    return {
      message: 'Sent successfully!',
      type: 'success'
    };
  } catch (error) {
    return {
      message: 'Error sending feedback!',
      type: 'error'
    };
  }
}
