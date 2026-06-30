import {useState} from 'react';
import styles from './styles/config.module.css';

export function Config(){
    const [nome, setNome] = useState('???');

    return(
        <div className={styles.container}>
            <h2 className={styles.title}>Configurações</h2>
            <div className={styles.form}>
                <div className={styles.field}>
                    <label>Nome do Herói:</label>
                    <input className={styles.text} value={nome} onChange={e => setNome(e.target.value)}/>
                </div>
                <div className={styles.field}>
                    <label>Notificações:</label>
                    <input className={styles.checkbox} type="checkbox" checked />
                </div>
                <button className={styles.saveBtn}>Salvar Alterações</button>
                <button className={styles.logoutBtn} onClick={()=> window.location.href='/login'}>Sair da Conta</button>
            </div>
        </div>
    );
};