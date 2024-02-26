const express = require("express");
const logger = require("morgan");
const cors = require("cors");
require('dotenv').config();
const Person = require("./models/person");

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
    let length = 0;
    Person
        .find({})
        .then(result => {
            const time = new Date();
            if (result.length) {
                length = result.length;
            }
            response.send(`<p>Phonebook has info for ${length} people</p><p>${time.toString()}</p>`)
        });
})

app.get('/api/persons', (request, response) => {
    Person
        .find({})
        .then(persons => {
            response.json(persons);
        });
})

app.post('/api/persons', (request, response) => {
    const error = isValid(request.body);
    if (error) {
        return response.status(400).json(error)
    }
    const newPerson = new Person({
        name: request.body.name,
        number: request.body.number,
    });
    newPerson
        .save()
        .then(savedPerson => {
            currIds.add(savedPerson.id);
            currNames.add(savedPerson.name);
            currNumbers.add(savedPerson.number);
            response.status(201);
            response.json(savedPerson);  
        });
})

app.get('/api/persons/:id', (request, response) => {
    Person
        .findById(request.params.id)
        .then(person => {
            response.json(person);
        });
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