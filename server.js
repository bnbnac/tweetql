//same when package.json without "type":"module" 
//const {ApolloServer, gql} = require("apollo-server");
import {ApolloServer, gql} from "apollo-server";
import fetch from "node-fetch";
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
        """
        is sum of firstName + lastName as a string
        """
        fullName: String!
         # if there is an 'User' resolver which has fullName field, the [fullName]s of a database are ignored when gql query the fullName with 'User' type the database though the database does have fullName information.
    }
# documentation on schema page
    """
    Tweet object represents a resource for a tweet
    """
    type Tweet {
        id: ID!
        text: String!
        author: User
    }
    type Query {
        allUsers: [User!]!
        allTweets: [Tweet!]!
        tweet(id: ID!): Tweet
        allMovies: [Movie!]!
        movie(id: String!): Movie
    }
    type Mutation {
        postTweet(text: String!, userId: ID!): Tweet!
        deleteTweet(id: ID!): Boolean!
    }
    type Movie {
        id: Int!
        url: String!
        imdb_code: String!
        title: String!
        title_english: String!
        title_long: String!
        slug: String!
        year: Int!
        runtime: Float!
        genres: [String!]!
        summary: String
        description_full: String!
        synopsis: String
        yt_trailer_code: String!
        language: String!
        rating: Float!
        background_image: String!
        background_image_original: String!
        small_cover_image: String!
        medium_cover_image: String!
        large_cover_image: String!
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
        allMovies() {
            return fetch("https://yts.mx/api/v2/list_movies.json")
                .then((r) => r.json())
                .then((json) => json.data.movies);
        },
        movie(_, {id}) {
            return fetch(`https://yts.mx/api/v2/movie_details.json?movie_id=${id}`)
            .then((r) => r.json())
            .then((json) => json.data.movie);
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