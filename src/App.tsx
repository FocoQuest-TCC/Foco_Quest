import './App.css'
import Roxa from './assets/Roxa.png'

function App() {

  return (
    <>
      <header className="Nav">
        <div className="nav-box">
          <div className='header-left'>
            <img src={Roxa} className='Logo'/>
              <div className='header-text'>
                <h1>FOCOQUEST</h1>
                <p>Motive-se a alcançar <br /> seus objetivos.</p>
              </div>
            </div>
            <div className='Login'>
              <h2>INICIAR SESSÃO</h2>
              <img src="https://cdn-icons-png.flaticon.com/128/2102/2102633.png"/>
            </div>
          </div>
        </header>

        <section id='Home'>
          <article className='triangle'>
            <p>Ganhe equipamentos, mascotes e habilidades mágicas conforme avança.</p>
          </article>
          <article className='card'>
            <img src="https://i.imgur.com/lYqXWJx.png"/>
            <h3>SE DESAFIE</h3>
          </article>
          <article className='triangle'>
            <p>Complete tarefas para ganhar experiência e subir de nível com seu personagem.</p>
          </article>
          <article className='card'>
            <img src="https://i.imgur.com/F7g8z4x.png"/>
            <h3>CRIE SEU PERSONAGEM</h3>
          </article>
          <article className='triangle'>
            <p>Progrida nas metas para liberar desafios e missões especiais.</p>
          </article>
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
              <h3>Produto</h3>
              <p>Como funciona</p>
            </div>
            <div>
              <h3>Companhia</h3>
              <p>Fale conosco</p>
              <p>Notícias</p>
            </div>
            <div>
              <h3>Comunidade</h3>
              <p>Diretrizes da Comunidade</p>
              <p>Contribua!</p>
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
