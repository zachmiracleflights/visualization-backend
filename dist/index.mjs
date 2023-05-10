import express from "express"
const app = express()

import dotenv from "dotenv"
dotenv.config()

const port = process.env.PORT

import Airtable from "airtable"
Airtable.configure({
    endpointUrl: 'https://api.airtable.com',
    apiKey: process.env.API_KEY
})
const base = Airtable.base("appQcfrcSc0lfgpQH")

app.get("/flights", async (req, res) => {

    base('Flight Legs').select({
        maxRecords: 5,
        view: "Upcoming Legs"
    }).firstPage((err, records) => {
        if (err) {
            console.log(err)
            res.json(err)
        }

        const flightList = []

        records?.forEach((record) => {
            flightList.push(
                {
                    time: new Date(record.get("Departure Date/Time")).toDateString(),
                    airline: record.get("Airline"),
                    to: record.get("State (from Arrival Airport)")[0],
                    from: record.get("State (from Departure Airport)")[0],
                    flight: record.get("Flight Number")
                }
            )
        })

        res.json(flightList)
    })
})

app.listen(port, () => {
    console.log("App running on port http://localhost:" + port)
})