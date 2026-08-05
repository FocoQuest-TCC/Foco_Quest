export const pad = (n: number) => String(n).padStart(2, '0');
export const toISODate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const todayISO = () => toISODate(new Date());
export const nowHHMM = () => new Date().toTimeString().slice(0, 5);

export const formatDateBR = (iso: string) => {
    const [, m, d] = iso.split('-');
    return `${d}/${m}`;
};
 
export const timeToMinutes = (time?: string): number | null => {
    if (!time) return null;
    const [h, m] = time.split(':').map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return null;
    return h * 60 + m;
};

export const tomorrowISO = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return toISODate(d);
};

export const MONTH_NAMES = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export const WEEKDAY_LABELS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export function getMonthMatrix(year: number, month: number): (number | null)[][]{
    const startWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const weeks: (number | null)[][] = [];
    let day = 1 - startWeekday;
    while(day <= daysInMonth){
        const week: (number | null)[] = [];
        for(let i = 0; i < 7; i++){
            week.push(day >= 1 && day <= daysInMonth ? day : null);
            day++;
        }
        weeks.push(week)
    }
    return weeks;
}