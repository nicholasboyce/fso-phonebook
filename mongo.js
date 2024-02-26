const mongoose = require('mongoose');


let password = '';
const length = process.argv.length;

if (length == 2) {
    console.log("Must provide password");
    process.exit(1);
} else {
    password = encodeURIComponent(process.argv[2]); 
}

const url = `mongodb+srv://nicholasboyce:${password}@fullstack.mtdf3ro.mongodb.net/phonebookApp?retryWrites=true&w=majority&appName=fullstack`;
mongoose.set('strictQuery', false);
mongoose.connect(url);

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
});

const Person = mongoose.model('Person', personSchema);

if (length == 3) {
    Person.find({}).then(result => {
        result.forEach(person => {
            console.log('phonebook:')
            console.log(`${person.name} ${person.number}`);
        });
        mongoose.connection.close();
    });
} else if (length == 5) {
    const person = new Person({
        name: process.argv[3],
        number: process.argv[4],
    })
    person.save().then(result => {
        console.log(`added ${person.name} number ${person.number} to phonebook`);
        mongoose.connection.close();
    })
} else {
    console.log("Needs exactly three arguments.");
    process.exit(1);
}





