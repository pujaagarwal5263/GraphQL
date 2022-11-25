const express = require("express");
const expressGraphQL= require("express-graphql");
const {GraphQLSchema, GraphQLObjectType, GraphQLList,GraphQLInt, GraphQLNonNull, GraphQLString} = require("graphql");
const app=express();

const authors = [
    { id: 1, name: 'J. K. Rowling' },
    { id: 2, name: 'J. R. R. Tolkien'},
    { id: 3, name: 'Brent Weeks' }
]
const books =[
    {id:1, name: "My first book", authorID: 1},
    {id:2, name: "My second book", authorID: 1},
    {id:3, name: "My third book", authorID: 1},
    {id:4, name: "My forth book", authorID: 2},
    {id:5, name: "My fifth book", authorID: 2},
    {id:6, name: "My sixth book", authorID: 2},
    {id:7, name: "My seventh book", authorID: 3},
    {id:8, name: "My eighth book", authorID: 3},
]

// const schema=new GraphQLSchema({
//     query: new GraphQLObjectType({
//         name: 'MyFirstQuery',
//         fields:()=>({
//           message: {
//             type: GraphQLString,
//             resolve: ()=>'Hello World'
//              },
//           context:{
//             type: GraphQLString,
//             resolve: ()=> "literature"
//           }
//           //resolve is a function which will tell where to get the data from
//         })
//     })
// })

const AuthorType= new GraphQLObjectType({
    name:"Author",
    description:"This represents an author",
    fields: () =>({
        id: {type:  GraphQLNonNull(GraphQLInt)},
        name: {type:  GraphQLNonNull(GraphQLString)},
        books:{
        type: new GraphQLList(BookType),
        resolve: (author)=>{
            return books.filter(book => book.authorID=== author.id)
        }
      } 
    })
})

const BookType= new GraphQLObjectType({
    name:"Book",
    description:"This represents a book",
    fields: () =>({
        id: {type:  GraphQLNonNull(GraphQLInt)},
        name: {type:  GraphQLNonNull(GraphQLString)},
        authorID: {type:  GraphQLNonNull(GraphQLInt)},
        author: {
            type: AuthorType,
            resolve:(book)=>{
               return authors.find(author => author.id === book.authorID)
            } 
        }
    })
})
const RootMutationType = new GraphQLObjectType({
   name:'Mutation',
   description:"Root Mutation",
   fields: ()=>({
    addBook:{
        type: BookType,
        description:"Add a book",
        args:{
            name: {type:  GraphQLNonNull(GraphQLString)},
            authorID: {type:  GraphQLNonNull(GraphQLInt)},
        },
        resolve: (parent, args)=>{
            const book={id:books.length+1, name:args.name, authorID: args.authorID}
            books.push(book)
            return book
        }
    },
    addAuthor:{
        type: AuthorType,
        description:"Add an Author",
        args:{
            name: {type:  GraphQLNonNull(GraphQLString)}
        },
        resolve: (parent, args)=>{
            const author={id:authors.length+1, name:args.name}
            authors.push(author)
            return author
        }
    }
   })
})

const rootQueryType= new GraphQLObjectType({
    name: "Query",
    description: 'Root Query',
    fields: ()=>({
        book:{
          type: BookType,
          description: "A single book",
          args:{
            id: {type: GraphQLInt}
          },
          resolve:(parent, args)=> books.find(book => book.id === args.id)
        },
        books:{ 
            type: new GraphQLList(BookType),
            description: "List of books",
            resolve: ()=> books
        },
        author:{
           type: AuthorType,
           description: "A single author",
           args:{
            id: {type: GraphQLInt}
           },
           resolve:(parent,args)=> authors.find(author => author.id=== args.id)
        },
        authors:{ 
            type: new GraphQLList(AuthorType),
            description: "List of authors",
            resolve: ()=> authors
        }
    })
})

const schema= new GraphQLSchema({
    query: rootQueryType,
    mutation: RootMutationType
})

app.use('/graphql',expressGraphQL.graphqlHTTP({
    schema: schema,
    graphiql: true
}))

app.listen(3000,()=>{
    console.log("Server is running");
})