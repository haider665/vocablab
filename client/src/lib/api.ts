import { Word } from "@shared/schema";

interface DictionaryApiPhonetic {
  text?: string;
  audio?: string;
}

interface DictionaryApiDefinition {
  definition: string;
  example?: string;
  synonyms?: string[];
  antonyms?: string[];
}

interface DictionaryApiMeaning {
  partOfSpeech: string;
  definitions: DictionaryApiDefinition[];
  synonyms?: string[];
  antonyms?: string[];
}

interface DictionaryApiResponse {
  word: string;
  phonetic?: string;
  phonetics?: DictionaryApiPhonetic[];
  origin?: string;
  meanings: DictionaryApiMeaning[];
}

// Helper function to get an image for the word
const getWordImage = async (word: string): Promise<string> => {
  try {
    // In a real application, we would use a proper image service with API key
    // Here we're just using Unsplash's search as a fallback
    const randomIndex = Math.floor(Math.random() * 5);
    return `https://source.unsplash.com/featured/?${encodeURIComponent(word)}&sig=${randomIndex}`;
  } catch (error) {
    console.error('Error fetching word image:', error);
    return '';
  }
};

// Get a random audio URL from the phonetics array
const getAudioUrl = (phonetics: DictionaryApiPhonetic[] | undefined): string => {
  if (!phonetics || phonetics.length === 0) return '';
  
  const phoneticsWithAudio = phonetics.filter(p => p.audio && p.audio.length > 0);
  if (phoneticsWithAudio.length === 0) return '';
  
  return phoneticsWithAudio[0].audio || '';
};

// Map the Free Dictionary API response to our Word type
export const mapDictionaryResponseToWord = async (
  response: DictionaryApiResponse
): Promise<Partial<Word>> => {
  // Find the first meaning with definitions
  const firstMeaning = response.meanings.find(m => m.definitions.length > 0);
  if (!firstMeaning) throw new Error('No definitions found');
  
  const firstDefinition = firstMeaning.definitions[0];
  const partOfSpeech = firstMeaning.partOfSpeech;
  
  // Gather all synonyms and antonyms
  const allSynonyms = [
    ...new Set([
      ...(firstMeaning.synonyms || []),
      ...response.meanings.flatMap(m => m.synonyms || [])
    ])
  ].slice(0, 5);
  
  const allAntonyms = [
    ...new Set([
      ...(firstMeaning.antonyms || []),
      ...response.meanings.flatMap(m => m.antonyms || [])
    ])
  ].slice(0, 5);
  
  // Get an image for the word
  const imageUrl = await getWordImage(response.word);
  
  return {
    word: response.word,
    phonetic: response.phonetic || (response.phonetics && response.phonetics[0]?.text) || '',
    partOfSpeech,
    definition: firstDefinition.definition,
    example: firstDefinition.example || response.meanings.flatMap(m => m.definitions).find(d => d.example)?.example || '',
    imageUrl,
    synonyms: allSynonyms,
    antonyms: allAntonyms,
    pronunciationUrl: getAudioUrl(response.phonetics),
  };
};

// Fetch a word from the Free Dictionary API
export const fetchWordDefinition = async (word: string): Promise<Partial<Word>> => {
  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch definition for "${word}"`);
    }
    
    const data = await response.json();
    
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error(`No definition found for "${word}"`);
    }
    
    const wordData = await mapDictionaryResponseToWord(data[0]);
    return wordData;
  } catch (error) {
    console.error('Error fetching word definition:', error);
    throw error;
  }
};

// Get a random word for "Word of the Day"
export const fetchRandomWord = async (): Promise<Partial<Word>> => {
  try {
    // In a real app, we might use a dedicated API for this
    const randomWords = [
      'ephemeral', 'serendipity', 'ubiquitous', 'luminescence', 'mellifluous',
      'eloquent', 'pernicious', 'esoteric', 'quintessential', 'surreptitious'
    ];
    
    const randomIndex = Math.floor(Math.random() * randomWords.length);
    const randomWord = randomWords[randomIndex];
    
    return await fetchWordDefinition(randomWord);
  } catch (error) {
    console.error('Error fetching random word:', error);
    throw error;
  }
};
