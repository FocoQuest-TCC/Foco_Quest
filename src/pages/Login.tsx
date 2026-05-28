export function Login(){
    return(
        <>
        <head>
            <link rel="shortcut icon" href="./src/assets/LOGO.png"/>
            <title>FocoQuest</title>
        </head>
        <header>
                <h1>Login</h1>
        </header>
        <body>
            <h2>Bem-vindo ao Login</h2>
            <form>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input type="email" id="email" name="email" required />
                </div>
                <div>
                    <label htmlFor="password">Senha:</label>
                    <input type="password" id="password" name="password" required />
                </div>
                <button type="submit">Entrar</button>
            </form>
        </body>
        </>
    )
}