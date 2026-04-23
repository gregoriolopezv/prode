export function calculatePoints(
  prediction: { homeScore: number; awayScore: number },
  result: { homeScore: number; awayScore: number }
): number {
  const predictedDiff = prediction.homeScore - prediction.awayScore;
  const actualDiff = result.homeScore - result.awayScore;

  const predictedOutcome = Math.sign(predictedDiff);
  const actualOutcome = Math.sign(actualDiff);

  if (
    prediction.homeScore === result.homeScore &&
    prediction.awayScore === result.awayScore
  ) {
    return 3;
  }

  if (predictedOutcome === actualOutcome) {
    return 1;
  }

  return 0;
}
