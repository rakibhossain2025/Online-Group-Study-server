const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 2002;

app.use(cors());
app.use(express.json());

// const verifyToken = async (req, res, next) => {
  
//   const authHeader = req.headers.authorization
//   if (!authHeader) {
//     return res.status(401).send({ message: 'bro message (if unauthorize )' })
//   }

//   try {
//     const token = authHeader.split(' ')[1]
//     const decodedUser = await admin.auth().verifyIdToken(token)
//     req.decoded = decodedUser
//     next()

//   } catch (e) {
//     res.status(401).send({ message: "bro message (if Invalid or expired token)" });
//   }

// }

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.iy8gzcy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const assignmentsCollection = client.db("group-study").collection("assignments");
    const takeAssignment = client.db("group-study").collection("take-assignment");

    app.get("/assignments", async (req, res) => {
      const result = await assignmentsCollection.find().toArray();
      res.send(result);
    });

    app.get("/pending", async (req, res) => {
      const result = await takeAssignment.find({ status: "pending" }).toArray();
      res.send(result);
    });

    app.post("/take-assignment", async (req, res) => {
      res.send(await takeAssignment.insertOne(req.body));
    });

    app.patch('/mark/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const updatedInfo = req.body;

        const result = await takeAssignment.updateOne(
          { _id: new ObjectId(id) },
          {
            $set: {
              givenMark: updatedInfo.givenMark,
              feedback: updatedInfo.feedback,
              examiner: updatedInfo.examiner,
              status: updatedInfo.status,
              examinerEmail:updatedInfo.examinerEmail
            }
          }
        );

        res.send(result);
      } catch (err) {
        console.error("Error marking assignment:", err);
        res.status(500).send({ error: "Failed to mark assignment" });
      }
    });

    app.get("/my-assignment", async (req, res) => {
      res.send(await takeAssignment.find({ examineEmail: req.query.email }).toArray());
    });


    //! brother's code 
    //


    app.get("/assignments/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await assignmentsCollection.findOne(query);
      res.send(result);
    });


    app.post("/myattemps", async (req, res) => {
      res.send(await MyAttemptsCollection.insertOne(req.body));
    });
    // 

    app.post("/assignments", async (req, res) => {
      newAssignment = req.body;
      const result = await assignmentsCollection.insertOne(newAssignment);
      res.send(result);
    });

    app.put("/assignments/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateAssignment = req.body;
      const updateDoc = {
        $set: updateAssignment,
      };
      const result = await assignmentsCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    // ORG
    // app.delete("/assignments/:id", async(req, res) => {
    //   const id = req.params.id;
    //   const query = {_id: new ObjectId(id)}
    //   const result = await assignmentsCollection.deleteOne(query);
    //   res.send(result)
    // })

    app.delete("/assignments/:id", async (req, res) => {
      const id = req.params.id;
      const requesterEmail = req.query.email;

      const assignment = await assignmentsCollection.findOne({
        _id: new ObjectId(id),
      });

      if (assignment?.createdBy !== requesterEmail) {
        return res.status(403).send({
          error: "Forbidden: You can only delete your own assignments.",
        });
      }

      const result = await assignmentsCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });
  } finally { }
}
run().catch(console.dir);

app.get("/", (rakib, res) => {
  res.send("rakib's Server is Getting Now cool😎");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
