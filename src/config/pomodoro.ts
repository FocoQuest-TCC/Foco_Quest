export interface PomodoroDurations {
  focus: number;
  shortBreak: number;
  longBreak: number;
}

export const DEFAULT_POMODORO_DURATIONS: PomodoroDurations = {
  focus: 25,
  shortBreak: 5,
  longBreak: 15,
};

export function isPomodoroDurations(value: unknown): value is PomodoroDurations {
  if (!value || typeof value !== 'object') return false;

  const durations = value as Record<string, unknown>;
  return ['focus', 'shortBreak', 'longBreak'].every(key => (
    Number.isInteger(durations[key])
    && Number(durations[key]) >= 1
    && Number(durations[key]) <= 180
  ));
}
