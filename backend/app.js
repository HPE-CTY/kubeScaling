const express = require("express");
const cors = require("cors");
const fs = require("fs");
const yaml = require("yaml");
const { Pool } = require("pg");
const { exec } = require("child_process");
const path = require("path");
const dotenv = require("dotenv");

const envPath = path.join(__dirname, "..", ".env"); //change as per requirement
dotenv.config({ path: envPath }); //.env config 
const pool = new Pool({
  user: process.env.user,
  host: "localhost",
  database: process.env.database,
  password: process.env.password,
  port: process.env.port,
});

const app = express();
const port = 3001;

const corsOptions = {
  origin: "http://localhost:5173",
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const hpaFilePath = process.env.HPA_FILE_PATH;

app.post("/update-hpa", (req, res) => {
  let { averageValue, averageUtilization } = req.body;

  if (!averageValue || isNaN(parseFloat(averageValue))) {
    averageValue = "500";
  }

  if (!averageUtilization || isNaN(parseInt(averageUtilization))) {
    averageUtilization = 50;
  }

  const insertQuery =
    "INSERT INTO hpa_config (average_http_value, average_utilisation_percentage) VALUES ($1, $2)";

  pool.query(
    insertQuery,
    [parseInt(averageValue), parseInt(averageUtilization)],
    (err, result) => {
      if (err) {
        console.error("Error inserting data into PostgreSQL:", err);
        return res.status(500).send("Error inserting data into PostgreSQL");
      }

      console.log("Data inserted into PostgreSQL:", result.rows);

      fs.readFile(hpaFilePath, "utf8", (readErr, data) => {
        if (readErr) {
          console.error("Error reading HPA configuration file:", readErr);
          return res.status(500).send("Error reading HPA configuration file");
        }

        let hpaConfig;
        try {
          hpaConfig = yaml.parse(data);
        } catch (parseErr) {
          console.error("Error parsing HPA configuration file:", parseErr);
          return res.status(500).send("Error parsing HPA configuration file");
        }

        hpaConfig.spec.metrics[0].pods.target.averageValue = `${parseFloat(
          averageValue
        )}m`;
        hpaConfig.spec.metrics[1].resource.target.averageUtilization =
          parseInt(averageUtilization);

        const newYaml = yaml.stringify(hpaConfig);

        fs.writeFile(hpaFilePath, newYaml, (writeErr) => {
          if (writeErr) {
            console.error("Error writing HPA configuration file:", writeErr);
            return res.status(500).send("Error writing HPA configuration file");
          }
          console.log("kubectl apply -f ", hpaFilePath);
          exec(`kubectl apply -f ${hpaFilePath}`, (execErr, stdout, stderr) => {
            if (execErr) {
              console.error(`Error applying configuration: ${stderr}`);
              return res.status(500).send("Error applying HPA configuration");
            }

            console.log(`kubectl apply stdout: ${stdout}`);
            return res.send(
              "HPA configuration updated and applied successfully"
            );
          });
        });
      });
    }
  );
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
