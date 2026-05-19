import './App.css'


function App() {

  return (
    <>
      <head>
        <title>FocoQuest</title>
      </head>
      <header className="Nav">
        <div className="nav-box">
          <div className='header-left'>
            <img src="" alt="" className='Logo' />
            <h1>FocoQuest</h1>
            <p>Motive-se a alcançar <br /> seus objetivos.</p>
          </div>
          <div className='Login'>
            <h2>Iniciar Sessão</h2>
            <img src="https://cdn-icons-png.flaticon.com/128/2102/2102633.png" alt="" />
          </div>
        </div>
        </header>
        <section id='Home'>
          <article className='triangle'>
            <p>Ganhe equipamentos, mascotes e habilidades mágicas conforme avança.</p>
          </article>
          <article className='img'>
            <p><img src="" alt="" /><br />SE DESAFIE</p>
          </article>
          <article className='triangle'>
            <p>Complete tarefas para ganhar experiência e subir de nível com seu personagem.</p>
          </article>
          <article className='img'>
            <p><img src="" alt="" /><br />CRIE SEU PERSONAGEM</p>
          </article>
          <article className='triangle'>
            <p>Progrida nas metas para liberar desafios e missões especiais.</p>
          </article>
        </section>
        <aside>
          <img src="" alt="" />
        </aside>
        <footer>
            <img src="" alt="" className='Logo' />
            <p>Junte-se a milhões de pessoas que organizam trabalho e vida pessoal com FocoQuest</p>

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
        </footer>
    </>
  )
}

export default App
