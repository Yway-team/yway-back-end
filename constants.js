const MAX_NOTIFICATIONS = 1000;
const MAX_HISTORY = 1000;
const DEFAULT_TIME_TO_ANSWER = 10;  // seconds
const MAX_DRAFTS = 10;
const DEFAULT_BANNER_IMAGE = 'https://cse416-content.s3.us-east-2.amazonaws.com/Banner+Image.png';
const DEFAULT_AVATAR = 'https://cse416-content.s3.us-east-2.amazonaws.com/Default+avatar.png';
const DEFAULT_THUMBNAIL = 'https://cse416-content.s3.us-east-2.amazonaws.com/thumbnail.png';
const DEFAULT_PROFILE_BANNER = 'https://cse416-content.s3.us-east-2.amazonaws.com/profile+cover+photo.png';
const DEFAULT_ACHIEVEMENT_ICON = 'https://cse416-content.s3.us-east-2.amazonaws.com/img/achievements/default.png';
const REQUEST_SIZE_LIMIT = '4MB';
const { S3_BUCKET_URL } = process.env;
const CREATE_QUIZ_REWARD = 10;
// const ACHIEVEMENT_CODES = [
//     'createquiz1', 'createquiz5', 'createquiz10', 'createquiz50', 'createquiz100',
//     'createplatform1', 'createplatform5', 'createplatform10',
//     'quizzesonplatform10', 'quizzesonplatform100', 'quizzesonplatform1000',
//     'playquiz1', 'playquiz5', 'playquiz20', 'playquiz50', 'playquiz100', 'playquiz1000',
//     'streak5', 'streak10', 'streak15', 'streak20', 'streak25', 'streak50', 'streak100'
// ];
// OR
// const ACHIEVEMENTS = [
//     ...[1, 5, 10, 50, 100].map(n => `createquiz${n}`),
//     ...[1, 5, 10].map(n => `createplatform${n}`),
//     ...[10, 100, 1000].map(n => `quizzesonplatform${n}`),
//     ...[1, 5, 20, 50, 100, 1000].map(n => `playquiz${n}`),
//     ...[5, 10, 15, 20, 25, 50, 100].map(n => `streak${n}`)
// ];

// [code]: [name, description, icon (todo)]
const ACHIEVEMENTS = {
    'createquiz1': { name: 'Welcome to Yway: Created a Quiz!', description: 'Create your first quiz.', icon: `${S3_BUCKET_URL}/img/achievements/createquiz1.png`, creatorPointValue: 5, playPointValue: 0/*, count: 0, updatedAt: new Date() */ },
    'createquiz5': { name: 'Challenger of Minds', description: 'Create five quizzes.', icon: `${S3_BUCKET_URL}/img/achievements/createquiz5.png` },
    'createquiz10': { name: 'Prolific Thinker', description: 'Create ten quizzes.', icon: `${S3_BUCKET_URL}/img/achievements/createquiz10.png` },
    'createquiz50': { name: 'Font of Knowledge', description: 'Create fifty quizzes.', icon: `${S3_BUCKET_URL}/img/achievements/createquiz50.png` },
    'createquiz100': { name: 'Knower of the Unknown', description: 'Create a hundred quizzes.', icon: `${S3_BUCKET_URL}/img/achievements/createquiz100.png` },
    
    'createplatform1': { name: 'Welcome to Yway: Created a Platform!', description: 'Create your first platform.', icon: `${S3_BUCKET_URL}/img/achievements/createplatform1.png` },
    'createplatform5': { name: 'Many Interests', description: 'Create five platforms.', icon: `${S3_BUCKET_URL}/img/achievements/createplatform5.png` },
    'createplatform10': { name: 'Patron of Knowledge', description: 'Create ten platforms.', icon: `${S3_BUCKET_URL}/img/achievements/createplatform10.png` },

    'quizzesonplatform10': { name: 'Humble Hub', description: 'Have ten quizzes on your platform.', icon: `${S3_BUCKET_URL}/img/achievements/quizzesonplatform10.png` },
    'quizzesonplatform100': { name: 'Sagacious City', description: 'Have a hundred quizzes on your platform.', icon: `${S3_BUCKET_URL}/img/achievements/quizzesonplatform100.png` },
    'quizzesonplatform1000': { name: 'Enlightened Empire', description: 'Have a thousand quizzes on your platform.', icon: `${S3_BUCKET_URL}/img/achievements/quizzesonplatform1000.png` },

    'playquiz1': { name: 'Welcome to Yway: Played a Quiz!', description: 'Play your first quiz.', icon: `${S3_BUCKET_URL}/img/achievements/playquiz1.png` },
    'playquiz5': { name: 'Just Getting Started', description: 'Play five quizzes.', icon: `${S3_BUCKET_URL}/img/achievements/playquiz5.png` },
    'playquiz20': { name: 'Getting the Hang of It', description: 'Play twenty quizzes.', icon: `${S3_BUCKET_URL}/img/achievements/playquiz20.png` },
    'playquiz50': { name: 'Fact Fancier', description: 'Play fifty quizzes.', icon: `${S3_BUCKET_URL}/img/achievements/playquiz50.png` },
    'playquiz100': { name: 'Proper Polymath', description: 'Play a hundred quizzes.', icon: `${S3_BUCKET_URL}/img/achievements/playquiz100.png` },
    'playquiz1000': { name: 'Singular Sage', description: 'Play a thousand quizzes.', icon: `${S3_BUCKET_URL}/img/achievements/playquiz1000.png` },

    'streak5': { name: '5 Question Streak', description: 'Keep it going!', icon: `${S3_BUCKET_URL}/img/achievements/streak5.png` },
    'streak10': { name: '10 Question Streak', description: 'Didn\'t even break a sweat.', icon: `${S3_BUCKET_URL}/img/achievements/streak10.png` },
    'streak15': { name: '15 Question Streak', description: 'Not bad. Not bad at all.', icon: `${S3_BUCKET_URL}/img/achievements/streak15.png` },
    'streak20': { name: '20 Question Streak', description: 'You know, some of the options are incorrect.', icon: `${S3_BUCKET_URL}/img/achievements/streak20.png` },
    'streak25': { name: '25 Question Streak', description: 'You\'re unstoppable!', icon: `${S3_BUCKET_URL}/img/achievements/streak25.png` },
    'streak50': { name: '50 Question Streak', description: 'How are you doing this?', icon: `${S3_BUCKET_URL}/img/achievements/streak50.png` },
    'streak100': { name: '100 Question Streak', description: 'Is this even possible?', icon: `${S3_BUCKET_URL}/img/achievements/streak100.png` }
};

module.exports = { MAX_NOTIFICATIONS, MAX_HISTORY, DEFAULT_TIME_TO_ANSWER, MAX_DRAFTS, DEFAULT_BANNER_IMAGE, DEFAULT_AVATAR, DEFAULT_THUMBNAIL, DEFAULT_PROFILE_BANNER, REQUEST_SIZE_LIMIT, ACHIEVEMENTS, CREATE_QUIZ_REWARD };
