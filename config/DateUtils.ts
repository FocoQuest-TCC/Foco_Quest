export const pad = (n: number) => String(n).padStart(2, '0');
export const toISODate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const todayISO = () => toISODate(new Date());
export const nowHHMM = () => new Date().toTimeString().slice(0, 5);

export const formatDateBR = (iso: string) => {
    const [, m, d] = iso.split('-');
    return `${d}/${m}`
};

export const timeToMinutes = (time?: string): number | null => {
    if (!time) return null; 
    const [h, m] = time.split(':').map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return null;
    return h * 60 + m;
};