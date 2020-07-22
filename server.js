const express = require('express')
const morgan = require('morgan')
const { graphqlHTTP } = require('express-graphql');
const { buildSchema} = require('graphql')
const mongoose = require('mongoose')
const Event = require("./models/event")
const User = require("./models/user")
const bcrypt = require('bcrypt')


const app = express();
const PORT = process.env.PORT || 9000



//controllers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/graphql', graphqlHTTP({
    schema: buildSchema(`
          type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
          }

          type User {
            _id: ID!
            email: String!
            password: String

          }

          input UserInput {
            email: String!
            password: String!
          }

          input EventInput {
              title: String!
              description: String!
              price: Float!
              date: String!
          }


          type RootQuery {
              events: [Event!]!
              
          }

          type RootMutation {
              createEvent(eventInput: EventInput): Event
              createUser(userInput:  UserInput) : User
          }

          schema {
            query: RootQuery
            mutation: RootMutation
          }      
    `),
    rootValue: {
      events: () => {
          return Event.find()
          .then(events => {
             return events.map((event) => {
                return {...event._doc, _id: event.id}
             })
          })
          .catch(err => {
            throw err
          })
      },

      createEvent: (args) => {
        const event = new Event({
          title: args.eventInput.title,
          description: args.eventInput.description,
          price: +args.eventInput.price,
          date: new Date(args.eventInput.date)
        })
        return event
        .save()
        .then(result => {
          console.log(result)
          return {...result._doc, _id: result.id}
        })
        .catch(err => { console.log(err)
          throw err;
        })
      },

      createUser: (args) => {
          return bcrypt
          .hash(args.userInput.password, 12 )
          .then(hashedPassword => {
            const user = new User ({
              email: args.userInput.email,
              password: hashedPassword
            })
            return user.save()
          })
          .then(result => {
            return {...result._doc, _id: result.id, password: null}
          })
          .catch(err => { throw err})

       
      }
    },
    graphiql: true
}))



//mongoose connection
mongoose.connect(`mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@ds157843.mlab.com:57843/eventapp-graphql`, { useNewUrlParser: true })
.then(() => {
    console.log(`Mongo connected`)
}).catch(err => {console.log(err)})

app.listen(PORT, () => {
    console.log('🎉🎊', 'celebrations happening on port', PORT, '🎉🎊',)
  })