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

let currIds = new Set();
let currNames = new Set();
let currNumbers = new Set();

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
            if (person) {
                response.json(person);
            } else {
                response.status(404).end();
            }
        })
        .catch(error => next(error));
})

app.delete('/api/persons/:id', (request, response) => {
    Person
        .findByIdAndDelete(request.params.id)
        .then(result => {
            currIds.delete(request.params.id);
            currNames.delete(result.name);
            currNumbers.delete(result.number);
            response.status(204).end();
        })
        .catch(error => next(error));
})

app.put('/api/persons/:id', (request, response) => {
    const body = request.params.body;

    const person = {
        name: body.name,
        number: body.number
    }

    Person
        .findByIdAndUpdate(request.params.id, person, {new: true})
        .then(updatedPerson => {
            response.json(updatedPerson);
        })
        .catch(error => next(error));
})

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
})

const errorHandler = (error, request, response, next) => {
    console.error(error.message);
  
    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' });
    } 
  
    next(error);
}
  
app.use(errorHandler)