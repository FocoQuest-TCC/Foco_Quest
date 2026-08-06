import { useEffect, useId, useRef, useState } from 'react';
import styles from './styles/DatePickerField.module.css';
import {
    todayISO,
    tomorrowISO,
    formatDateBR,
    getMonthMatrix,
    MONTH_NAMES,
    WEEKDAY_LABELS,
    pad,
} from '../config/DateUtils';

interface DatePickerFieldProps {
    date: string;
    time: string;
    onDateChange: (iso: string) => void;
    onTimeChange: (hhmm: string) => void;
    repeat?: boolean;
    onRepeatChange?: (value: boolean) => void;
    showRepeat?: boolean;
}

export function DatePickerField({
    date,
    time,
    onDateChange,
    onTimeChange,
    repeat = false,
    onRepeatChange,
    showRepeat = false,
}: DatePickerFieldProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [viewYear, setViewYear] = useState(() => Number((date || todayISO()).slice(0, 4)));
    const [viewMonth, setViewMonth] = useState(() => Number((date || todayISO()).slice(5, 7)) - 1);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const timeInputId = useId();

    useEffect(() => {
        if (!isOpen) return;
        const handleClick = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        window.addEventListener('keydown', handleKey);
        return () => {
            document.removeEventListener('mousedown', handleClick);
            window.removeEventListener('keydown', handleKey);
        };
    }, [isOpen]);

    const openPanel = () => {
        const base = date || todayISO();
        setViewYear(Number(base.slice(0, 4)));
        setViewMonth(Number(base.slice(5, 7)) - 1);
        setIsOpen(true);
    };

    const pickDate = (iso: string) => {
        onDateChange(iso);
        onRepeatChange?.(false);
    };

    const clearDate = () => {
        onDateChange('');
        onRepeatChange?.(false);
    };

    const goToPrevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
    };

    const goToNextMonth = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
    };

    const label = repeat
        ? '🔁 Repete'
        : !date
            ? 'Adicionar data'
            : date === todayISO()
                ? 'Hoje'
                : date === tomorrowISO()
                    ? 'Amanhã'
                    : formatDateBR(date);

    return (
        <div className={styles.dateFieldWrapper} ref={wrapperRef}>
            <button
                type="button"
                className={styles.dateBtn}
                onClick={() => (isOpen ? setIsOpen(false) : openPanel())}
                aria-expanded={isOpen}
            >
                📅 {label}
            </button>

            {isOpen && (
                <div className={`${styles.datePanel} cornerFrame`} role="dialog" aria-label="Escolher data">
                    <div className={styles.quickOptions}>
                        <button type="button" onClick={() => pickDate(todayISO())}>Hoje</button>
                        <button type="button" onClick={() => pickDate(tomorrowISO())}>Amanhã</button>
                        <button type="button" onClick={clearDate}>Nenhuma</button>
                    </div>

                    <div className={styles.calendarNav}>
                        <button type="button" onClick={goToPrevMonth} aria-label="Mês anterior">‹</button>
                        <span>{MONTH_NAMES[viewMonth]} {viewYear}</span>
                        <button type="button" onClick={goToNextMonth} aria-label="Próximo mês">›</button>
                    </div>

                    <div className={styles.calendarGrid}>
                        {WEEKDAY_LABELS.map((w, i) => (
                            <span key={i} className={styles.weekdayLabel}>{w}</span>
                        ))}
                        {getMonthMatrix(viewYear, viewMonth).flat().map((day, i) => {
                            if (day === null) return <span key={i} />;
                            const iso = `${viewYear}-${pad(viewMonth + 1)}-${pad(day)}`;
                            const isSelected = !repeat && iso === date;
                            const isToday = iso === todayISO();
                            return (
                                <button
                                    key={i}
                                    type="button"
                                    className={`${styles.dayCell} ${isSelected ? styles.daySelected : ''} ${isToday ? styles.dayToday : ''}`}
                                    onClick={() => pickDate(iso)}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>

                    <div className={styles.panelRow}>
                        <label htmlFor={timeInputId}>HORA</label>
                        <input
                            id={timeInputId}
                            type="time"
                            value={time}
                            disabled={repeat || !date}
                            onChange={e => onTimeChange(e.target.value)}
                        />
                    </div>

                    {showRepeat && (
                        <label className={styles.repeatRow}>
                            <input
                                type="checkbox"
                                checked={repeat}
                                onChange={e => onRepeatChange?.(e.target.checked)}
                            />
                            <span>🔁 Repetir diariamente <em>(vira um hábito)</em></span>
                        </label>
                    )}
                </div>
            )}
        </div>
    );
}