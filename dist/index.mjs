import express from "express";
const app = express();
import cors from "cors"

import dotenv from "dotenv";
dotenv.config();

const port = process.env.PORT;

import Airtable from "airtable";
Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: process.env.AIRTABLE_KEY,
});
const base = Airtable.base("appQcfrcSc0lfgpQH");

const getAirport = async (recordID) => {
  const airport = await base("Directory: Airports").find(recordID);
  return airport.fields["Airport Code"];
};

const getCity = async (recordID) => {
  const airport = await base("Directory: Airports").find(recordID);
  return airport.fields["City"]
}

const getCoords = async (city) => {
  const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${city}&key=${process.env.GOOGLE_MAPS_API_KEY}`)
  const data = await res.json()
  return [data.results[0].geometry.location.lat, data.results[0].geometry.location.lng]
}

app.use(cors())

app.get("/departures", async (req, res) => {
  base("Flight Legs")
    .select({
      maxRecords: 10,
      view: "Today's Departures",
    })
    .firstPage(async (err, records) => {
      if (err) {
        console.log(err);
        res.json(err);
      }

      const flightList = [];

      for (const record of records) {
        const arrivalAirport = await getAirport(record.get("Arrival Airport"));
        const departureAirport = await getAirport(
          record.get("Departure Airport")
        );
        const departureCity = await getCity(record.get("Departure Airport"))
        const departureCoords = await getCoords(departureCity)
        const arrivalCity = await getCity(record.get("Arrival Airport"))
        const arrivalCoords = await getCoords(arrivalCity)
        flightList.push({
          time: new Date(record.get("Departure Date/Time")),
          timezone: record.get("Departure Timezone"),
          airline: record
            .get("Airline")
            .substring(record.get("Airline").indexOf("-") + 1)
            .trim(),
          to: arrivalAirport,
          from: departureAirport,
          flight: record.get("Flight Number"),
          arrival_time: new Date(record.get("Arrival Date/Time")),
          arrival_city: arrivalCity,
          arrival_coords: arrivalCoords,
          departure_city: departureCity,
          departure_coords: departureCoords
        });
      }

      res.json(flightList);
    });
});

app.get("/returns", async (req, res) => {
  base("Flight Legs")
    .select({
      maxRecords: 10,
      view: "Today's Returns",
    })
    .firstPage(async (err, records) => {
      if (err) {
        console.log(err);
        res.json(err);
      }

      const flightList = [];

      for (const record of records) {
        const arrivalAirport = await getAirport(record.get("Arrival Airport"));
        const departureAirport = await getAirport(
          record.get("Departure Airport")
        );
        const departureCity = await getCity(record.get("Departure Airport"))
        const departureCoords = await getCoords(departureCity)
        const arrivalCity = await getCity(record.get("Arrival Airport"))
        const arrivalCoords = await getCoords(arrivalCity)
        flightList.push({
          time: new Date(record.get("Departure Date/Time")),
          timezone: record.get("Departure Timezone"),
          airline: record
            .get("Airline")
            .substring(record.get("Airline").indexOf("-") + 1)
            .trim(),
          to: arrivalAirport,
          from: departureAirport,
          flight: record.get("Flight Number"),
          arrival_time: new Date(record.get("Arrival Date/Time")),
          arrival_city: arrivalCity,
          arrival_coords: arrivalCoords,
          departure_city: departureCity,
          departure_coords: departureCoords
        });
      }

      res.json(flightList);
    });
});

app.listen(port, () => {
  console.log("App running on port http://localhost:" + port);
});
