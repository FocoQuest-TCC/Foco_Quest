import './App.css'
import Roxa from './assets/Roxa.png'

export function App() {

  return (
    <>
      <header className="nav">
        <div className="nav-box">
          <div className='header-left'>
            <img src={Roxa} className='logo'/>
              <div className='header-text'>
                <h1>FOCOQUEST</h1>
                <p>Motive-se a alcançar <br /> Seus objetivos.</p>
              </div>
            </div>
            <button className='login'><h2>INICIAR SESSÃO</h2></button>
          </div>
        </header>

        <section className='Home'>
          <article className='square l'>
            <p>Ganhe equipamentos, mascotes e habilidades mágicas conforme avança.</p>
          </article>
          <article className='card'>
            <img src="https://i.imgur.com/lYqXWJx.png"/>
            <h3>SE DESAFIE</h3>
          </article>
          <article className='square'>
            <p>Complete tarefas para ganhar experiência e subir de nível com seu personagem.</p>
          </article>
          <article className='card'>
            <img src="https://i.imgur.com/F7g8z4x.png"/>
            <h3>CRIE SEU PERSONAGEM</h3>
          </article>
          <article className='square r'>
            <p>Progrida nas metas para liberar desafios e missões especiais.</p>
          </article>
        </section>

        <section className='about'>
          <div className='about-text'>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            Ut enim ad minim veniam.</p>
            <p>Quis nostrud exercitation ullamco laboris nisi ut aliquip
            ex ea commodo consequat. Duis aute irure dolor in reprehenderit.</p>
          </div>
          <div className='about-image'>
            <img src="https://i.imgur.com/ES0GZ8Q.png" />
          </div>
        </section>

        <aside>
          <img src="https://i.imgur.com/lYqXWJx.png" className='banner' />
        </aside>

        <footer>
          <div className='footer-top'>
            <img src={Roxa} className='footer-logo' />
            <p>Junte-se a milhões de pessoas que organizam trabalho e vida pessoal com FocoQuest</p>
          </div>
          <div className='footer-links'>
            <div>
              <h3>Companhia</h3>
              <p>Fale conosco</p>
              <p>Notícias</p>
            </div>
            <div>
              <h3>Suporte</h3>
              <p>Perguntas frequentes</p>
              <p>Reportar um problema</p>
              <p>Solicitar Sugestão</p>
            </div>
          </div>
          <div className='footer-bottom'>
            <p>© 8088 FocoQuest. Todos os direitos reservados.</p>
            <div>
              <span>Política de Privacidade</span>
              <span>Termos de Uso</span>
            </div>
          </div>
        </footer>
    </>
  )
}

export default App
