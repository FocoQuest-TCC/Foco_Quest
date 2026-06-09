import './styles/home.css';
import Branco from '../assets/LOGO.png';

export function Home() {
  return (
    <main className="home">
        <nav className="navbar">
            <img src={Branco} className='nav-logo'/>
            <div className='nav-links'>
                <a>Início</a>
                <a>Tarefas</a>
                <a>Sobre</a>
                <a>Ajuda</a>
            </div>
            <div className='user'>
                <span>???</span>
            </div>
        </nav>

        <section className='img'>
            <img src="https://i.imgur.com/lYqXWJx.png"/>
        </section>
        
        <section className='dashboard'>
            <aside className='sidebar'>
                <ul>
                    <li className="active">Início</li>
                    <li>Tarefas</li>
                    <li>Hábitos</li>
                    <li>Calendário</li>
                    <li>Inventário</li>
                    <li>Loja</li>
                    <li>Guilda</li>
                    <li>Configurações</li>
                </ul>
            </aside>

            <div className='content'>
                <div className='top-cards'>
                    <div className='character-card'>
                        <div className='profile'>
                            <img src="https://i.imgur.com/lYqXWJx.png"/>
                            <div>
                                <h2>???</h2>
                                <p>Nível ??</p>
                            </div>
                        </div>
                        <div className='bar hp'/>
                        <div className='bar mana'/>
                        <div className='bar xp'/>
                    </div>
                    <div className='card'>
                        <h3>Tarefas do Dia</h3>
                        <div className='task'>
                            <input type="checkbox"/>
                            <span>???</span>
                        </div>
                    </div>
                    <div className='card'>
                        <h3>Hábitos do Dia</h3>
                        <div className='task'>
                            ???
                        </div>
                    </div>
                </div>
                <div className='guild-card'>
                    <h3>Missão da Guilda</h3>
                    <p>???</p>
                    <div className='progress'>
                        <div></div>
                    </div>
                </div>
            </div>
        </section>
    </main>
  )
}