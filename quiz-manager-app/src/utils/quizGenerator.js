
export const QUESTION_TYPES = {
  MULTIPLE_CHOICE: 'MULTIPLE_CHOICE',
  TRUE_FALSE: 'TRUE_FALSE',
  MULTIPLE_ANSWER: 'MULTIPLE_ANSWER',
  SHORT_ANSWER: 'SHORT_ANSWER',
};

export const DIFFICULTY_LEVELS = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
};

export const DEFAULT_CATEGORIES = [
  'Programming',
  'Mathematics',
  'Science',
  'History',
  'Languages',
  'Art',
  'Business',
  'Technology',
  'General Knowledge',
  'Sports',
  'Entertainment',
  'Geography',
];

/**
 * Génère un quiz aléatoire
 * @param {string} category - Catégorie du quiz
 * @param {number} numberOfQuestions - Nombre de questions
 * @param {string} difficulty - Niveau de difficulté
 * @returns {Object} Quiz généré
 */
export const generateRandomQuiz = (category, numberOfQuestions = 10, difficulty = 'Intermediate') => {
  const quiz = {
    title: `Quiz Aléatoire - ${category}`,
    description: `Quiz généré automatiquement sur le thème de ${category}. ${numberOfQuestions} questions de niveau ${difficulty}.`,
    category,
    timeLimit: 30,
    passingScore: 70,
    isPublished: false,
    isRandomized: true,
    maxQuestions: numberOfQuestions,
    questions: [],
  };

  for (let i = 0; i < numberOfQuestions; i++) {
    const question = generateRandomQuestion(category, difficulty, i + 1);
    quiz.questions.push(question);
  }

  return quiz;
};

/**
 * Génère une question aléatoire
 * @param {string} category - Catégorie de la question
 * @param {string} difficulty - Niveau de difficulté
 * @param {number} questionNumber - Numéro de la question
 * @returns {Object} Question générée
 */
const generateRandomQuestion = (category, difficulty, questionNumber) => {
  const questionTypes = Object.values(QUESTION_TYPES);
  const type = questionTypes[Math.floor(Math.random() * questionTypes.length)];
  
  let question;
  
  switch (type) {
    case QUESTION_TYPES.MULTIPLE_CHOICE:
      question = generateMultipleChoiceQuestion(category, difficulty, questionNumber);
      break;
    case QUESTION_TYPES.TRUE_FALSE:
      question = generateTrueFalseQuestion(category, difficulty, questionNumber);
      break;
    case QUESTION_TYPES.MULTIPLE_ANSWER:
      question = generateMultipleAnswerQuestion(category, difficulty, questionNumber);
      break;
    case QUESTION_TYPES.SHORT_ANSWER:
      question = generateShortAnswerQuestion(category, difficulty, questionNumber);
      break;
    default:
      question = generateMultipleChoiceQuestion(category, difficulty, questionNumber);
  }

  return question;
};

/**
 * Génère une question à choix multiple
 */
const generateMultipleChoiceQuestion = (category, difficulty, questionNumber) => {
  const points = getPointsByDifficulty(difficulty);
  const numberOfOptions = 4;
  
  const options = [];
  const correctOptionIndex = Math.floor(Math.random() * numberOfOptions);
  
  for (let i = 0; i < numberOfOptions; i++) {
    options.push({
      id: Date.now() + i,
      text: generateOptionText(category, difficulty, i),
      isCorrect: i === correctOptionIndex,
      order: i + 1,
    });
  }

  return {
    id: Date.now() + questionNumber,
    text: `Question ${questionNumber}: ${generateQuestionText(category, difficulty)}`,
    category,
    points,
    type: QUESTION_TYPES.MULTIPLE_CHOICE,
    explanation: generateExplanation(category, difficulty),
    options,
  };
};

/**
 * Génère une question vrai/faux
 */
const generateTrueFalseQuestion = (category, difficulty, questionNumber) => {
  const points = getPointsByDifficulty(difficulty);
  const isTrue = Math.random() > 0.5;

  return {
    id: Date.now() + questionNumber,
    text: `Question ${questionNumber}: ${generateQuestionText(category, difficulty)}`,
    category,
    points,
    type: QUESTION_TYPES.TRUE_FALSE,
    explanation: generateExplanation(category, difficulty),
    options: [
      {
        id: Date.now() + 1,
        text: 'Vrai',
        isCorrect: isTrue,
        order: 1,
      },
      {
        id: Date.now() + 2,
        text: 'Faux',
        isCorrect: !isTrue,
        order: 2,
      },
    ],
  };
};


const generateMultipleAnswerQuestion = (category, difficulty, questionNumber) => {
  const points = getPointsByDifficulty(difficulty) * 2; 
  const numberOfOptions = 5;
  const numberOfCorrectAnswers = 2 + Math.floor(Math.random() * 2); 
  
  const options = [];
  const correctIndices = new Set();
  
  while (correctIndices.size < numberOfCorrectAnswers) {
    correctIndices.add(Math.floor(Math.random() * numberOfOptions));
  }
  
  for (let i = 0; i < numberOfOptions; i++) {
    options.push({
      id: Date.now() + i,
      text: generateOptionText(category, difficulty, i),
      isCorrect: correctIndices.has(i),
      order: i + 1,
    });
  }

  return {
    id: Date.now() + questionNumber,
    text: `Question ${questionNumber}: ${generateQuestionText(category, difficulty)} (sélectionnez toutes les bonnes réponses)`,
    category,
    points,
    type: QUESTION_TYPES.MULTIPLE_ANSWER,
    explanation: generateExplanation(category, difficulty),
    options,
  };
};

const generateShortAnswerQuestion = (category, difficulty, questionNumber) => {
  const points = getPointsByDifficulty(difficulty);

  return {
    id: Date.now() + questionNumber,
    text: `Question ${questionNumber}: ${generateQuestionText(category, difficulty)}`,
    category,
    points,
    type: QUESTION_TYPES.SHORT_ANSWER,
    explanation: generateExplanation(category, difficulty),
    options: [
      {
        id: Date.now() + 1,
        text: generateShortAnswer(category, difficulty),
        isCorrect: true,
        order: 1,
      },
    ],
  };
};

/**
 * Génère un texte de question basé sur la catégorie et la difficulté
 */
const generateQuestionText = (category, difficulty) => {
  const questions = {
    Programming: [
      "Quelle est la différence entre 'let' et 'var' en JavaScript?",
      "Qu'est-ce qu'une closure en programmation?",
      "Expliquez le principe d'héritage en POO.",
      "Qu'est-ce que le polymorphisme?",
      "Comment fonctionne l'asynchrone en JavaScript?",
    ],
    Mathematics: [
      "Calculez la dérivée de f(x) = x² + 3x + 2.",
      "Qu'est-ce qu'une matrice carrée?",
      "Résolvez l'équation: 2x + 5 = 15",
      "Définissez le théorème de Pythagore.",
      "Qu'est-ce qu'un nombre premier?",
    ],
    Science: [
      "Quelles sont les trois lois de Newton?",
      "Expliquez la photosynthèse.",
      "Qu'est-ce qu'un atome?",
      "Décrivez le système solaire.",
      "Quelle est la différence entre vitesse et accélération?",
    ],
  };

  const categoryQuestions = questions[category] || questions.Programming;
  return categoryQuestions[Math.floor(Math.random() * categoryQuestions.length)];
};

/**
 * Génère un texte d'option
 */
const generateOptionText = (category, difficulty, index) => {
  const options = {
    Programming: [
      "Aucune différence",
      "let a une portée de bloc, var a une portée de fonction",
      "var est plus récent que let",
      "let est utilisé pour les constantes",
      "Les deux sont identiques",
    ],
    Mathematics: [
      "x² + 3",
      "2x + 3",
      "3x² + 2",
      "x + 3",
      "2x + 5",
    ],
    Science: [
      "Lois de la thermodynamique",
      "Lois du mouvement",
      "Lois de l'électricité",
      "Lois de la gravité",
      "Lois de la relativité",
    ],
  };

  const categoryOptions = options[category] || options.Programming;
  return categoryOptions[index] || `Option ${index + 1}`;
};

/**
 * Génère une réponse courte
 */
const generateShortAnswer = (category, difficulty) => {
  const answers = {
    Programming: "Une closure est une fonction qui a accès aux variables de sa portée parente même après que la fonction parente ait terminé son exécution.",
    Mathematics: "La dérivée de f(x) = x² + 3x + 2 est f'(x) = 2x + 3.",
    Science: "Les trois lois de Newton sont: 1) Inertie, 2) F=ma, 3) Action-réaction.",
  };

  return answers[category] || "Réponse courte générée.";
};

/**
 * Génère une explication
 */
const generateExplanation = (category, difficulty) => {
  const explanations = {
    Programming: "Cette question teste votre compréhension des concepts fondamentaux de la programmation. La bonne réponse démontre une maîtrise du sujet.",
    Mathematics: "La solution requiert l'application des principes mathématiques de base. Assurez-vous de comprendre chaque étape du raisonnement.",
    Science: "Cette explication clarifie le concept scientifique abordé dans la question. Revoir les principes fondamentaux peut être utile.",
  };

  return explanations[category] || "Explication générée pour cette question.";
};

/**
 * Détermine les points basés sur la difficulté
 */
const getPointsByDifficulty = (difficulty) => {
  switch (difficulty) {
    case DIFFICULTY_LEVELS.BEGINNER:
      return 5;
    case DIFFICULTY_LEVELS.INTERMEDIATE:
      return 10;
    case DIFFICULTY_LEVELS.ADVANCED:
      return 15;
    default:
      return 10;
  }
};

/**
 * Mélange un tableau (algorithme de Fisher-Yates)
 * @param {Array} array - Tableau à mélanger
 * @returns {Array} Tableau mélangé
 */
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Calcule le score d'un quiz
 * @param {Array} questions - Questions du quiz
 * @param {Object} userAnswers - Réponses de l'utilisateur
 * @returns {Object} Score et statistiques
 */
export const calculateScore = (questions, userAnswers) => {
  let totalScore = 0;
  let totalPoints = 0;
  let correctAnswers = 0;
  const detailedResults = [];

  questions.forEach((question, index) => {
    totalPoints += question.points;
    const userAnswer = userAnswers[question.id];
    let isCorrect = false;
    let pointsEarned = 0;

    if (question.type === QUESTION_TYPES.MULTIPLE_ANSWER) {
      const correctOptions = question.options.filter(opt => opt.isCorrect).map(opt => opt.id);
      const userSelected = Array.isArray(userAnswer) ? userAnswer : [];
      
      if (correctOptions.length > 0 && 
          correctOptions.every(id => userSelected.includes(id)) &&
          userSelected.every(id => correctOptions.includes(id))) {
        isCorrect = true;
        pointsEarned = question.points;
        totalScore += question.points;
        correctAnswers++;
      }
    } else if (question.type === QUESTION_TYPES.SHORT_ANSWER) {
     
      if (userAnswer && userAnswer.trim().length > 0) {
        isCorrect = true;
        pointsEarned = question.points;
        totalScore += question.points;
        correctAnswers++;
      }
    } else {
      const correctOption = question.options.find(opt => opt.isCorrect);
      if (correctOption && userAnswer === correctOption.id) {
        isCorrect = true;
        pointsEarned = question.points;
        totalScore += question.points;
        correctAnswers++;
      }
    }

    detailedResults.push({
      questionNumber: index + 1,
      question: question.text,
      userAnswer: userAnswer || 'Non répondue',
      correctAnswer: question.type === QUESTION_TYPES.MULTIPLE_ANSWER
        ? question.options.filter(opt => opt.isCorrect).map(opt => opt.text).join(', ')
        : question.options.find(opt => opt.isCorrect)?.text || '',
      isCorrect,
      pointsEarned,
      totalPoints: question.points,
      explanation: question.explanation,
    });
  });

  const percentage = totalPoints > 0 ? (totalScore / totalPoints) * 100 : 0;

  return {
    score: totalScore,
    totalPoints,
    percentage,
    correctAnswers,
    totalQuestions: questions.length,
    detailedResults,
  };
};

/**
 * Formate le temps en minutes:secondes
 * @param {number} seconds - Temps en secondes
 * @returns {string} Temps formaté
 */
export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Génère une couleur basée sur un score
 * @param {number} percentage - Pourcentage du score
 * @returns {string} Code couleur hexadécimal
 */
export const getScoreColor = (percentage) => {
  if (percentage >= 80) return '#34C759';
  if (percentage >= 60) return '#FF9500';
  if (percentage >= 40) return '#FFCC00';
  return '#FF3B30';
};

/**
 * Génère un message basé sur un score
 * @param {number} percentage - Pourcentage du score
 * @returns {string} Message d'encouragement
 */
export const getScoreMessage = (percentage) => {
  if (percentage >= 90) return 'Excellent! 🎉';
  if (percentage >= 80) return 'Très bien! 👏';
  if (percentage >= 70) return 'Bon travail! 👍';
  if (percentage >= 60) return 'Pas mal! 😊';
  if (percentage >= 50) return 'Peut mieux faire 💪';
  return 'Continue à apprendre! 📚';
};

export default {
  QUESTION_TYPES,
  DIFFICULTY_LEVELS,
  DEFAULT_CATEGORIES,
  generateRandomQuiz,
  shuffleArray,
  calculateScore,
  formatTime,
  getScoreColor,
  getScoreMessage,
};