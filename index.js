const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();


const port = process.env.port || 3000;

const helmet = require('helmet');


app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", 'data:'],
    },
  })
);
app.use(helmet());

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sgbuojp.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});



     client.connect();
    const DisneyToyCollection = client.db("toyDB").collection("allToy");


    //insertion of toy data
    app.post('/Toys', async (req, res) => {
      const newToy = req.body;
      console.log(newToy);
      const result = await DisneyToyCollection.insertOne(newToy);
      res.send(result);
    })

    // get all toys 
    app.get("/AllDisneyToys", async (req, res) => {
      const cursor = DisneyToyCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

     //get some toy data
     app.get('/DisneyToys', async (req, res) => {
      console.log(req.query.sellerEmail);
      console.log(req.query.subCategory);
      let query = {};
      if (req.query?.sellerEmail) {
        query = {sellerEmail: req.query.sellerEmail}
      }

      if (req.query?.subCategory) {
        query = {subCategory: req.query.subCategory}
      }
      const sortField = req.query.sort || 'asc'; // Default to ascending order if no sort parameter is provided
      const sortOption = sortField === 'asc' ? 1 : -1;
      const result = await DisneyToyCollection.find(query).sort({ price: sortOption }).toArray();
      
      res.send(result);
    })

        //Update added here
        app.get('/DisneyToys/:id', async (req, res) => {
          const id = req.params.id;
          const query = { _id: new ObjectId(id) }
          const result = await DisneyToyCollection.findOne(query);
          res.send(result);
        })
        app.put('/DisneyToys/:id', async (req, res) => {
          const id = req.params.id;
          const filter = { _id: new ObjectId(id) }
          const options = { upsert: true };
          const updatedToy = req.body;
          const toy = {
            $set: {
              name: updatedToy.name,
              sellerName: updatedToy.sellerName,
              sellerEmail: updatedToy.sellerEmail,
              pictureURL: updatedToy.pictureURL,
              subCategory: updatedToy.subCategory,
              price: updatedToy.price,
              rating: updatedToy.rating,
              quantity: updatedToy.quantity,
              description: updatedToy.description
            }
          }
    
          const result = await DisneyToyCollection.updateOne(filter, toy, options);
          res.send(result);
        })
    

    //Read data
    app.get('/Disneyalltoys', async (req, res) => {
      const search = req.query.search || ''; // Get the search query from request parameters
      const searchRegex = new RegExp(search, 'i'); // Create a case-insensitive 
    
      const query = { name: searchRegex }; // Add the search condition to the query
      const cursor = DisneyToyCollection.find(query).limit(20); 
      // Limit the 20 result
      const result = await cursor.toArray();
      res.send(result);
    });

    //Delete Operation
    app.delete('/DisneyToys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await DisneyToyCollection.deleteOne(query);
      res.send(result);
    })
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("hukka hua!");
});
app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});


