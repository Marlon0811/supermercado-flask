const formCadastro = document.getElementById("form-cadastro");
const formLogin = document.getElementById("form-login");
const mensagem = document.getElementById("mensagem");

if (formCadastro) {
    formCadastro.addEventListener("submit", async event => {
        event.preventDefault();

        const dados = {
            nome: document.getElementById("nome").value,
            email: document.getElementById("email").value,
            senha: document.getElementById("senha").value
        };

        const resposta = await fetch("/api/cadastro", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(dados)
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            mensagem.textContent = resultado.erro;
            return;
        }

        alert(resultado.mensagem);
        window.location.href = "/";
    });
}

if (formLogin) {
    formLogin.addEventListener("submit", async event => {
        event.preventDefault();

        const dados = {
            email: document.getElementById("email").value,
            senha: document.getElementById("senha").value
        };

        const resposta = await fetch("/api/login", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(dados)
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            mensagem.textContent = resultado.erro;
            return;
        }

        alert(resultado.mensagem);
        window.location.href = "/";
    });
}
