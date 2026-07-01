import {useState} from 'react';
import styles from './styles/config.module.css';

export function Config(){
    const [nome, setNome] = useState('???');

    return(
        <div className={styles.container}>
            <h2 className={styles.title}>CONFIGURAÇÕES DA CONTA</h2>
            <div className={styles.form}>
                <div className={styles.field}>
                    <label>APELIDO DO HERÓI:</label>
                    <input value={nome} onChange={e => setNome(e.target.value)}/>
                </div>
                <button type='button' className={styles.saveBtn}>SALVAR ALTERAÇÕES</button>
                <button type='button' className={styles.logoutBtn} onClick={()=> window.location.href='/login'}>SAIR DA CONTA</button>
            </div>
        </div>
    );
};