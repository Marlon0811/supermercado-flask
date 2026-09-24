let produtos = [];
let carrinho = [];

const listaProdutos = document.getElementById("lista-produtos");
const listaCarrinho = document.getElementById("lista-carrinho");
const totalElemento = document.getElementById("total");
const pesquisa = document.getElementById("pesquisa");
const botaoFinalizar = document.getElementById("finalizar");

fetch("/produtos")
    .then(resposta => resposta.json())
    .then(dados => {
        produtos = dados;
        mostrarProdutos(produtos);
    });

function mostrarProdutos(lista) {
    listaProdutos.innerHTML = "";

    lista.forEach(produto => {
        const div = document.createElement("div");
        div.classList.add("produto");

        div.innerHTML = `
            <h3>${produto.nome}</h3>
            <p>Categoria: ${produto.categoria}</p>
            <p class="preco">R$ ${produto.preco.toFixed(2)}</p>
            <button onclick="adicionarCarrinho(${produto.id})">
                Adicionar ao carrinho
            </button>
        `;

        listaProdutos.appendChild(div);
    });
}

function adicionarCarrinho(id) {
    const produto = produtos.find(p => p.id === id);
    const item = carrinho.find(i => i.id === id);

    if (item) {
        item.quantidade++;
    } else {
        carrinho.push({
            id: produto.id,
            nome: produto.nome,
            preco: produto.preco,
            quantidade: 1
        });
    }

    mostrarCarrinho();
}

function mostrarCarrinho() {
    listaCarrinho.innerHTML = "";

    if (carrinho.length === 0) {
        listaCarrinho.innerHTML = "<p>Seu carrinho está vazio.</p>";
        totalElemento.textContent = "0.00";
        return;
    }

    carrinho.forEach(item => {
        const div = document.createElement("div");
        div.classList.add("item-carrinho");

        div.innerHTML = `
            <div>
                <strong>${item.nome}</strong>
                <p>R$ ${item.preco.toFixed(2)}</p>
            </div>

            <div class="quantidade">
                <button onclick="diminuir(${item.id})">-</button>
                <span>${item.quantidade}</span>
                <button onclick="aumentar(${item.id})">+</button>
                <button onclick="remover(${item.id})">Remover</button>
            </div>
        `;

        listaCarrinho.appendChild(div);
    });

    calcularTotal();
}

function aumentar(id) {
    const item = carrinho.find(i => i.id === id);
    item.quantidade++;
    mostrarCarrinho();
}

function diminuir(id) {
    const item = carrinho.find(i => i.id === id);
    item.quantidade--;

    if (item.quantidade <= 0) {
        remover(id);
        return;
    }

    mostrarCarrinho();
}

function remover(id) {
    carrinho = carrinho.filter(i => i.id !== id);
    mostrarCarrinho();
}

function calcularTotal() {
    const total = carrinho.reduce(
        (soma, item) => soma + item.preco * item.quantidade,
        0
    );

    totalElemento.textContent = total.toFixed(2);
}

pesquisa.addEventListener("input", () => {
    const texto = pesquisa.value.toLowerCase();

    const resultado = produtos.filter(produto =>
        produto.nome.toLowerCase().includes(texto)
    );

    mostrarProdutos(resultado);
});

botaoFinalizar.addEventListener("click", () => {
    if (carrinho.length === 0) {
        alert("Seu carrinho está vazio!");
        return;
    }

    fetch("/finalizar", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(carrinho)
    })
    .then(async resposta => {
        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.erro || "Erro ao finalizar.");
        }

        return dados;
    })
    .then(dados => {
        alert(
            dados.mensagem +
            "\nPedido #" +
            dados.pedido_id +
            "\nTotal: R$ " +
            dados.total.toFixed(2)
        );

        carrinho = [];
        mostrarCarrinho();
    })
    .catch(erro => {
        alert(erro.message);
        if (erro.message.includes("login")) {
            window.location.href = "/login";
        }
    });
});

let slideAtual = 0;

const slides = document.querySelectorAll(".slide");
const indicadores = document.querySelectorAll(".indicador");

function mostrarSlide(numero) {

    slides.forEach(function(slide) {
        slide.classList.remove("ativo");
    });

    indicadores.forEach(function(indicador) {
        indicador.classList.remove("ativo");
    });

    slides[numero].classList.add("ativo");
    indicadores[numero].classList.add("ativo");
}

function proximoSlide() {

    slideAtual++;

    if (slideAtual >= slides.length) {
        slideAtual = 0;
    }

    mostrarSlide(slideAtual);
}

function slideAnterior() {

    slideAtual--;

    if (slideAtual < 0) {
        slideAtual = slides.length - 1;
    }

    mostrarSlide(slideAtual);
}

document
    .getElementById("carrosselProximo")
    .addEventListener("click", proximoSlide);

document
    .getElementById("carrosselAnterior")
    .addEventListener("click", slideAnterior);

indicadores.forEach(function(indicador, index) {

    indicador.addEventListener("click", function() {

        slideAtual = index;

        mostrarSlide(slideAtual);

    });

});

setInterval(proximoSlide, 4000);
