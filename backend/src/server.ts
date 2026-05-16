import express from "express";
import cors from "cors";
import helmet from "helmet";

const server = express();

server.use(cors());
server.use(helmet());
server.use(express.json());

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
