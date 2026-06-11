const calculateMatchScore = (answers, privateDetails) => {
  let score = 0;
  let totalWeight = 0;

  for (const [key, userAnswer] of Object.entries(answers)) {
    const expectedAnswer = privateDetails[key];
    if (expectedAnswer) {
      totalWeight += 10;
      if (
        userAnswer.toLowerCase().trim() === expectedAnswer.toLowerCase().trim()
      ) {
        score += 10;
      }
    }
  }

  return totalWeight > 0 ? (score / totalWeight) * 100 : 0;
};

const calculateItemMatchScore = (item1, item2) => {
  let score = 0;

  // Category match (30 points)
  if (item1.category === item2.category) score += 30;

  // Location similarity (25 points)
  const locationSimilarity = calculateLocationSimilarity(
    item1.location,
    item2.location,
  );
  score += locationSimilarity * 25;

  // Description keyword match (25 points)
  const keywords1 = extractKeywords(item1.description);
  const keywords2 = extractKeywords(item2.description);
  const matchCount = keywords1.filter((kw) => keywords2.includes(kw)).length;
  const keywordScore =
    keywords1.length > 0 ? (matchCount / keywords1.length) * 25 : 0;
  score += keywordScore;

  // Time proximity (20 points)
  const daysDiff =
    Math.abs(new Date(item1.date) - new Date(item2.date)) /
    (1000 * 60 * 60 * 24);
  const timeScore = Math.max(0, 20 - daysDiff);
  score += timeScore;

  return Math.min(100, Math.floor(score));
};

const calculateLocationSimilarity = (loc1, loc2) => {
  if (!loc1 || !loc2) return 0;
  const words1 = loc1.toLowerCase().split(" ");
  const words2 = loc2.toLowerCase().split(" ");
  const common = words1.filter((w) => words2.includes(w)).length;
  return common / Math.max(words1.length, words2.length);
};

const extractKeywords = (text) => {
  const stopWords = [
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
  ];
  return text
    .toLowerCase()
    .split(" ")
    .filter((word) => word.length > 2 && !stopWords.includes(word));
};

module.exports = {
  calculateMatchScore,
  calculateItemMatchScore,
  calculateLocationSimilarity,
  extractKeywords,
};
