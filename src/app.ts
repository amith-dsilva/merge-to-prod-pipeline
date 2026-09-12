import cors from "cors";
import express from "express";
import helmet from "helmet";

import routes from "./routes/index.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { notFoundHandler } from "./middleware/not-found.middleware.js";

const app = express();

app.disable("x-powered-by");

app.use(helmet());
app.use(cors());

app.use(express.json({
  limit: "1mb"
}));

app.use(express.urlencoded({
  extended: true
}));

app.use("/api/v1", routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;