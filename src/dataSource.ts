import { DataSource } from "typeorm";

// Use Enviroment Variables
import dotenv from "dotenv";
dotenv.config();

const dataSource = new DataSource({
  type: "mongodb",
  url: process.env.DATABASE_URL,
  useNewUrlParser: true,
  synchronize: true,
  logging: true,
  entities: ["src/entities/*.*"],
});

// Initiate the connection to the database
dataSource
  .initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
  })
  .catch((err) => {
    console.error("Error during Data Source initialization:", err);
  });

export default dataSource;
