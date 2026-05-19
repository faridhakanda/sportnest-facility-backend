const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 5000
const dotenv = require('dotenv')
dotenv.config()
const uri = process.env.MONGODB_URL
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send('Hello SportNext Project backend for api provider!')
})


// MongoDB code
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // await client.connect();
        // await client.db('admin').command({ ping: 1 });
        // console.log("Pinged my deployment. SportNest successfully connected to MongoDB!");
        
        const DB = client.db('SportNestDB');
        const allSportFacilities = DB.collection('facilities');
        //const userData = DB.collection('user');
    
        // all facilities for all users who authenticated or not
        app.get('/facilities', async(req, res) => {
            const allFacilities = await allSportFacilities.find();
            const facilities = await allFacilities.toArray();
            res.send(facilities);
        })

        app.post('/facilities', async(req, res) => {
            const facilityData = req.body;
            const allFacilities = await allSportFacilities.insertOne(facilityData);
            res.send(allFacilities);
        })

        // facilities details, update and delete
        app.get('/facilities/:id', async(req, res) => {
            const id = req.params;
            const query = {
                _id: new ObjectId(id)
            }
            const facility = await allSportFacilities.findOne(query);
            res.send(facility);
        })
    
    
    
    } finally {
        //await client.close();
    }
}



run().catch(console.dir);
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
