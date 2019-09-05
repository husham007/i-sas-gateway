


const express = require('express');
import { ApolloServer } from 'apollo-server-express';
const { ApolloGateway, RemoteGraphQLDataSource } = require("@apollo/gateway");

const port = process.env.PORT || 8000;

const app = express();

const gateway = new ApolloGateway({
  serviceList: [
    /*
    { name: "user", url: "http://localhost:5000/graphql" },
    { name: "questionBank", url: "http://localhost:7000/graphql" },
    { name: "exam", url: "http://localhost:7009/graphql" },
    */

   { name: "user", url: "https://isas-user-microservice.herokuapp.com/graphql" },
   { name: "questionBank", url: "https://qb-microservice.herokuapp.com/graphql" },
   { name: "exam", url: "https://exam-microservice.herokuapp.com/graphql" },   
    
  ],

  buildService({ name, url }) {
    return new RemoteGraphQLDataSource({
      url,
      willSendRequest({ request, context }) {
        // pass the user's id from the context to underlying services
        // as a header called `user-id`
        request.http.headers.set('x-token', context.token);
      },
    });
  },
});

(async () => {  
  const { schema, executor } = await gateway.load();

  const server = new ApolloServer({ schema, executor, 
    introspection: true, // enables introspection of the schema
    playground: true, // enables the actual playground
    context: ({ req }) => {
        // get the user token from the headers
        const token = req.headers['x-token'];
        //console.log(token);
        // try to retrieve a user with the token
       // const userId = getUserId(token);
        // add the user to the context
        return { token };
      },
    });

    server.applyMiddleware({
      app,
      path: '/graphql'
    });

    app.listen({ port }, () => {
      console.log('Gateway on http://localhost:4000/graphql');
    });
 
/*
  server.listen({port: 4000}).then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
    
  });*/

})();