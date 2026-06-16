import {useState} from 'react';
import styles from './styles/home.module.css';
import Branco from '../assets/LOGO.png';
import {Kanban} from './Kanban';
import {Guilda} from './Guilda';

export function Home() {
  const [activeMenu, setActiveMenu] = useState<string>('Kanban');
  return (
    <main className={styles.home}>
      <header className={styles.navbar}>
        <img src={Branco} className={styles.logo} alt="FocoQuest"/>
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
            <button className={activeMenu === 'KanBan'?styles.activeMenuBtn: ''} onClick={()=> setActiveMenu('KanBan')}>KanBan</button>
            <button className={activeMenu === 'Foco'?styles.activeMenuBtn: ''} onClick={()=> setActiveMenu('Foco')}>Foco</button>
            <button className={activeMenu === 'Passe de Batalha'?styles.activeMenuBtn: ''} onClick={()=> setActiveMenu('TPasse de Batalha')}>Passe de Batalha</button>
            <button className={activeMenu === 'Guilda'?styles.activeMenuBtn: ''} onClick={()=> setActiveMenu('Guilda')}>Guilda</button>
            <button className={activeMenu === 'Configurações'?styles.activeMenuBtn: ''} onClick={()=> setActiveMenu('Configurações')}>Configurações</button>
            <button className={activeMenu === 'Inventário'?styles.activeMenuBtn: ''} onClick={()=> setActiveMenu('Inventário')}>Inventário</button>
          </nav>
        </aside>
          
        <section className={styles.contentContainer}>
          {activeMenu === 'KanBan' && <Kanban/>}
          {activeMenu === 'Guilda' && <Guilda/>}
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