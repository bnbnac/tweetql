//same when package.json without "type":"module" 
//const {ApolloServer, gql} = require("apollo-server");
import {ApolloServer, gql} from "apollo-server";
import { isNullableType } from "graphql";

let tweets = [
    {
        id: "1",
        text: "hello1",
        userId: "2",
    },
    {
        id: "2",
        text: "hello2",
        userId: "1",
    },
];
let users = [
    {
        id: "1",
        firstName: "Hong",
        lastName: "Seongjin",
    },
    {
        id: "2",
        firstName: "Elon",
        lastName: "Mask",
    }
]

const typeDefs = gql`
    type User {
        id: ID!
        firstName: String!
        lastName: String!
        fullName: String!
         # if there is an 'User' resolver which has fullName field, the [fullName]s of a database are ignored when gql query the fullName with 'User' type the database though the database does have fullName information.
    }
    type Tweet {
        id: ID!
        text: String!
        author: User
    }
    type Query {
        allUsers: [User!]!
        allTweets: [Tweet!]!
        tweet(id: ID!): Tweet
    }
    type Mutation {
        postTweet(text: String!, userId: ID!): Tweet!
        deleteTweet(id: ID!): Boolean!
    }

`;

const resolvers = {
    Query: {
        allTweets() {
            return tweets;
        },
        tweet(root, {id}) {
            return tweets.find((tweet) => tweet.id === id);
        },
        allUsers() {
            console.log("all users called");
            return users;
        },
    },
    Mutation: {
        postTweet(_, {text, userId}) {
            const user = users.find((user) => user.id === userId);
            if (!user) return false;
            const newTweet = {
                id: tweets.length + 1,
                text,
            };
            tweets.push(newTweet);
            return newTweet;
        },
        deleteTweet(_, {id}) {
            const tweet = tweets.find(tweet => tweet.id === id);
            if (!tweet) return false;
            tweets = tweets.filter((tweet) => tweet.id !== id);
            return true;
        }
    },
    User: {
        fullName({firstName, lastName}) {
            return `${firstName} ${lastName}`;
        },
    },
    Tweet: {
        author({userId}) {
            return users.find((user) => user.id === userId);
        },
    },
};

const server = new ApolloServer({typeDefs, resolvers});
server.listen().then(({url}) => {
    console.log(`Running on ${url}`);
});