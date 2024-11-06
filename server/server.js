const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
const express = require("express");
const mongoose = require("mongoose");
const db_url =  process.env.ATLASDB_URL;
const bodyParser = require("body-parser");
const Event = require("./models/events.js"); // Changed to uppercase 'Event' for consistency
const Magazine = require("./models/magazine.js");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 8080;

app.use(express.json())
app.use(cors({
  origin:[process.env.FRONTEND_URL],
  methods:["POST","GET"],
  credentials:true,
  allowedHeaders: ['Content-Type', 'Origin', 'X-Requested-With', 'Accept', 'x-client-key', 'x-client-token', 'x-client-secret', 'Authorization'],
}));
// Getting preflight cors error need to fix it 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(db_url);
}

app.use(express.static('dist'));

// app.get("/",(req,res)=>{
//   // serve my react app
// });

// Testing route
// app.get("/test",(req,res)=>{
//   res.json("Hello testing route");
// });

app.get("/api/events", async (req, res) => {
  try {
    let eventArray = await Event.find({ optionDate: 2023 });
    res.json(eventArray);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "An error occurred while fetching events" });
  }
});

app.post("/api/magazine", async(req,res)=>{
  try{
  // console.log("put request call");
  // console.log(req.params);
  // console.log(req.body.id);
  let magazine = req.body.id;
  magazine.views+=1;
  let magazineUpdated = await Magazine.findByIdAndUpdate(magazine._id,{...magazine});
  // console.log(magazineUpdated);
  // let magazine = await Magazine.findById
  // let {id} = req.params;
  } catch(error) {
    console.error("Error updating viewNumber:",error);
    res.status(500).json({error: "An error occured while updating views of magazine"})
  }
})

app.get("/api/events/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(event); // Send the single event, not eventArray
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid event ID format" });
    }
    res
      .status(500)
      .json({ message: "Error retrieving event", error: err.message });
  }
});

app.get("/api/publication", async (req, res) => {
  try {
    let magazineArray = await Magazine.find({optionDate:2023});
    // console.log(magazineArray);
    res.json(magazineArray);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "An error occurred while fetching events" });
  }
});

app.get("/api/latestpublication", async (req, res) => {
  try {
    let magazineArray = await Magazine.find({latest:'yes'});
    // console.log(magazineArray);
    res.json(magazineArray);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "An error occurred while fetching events" });
  }
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}!`);
});
