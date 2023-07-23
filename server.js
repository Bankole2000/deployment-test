const express = require("express");
const router = express.Router();
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const requestsRoute = require("./routes/requestsRoute");
const requestsModel = require("./models/requestsModel");

const cors = require("cors");
const port = process.env.PORT || 4000;

// ========
// SOCKET IO START
// ========

// ========
// CONNECTION START
// ========

const { createServer } = require("http");
const { Server } = require("socket.io");
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
// ========
// CONNECTION END
// ========

// ========
// GLOBAL VARIABLES START
// ========

var SHOW_RECENT = true;

// ========
// GLOBAL VARIABLES END
// ========
// ========
// FUNCTIONS START
// ========

const __DEBUG__ = (message, id, error = false) => {
  console.log(`[${error ? "ERROR" : "DEBUG"}][${id}]: ${message}`);
};

const changeRecentStatus = (value) => {
  SHOW_RECENT = value;
};

// ========
// FUNCTIONS END
// ========

io.on("connection", function (socket) {
  __DEBUG__("Client connected!", socket.id);
  io.emit("hello", "Hello, everyone!");

  // Function to send all song requests to connected clients
  const sendAllRequests = () => {
    requestsModel.find(
      {},
      null,
      {
        sort: { addedAt: -1 },
      },
      (err, requests) => {
        if (err) {
          __DEBUG__("Fetching song requests!", "", true);
        } else {
          io.emit("allRequests", requests);
        }
      }
    );
  };

  const sendRecentFulfilledRequests = () => {
    requestsModel.find(
      { isFulfilled: true }, // Find fulfilled requests based on the "isFulfilled" field being true
      null,
      {
        sort: { fulfilledAt: -1 }, // Assuming there's a field "fulfilledAt" for tracking fulfillment time
        limit: 4,
      },
      (err, requests) => {
        if (err) {
          __DEBUG__("Fetching recent fulfilled requests!", "", true);
        } else {
          io.emit("recentFulfilledRequests", requests);
        }
      }
    );
  };

  // Send all requests data when a new client connects
  sendAllRequests();
  if (SHOW_RECENT) {
    sendRecentFulfilledRequests();
  }
  io.emit("recentStatus", SHOW_RECENT);

  socket.on("newRequest", function (data) {
    // Create a new instance of the Mongoose model with the received data
    const newRequest = new requestsModel({
      song: data.song,
      singer: data.singer,
    });

    // Save the new song request to the database
    newRequest
      .save()
      .then(() => {
        __DEBUG__("New song request saved to the database!", data.song);
        sendAllRequests();
      })
      .catch((error) => {
        __DEBUG__("Error saving song request!", "", true);
      });
  });

  socket.on("changeRecent", function (data) {
    changeRecentStatus(data);
    io.emit("recentStatus", SHOW_RECENT);
  });

  socket.on("disconnect", function () {
    __DEBUG__("Client disconnected!", socket.id);
  });
});

// ========
// SOCKET IO END
// ========

dotenv.config();
mongoose.connect(
  process.env.DATABASE,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  },
  () => {
    console.log("Database connected...");
  }
);

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "client", "dist")));
// app.use(express.static(path.join(__dirname, "../", "client", "build")));
app.use("/requests", requestsRoute);

app.get("*", (req, res) => {
  // res.sendFile(path.join(__dirname, "../", "client", "build", "index.html"));
  res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
});

httpServer.listen(port, () => {
  console.log("Backend is running....");
});
