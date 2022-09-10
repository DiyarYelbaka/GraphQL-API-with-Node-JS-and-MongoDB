const { ApolloServer, gql } = require('apollo-server');
const {ApolloServerPluginLandingPageLocalDefault} = require('apollo-server-core');
const { MongoClient, ServerApiVersion } = require('mongodb')
const dotenv = require('dotenv')
const bcrypt = require("bcryptjs");
dotenv.config();

const{ DB_URI, DB_NAME } = process.env;




const typeDefs = gql`
  
  type Query {
    myTaskLists:[TaskList!]! 
  }

  type Mutation {
    signUp(input: SignUpInput): AuthUser!   
    signIn(input: SignInInput): AuthUser!  
  }

  input SignUpInput{
    email: String!
    password: String!
    name: String!
    avatar: String
  }

  input SignInInput{
    email: String!
    password: String!
  }

  type AuthUser {
     user: User!
     token: String!
  }
  
  type User {
    id: ID!
    name: String!
    email: String!
    avatar: String
  }

  type TaskList {
    id: ID!
    createdAt: String! 
    title: String!
    progress: Float!

    users: [User!]!
    todos: [ToDo!]!
  }

  type ToDo {
    id: ID!
    content: String!
    isCompleted: Boolean!
    
    taskListId: ID!
    taskList: TaskList!
  }
`;

const resolvers = {
   Query: {
    myTaskLists: () =>[]
   },
   Mutation:{
    signUp: async (_,{input},{db}) => {
      const hashedPassword = bcrypt.hashSync(input.password);
      const newUser = {
        ...input,
        password: hashedPassword,
      }
      //save to database
      const result = await db.collection('Users').insertOne(newUser)
      console.log(result)

      const someId = result.insertedId;
      const actualResult = await db.collection('Users').findOne({ _id: someId });
      console.log(actualResult)
      
       const  user =  actualResult;
        return{
          user,
          token:'token'
       }
   },
    signIn:()=>{},
   },

   User:{
    id: (root) => {
        console.log(root);
        return 'hello'
    }
}
};

console.log('git')

const start = async () => {
    
    const client = new MongoClient(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
    await client.connect();
    const db = client.db(DB_NAME)

    const context ={
        db,
    }
  
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        context,
        csrfPrevention: true,
        cache: 'bounded',
        plugins: [
        ApolloServerPluginLandingPageLocalDefault({ embed: true }),
        ],
    });

    server.listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
    });
  
}

start();

