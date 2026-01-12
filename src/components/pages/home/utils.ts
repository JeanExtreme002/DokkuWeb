export const getResourceUsagePercentage = (used: number | undefined, quota: number) => {
  return quota > 0 ? Math.min(((used || 0) / quota) * 100, 100) : 0;
};

export const getUsageColor = (percentage: number) => {
  if (percentage >= 90) return 'red';
  if (percentage >= 70) return 'orange';
  return 'green';
};
