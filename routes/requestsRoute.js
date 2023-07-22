const express = require("express");
const router = express.Router();
const requestsModel = require("../models/requestsModel");

router.post("/insert", (request, responce) => {
  let requestsModelObject = new requestsModel({
    song: request.body.song ?? "",
    singer: request.body.singer ?? "",
  });
  requestsModelObject
    .save()
    .then((callbackData) => {
      responce.json(callbackData);
    })
    .catch((error) => {
      responce.json(error);
    });
});

router.get("/view", (request, responce) => {
  // requestsModel.remove({})
  requestsModel.find(
    {},
    null,
    {
      sort: { addedAt: -1 },
    },
    (error, data) => {
      if (error) {
        console.log(error);
      } else {
        responce.json(data);
      }
    }
  );
});

router.put("/update/:id", (request, response) => {
  const requestId = request.params.id;
  const newIsFulfilledValue = request.body.isFulfilled;

  requestsModel.findByIdAndUpdate(
    requestId,
    { $set: { isFulfilled: newIsFulfilledValue } },
    { new: true },
    (error, updatedRequest) => {
      if (error) {
        console.log(error);
        response.status(500).json({ error: "Failed to update the request." });
      } else {
        response.json(updatedRequest);
      }
    }
  );
});

module.exports = router;
