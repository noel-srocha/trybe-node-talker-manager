const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
app.use(bodyParser.json());

const HTTP_OK_STATUS = 200;
const HTTP_NOT_OK_STATUS = 404;
const PORT = '3000';

const talkerJson = 'talker.json';

const crypto = require('crypto');
const { validateEmail, 
  validatePassword, 
  validateToken, 
  validateName, 
  validateAge, 
  validateRateAndWhatchedAt, 
  validateTalk } = require('./middlewares/validations');

function generateToken() {
  return crypto.randomBytes(8).toString('hex');
}

app.get('/talker', (req, res) => {
  try {
    const talkerData = fs.readFileSync(`./${talkerJson}`);
    res.status(HTTP_OK_STATUS).json(JSON.parse(talkerData));
  } catch (error) {
    res.status(HTTP_OK_STATUS).json(JSON.parse([]));
  }
});

app.get('/talker/:id', (req, res) => {
  const { id } = req.params;
  const talkerData = fs.readFileSync(`./${talkerJson}`, 'utf-8');
  const parsedTalker = JSON.parse(talkerData);
  const foundTalker = parsedTalker.find((findId) => findId.id === +id);
  console.log(foundTalker);
  if (!foundTalker) {
    return res.status(HTTP_NOT_OK_STATUS).json({ message: 'Pessoa palestrante não encontrada' });
  } 
  return res.status(HTTP_OK_STATUS).json(foundTalker);
});

app.post('/login', validateEmail, validatePassword, (req, res) => {
  const token = generateToken();
  console.log(token);
  return res.status(HTTP_OK_STATUS).json({ token });
});

app.post('/talker',
  validateToken,
  validateName,
  validateAge, 
  validateTalk, 
  validateRateAndWhatchedAt, 

    (req, res) => {
     const { name, age, talk } = req.body;
     const readFile = fs.readFileSync(`./${talkerJson}`, 'utf-8');
     const readJson = JSON.parse(readFile);
     const id = 5;
     const objectWithId = ({ name, age, talk, id });
     readJson.push(objectWithId); 
     fs.writeFileSync(`./${talkerJson}`, JSON.stringify(readJson));
     res.status(201).json({ name, age, talk, id });
    });

app.put('/talker/:id',
  validateToken,
  validateName,
  validateAge, 
  validateTalk, 
  validateRateAndWhatchedAt,
  (req, res) => {
    const { name, age, talk } = req.body;
    const { id } = req.params;
    const talker = fs.readFileSync(`./${talkerJson}`, 'utf-8');
    const parsedTalker = JSON.parse(talker);
    const indexObj = parsedTalker.findIndex((e) => e.id === +id);
    parsedTalker[indexObj] = { ...parsedTalker[indexObj], name, age, talk };
    fs.writeFileSync(`./${talkerJson}`, JSON.stringify(parsedTalker));
    return res.status(200).json(parsedTalker[indexObj]);
  });

app.delete('/talker/:id', validateToken, (req, res) => {
  const { id } = req.params;
  const talker = fs.readFileSync(`./${talkerJson}`, 'utf-8');
  const parsedTalker = JSON.parse(talker);
  const talkerIndex = parsedTalker.findIndex((e) => e.id === +id);
  if (talkerIndex === -1) return res.status(404).send({ message: 'Pessoa não encontrada' });
  parsedTalker.splice(talkerIndex, 1);
  fs.writeFileSync(`./${talkerJson}`, JSON.stringify(parsedTalker));
  res.status(200).json({ message: 'Pessoa palestrante deletada com sucesso' });
});

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.use((err, _req, res, _next) => res.status(500).json({ error: `Erro: ${err.message}` }));

app.listen(PORT, () => {
  console.log('Online');
});
