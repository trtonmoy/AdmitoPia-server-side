const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// middleware
app.use(cors());
app.use(express.json());

const uri =
  "mongodb+srv://AdmitoPia:mtZoPfz4qrx8ukOy@cluster0.nlhjk6a.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Connect to MongoDB and define the routes
async function startServer() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();

    const collegesCollection = client.db("AdmitoPia").collection("colleges");
    const admissionCollection = client.db("AdmitoPia").collection("admission");

    // Colleges Endpoint - Get all colleges
    app.get("/colleges", async (req, res) => {
      const result = await collegesCollection.find().toArray();
      res.send(result);
    });

    // Colleges Endpoint - Get college by ID
    app.get("/colleges/:id", async (req, res) => {
      const id = req.params.id;

      try {
        // Check if the provided ID is a valid ObjectId
        if (!ObjectId.isValid(id)) {
          res.status(400).send("Invalid ID format.");
          return;
        }

        const query = { _id: new ObjectId(id) };
        const result = await collegesCollection.findOne(query);

        if (result) {
          res.send(result);
        } else {
          res.status(404).send("College not found.");
        }
      } catch (error) {
        console.error("Error fetching college:", error);
        res.status(500).send("Something went wrong!");
      }
    });

    app.get("/admission/enroll/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const options = {
        // Include only the `title` and `imdb` fields in the returned document
        projection: {
          image: 1,
          college_name: 1,
          admission_dates: 1,
          rating: 1,
        },
      };

      const result = await collegesCollection.findOne(query, options);
      res.send(result);
    });

    // ---------Admission ---------------

    app.get("/admission", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await admissionCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/admission", async (req, res) => {
      const admission = req.body;
      // console.log(admission);
      const result = await admissionCollection.insertOne(admission);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

startServer().then(() => {
  app.get("/", (req, res) => {
    res.send("admitopia is running fast");
  });

  app.listen(port, () => {
    console.log(`This server is running on ${port}`);
  });
});
