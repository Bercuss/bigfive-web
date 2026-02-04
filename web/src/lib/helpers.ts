export const formatId = (id: string): string => {
  return id
    .replace(/^https?:\/\/.+\/result\//, '')
    .toLowerCase()
    .replaceAll(' ', '');
};

export const validId: (id: string) => boolean = (id: string) => {
  // Accept MongoDB ObjectIds (24 hex characters) or custom IDs (3+ characters, alphanumeric with underscores/hyphens)
  const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
  const isCustomId = /^[a-z0-9_-]{3,}$/i.test(id);
  return isMongoId || isCustomId;
};

export const formatAndValidateId = (id: string): boolean => {
  const formattedId = formatId(id);
  return validId(formattedId);
};

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));


export const isDev: boolean = process.env.NEXT_PUBLIC_ENV === 'development';

const unescape = (str: string) =>
  (str + '==='.slice((str.length + 3) % 4))
    .replace(/-/g, '+')
    .replace(/_/g, '/');
const escape = (str: string) =>
  str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

export const base64url = {
  encode: (str: string) => escape(Buffer.from(str, 'utf8').toString('base64')),
  decode: (str: string) => {
    const trimmedString = str
      .split('?')[0]
      .replaceAll('=', '')
      .replaceAll('%3D', '');
    return JSON.parse(
      Buffer.from(unescape(trimmedString), 'base64').toString('utf8')
    );
  }
};

export function calculateReadingTime(content: string) {
  // Define the average reading speed (words per minute)
  const wordsPerMinute = 200;

  // Strip MDX/HTML tags and count the words
  const markdownRegex =
    /(\[.*?\]\(.*?\)|#+\s|```.*?```|`.*?`|\*\*.*?\*\*|\*\*|__.*?__|_.*?_|!\[.*?\]\(.*?\))/gs;
  const text = content
    .replace(markdownRegex, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  const wordCount = text
    .split(/\s+/)
    .filter((word: any) => word.length > 0).length;

  // Calculate reading time
  const readingTime = Math.ceil(wordCount / wordsPerMinute);

  return readingTime;
}
