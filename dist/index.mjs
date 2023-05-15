import express from "express";
const app = express();

import dotenv from "dotenv";
dotenv.config();

const port = process.env.PORT;

import Airtable from "airtable";
Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: process.env.API_KEY,
});
const base = Airtable.base("appQcfrcSc0lfgpQH");

const getAirport = async (recordID) => {
  const airport = await base("Directory: Airports").find(recordID);
  return airport.fields["Airport Code"];
};

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
        flightList.push({
          time: new Date(record.get("Departure Date/Time")),
          airline: record
            .get("Airline")
            .substring(record.get("Airline").indexOf("-") + 1)
            .trim(),
          to: arrivalAirport,
          from: departureAirport,
          flight: record.get("Flight Number"),
          arrival_time: new Date(record.get("Arrival Date/Time")),
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
        flightList.push({
          time: new Date(record.get("Departure Date/Time")),
          airline: record
            .get("Airline")
            .substring(record.get("Airline").indexOf("-") + 1)
            .trim(),
          to: arrivalAirport,
          from: departureAirport,
          flight: record.get("Flight Number"),
          arrival_time: new Date(record.get("Arrival Date/Time")),
        });
      }

      res.json(flightList);
    });
});

app.listen(port, () => {
  console.log("App running on port http://localhost:" + port);
});
