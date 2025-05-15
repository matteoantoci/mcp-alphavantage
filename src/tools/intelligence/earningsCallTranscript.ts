import { z } from 'zod';
import type { AlphaVantageClient, AlphaVantageApiParams } from '../../alphaVantageClient.js';

// Define the input schema shape for the EARNINGS_CALL_TRANSCRIPT tool
const earningsCallTranscriptInputSchemaShape = {
  symbol: z.string().describe('The symbol of the ticker of your choice. For example: IBM.'),
  quarter: z.string().describe('Fiscal quarter in YYYYQM format. For example: 2024Q1.'),
  speakers: z
    .string()
    .optional()
    .describe(
      'Comma-separated list of speaker names or titles (e.g., "CEO,CFO", "Satya Nadella") to filter by. Case-insensitive.'
    ),
  sections: z
    .string()
    .optional()
    .describe(
      'Comma-separated list of sections to include (e.g., "prepared_remarks", "q_and_a"). Note: Section identification is based on heuristics (e.g., initial executive speakers for prepared_remarks, analyst questions for q_and_a) and may not be perfectly accurate.'
    ),
  keywords: z
    .string()
    .optional()
    .describe(
      'Comma-separated list of keywords to search for within the content of each transcript segment. Returns segments containing any of the keywords. Case-insensitive.'
    ),
  exclude_boilerplate: z
    .boolean()
    .optional()
    .default(false)
    .describe(
      'If true, attempts to exclude common introductory (e.g., legal disclaimers by IR) and closing remarks. Identification is heuristic-based.'
    ),
  min_sentiment: z
    .number()
    .optional()
    .describe(
      'Minimum sentiment score for a transcript segment to be included (e.g., 0.5). Filters segments where sentiment >= min_sentiment.'
    ),
  max_sentiment: z
    .number()
    .optional()
    .describe(
      'Maximum sentiment score for a transcript segment to be included (e.g., -0.2). Filters segments where sentiment <= max_sentiment.'
    ),
  max_segments: z
    .number()
    .int()
    .positive()
    .optional()
    .describe(
      'Maximum number of speaker segments to return from the beginning of the transcript after other filters are applied.'
    ),
  // Removed datatype parameter
};

type RawSchemaShape = typeof earningsCallTranscriptInputSchemaShape;
type Input = z.infer<z.ZodObject<RawSchemaShape>>;

const transcriptEntrySchema = z.object({
  speaker: z.string(),
  title: z.string().optional(),
  content: z.string(),
  sentiment: z
    .string()
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val), { message: 'Sentiment must be a number' })
    .optional(),
});

const earningsCallTranscriptOutputSchema = z.object({
  symbol: z.string(),
  quarter: z.string(),
  transcript: z.array(transcriptEntrySchema).optional(), // Optional if only a summary message is returned
  message: z.string().optional(), // For summary placeholder or other notes
});

type Output = z.infer<typeof earningsCallTranscriptOutputSchema>;

// Define the handler function for the EARNINGS_CALL_TRANSCRIPT tool
const earningsCallTranscriptHandler = async (input: Input, client: AlphaVantageClient): Promise<Output> => {
  try {
    const {
      symbol,
      quarter,
      speakers,
      sections,
      keywords,
      exclude_boilerplate,
      min_sentiment,
      max_sentiment,
      max_segments,
    } = input;

    const apiRequestParams: AlphaVantageApiParams = {
      apiFunction: 'EARNINGS_CALL_TRANSCRIPT',
      symbol,
      quarter,
      datatype: 'json',
    };

    const data = await client.fetchApiData(apiRequestParams);

    if (!data || !data.transcript) {
      return {
        symbol,
        quarter,
        transcript: [],
        message: 'No transcript data found for the specified symbol and quarter.',
      };
    }

    // Cast the raw data transcript to our internal type
    const baseTranscript: TranscriptSegment[] = data.transcript as TranscriptSegment[];

    const processedTranscript = applySegmentLimit(
      applyKeywordFilter(
        applySentimentFilter(
          applyBoilerplateExclusion(
            applySectionFilter(applySpeakerFilter(baseTranscript, speakers), sections),
            exclude_boilerplate
          ),
          min_sentiment,
          max_sentiment
        ),
        keywords
      ),
      max_segments
    );

    // Validate the output against the schema before returning
    return earningsCallTranscriptOutputSchema.parse({
      symbol,
      quarter,
      transcript: processedTranscript,
    });
  } catch (error: unknown) {
    console.error('EARNINGS_CALL_TRANSCRIPT tool error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    throw new Error(`EARNINGS_CALL_TRANSCRIPT tool failed: ${message}`);
  }
};

// Helper functions for filtering (extracted from handler)

type TranscriptSegment = {
  speaker: string;
  title?: string;
  content: string;
  sentiment?: number; // Sentiment should be a number after initial parsing/transformation
};

const applySpeakerFilter = (transcript: TranscriptSegment[], speakersInput?: string): TranscriptSegment[] => {
  if (!speakersInput) {
    return transcript;
  }
  const speakerList = speakersInput.split(',').map((s) => s.trim().toLowerCase());
  return transcript.filter((entry) =>
    speakerList.some(
      (speakerName) =>
        entry.speaker.toLowerCase().includes(speakerName) ||
        (entry.title && entry.title.toLowerCase().includes(speakerName))
    )
  );
};

// Helper to identify if an entry is part of prepared remarks
const isPreparedRemarkEntry = (entry: TranscriptSegment, preparedRemarksSpeakersLower: string[]): boolean =>
  preparedRemarksSpeakersLower.some((title) => entry.title?.toLowerCase().includes(title)) ||
  preparedRemarksSpeakersLower.some((name) => entry.speaker?.toLowerCase().includes(name));

// Helper to identify if an entry is part of Q&A
const isQandAEntry = (entry: TranscriptSegment): boolean =>
  entry.speaker.toLowerCase().includes('analyst') || entry.content.trim().endsWith('?');

const applySectionFilter = (transcript: TranscriptSegment[], sectionsInput?: string): TranscriptSegment[] => {
  if (!sectionsInput) {
    return transcript;
  }
  const sectionList = sectionsInput.split(',').map((s) => s.trim().toLowerCase());
  const wantPrepared = sectionList.includes('prepared_remarks');
  const wantQandA = sectionList.includes('q_and_a');

  if (wantPrepared && wantQandA) {
    return transcript; // Both requested, return all
  }

  const preparedRemarksSpeakerTitlesLower = [
    'ceo',
    'cfo',
    'president',
    'chief operating officer',
    'chief technology officer',
    'vice president of investor relations',
  ];

  if (wantPrepared) {
    // Refactored to use reduce for prepared remarks (still heuristic)
    const preparedRemarks = transcript.reduce(
      (acc, entry) => {
        const isQandA = isQandAEntry(entry);
        const isPrepared = isPreparedRemarkEntry(entry, preparedRemarksSpeakerTitlesLower);

        if (acc.foundQandA) {
          return acc; // Stop adding if Q&A has started
        }

        if (isQandA) {
          return { ...acc, foundQandA: true }; // Mark Q&A found
        }

        if (isPrepared) {
          acc.segments.push(entry);
        }
        return acc;
      },
      { segments: [] as TranscriptSegment[], foundQandA: false }
    );

    return preparedRemarks.segments;
  }

  if (wantQandA) {
    // Refactored to use filter for Q&A
    let inQandASession = false;
    return transcript.filter((entry) => {
      if (isQandAEntry(entry)) {
        inQandASession = true;
      }
      return inQandASession;
    });
  }
  return transcript; // No specific section matched or invalid input
};

const applyBoilerplateExclusion = (transcript: TranscriptSegment[], shouldExclude?: boolean): TranscriptSegment[] => {
  if (!shouldExclude || transcript.length === 0) {
    return transcript;
  }

  let startIndex = 0;
  let endIndex = transcript.length;

  // Exclude first segment if it looks like an intro
  const firstSegment = transcript[0];
  if (
    firstSegment.speaker.toLowerCase().includes('investor relations') ||
    firstSegment.content.toLowerCase().includes('good afternoon') ||
    firstSegment.content.toLowerCase().includes('thank you for joining us')
  ) {
    startIndex = 1;
  }

  // Exclude last segment if it looks like a closing
  if (endIndex > startIndex) {
    // Ensure there are still segments after potentially removing the first
    const lastSegment = transcript[endIndex - 1];
    if (
      lastSegment.speaker.toLowerCase().includes('operator') ||
      lastSegment.content.toLowerCase().includes('thank you for your questions') ||
      lastSegment.content.toLowerCase().includes('this concludes')
    ) {
      endIndex = endIndex - 1;
    }
  }

  // Use slice to return a new array without mutating the original
  return transcript.slice(startIndex, endIndex);
};

const applySentimentFilter = (
  transcript: TranscriptSegment[],
  minSentiment?: number,
  maxSentiment?: number
): TranscriptSegment[] => {
  if (minSentiment === undefined && maxSentiment === undefined) {
    return transcript;
  }

  return transcript.filter((entry) => {
    if (entry.sentiment === undefined) return false; // Exclude entries without sentiment
    // Sentiment is already expected to be a number based on TranscriptSegment type
    const sentimentValue = entry.sentiment;

    const passMin = minSentiment === undefined || sentimentValue >= minSentiment;
    const passMax = maxSentiment === undefined || sentimentValue <= maxSentiment;

    return passMin && passMax;
  });
};

const applyKeywordFilter = (transcript: TranscriptSegment[], keywordsInput?: string): TranscriptSegment[] => {
  if (!keywordsInput) {
    return transcript;
  }
  const keywordList = keywordsInput.split(',').map((k) => k.trim().toLowerCase());
  return transcript.filter((entry) => keywordList.some((keyword) => entry.content.toLowerCase().includes(keyword)));
};

const applySegmentLimit = (transcript: TranscriptSegment[], maxSegments?: number): TranscriptSegment[] => {
  if (maxSegments === undefined || transcript.length <= maxSegments) {
    return transcript;
  }
  return transcript.slice(0, maxSegments);
};

// Define the tool definition object structure
type AlphaVantageToolDefinition = {
  name: string;
  description: string;
  inputSchemaShape: RawSchemaShape;
  handler: (input: Input, client: AlphaVantageClient) => Promise<Output>;
};

export const earningsCallTranscriptTool: AlphaVantageToolDefinition = {
  name: 'earnings_call_transcript',
  description: 'Fetches the earnings call transcript for a given company in a specific quarter.',
  inputSchemaShape: earningsCallTranscriptInputSchemaShape,
  handler: earningsCallTranscriptHandler,
};
