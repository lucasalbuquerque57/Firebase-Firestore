const express = require('express');
const app = express();
const handlebars = require('express-handlebars').engine;
const bodyParser = require('body-parser');
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');
const serviceAccount = require('./albuquerque-firebase-adminsdk-m0f1v-d88e4b906f.json')

initializeApp({
    credential: cert(serviceAccount)
})


const db = getFirestore()
app.engine('handlebars', handlebars({ defaultLayout: 'main' }))
app.engine('handlebars', handlebars({
    helpers: {
        eq: function (v1, v2) {
            return v1 === v2
        }
    },
    defaultLayout: 'main'
}))


app.set('view engine', 'handlebars')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.get("/", function (req, res) {
    res.render("cadastro")
})


app.post("/cadastrar", function (req, res) {
    db.collection('clientes').add({
        nome: req.body.nome,
        telefone: req.body.telefone,
        origem: req.body.origem,
        data_contato: req.body.data_contato,
        observacao: req.body.observacao
    }).then(function () {
        console.log("Dados cadastrados com sucesso!");
        res.send("Dados cadastrados com sucesso!");
    }).catch(function (error) {
        console.error("Erro ao cadastrar: ", error);
        res.status(500).send("Erro ao cadastrar dados.");
    });
});


app.get("/editar/:id", async (req, res) => {
    const iduser = req.params.id;

    const clientesRef = db.collection('clientes').doc(iduser);
    const snapshot = await clientesRef.get();
    let datavalues = snapshot['_fieldsProto']

    res.render("editar", { posts: datavalues })
})


app.get("/consultar", function (req, res) {
    var posts = []
    db.collection('clientes').get().then(
        function (snapshot) {
            snapshot.forEach(function (doc) {
                const data = doc.data()
                data.id = doc.id
                posts.push(data)
            })
            console.log(posts)
            res.render('consulta', { posts: posts })
        }
    )
});


app.post("/excluir/:id", function (req, res) {
    const id = req.params.id;

    db.collection('clientes').doc(id).delete()
        .then(function () {
            console.log("Cliente excluído com sucesso!");
            res.send("Cliente excluído com sucesso!");
            res.redirect("/consulta")
        })
        .catch(function (error) {
            console.error("Erro ao excluir cliente: ", error);
            res.status(500).send("Erro ao excluir cliente.");
        });
});


app.post("/atualizar/:id", function (req, res) {
    const id = req.params.id;

    console.log("ID recebido:", id);

    const dadosAtualizados = {
        nome: req.body.nome,
        telefone: req.body.telefone,
        origem: req.body.origem,
        data_contato: req.body.data_contato,
        observacao: req.body.observacao
    };
    db.collection('clientes').doc(id).update(dadosAtualizados)
        .then(function () {
            console.log("Dados atualizados com sucesso!");
            res.send("Dados atualizados com sucesso!");
        })
        .catch(function (error) {
            console.error("Erro ao atualizar: ", error);
            res.status(500).send("Erro ao atualizar dados.");
        });
});


app.listen(8081, function () {
    console.log("Servidor Ativo!")
})