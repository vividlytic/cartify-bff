import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import http from "http";
import { CatalogueDataSource } from "./datasource/catalogue.js";
import { OrderDataSource } from "./datasource/order.js";
import { resolvers } from "./resolver.js";
import { typeDefs } from "./schema.js";

// Expressサーバとの統合
const app = express();

// Expressサーバーへの受信リクエストを処理するhttpServerの設定
const httpServer = http.createServer(app);

// ApolloServer 初期化用の処理
const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

// ApolloServerの起動
await server.start();

// サーバーをマウントするパスの指定
app.use(
  "/graphql",
  cors(),
  bodyParser.json(),
  expressMiddleware(server, {
    context: async ({ req }) => {
      return {
        dataSources: {
          catalogueApi: new CatalogueDataSource(),
          orderApi: new OrderDataSource(),
        },
      };
    },
  })
);

await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));

console.log(`🚀 Server ready at http://localhost:4000/`);

app.get("/health", (req, res) => {
  res.status(200).send("Okay!");
});
