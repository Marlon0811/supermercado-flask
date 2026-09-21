from flask import Flask, render_template, request, jsonify, session, redirect
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import text
import os

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "chave-local-apenas-para-desenvolvimento")

database_url = os.environ.get("DATABASE_URL", "sqlite:///supermercado.db")
if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

app.config["SQLALCHEMY_DATABASE_URI"] = database_url
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)


class Usuario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    senha = db.Column(db.String(255), nullable=False)


class Pedido(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey("usuario.id"), nullable=False)
    total = db.Column(db.Float, nullable=False)
    usuario = db.relationship("Usuario", backref=db.backref("pedidos", lazy=True))


class ItemPedido(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    pedido_id = db.Column(db.Integer, db.ForeignKey("pedido.id"), nullable=False)
    produto_id = db.Column(db.Integer, nullable=False)
    nome = db.Column(db.String(150), nullable=False)
    preco = db.Column(db.Float, nullable=False)
    quantidade = db.Column(db.Integer, nullable=False)
    pedido = db.relationship("Pedido", backref=db.backref("itens", lazy=True, cascade="all, delete-orphan"))


produtos = [
    {"id": 1, "nome": "Arroz 5kg", "preco": 25.90, "categoria": "Alimentos"},
    {"id": 2, "nome": "Feijão 1kg", "preco": 8.50, "categoria": "Alimentos"},
    {"id": 3, "nome": "Leite 1L", "preco": 5.90, "categoria": "Bebidas"},
    {"id": 4, "nome": "Café 500g", "preco": 14.90, "categoria": "Bebidas"},
    {"id": 5, "nome": "Açúcar 1kg", "preco": 4.99, "categoria": "Alimentos"},
    {"id": 6, "nome": "Detergente", "preco": 2.99, "categoria": "Limpeza"}
]


@app.route("/")
def inicio():
    usuario = None
    if "usuario_id" in session:
        usuario = db.session.get(Usuario, session["usuario_id"])
    return render_template("index.html", usuario=usuario)


@app.route("/cadastro")
def pagina_cadastro():
    return render_template("cadastro.html")


@app.route("/login")
def pagina_login():
    return render_template("login.html")


@app.route("/meus-pedidos")
def meus_pedidos():
    if "usuario_id" not in session:
        return redirect("/login")

    pedidos = (
        Pedido.query
        .filter_by(usuario_id=session["usuario_id"])
        .order_by(Pedido.id.desc())
        .all()
    )
    return render_template("pedidos.html", pedidos=pedidos)


@app.post("/api/cadastro")
def cadastro():
    dados = request.get_json(silent=True) or {}
    nome = dados.get("nome", "").strip()
    email = dados.get("email", "").strip().lower()
    senha = dados.get("senha", "")

    if not nome or not email or not senha:
        return jsonify({"erro": "Preencha todos os campos."}), 400

    if len(senha) < 6:
        return jsonify({"erro": "A senha deve ter pelo menos 6 caracteres."}), 400

    if Usuario.query.filter_by(email=email).first():
        return jsonify({"erro": "Este e-mail já está cadastrado."}), 409

    usuario = Usuario(
        nome=nome,
        email=email,
        senha=generate_password_hash(senha)
    )
    db.session.add(usuario)
    db.session.commit()

    session["usuario_id"] = usuario.id

    return jsonify({"mensagem": "Cadastro realizado com sucesso!"})


@app.post("/api/login")
def login():
    dados = request.get_json(silent=True) or {}
    email = dados.get("email", "").strip().lower()
    senha = dados.get("senha", "")

    usuario = Usuario.query.filter_by(email=email).first()

    if not usuario or not check_password_hash(usuario.senha, senha):
        return jsonify({"erro": "E-mail ou senha incorretos."}), 401

    session["usuario_id"] = usuario.id

    return jsonify({"mensagem": "Login realizado com sucesso!"})


@app.get("/logout")
def logout():
    session.clear()
    return redirect("/")


@app.get("/produtos")
def listar_produtos():
    return jsonify(produtos)


@app.post("/finalizar")
def finalizar_compra():
    if "usuario_id" not in session:
        return jsonify({"erro": "Você precisa fazer login para finalizar a compra."}), 401

    carrinho = request.get_json(silent=True) or []

    if not carrinho:
        return jsonify({"erro": "O carrinho está vazio."}), 400

    total = 0

    for item in carrinho:
        total += float(item["preco"]) * int(item["quantidade"])

    pedido = Pedido(
        usuario_id=session["usuario_id"],
        total=round(total, 2)
    )
    db.session.add(pedido)
    db.session.flush()

    for item in carrinho:
        item_pedido = ItemPedido(
            pedido_id=pedido.id,
            produto_id=int(item["id"]),
            nome=item["nome"],
            preco=float(item["preco"]),
            quantidade=int(item["quantidade"])
        )
        db.session.add(item_pedido)

    db.session.commit()

    return jsonify({
        "mensagem": "Pedido realizado com sucesso!",
        "pedido_id": pedido.id,
        "total": pedido.total
    })


with app.app_context():
    db.create_all()


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 5000)),
        debug=True
    )
