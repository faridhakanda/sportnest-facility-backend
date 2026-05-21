const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 5000
const dotenv = require('dotenv')
dotenv.config()
const uri = process.env.MONGODB_URL
// app.use(cors({
//     // add this for local dev
//     origin: 'http://localhost:3000',
//     credentials: true,
// }));
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send('Hello SportNext Project backend for api provider!')
})


// MongoDB code
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
const { createRemoteJWKSet, jwtVerify } = require('jose-cjs')
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


const JWKS = createRemoteJWKSet(
    new URL(`${process.env.CLIENT_URL}/api/auth/jwks`)
)

const verfiyToken = async(req, res, next) => {
    const authToken = req?.headers.authorization;
    if (!authToken) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const token = authToken.split(" ")[1]
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
        const { payload } = await jwtVerify(token, JWKS)
        console.log('payload: ', payload)
        next()
    } catch(err) {
        return res.status(403).json({ message: "Forbidden" })
    }
}



async function run() {
    try {
        // await client.connect();
        // await client.db('admin').command({ ping: 1 });
        // console.log("Pinged my deployment. SportNest successfully connected to MongoDB!");
        
        const DB = client.db('SportNestDB');
        const allSportFacilities = DB.collection('facilities');
        const myBooking = DB.collection("booking");
        //const userData = DB.collection('user');
    
        // all facilities for all users who authenticated or not
        app.get('/facilities', async(req, res) => {
            const allFacilities = await allSportFacilities.find();
            const facilities = await allFacilities.toArray();
            res.send(facilities);
        })

        app.post('/facilities', verfiyToken, async(req, res) => {
            const facilityData = req.body;
            const allFacilities = await allSportFacilities.insertOne(facilityData);
            res.send(allFacilities);
        })
        
        // facilities details, update and delete
        app.get('/facilities/:id', verfiyToken, async(req, res) => {
            const { id } = req.params;
            const query = {
                _id: new ObjectId(id)
            }
            const facility = await allSportFacilities.findOne(query); //.toArray();
            res.send(facility);
        })
    
        // user booking data CRUD, get, post, update, delete
        app.get('/booking/:userId', verfiyToken, async(req, res) => {
            const { userId } = req.params;
            const query = { bookingUserId: userId }
            const my_booking = await myBooking.find(query).toArray();
            res.json(my_booking);
        })
        app.post('/booking', verfiyToken, async(req, res) => {
            const bookingData = req.body;
            const bookDataBody = await myBooking.insertOne(bookingData);
            res.json(bookDataBody);
        })
        app.delete('/booking/:id', verfiyToken, async(req, res) => {
            const { id } = req.params;
            const query = { 
                _id: new ObjectId(id)
             }
            const bookingResult = await myBooking.deleteOne(query);
            res.json(bookingResult);
        })

        // my added facility
        app.get('/my-facility/:userId', verfiyToken, async(req, res) => {
            const { userId } = req.params;
            const query = { userId: userId };
            const myBooking = await allSportFacilities.find(query).toArray();
            res.send(myBooking);   
        })

        app.patch('/my-facility/:userId', verfiyToken, async(req, res) => {
            const { userId } = req.params;
            const query = { userId: userId }
            const modifiedValue = req.body;
            const myBooking = await allSportFacilities.updateOne(query, {$set: modifiedValue});
            res.send(myBooking);
        })
        
        app.delete('/my-facility/:userId', verfiyToken, async(req, res) => {
            const { userId } = req.params;
            const query = { userId: userId }
            const data = await allSportFacilities.deleteOne(query);
            res.send(data);
        })
    
    
    } finally {
        //await client.close();
    }
}



run().catch(console.dir);
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
