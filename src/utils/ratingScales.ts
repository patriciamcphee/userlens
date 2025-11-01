// utils/ratingScales.ts
export function getDefaultRatingScale(label: string): { low: string; high: string } {
  const defaults: Record<string, { low: string; high: string }> = {
    'Task Difficulty': { low: 'Very Easy', high: 'Very Difficult' },
    'Confidence Level': { low: 'Not Confident', high: 'Very Confident' },
    'Satisfaction': { low: 'Very Unsatisfied', high: 'Very Satisfied' },
    'Clarity': { low: 'Very Confusing', high: 'Very Clear' },
    'Ease of Use': { low: 'Very Difficult', high: 'Very Easy' },
    'Success Rate': { low: 'Not Successful', high: 'Very Successful' }
  };
  
  return defaults[label] || { low: 'Low', high: 'High' };
}