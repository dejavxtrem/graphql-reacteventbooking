const express = require('express')
const morgan = require('morgan')
const { graphqlHTTP } = require('express-graphql');
const { buildSchema} = require('graphql')



const app = express();
const PORT = process.env.PORT || 9000


//controllers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/graphql', graphqlHTTP({
    schema: buildSchema(`
          type RootQuery {
              events: [String!]!
          }

          type RootMutation {
              createEvent(name: String): String
          }

          schema {
            query: RootQuery
            mutation: RootMutation
          }      
    `),
    rootValue: {
      events: () => {
          return [`Romantic Cooking`, `Sailing`, 'All-night Coding']
      },
      createEvent: (args) => {
        const eventName = args.name
        return eventName
      }
    },
    graphiql: true
}))


app.listen(PORT, () => {
    console.log('🎉🎊', 'celebrations happening on port', PORT, '🎉🎊',)
  })