export interface LevelProgress {
  level: number;
  experience: number;
  experienceInLevel: number;
  experienceForNextLevel: number;
  experienceToNextLevel: number;
}

export function formatCompactNumber(value: number): string {
  const absoluteValue = Math.abs(value);
  const units = [
    { threshold: 1_000_000_000_000, suffix: 'T' },
    { threshold: 1_000_000_000, suffix: 'B' },
    { threshold: 1_000_000, suffix: 'M' },
    { threshold: 1_000, suffix: 'K' },
  ];
  const unit = units.find(({ threshold }) => absoluteValue >= threshold);
  if (!unit) return value.toLocaleString('pt-BR');

  const scaledValue = value / unit.threshold;
  const formattedValue = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: Math.abs(scaledValue) < 10 ? 1 : 0,
  }).format(scaledValue);
  return `${formattedValue}${unit.suffix}`;
}

export function getLevelProgress(totalExperience: number | null | undefined): LevelProgress {
  let remainingExperience = typeof totalExperience === 'number' && Number.isFinite(totalExperience)
    ? Math.max(0, Math.floor(totalExperience))
    : 0;
  let level = 1;
  let experienceForNextLevel = Math.floor(150 * (level * 0.5));

  while (remainingExperience >= experienceForNextLevel) {
    remainingExperience -= experienceForNextLevel;
    level += 1;
    experienceForNextLevel = Math.floor(150 * (level * 0.5));
  }

  return {
    level,
    experience: typeof totalExperience === 'number' && Number.isFinite(totalExperience)
      ? Math.max(0, Math.floor(totalExperience))
      : 0,
    experienceInLevel: remainingExperience,
    experienceForNextLevel,
    experienceToNextLevel: experienceForNextLevel - remainingExperience,
  };
}
