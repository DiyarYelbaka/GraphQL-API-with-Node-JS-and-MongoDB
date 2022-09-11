const { ApolloServer, gql } = require('apollo-server');
const {ApolloServerPluginLandingPageLocalDefault} = require('apollo-server-core');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
const dotenv = require('dotenv')
const bcrypt = require("bcryptjs");
var jwt = require('jsonwebtoken');
dotenv.config();

const{ DB_URI, DB_NAME, JWT_SECRET } = process.env; 


const getToken = (user) => jwt.sign({id:user._id}, JWT_SECRET, {expiresIn: '30 days'})

const getUserFromToken = async(token,db)=>{
  if(!token) {return null}

  const tokenData = jwt.verify(token,JWT_SECRET);
  if(!tokenData?.id){
    return null;
  }

  return await db.collection('Users').findOne({ _id: ObjectId(tokenData.id) })
}

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
      const someId = result.insertedId;
      const actualResult = await db.collection('Users').findOne({ _id: someId });
      
       const  user =  actualResult;
        return{
          user,
          token: getToken(user),
       }
   },
    signIn: async(_,{input},{db})=>{
       const user = await db.collection('Users').findOne({email:input.email})
       const isPasswordCorrect = user && bcrypt.compareSync(input.password, user.password)

       if(!user || !isPasswordCorrect){
        throw new Error('Invalid Credentials!')
       }

       return{
        user,
        token: getToken(user),
       }
    },
   },

   User:{
    id: (root) =>  root._id || root.id ,
    
    }
};



const start = async () => {
    
    const client = new MongoClient(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
    await client.connect();
    const db = client.db(DB_NAME)

    // const context ={
    //     db,
    // }
  
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        context: async({req})=>{
          const user = await getUserFromToken(req.headers.authorization, db);
          console.log(user)
          return  {
            db,
            user,
          }
        },
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


