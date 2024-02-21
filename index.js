const express = require("express");
const logger = require("morgan");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.static('dist'));
app.use(express.json());

logger.token('content', (request) => {
    return JSON.stringify(request.body);
})
app.use(logger(':method :url :status :res[content-length] - :response-time ms :content'));

const createNewId = () => {
    return Math.floor(Math.random() * 1000);
}

const isValid = (entry) => {
    let message = null;
    if (!entry || !entry.name || !entry.number) {
        message = {
            error: "Content missing"
        }
    } else if (currNames.has(entry.name)) {
        message = {
            error: "Name must be unique"
        }
    } else if (currNumbers.has(entry.number)) {
        message = {
            error: "Number must be unique"
        }
    }
    return message
}

let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
];

let currIds = new Set(persons.map(p => p.id));
let currNames = new Set(persons.map(p => p.name));
let currNumbers = new Set(persons.map(p => p.number));

app.get('/info', (request, response) => {
    const length = persons.length;
    const time = new Date();
    response.send(`<p>Phonebook has info for ${length} people</p><p>${time.toString()}</p>`)
})

app.get('/api/persons', (request, response) => {
    response.json(persons);
})

app.post('/api/persons', (request, response) => {
    const newPerson = request.body;
    const error = isValid(newPerson);
    if (error) {
        return response.status(400).json(error)
    }
    let newId = createNewId();
    while (newId in currIds) {
        newId = createNewId();
    }
    newPerson.id = newId;
    persons = persons.concat(newPerson);
    currIds.add(newId);
    currNames.add(newPerson.name);
    currNumbers.add(newPerson.number);
    response.status(201);
    response.json(newPerson);  
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id);
    const person = persons.find(p => p.id === id);

    if (person) {
        response.json(person);
    } else {
        response.status(404).end();
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id);
    const target = persons.find(p => p.id === id);
    persons = persons.filter(p => p.id !== id);
    currIds.delete(id);
    currNames.delete(target.name);
    currNumbers.delete(target.number);
    response.status(204).end();
})

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
})