import {useState} from 'react';
import styles from './styles/home.module.css';
import Branco from '../assets/LOGO.png';
import { useNavigate } from 'react-router-dom';
import {Tarefas} from './tarefas';
import {Habitos} from './Habitos';
import {Kanban} from './Kanban';
import {Guilda} from './Guilda';
import {Config} from './Config';
import {Inv} from './Inv';

export function Home() {
  const navigate = useNavigate(); 
  const [activeMenu, setActiveMenu] = useState<string>('Kanban');

  const renderContent = () =>{
    switch(activeMenu){
      case 'Tarefas': return <Tarefas/>;
      case 'Hábitos': return <Habitos/>;
      case 'Kanban': return <Kanban/>;
      case 'Guilda': return <Guilda/>;
      case 'Configurações': return <Config/>;
      case 'Inventário': return <Inv/>;
      default: return <Kanban/>;
    }
  }
  return (
    <main className={styles.home}>
      <header className={styles.navbar}>
        <a onClick={() => navigate('/')}>
          <img src={Branco} className={styles.logo} alt="FocoQuest"/>
        </a>
        <nav className={styles.navLinks}>
          <a href='#' className={styles.active}>Início</a>
          <a href='#'>Tarefas</a>
          <a href='#'>Sobre</a>
          <a href='#'>Ajuda</a>
        </nav>
        <div className={styles.userTag}>???</div>
      </header>
          
      <div className={styles.mainContainer}>
        <aside className={styles.sidebar}>
          <div className={styles.profileCard}>
            <div className={styles.avatar}>?</div>
            <div className={styles.profileInfo}>
              <h3>???</h3>
              <p>Nível ??</p>
              <div className={`${styles.bar} ${styles.hp}`} />
              <div className={`${styles.bar} ${styles.xp}`} />
            </div>
          </div>
          <div className={styles.currencyStatus}>
            <span className={styles.gold}>???</span>
            <span className={styles.gems}>???</span>
          </div>
          <nav className={styles.menuItems}>
            <button className={activeMenu === 'Tarefas'?styles.activeMenuBtn: ''} onClick={()=> setActiveMenu('Tarefas')}>Tarefas</button>
            <button className={activeMenu === 'Hábitos'?styles.activeMenuBtn: ''} onClick={()=> setActiveMenu('Hábitos')}>Hábitos</button>
            <button className={activeMenu === 'KanBan'?styles.activeMenuBtn: ''} onClick={()=> setActiveMenu('Kanban')}>Kanban</button>
            <button className={activeMenu === 'Guilda'?styles.activeMenuBtn: ''} onClick={()=> setActiveMenu('Guilda')}>Guilda</button>
            <button className={activeMenu === 'Configurações'?styles.activeMenuBtn: ''} onClick={()=> setActiveMenu('Configurações')}>Configurações</button>
            <button className={activeMenu === 'Inventário'?styles.activeMenuBtn: ''} onClick={()=> setActiveMenu('Inventário')}>Inventário</button>
          </nav>
        </aside>
          
        <section className={styles.contentContainer}>
          {renderContent()}
          <div className={styles.bottomWidgets}>
            <div className={styles.shopItems}>
              <div className={styles.slot}>?</div>
              <div className={styles.slot}>?</div>
              <div className={styles.slot}>?</div>
              <div className={styles.slot}>?</div>
            </div>
            <div className={styles.extraPanel}></div>
          </div>
        </section>
      </div>
    </main>
  );
}

// 83