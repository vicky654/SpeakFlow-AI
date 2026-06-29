import bcrypt from 'bcryptjs';
import { dbService } from './dbService';
import { ILesson } from '../models/Lesson';

export async function seedInitialData() {
  try {
    // 1. Seed Users if empty
    const users = await dbService.users.getAll();
    if (users.length === 0) {
      console.log('🌱 Database is empty. Seeding initial users...');
      const salt = await bcrypt.genSalt(10);
      const adminPass = await bcrypt.hash('adminpassword', salt);
      const studentPass = await bcrypt.hash('studentpassword', salt);

      // Seed Admin
      await dbService.users.create({
        name: 'SpeakFlow Admin',
        email: 'admin@speakflow.com',
        passwordHash: adminPass,
        role: 'admin',
        xp: 350,
        coins: 80,
        streak: 10,
        level: 4,
        badges: ['Scholar', 'Orator', 'Daily Champion'],
        favorites: [],
        completedLessons: [],
        lastActive: new Date().toISOString().split('T')[0]
      });

      // Seed Student
      await dbService.users.create({
        name: 'John Doe',
        email: 'student@speakflow.com',
        passwordHash: studentPass,
        role: 'student',
        xp: 120,
        coins: 14,
        streak: 3,
        level: 2,
        badges: ['Vocab Starter'],
        favorites: [],
        completedLessons: [],
        lastActive: new Date().toISOString().split('T')[0]
      });
      console.log('✅ Users seeded: admin@speakflow.com (adminpassword), student@speakflow.com (studentpassword)');
    }

    // 2. Seed Vocabulary Words if empty
    const vocabs = await dbService.vocab.getAll();
    if (vocabs.length === 0) {
      console.log('🌱 Seeding vocabulary data...');
      
      const vocabList = [
        {
          word: 'Confident',
          pronunciation: '/ˈkɒnfɪdənt/',
          partOfSpeech: 'Adjective',
          englishMeaning: 'Feeling or showing self-assurance and belief in one\'s own abilities.',
          hindiMeaning: 'आत्मविश्वासी',
          synonyms: ['Bold', 'Self-assured', 'Fearless', 'Assertive'],
          antonyms: ['Shy', 'Nervous', 'Apprehensive', 'Timid'],
          exampleSentences: [
            'She is confident during interview panels.',
            'He spoke in a confident voice to the clients.'
          ],
          commonMistakes: 'Don\'t confuse "confident" (sure of self) with "confidant" (a close friend to share secrets with).',
          memoryTrick: 'Break it into "Con" + "Fi" (fidelity/trust) + "Dent". Think of a confident dentist who has full trust in fixing your teeth.',
          realLifeUsage: 'Used extensively in professional workplaces, performance reviews, self-help books, and job interview settings.',
          audioUrl: ''
        },
        {
          word: 'Resilience',
          pronunciation: '/rɪˈzɪlɪəns/',
          partOfSpeech: 'Noun',
          englishMeaning: 'The capacity to recover quickly from difficulties; toughness.',
          hindiMeaning: 'लचीलापन',
          synonyms: ['Toughness', 'Flexibility', 'Adaptability', 'Grit'],
          antonyms: ['Fragility', 'Vulnerability', 'Weakness', 'Rigidity'],
          exampleSentences: [
            'Nylon is notable for its durability and resilience.',
            'The team showed great resilience after losing the first game.'
          ],
          commonMistakes: 'Do not write "resiliance" with an "a". It is always spelled with an "e" - "resilience".',
          memoryTrick: 'Sounds like "re-silence". When obstacles make noise, you recover quickly to find your calm silence again.',
          realLifeUsage: 'Discussed during team retro meetings, career growth reviews, and psychological discussions on stress management.',
          audioUrl: ''
        },
        {
          word: 'Eloquent',
          pronunciation: '/ˈɛləkwənt/',
          partOfSpeech: 'Adjective',
          englishMeaning: 'Fluent or persuasive in speaking or writing.',
          hindiMeaning: 'सुवक्ता / वाक्पटु',
          synonyms: ['Articulate', 'Expressive', 'Persuasive', 'Fluent'],
          antonyms: ['Inarticulate', 'Stuttering', 'Silent', 'Mumbled'],
          exampleSentences: [
            'His eloquent speech moved the audience to tears.',
            'An eloquent email can secure deals faster.'
          ],
          commonMistakes: 'Avoid pronouncing it as "elo-cunt". The correct pronunciation ends with a soft "kwent".',
          memoryTrick: 'Think of "Elephant speech" - an elephant speaking so beautifully that everyone listens in awe.',
          realLifeUsage: 'Used to describe great speakers, politicians, writers, or well-written emails and proposals.',
          audioUrl: ''
        },
        {
          word: 'Procrastinate',
          pronunciation: '/prəʊˈkræstɪneɪt/',
          partOfSpeech: 'Verb',
          englishMeaning: 'Delay or postpone action; put off doing something.',
          hindiMeaning: 'टालमटोल करना',
          synonyms: ['Delay', 'Postpone', 'Dither', 'Linger'],
          antonyms: ['Accelerate', 'Expedite', 'Advance', 'Hasten'],
          exampleSentences: [
            'If you procrastinate, you will miss the assignment deadline.',
            'I always procrastinate when it comes to cleaning the room.'
          ],
          commonMistakes: 'Often misspelled as "procrastnate". Do not miss the "i" after "t".',
          memoryTrick: 'Pro-crast-inate. "Pro" at putting things off until "tomorrow" (crust/tomorrow in Latin).',
          realLifeUsage: 'Often used when discussing time management, study habits, workflow struggles, and productivity.',
          audioUrl: ''
        },
        {
          word: 'Pragmatic',
          pronunciation: '/præɡˈmætɪk/',
          partOfSpeech: 'Adjective',
          englishMeaning: 'Dealing with things sensibly and realistically in a way that is based on practical considerations.',
          hindiMeaning: 'व्यवहारिक',
          synonyms: ['Practical', 'Realistic', 'Sensible', 'Hard-headed'],
          antonyms: ['Idealistic', 'Impractical', 'Visionary', 'Unrealistic'],
          exampleSentences: [
            'We need a pragmatic solution, not a theoretical lecture.',
            'He made a pragmatic decision to compromise.'
          ],
          commonMistakes: 'Do not confuse with "dogmatic" which means adhering strictly to principles.',
          memoryTrick: 'Pragmatic sounds like "practical magic". Practical actions work like magic.',
          realLifeUsage: 'Commonly used in executive business discussions, technical scoping, and everyday planning.',
          audioUrl: ''
        }
      ];

      for (const item of vocabList) {
        await dbService.vocab.create(item);
      }
      console.log(`✅ Seeded ${vocabList.length} vocabulary words.`);
    }

    // 3. Seed Grammar Lessons if empty
    const grammarLessons = await dbService.lessons.getByType('grammar');
    if (grammarLessons.length === 0) {
      console.log('🌱 Seeding grammar course content...');
      
      const lessons: Partial<ILesson>[] = [
        {
          type: 'grammar',
          title: 'Mastering English Tenses',
          category: 'Tenses',
          content: `
# Mastering English Tenses

Tenses denote the time of action. In English, there are three primary tenses, each divided into four sub-aspects (Simple, Continuous, Perfect, and Perfect Continuous).

### 1. Present Tense
- **Present Simple**: Used for habits, general facts, and timetables. 
  - *Formula*: Subject + Verb(s/es) + Object.
  - *Example*: *"She writes code every day."*
- **Present Continuous**: Action happening right now.
  - *Formula*: Subject + is/am/are + Verb(ing) + Object.
  - *Example*: *"We are practicing English speaking."*

### 2. Past Tense
- **Past Simple**: Completed action in the past.
  - *Formula*: Subject + Verb(2nd form) + Object.
  - *Example*: *"They designed the landing page yesterday."*

### 3. Future Tense
- **Future Simple**: Action to happen hereafter.
  - *Formula*: Subject + will + Verb(1st form) + Object.
  - *Example*: *"You will speak English fluently."*
`,
          metadata: {
            questions: [
              {
                id: 'q1',
                question: 'Which sentence is in the Present Perfect tense?',
                options: [
                  'She wrote a letter.',
                  'She has written a letter.',
                  'She is writing a letter.',
                  'She will write a letter.'
                ],
                answer: 'She has written a letter.',
                explanation: 'Present Perfect uses "has/have + past participle (3rd form verb)".'
              },
              {
                id: 'q2',
                question: 'Identify the sentence showing a habitual present action:',
                options: [
                  'I am eating lunch.',
                  'I went to school.',
                  'I read newspapers daily.',
                  'I will play tennis tomorrow.'
                ],
                answer: 'I read newspapers daily.',
                explanation: 'Simple present represents habits and routines, marked by "daily".'
              }
            ]
          }
        },
        {
          type: 'grammar',
          title: 'Prepositions of Time and Place',
          category: 'Prepositions',
          content: `
# Prepositions of Time and Place: In, On, At

Using "in", "on", and "at" correctly is vital for natural sounding speech. Here is a handy breakdown:

### Prepositions of Time
- **AT**: Specific point in time. (*"at 5:00 PM"*, *"at midnight"*, *"at Christmas"*)
- **ON**: Specific days and dates. (*"on Monday"*, *"on June 29th"*, *"on my birthday"*)
- **IN**: Unspecific times during a day, month, year, or century. (*"in the morning"*, *"in July"*, *"in 2026"*, *"in the 21st century"*)

### Prepositions of Place
- **AT**: Specific point or address. (*"at the office"*, *"at the bus stop"*, *"at 10 Downing Street"*)
- **ON**: Position on a surface. (*"on the table"*, *"on the floor"*, *"on the wall"*)
- **IN**: Inside an enclosed space or large geographic boundary. (*"in the room"*, *"in India"*, *"in the swimming pool"*)
`,
          metadata: {
            questions: [
              {
                id: 'q1',
                question: 'We scheduled the kickoff meeting ____ Monday ____ 10:00 AM.',
                options: [
                  'in / at',
                  'on / at',
                  'at / on',
                  'on / in'
                ],
                answer: 'on / at',
                explanation: 'We use "on" for days (Monday) and "at" for specific times (10:00 AM).'
              }
            ]
          }
        }
      ];

      for (const item of lessons) {
        await dbService.lessons.create(item);
      }
      console.log(`✅ Seeded ${lessons.length} grammar lessons.`);
    }

    // 4. Seed Reading Lessons if empty
    const readingLessons = await dbService.lessons.getByType('reading');
    if (readingLessons.length === 0) {
      console.log('🌱 Seeding reading practice stories...');
      
      const lessons: Partial<ILesson>[] = [
        {
          type: 'reading',
          title: 'The Art of Professional Email Writing',
          category: 'Office Documents',
          content: `
# The Art of Professional Email Writing

In the modern corporate world, emails are the primary medium of formal exchange. An email can establish credibility, display competence, and resolve bottleneck debates when written clearly.

### The Anatomy of a Perfect Email:
1. **Clear Subject Line**: Make it actionable. E.g., *"Urgent: Design Mockup Feedback Required"* instead of *"Hey"*.
2. **Professional Greeting**: Start with *"Hi [Name]"* or *"Dear [Name]"*. Avoid over-formal greetings like *"Respected Sir"* in modern tech organizations.
3. **The Core Request**: Put your ask in the first two sentences. Do not bury the request under long introductory paragraphs.
4. **Call to Action (CTA)**: Clearly define who needs to do what and by when.
5. **Polite Sign-off**: End with *"Best regards"*, *"Regards"*, or *"Sincerely"*, followed by your name and signature.

### Common Mistakes:
- Writing long blocks of paragraphs. Instead, use bullet points.
- Sounding passive-aggressive. Always review your tone before hitting send.
`,
          metadata: {
            questions: [
              {
                id: 'q1',
                question: 'Which of the following is the best professional email greeting in a modern workplace?',
                options: [
                  'Respected Sir',
                  'Hi James',
                  'Hey buddy',
                  'To whom it may concern'
                ],
                answer: 'Hi James',
                explanation: '"Hi James" is friendly, professional, and standard in modern business environments.'
              },
              {
                id: 'q2',
                question: 'Where should the main request of the email ideally be placed?',
                options: [
                  'In the last paragraph',
                  'Within the first two sentences',
                  'In a post-script (P.S.) note',
                  'Only in the signature space'
                ],
                answer: 'Within the first two sentences',
                explanation: 'Placing the core request early ensures the recipient sees the action item immediately.'
              }
            ]
          }
        }
      ];

      for (const item of lessons) {
        await dbService.lessons.create(item);
      }
      console.log(`✅ Seeded ${lessons.length} reading lessons.`);
    }

    // 5. Seed Listening Lessons if empty
    const listeningLessons = await dbService.lessons.getByType('listening');
    if (listeningLessons.length === 0) {
      console.log('🌱 Seeding listening practice materials...');
      
      const lessons: Partial<ILesson>[] = [
        {
          type: 'listening',
          title: 'Ordering Dinner at a Premium Restaurant',
          category: 'Daily Conversations',
          content: `
**Dialogue Transcript:**
*Waitstaff:* Good evening! Welcome to The Green Bistro. Do you have a reservation?
*Guest:* Yes, we have a table booked under the name of Miller.
*Waitstaff:* Ah, yes, Mr. Miller! A table for two by the window. Right this way.
*Guest:* Thank you. Could we see the drink menu first?
*Waitstaff:* Absolutely. Tonight, our special is a fresh mint lemonade. For the main course, I highly recommend our pan-seared salmon served with wild rice.
*Guest:* That sounds delicious. I will have the salmon, and my friend will have the vegetarian lasagna.
*Waitstaff:* Excellent choices. I will place your order and bring your drinks shortly.
`,
          metadata: {
            questions: [
              {
                id: 'q1',
                question: 'Under what name was the restaurant table booked?',
                options: [
                  'Smith',
                  'Miller',
                  'Green Bistro',
                  'Lasagna'
                ],
                answer: 'Miller',
                explanation: 'The guest mentions "we have a table booked under the name of Miller."'
              },
              {
                id: 'q2',
                question: 'What is the waiter\'s recommendation for the main course?',
                options: [
                  'Vegetarian lasagna',
                  'Mint lemonade',
                  'Pan-seared salmon with wild rice',
                  'Wild mushroom pizza'
                ],
                answer: 'Pan-seared salmon with wild rice',
                explanation: 'The waitstaff says "I highly recommend our pan-seared salmon served with wild rice."'
              }
            ]
          }
        }
      ];

      for (const item of lessons) {
        await dbService.lessons.create(item);
      }
      console.log(`✅ Seeded ${lessons.length} listening lessons.`);
    }

    // 6. Seed Interview Prep if empty
    const interviewLessons = await dbService.lessons.getByType('interview');
    if (interviewLessons.length === 0) {
      console.log('🌱 Seeding interview prep questions...');
      
      const lessons: Partial<ILesson>[] = [
        {
          type: 'interview',
          title: 'How to Answer: "Tell Me About Yourself"',
          category: 'Self Introduction',
          content: `
# Preparing "Tell Me About Yourself"

This is almost always the first question asked in any interview. It sets the tone for the entire interview.

### The "Present-Past-Future" Formula:
1. **Present**: Talk about your current role, key accomplishments, and major responsibilities. (30 seconds)
2. **Past**: Mention how you got there—mention key educational milestones or previous roles that are highly relevant to this job. (30 seconds)
3. **Future**: Explain why you are sitting here today, and why this specific role at this specific company is the perfect next step for you. (30 seconds)

### Key Rules:
- Keep it under 2 minutes.
- Do not repeat your resume line-by-line. Focus on key achievements.
- Tailor it to the job description.
`,
          metadata: {
            suggestedAnswers: [
              "I am currently a Software Engineer at TechCorp where I lead frontend development for our analytics dashboard. Over the past two years, I built our core UI component library which speeded up build times by 30%. Before this, I graduated with a degree in Computer Science and interned at a startup where I fell in love with React. I am looking for my next challenge, and I am excited about this role because your company is leading the path in interactive AI applications."
            ],
            tips: [
              "Focus on achievements rather than just naming duties.",
              "Match your vocabulary with keywords mentioned in the job post.",
              "Inject energy and smile. This is your first impression!"
            ]
          }
        },
        {
          type: 'interview',
          title: 'Answering: "What are your Strengths & Weaknesses?"',
          category: 'Strengths & Weaknesses',
          content: `
# Tackling Strengths & Weaknesses

This question tests your self-awareness, honesty, and growth mindset.

### Speaking about Strengths:
- Pick **one or two key strengths** directly listed in the job description.
- Support them with concrete proof (a short story).
- *E.g., "My main strength is problem-solving. In my last job, I identified a query bottleneck that caused page timeouts and fixed it, resolving 90% of user complaints."*

### Speaking about Weaknesses:
- Pick a **real weakness** but make sure it is not a core requirement of the job.
- Immediately explain how you are **actively working to overcome it**.
- *E.g., "Historically, I found it hard to delegate tasks because I wanted everything to be perfect. Recently, I completed a project management course and started using Trello, which helped me delegate tasks and trust my team."*
`,
          metadata: {
            suggestedAnswers: [
              "My primary strength is structured communication. I can break down complex engineering concepts for marketing and sales partners. As for weaknesses, I sometimes struggle with saying 'no' to requests, which leads to taking on too many tasks. To manage this, I now log all incoming requests and sync with my manager to prioritize tasks according to our quarterly milestones."
            ],
            tips: [
              "Never say 'I have no weaknesses' or choose a fake weakness like 'I am too much of a perfectionist'.",
              "Keep the tone positive and growth-oriented.",
              "Make sure your strengths solve the company's pain points."
            ]
          }
        }
      ];

      for (const item of lessons) {
        await dbService.lessons.create(item);
      }
      console.log(`✅ Seeded ${lessons.length} interview lessons.`);
    }

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
}
