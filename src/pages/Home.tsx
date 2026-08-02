import {useState} from 'react';
import styles from './styles/home.module.css';
import Branco from '../assets/LOGO.png';
import { useNavigate } from 'react-router-dom';
import { Crono } from './Cronograma';
import { Atividades } from './Atividades';
import { Kanban } from './Kanban';
import { Guilda } from './Guilda';
import { Config } from './Config';
import { Inv } from './Inv';
import { usePersistentState } from '../config/UsePersistentState';

export interface ITarefa{
  id: number;
  text: string;
  completed: boolean;
  date?: string;
  time?: string;
}

export interface IHabito{
  id: number;
  title: string;
  streak: number;
}

export interface IKanbanTask{
  id: number;
  text: string;
  column: 'todo' | 'doing' | 'done';
  date?: string;
  time?: string;
}

type MenuKey = 'Cronograma' | 'Atividades' |  'Kanban' | 'Guilda' | 'Configurações' | 'Inventário';

export function Home() {
  const navigate = useNavigate(); 
  const [activeMenu, setActiveMenu] = useState<MenuKey>('Cronograma');

  const [tasks, setTasks] = usePersistentState<ITarefa[]>('@focoquest:tarefas_simples', [])
  const [habits, setHabits] = usePersistentState<IHabito[]>('@focoquest:habitos', [])
  const [kanbanTasks, setKanbanTasks] = usePersistentState<IKanbanTask[]>('@focoquest:tasks', [])

  const renderContent = () =>{
    switch(activeMenu){
      case 'Cronograma': return <Crono tasks = {tasks} habits = {habits} kanbanTasks={kanbanTasks}/>;
      case 'Atividades': return <Atividades tasks = {tasks} setTasks = {setTasks} habits = {habits} setHabits={setHabits}/>;
      case 'Kanban': return <Kanban tasks = {kanbanTasks} setTasks = {setKanbanTasks}/>;
      case 'Guilda': return <Guilda/>;
      case 'Configurações': return <Config/>;
      case 'Inventário': return <Inv/>;
      default: return <Crono tasks = {tasks} habits = {habits} kanbanTasks={kanbanTasks}/>;
    }
  };

  return (
    <main className={styles.home}>
      <h1 className='srOnly'>FocoQuest - Painel do usuário</h1>
      <header className={styles.navbar}>
        <button type="button" className={styles.logoBtn} onClick={() => navigate('/')} aria-label="Voltar para a página inicial">
          <img src={Branco} className={styles.logo} alt="Logo FocoQuest" />
        </button>
        <nav className={styles.navLinks}>
          <button type="button" onClick={() => setActiveMenu('Cronograma')} className={activeMenu === 'Cronograma' ? styles.active : ''}>Início</button>
          <button type="button" onClick={() => setActiveMenu('Kanban')} className={activeMenu === 'Kanban' ? styles.active : ''}>Kanban</button>
          <span className={styles.userTag}>???</span>
        </nav>
      </header>
          
      <div className={styles.mainContainer}>
        <aside className={styles.sidebar}>
          <div className={styles.profileCard}>
            <div className={styles.avatar}>?</div>
            <div className={styles.profileInfo}>
              <p>Nível 1</p>
              <span>???</span>
            </div>
          </div>
          <div className={styles.stats}>
            <span className={styles.gold}>Gold: 0</span>
            <span className={styles.gems}>Gems: 0</span>
          </div>
          <nav className={styles.menuItems}>
            <button className={activeMenu === 'Cronograma' ? styles.activeMenuBtn : ''} onClick={() => setActiveMenu('Cronograma')}>Cronograma</button>
            <button className={activeMenu === 'Atividades' ? styles.activeMenuBtn : ''} onClick={() => setActiveMenu('Atividades')}>Atividades</button>
            <button className={activeMenu === 'Kanban' ? styles.activeMenuBtn : ''} onClick={() => setActiveMenu('Kanban')}>Kanban</button>
            <button className={activeMenu === 'Guilda' ? styles.activeMenuBtn : ''} onClick={() => setActiveMenu('Guilda')}>Guilda</button>
            <button className={activeMenu === 'Inventário' ? styles.activeMenuBtn : ''} onClick={() => setActiveMenu('Inventário')}>Inventário</button>
            <button className={activeMenu === 'Configurações' ? styles.activeMenuBtn : ''} onClick={() => setActiveMenu('Configurações')}>Configurações</button>
          </nav>
        </aside>
          
        <section className={styles.contentContainer}>
          <div className={styles.innerWrapper}>
            {renderContent()}
          </div>
        </section>
      </div>
    </main>
  );
}