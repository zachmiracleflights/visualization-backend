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

const formatTime = (date) => {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    let timeString = hours + ':' + minutes + ' ' + ampm;
    return timeString;
}

app.get("/flights", async (req, res) => {

    base('Flight Legs').select({
        maxRecords: 10,
        view: "Today"
    }).firstPage((err, records) => {
        if (err) {
            console.log(err)
            res.json(err)
        }

        const flightList = []

        records?.forEach((record) => {
            flightList.push(
                {
                    time: formatTime(new Date(record.get("Departure Date/Time"))),
                    airline: record.get("Airline").substring(record.get("Airline").indexOf("-") + 1).trim(),
                    to: record.get("State (from Arrival Airport)"),
                    from: record.get("State (from Departure Airport)"),
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