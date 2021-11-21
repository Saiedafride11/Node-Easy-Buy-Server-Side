const express = require('express')
const { MongoClient } = require('mongodb');
require('dotenv').config();
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
const stripe = require('stripe')(process.env.STRIPE_SECRET);

const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.u9lnx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
      await client.connect();
      const database = client.db("easyBuy");
      const productsCollection = database.collection("products");
      const ordersCollection = database.collection("orders");
      const paymentCollection = database.collection("payments");
      
    //GET API cars
    app.get('/products', async (req, res) => {
        const cursor = productsCollection.find({})
        const products = await cursor.toArray();
        res.send(products)
      })
      
    // ---------------------------------------------------------
    // ------------------- ordersCollection  -----------------------------
    // ---------------------------------------------------------

    // POST API Orders
    app.post('/orders', async (req, res) => {
        const order = req.body;
        const result = await ordersCollection.insertOne(order)
        res.json(result)
    })

    //GET API Orders
    app.get('/orders', async (req, res) => {
        const cursor = ordersCollection.find({})
        const orders = await cursor.toArray()
        res.send(orders)
    })
  
    // GET API Orders Id
    app.get('/orders/:id', async (req, res) => {
        const id = req.params.id;
        // const query = { _id: ObjectId(id)};
        const query = { _id: id};
        console.log(query._id)
        const order = await ordersCollection.findOne(query);
        res.json(order);
      })

    // Delete API Orders Id
    app.delete('/orders/:id', async (req, res) => {
        const id = req.params.id;
        // const query = { _id: ObjectId(id)};
        const query = { _id: id};
        const order = await ordersCollection.deleteOne(query);
        res.json(order);
    })
   
     // ---------------------------------------------------------
    // ------------------- paymentCollection  -----------------------------
    // ---------------------------------------------------------

    // POST API payment
    app.post('/payment', async (req, res) => {
      const order = req.body;
      const payment = await paymentCollection.insertOne(order)
      res.json(payment)
  })

  //GET API Orders
  app.get('/payment', async (req, res) => {
    const cursor = paymentCollection.find({})
    const payment = await cursor.toArray()
    res.send(payment)
  })

  app.post("/create-payment-intent", async (req, res) => {
    const { paymentInfo } = req.body;
    const amount = paymentInfo.orderTotal * 100;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: calculateOrderAmount(items),
      currency: "usd",
      amount: amount,
      automatic_payment_methods: ['card']
    });
  
    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  });

  app.get('/payment/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const result = await paymentCollection.findOne(query);
    res.json(result);
})


  app.put('/payment/:id', async (req, res) => {
    const id = req.params.id;
    const payment = req.body;
    const filter = { _id: ObjectId(id) };
    const updateDoc = {
        $set: {
            payment: payment
        }
    };
    const result = await paymentCollection.updateOne(filter, updateDoc);
    res.json(result);
})
  
    } finally {
      // await client.close();
    }
  }
  run().catch(console.dir);
  
  app.get('/', (req, res) => {
      res.send('Hello Easy Buy')
    })
    
    app.listen(port, () => {
      console.log('Running Server Easy Buy', port)
})