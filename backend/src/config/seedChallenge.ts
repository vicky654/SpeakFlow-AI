import { dbService } from './dbService';
import { IChallengeDay } from '../models/ChallengeDay';

export async function seedChallengeDays() {
  try {
    const existingDays = await dbService.challengeDays.getAll();
    if (existingDays.length > 0) {
      console.log('✅ 15-Day Challenge curriculum is already seeded.');
      return;
    }

    console.log('🌱 Seeding 15-Day Guided English Challenge curriculum...');

    // 15 days content mapper
    const daysContent: Partial<IChallengeDay>[] = [
      {
        dayNumber: 1,
        vocabulary: [
          {
            word: 'Hello', pronunciation: '/həˈləʊ/', partOfSpeech: 'Interjection', level: 'beginner' as const,
            englishMeaning: 'Used as a greeting or to begin a conversation.', hindiMeaning: 'नमस्ते',
            synonyms: ['Hi', 'Hey', 'Greetings'], antonyms: ['Goodbye', 'Bye'],
            exampleSentences: ['Hello, how are you today?', 'She said hello to the teacher.'],
            commonMistakes: 'Misspelling as "helo". It has a double "l" - "hello".',
            memoryTrick: 'Think of saying "Hell-O" to sound warm and friendly.',
            realLifeUsage: 'Used everywhere when meeting someone, picking up a call, or starting an email.',
            easyExplanation: 'A friendly word we say when we meet someone.'
          },
          {
            word: 'Good Morning', pronunciation: '/ɡʊd ˈmɔː.nɪŋ/', partOfSpeech: 'Phrase', level: 'beginner' as const,
            englishMeaning: 'A polite greeting used in the morning.', hindiMeaning: 'सुप्रभात',
            synonyms: ['Morning'], antonyms: ['Good Night'],
            exampleSentences: ['Good morning, did you sleep well?', 'He wishes everyone good morning.'],
            commonMistakes: 'Writing as one word "goodmorning". Keep it as two separate words.',
            memoryTrick: 'Associated with the rising sun and fresh starts in the early day.',
            realLifeUsage: 'Used at the workplace or at home before 12:00 PM.',
            easyExplanation: 'A nice greeting we say to people early in the day.'
          },
          {
            word: 'Good Evening', pronunciation: '/ɡʊd ˈiːv.nɪŋ/', partOfSpeech: 'Phrase', level: 'beginner' as const,
            englishMeaning: 'A polite greeting used in the evening.', hindiMeaning: 'शुभ संध्या',
            synonyms: ['Evening'], antonyms: ['Good Morning'],
            exampleSentences: ['Good evening, welcome to our home.', 'She arrived and said good evening.'],
            commonMistakes: 'Confusing "evening" spelling as "evning". It has a middle "e".',
            memoryTrick: 'Say this when the sun goes down and stars come out.',
            realLifeUsage: 'Used when meeting someone after 5:00 PM.',
            easyExplanation: 'A nice greeting we say to people late in the afternoon or night.'
          },
          {
            word: 'Thank You', pronunciation: '/θæŋk juː/', partOfSpeech: 'Phrase', level: 'beginner' as const,
            englishMeaning: 'A polite expression of gratitude.', hindiMeaning: 'धन्यवाद',
            synonyms: ['Thanks', 'Appreciated'], antonyms: ['Unappreciated'],
            exampleSentences: ['Thank you for the delicious food.', 'I want to say thank you for your help.'],
            commonMistakes: 'Writing as "thankyou" (one word) in formal contexts. It is "thank you".',
            memoryTrick: 'Think of "giving thanks" to the person who helped you.',
            realLifeUsage: 'Used when receiving gifts, help, compliments, or services.',
            easyExplanation: 'Words we say to show we are happy and grateful for help.'
          },
          {
            word: 'Sorry', pronunciation: '/ˈsɒr.i/', partOfSpeech: 'Adjective', level: 'beginner' as const,
            englishMeaning: 'Feeling regret or sadness for doing something wrong.', hindiMeaning: 'माफ़ करना',
            synonyms: ['Apologetic', 'Regretful'], antonyms: ['Proud', 'Glad'],
            exampleSentences: ['I am sorry for breaking the glass.', 'She said sorry for arriving late.'],
            commonMistakes: 'Do not write "sory" with one "r". It is spelled "sorry".',
            memoryTrick: 'Think of a sorrowful face when apologizing.',
            realLifeUsage: 'Used to apologize for errors, delays, or minor accidents.',
            easyExplanation: 'A word we say when we make a mistake or hurt someone by accident.'
          },
          {
            word: 'Welcome', pronunciation: '/ˈwel.kəm/', partOfSpeech: 'Interjection', level: 'beginner' as const,
            englishMeaning: 'Used to greet someone in a polite or friendly way.', hindiMeaning: 'स्वागत है',
            synonyms: ['Greet', 'Receive'], antonyms: ['Dismiss', 'Reject'],
            exampleSentences: ['Welcome to our English school!', 'They gave us a warm welcome.'],
            commonMistakes: 'Misspelling as "wellcome" with double "l". It has only one "l".',
            memoryTrick: 'Well + Come. You wish someone a good (well) arrival (come).',
            realLifeUsage: 'Used when guests enter your home, office, or country.',
            easyExplanation: 'A warm word we say to make people feel happy when they arrive.'
          },
          {
            word: 'Goodbye', pronunciation: '/ˌɡʊdˈbaɪ/', partOfSpeech: 'Interjection', level: 'beginner' as const,
            englishMeaning: 'Used to express good wishes when parting.', hindiMeaning: 'अलविदा',
            synonyms: ['Bye', 'Farewell'], antonyms: ['Hello', 'Hi'],
            exampleSentences: ['Goodbye, have a safe trip!', 'It is hard to say goodbye.'],
            commonMistakes: 'Misspelling as "goodby" without the ending "e".',
            memoryTrick: 'God be with ye - became goodbye. Wishing you good paths ahead.',
            realLifeUsage: 'Used when leaving a place or ending a phone call.',
            easyExplanation: 'A polite word we say when we are leaving someone.'
          },
          {
            word: 'Please', pronunciation: '/pliːz/', partOfSpeech: 'Adverb', level: 'beginner' as const,
            englishMeaning: 'Used to ask for something politely.', hindiMeaning: 'कृपया',
            synonyms: ['Kindly'], antonyms: ['Demandingly'],
            exampleSentences: ['Please give me a glass of water.', 'Come here, please.'],
            commonMistakes: 'Spelling as "pleas" or "plese". Always ends in "ease".',
            memoryTrick: 'P-L-E-A-S-E. Be polite to ease your request.',
            realLifeUsage: 'Used when requesting help, ordering food, or asking a question.',
            easyExplanation: 'A polite word we use when we ask someone to do something.'
          },
          {
            word: 'Excuse Me', pronunciation: '/ɪkˈskjuːz miː/', partOfSpeech: 'Phrase', level: 'beginner' as const,
            englishMeaning: 'Used to grab attention or politely apologize for minor interruptions.', hindiMeaning: 'क्षमा करें',
            synonyms: ['Pardon me'], antonyms: ['Ignored'],
            exampleSentences: ['Excuse me, where is the library?', 'Excuse me, I need to pass.'],
            commonMistakes: 'Saying "excuse" without "me". Always keep them together.',
            memoryTrick: 'Ex-cuse me. Ask for clearance to pass or ask.',
            realLifeUsage: 'Used when coughing, passing through a crowd, or asking a stranger a query.',
            easyExplanation: 'A polite phrase we say to get someone\'s attention or when passing by.'
          },
          {
            word: 'Congratulations', pronunciation: '/kənˌɡrætʃ.ʊˈleɪ.ʃənz/', partOfSpeech: 'Interjection', level: 'beginner' as const,
            englishMeaning: 'Expressions of praise for an achievement or good fortune.', hindiMeaning: 'बधाई हो',
            synonyms: ['Congrats', 'Well done'], antonyms: ['Condolences'],
            exampleSentences: ['Congratulations on passing the quiz!', 'Congratulations on your new job!'],
            commonMistakes: 'Difficult spelling. Remember the "t" in the middle: con-GRA-TU-lations.',
            memoryTrick: 'Congratulate - think of a grand rate of success.',
            realLifeUsage: 'Used during birthdays, promotions, exams, weddings, or milestones.',
            easyExplanation: 'A happy word we say to someone who has done a great job or won something.'
          }
        ],
        grammar: {
          conceptName: 'Greetings & Polite Phrases',
          explanation: 'In English, speaking politely is very important. We use "Hello" to greet, "Please" to request, "Thank you" to show gratitude, and "Sorry" to apologize. Using these words makes conversations friendly and easy.',
          examples: [
            'Hello! Good morning, sir.',
            'Please help me with this task.',
            'Thank you so much for the tea.',
            'I am sorry for the delay.'
          ],
          interactiveQuiz: [
            {
              question: 'What is a polite way to ask for water?',
              options: ['Give me water!', 'Please give me water.', 'I want water.', 'Water now.'],
              answer: 'Please give me water.',
              explanation: 'Using "Please" makes the request polite and friendly.'
            },
            {
              question: 'What do you say when you make a mistake?',
              options: ['Thank you', 'Excuse me', 'I am sorry', 'Welcome'],
              answer: 'I am sorry',
              explanation: '"I am sorry" is the correct way to apologize for a mistake.'
            }
          ]
        },
        speaking: {
          prompt: 'Greet your teacher in the morning and say thank you for the lesson.',
          sentencesToRead: [
            'Good morning, teacher.',
            'Please explain today\'s words.',
            'Thank you for this lesson.'
          ],
          helperVocabulary: ['Good morning', 'Please', 'Thank you']
        },
        listening: {
          audioPrompt: 'A simple dialogue between two friends greeting each other.',
          transcript: 'Hello, good morning! How are you? Hello, I am fine, thank you. Sorry, I must leave now. Goodbye!',
          fillInBlanks: [
            { question: 'Hello, good ____!', answer: 'morning' },
            { question: 'Goodbye, see you ____.', answer: 'later' }
          ],
          multipleChoice: [
            {
              question: 'What greeting is used in the conversation?',
              options: ['Good evening', 'Good morning', 'Good night', 'Goodbye'],
              answer: 'Good morning'
            }
          ]
        },
        writing: {
          prompt: 'Write a polite message greeting your manager and asking for help.',
          placeholder: 'Good morning, sir. Please help me with...',
          suggestedVocabulary: ['Hello', 'Please', 'Thank you']
        },
        quiz: [
          {
            id: 'q1', skillType: 'vocab',
            question: 'What is the Hindi meaning of "Thank You"?',
            options: ['नमस्ते', 'धन्यवाद', 'क्षमा करें', 'स्वागत है'],
            answer: 'धन्यवाद', explanation: '"Thank You" translates to "धन्यवाद" in Hindi.'
          },
          {
            id: 'q2', skillType: 'vocab',
            question: 'Which word is used to say goodbye politely?',
            options: ['Hello', 'Goodbye', 'Please', 'Sorry'],
            answer: 'Goodbye', explanation: 'Goodbye is used when leaving or parting.'
          },
          {
            id: 'q3', skillType: 'grammar',
            question: 'Complete the sentence: "____, can you help me find the table?"',
            options: ['Hello', 'Excuse me', 'Sorry', 'Welcome'],
            answer: 'Excuse me', explanation: 'Use "Excuse me" to get attention politely.'
          },
          {
            id: 'q4', skillType: 'grammar',
            question: 'Complete: "Here is your coffee." - "____."',
            options: ['Sorry', 'Please', 'Thank you', 'Goodbye'],
            answer: 'Thank you', explanation: 'Say "Thank you" when someone gives you something.'
          },
          {
            id: 'q5', skillType: 'listening',
            question: 'In the conversation, what did the friend apologize for having to do?',
            options: ['Arriving late', 'Forgetting the book', 'Having to leave now', 'Spilling the coffee'],
            answer: 'Having to leave now', explanation: 'The speaker says: "Sorry, I must leave now."'
          }
        ]
      }
    ];

    // Syllabus list for remaining days
    const syllabusList = [
      { name: 'Introducing Yourself', vocab: 'Introduction', concept: 'Subject Pronouns (I, You, He, She, It)' },
      { name: 'Talking About Family', vocab: 'Family', concept: 'Verb "to be" (am, is, are)' },
      { name: 'Shopping for Clothes', vocab: 'Shopping', concept: 'Possessive Adjectives (my, your, his, her)' },
      { name: 'At the Restaurant', vocab: 'Restaurant', concept: 'Singular & Plural Nouns (a book, books)' },
      { name: 'Asking for Directions', vocab: 'Directions', concept: 'This, That, These, Those' },
      { name: 'Hobbies and Free Time', vocab: 'Hobbies', concept: 'Basic Action Verbs (run, eat, sleep)' },
      { name: 'Work and Daily Routines', vocab: 'Work', concept: 'Simple Present Tense (habits)' },
      { name: 'Weather and Clothes', vocab: 'Weather', concept: 'Present Continuous (happening now)' },
      { name: 'Health and Doctor visits', vocab: 'Health', concept: 'Adjectives (describing colors, sizes)' },
      { name: 'Making Appointments', vocab: 'Appointments', concept: 'Prepositions of Place (in, on, at)' },
      { name: 'Phone Conversations', vocab: 'Phone', concept: 'Question Words (Who, What, Where, When, Why)' },
      { name: 'Travel and Booking', vocab: 'Travel', concept: 'Simple Past of "to be" (was, were)' },
      { name: 'Emergency Expressions', vocab: 'Emergency', concept: 'Can & Can\'t (Ability)' },
      { name: 'Graduation Ceremony', vocab: 'Graduation', concept: 'Future with "going to" (plans)' }
    ];

    for (let d = 2; d <= 15; d++) {
      const syllabus = syllabusList[d - 2];
      
      const dayVocab = [
        { word: `WordA${d}`, pronunciation: '/wɜːd eɪ/', partOfSpeech: 'Noun', level: 'beginner' as const, englishMeaning: `A useful word related to ${syllabus.vocab}.`, hindiMeaning: `अर्थ ${d}`, synonyms: ['Word', 'Term'], antonyms: ['Silence'], exampleSentences: [`Let us use WordA${d} in a sentence.`, `This is WordA${d}.`], commonMistakes: 'None.', memoryTrick: 'Practice daily.', realLifeUsage: 'Daily dialogue', easyExplanation: `A simple word used when discussing ${syllabus.name}.` },
        { word: `WordB${d}`, pronunciation: '/wɜːd biː/', partOfSpeech: 'Noun', level: 'beginner' as const, englishMeaning: `Another useful word for ${syllabus.vocab}.`, hindiMeaning: `अर्थ ${d}`, synonyms: ['Word', 'Term'], antonyms: ['Silence'], exampleSentences: [`Let us use WordB${d} in a sentence.`, `This is WordB${d}.`], commonMistakes: 'None.', memoryTrick: 'Practice daily.', realLifeUsage: 'Daily dialogue', easyExplanation: `Another simple word used when discussing ${syllabus.name}.` },
        { word: `WordC${d}`, pronunciation: '/wɜːd siː/', partOfSpeech: 'Noun', level: 'beginner' as const, englishMeaning: `A helpful word for ${syllabus.vocab}.`, hindiMeaning: `अर्थ ${d}`, synonyms: ['Word', 'Term'], antonyms: ['Silence'], exampleSentences: [`Let us use WordC${d} in a sentence.`, `This is WordC${d}.`], commonMistakes: 'None.', memoryTrick: 'Practice daily.', realLifeUsage: 'Daily dialogue', easyExplanation: `A helpful word used when discussing ${syllabus.name}.` },
        { word: `WordD${d}`, pronunciation: '/wɜːd diː/', partOfSpeech: 'Noun', level: 'beginner' as const, englishMeaning: `A basic word for ${syllabus.vocab}.`, hindiMeaning: `अर्थ ${d}`, synonyms: ['Word', 'Term'], antonyms: ['Silence'], exampleSentences: [`Let us use WordD${d} in a sentence.`], commonMistakes: 'None.', memoryTrick: 'Practice daily.', realLifeUsage: 'Daily dialogue', easyExplanation: `A basic word used when discussing ${syllabus.name}.` },
        { word: `WordE${d}`, pronunciation: '/wɜːd iː/', partOfSpeech: 'Noun', level: 'beginner' as const, englishMeaning: `A primary word for ${syllabus.vocab}.`, hindiMeaning: `अर्थ ${d}`, synonyms: ['Word', 'Term'], antonyms: ['Silence'], exampleSentences: [`Let us use WordE${d} in a sentence.`], commonMistakes: 'None.', memoryTrick: 'Practice daily.', realLifeUsage: 'Daily dialogue', easyExplanation: `A primary word used when discussing ${syllabus.name}.` },
        { word: `WordF${d}`, pronunciation: '/wɜːd ef/', partOfSpeech: 'Noun', level: 'beginner' as const, englishMeaning: `An essential word for ${syllabus.vocab}.`, hindiMeaning: `अर्थ ${d}`, synonyms: ['Word', 'Term'], antonyms: ['Silence'], exampleSentences: [`Let us use WordF${d} in a sentence.`], commonMistakes: 'None.', memoryTrick: 'Practice daily.', realLifeUsage: 'Daily dialogue', easyExplanation: `An essential word used when discussing ${syllabus.name}.` },
        { word: `WordG${d}`, pronunciation: '/wɜːd dʒiː/', partOfSpeech: 'Noun', level: 'beginner' as const, englishMeaning: `A simple expression for ${syllabus.vocab}.`, hindiMeaning: `अर्थ ${d}`, synonyms: ['Word', 'Term'], antonyms: ['Silence'], exampleSentences: [`Let us use WordG${d} in a sentence.`], commonMistakes: 'None.', memoryTrick: 'Practice daily.', realLifeUsage: 'Daily dialogue', easyExplanation: `A simple expression used when discussing ${syllabus.name}.` },
        { word: `WordH${d}`, pronunciation: '/wɜːd eɪtʃ/', partOfSpeech: 'Noun', level: 'beginner' as const, englishMeaning: `A common word for ${syllabus.vocab}.`, hindiMeaning: `अर्थ ${d}`, synonyms: ['Word', 'Term'], antonyms: ['Silence'], exampleSentences: [`Let us use WordH${d} in a sentence.`], commonMistakes: 'None.', memoryTrick: 'Practice daily.', realLifeUsage: 'Daily dialogue', easyExplanation: `A common word used when discussing ${syllabus.name}.` },
        { word: `WordI${d}`, pronunciation: '/wɜːd aɪ/', partOfSpeech: 'Noun', level: 'beginner' as const, englishMeaning: `A conversational word for ${syllabus.vocab}.`, hindiMeaning: `अर्थ ${d}`, synonyms: ['Word', 'Term'], antonyms: ['Silence'], exampleSentences: [`Let us use WordI${d} in a sentence.`], commonMistakes: 'None.', memoryTrick: 'Practice daily.', realLifeUsage: 'Daily dialogue', easyExplanation: `A conversational word used when discussing ${syllabus.name}.` },
        { word: `WordJ${d}`, pronunciation: '/wɜːd dʒeɪ/', partOfSpeech: 'Noun', level: 'beginner' as const, englishMeaning: `A final vocabulary word for ${syllabus.vocab}.`, hindiMeaning: `अर्थ ${d}`, synonyms: ['Word', 'Term'], antonyms: ['Silence'], exampleSentences: [`Let us use WordJ${d} in a sentence.`], commonMistakes: 'None.', memoryTrick: 'Practice daily.', realLifeUsage: 'Daily dialogue', easyExplanation: `A vocabulary word used when discussing ${syllabus.name}.` }
      ];

      const daySeed: Partial<IChallengeDay> = {
        dayNumber: d,
        vocabulary: dayVocab,
        grammar: {
          conceptName: `${syllabus.name} & ${syllabus.concept}`,
          explanation: `Let us focus on ${syllabus.name} today. We will learn how to use ${syllabus.concept} in simple English phrases.`,
          examples: [
            `Example: "This is correct for ${syllabus.name}."`,
            `Example: "We can practice speaking now."`
          ],
          interactiveQuiz: [
            {
              question: `Identify the sentence that relates to ${syllabus.name}:`,
              options: [
                `Let us talk about ${syllabus.name}.`,
                'I am buying a server.',
                'The query runs fast.',
                'Restart the computer.'
              ],
              answer: `Let us talk about ${syllabus.name}.`,
              explanation: `This sentence focuses on today's communication topic: ${syllabus.name}.`
            }
          ]
        },
        speaking: {
          prompt: `Greet your friend and talk about ${syllabus.name}.`,
          sentencesToRead: [
            `I want to speak about ${syllabus.name}.`,
            `This helps me practice ${syllabus.concept}.`,
            'I am learning English step by step.'
          ],
          helperVocabulary: [`WordA${d}`, `WordB${d}`, 'Practice']
        },
        listening: {
          audioPrompt: `A dialog regarding ${syllabus.name}.`,
          transcript: `Hello. Let us discuss ${syllabus.name} today. We need to practice ${syllabus.concept} together. Yes, that is a great plan.`,
          fillInBlanks: [
            { question: `Let us discuss ____ today.`, answer: syllabus.name.toLowerCase() }
          ],
          multipleChoice: [
            {
              question: `What are they discussing today?`,
              options: ['Weather forecasts', syllabus.name, 'Technical servers', 'Database indexes'],
              answer: syllabus.name
            }
          ]
        },
        writing: {
          prompt: `Write 1 sentence describing ${syllabus.name} using ${dayVocab[0].word}.`,
          placeholder: `Type here...`,
          suggestedVocabulary: [dayVocab[0].word, dayVocab[1].word]
        },
        quiz: [
          {
            id: 'q1', skillType: 'vocab',
            question: `What is a synonym of "${dayVocab[0].word}"?`,
            options: ['Word', 'Silence', 'Slow walk', 'Printer'],
            answer: 'Word', explanation: `A synonym of ${dayVocab[0].word} is Word.`
          },
          {
            id: 'q2', skillType: 'grammar',
            question: `Complete the sentence: "We are discussing ____ today."`,
            options: [syllabus.name, 'yesterday', 'servers', 'compilers'],
            answer: syllabus.name, explanation: 'This matches the context of today\'s theme.'
          },
          {
            id: 'q3', skillType: 'listening',
            question: 'What do they want to do together?',
            options: ['Practice speaking', 'Play a game', 'Read a story', 'Go home'],
            answer: 'Practice speaking', explanation: 'They want to practice oral English together.'
          },
          {
            id: 'q4', skillType: 'reading',
            question: `Identify the main focus of Day ${d}:`,
            options: [syllabus.name, 'Tenses', 'Prepositions', 'Articles'],
            answer: syllabus.name, explanation: 'The main topic is ' + syllabus.name
          },
          {
            id: 'q5', skillType: 'speaking',
            question: 'Which skill uses your voice microphone?',
            options: ['Reading', 'Writing', 'Speaking', 'Listening'],
            answer: 'Speaking', explanation: 'Speaking involves recording your voice.'
          }
        ]
      };

      daysContent.push(daySeed);
    }

    for (const item of daysContent) {
      await dbService.challengeDays.create(item);
    }

    console.log(`✅ Seeded ${daysContent.length} challenge days.`);
  } catch (error) {
    console.error('❌ Failed to seed challenge days:', error);
  }
}
