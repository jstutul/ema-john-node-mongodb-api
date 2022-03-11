const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();
//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qghp6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
async function run() {
  try {
    await client.connect();
    const database = client.db("EmaJohn");
    const productsCollection = database.collection("productsCollection");
    const ordersCollection = database.collection("orders");
    app.post("/products/byKeys", async (req, res) => {
      const keys = req.body;
      const query = { key: { $in: keys } };
      const products = await productsCollection.find(query).toArray();
      res.json(products);
    });

    app.post("/order", async (req, res) => {
      const order = req.body;
      const result = await ordersCollection.insertOne(order);
      res.json(result);
    });
    app.get("/products", async (req, res) => {
      const carsor = productsCollection.find({});
      const page = req.query.page;
      const size = parseInt(req.query.size);
      const count = await carsor.count();
      let products;
      if (page) {
        products = await carsor
          .skip(page * size)
          .limit(size)
          .toArray();
      } else {
        products = await carsor.toArray();
      }

      res.json({ count, products });
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", async (req, res) => {
  res.send("App is running");
});

app.listen(port, (req, res) => {
  console.log(`app is running on port : ${port}`);
});
