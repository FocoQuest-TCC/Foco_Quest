import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from 'react';

interface StoredState<T>{
    key: string;
    value: T;
}

function readStoredValue<T>(key: string, initialValue: T): T{
    try{
        const saved = localStorage.getItem(key);

        if(saved === null){
            return initialValue;
        }

        return JSON.parse(saved) as T;
    } catch{
        return initialValue;
    }
}

export function usePersistentState<T>(key: string, initialValue: T): readonly[ T, Dispatch<SetStateAction<T>>]{
    const [stored, setStored] = useState<StoredState<T>>(() =>({
        key,
        value: readStoredValue(key, initialValue),
    }));

    if(stored.key !== key){
        setStored({
            key,
            value: readStoredValue(key, initialValue),
        });
    }

    const setValue = useCallback<Dispatch<SetStateAction<T>>>(
        update => {
            setStored(previous => {
                if(previous.key !== key){
                    return previous;
                }

                const nextValue = typeof update === 'function' ? (update as (value: T) => T)(previous.value): update;

                if(Object.is(nextValue, previous.value)){
                    return previous;
                }

                return{
                    key, 
                    value: nextValue,
                };
            });
        }, [key]);

        useEffect(() =>{
            if(stored.key !== key){
                return;
            }

            try {
                localStorage.setItem(key, JSON.stringify(stored.value));
            } catch (error) {
                console.error('Não foi possível salvar os dados locais:', error);
            }
        }, [key, stored]);

        const currentValue = stored.key === key ? stored.value : readStoredValue(key, initialValue);

        return [currentValue, setValue] as const;
}