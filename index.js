const { ApolloServer } = require("apollo-server");
const { ApolloGateway, RemoteGraphQLDataSource } = require("@apollo/gateway");

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
 

  server.listen().then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
  });
})();