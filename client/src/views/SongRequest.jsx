import React, { useState, useEffect } from "react";

import io from "socket.io-client";
import { CONSTANT, resetMessage, setMessage } from "../CONSTANT";
import logo from "./../assets/logo.png";

const SongRequest = () => {
  const [my_socket, setMySocket] = useState(null);
  const [isRecent, setIsRecent] = useState(true);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    const socket = io(CONSTANT.server);
    setMySocket(socket);
    socket.on("hello", (message) => {
      console.log(message);
    });

    socket.on("recentStatus", (status) => {
      setIsRecent(status);
    });
    socket.on("recentFulfilledRequests", (data) => {
      setRecent(data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const __INIT__ = {
    song: "",
    singer: "",
  };

  const [data, setData] = useState(__INIT__);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Function to handle sending the song request
  const handleSendRequest = () => {
    const lastRequestTime = localStorage.getItem("lastRequestTime");
    const currentTime = Date.now();
    const delayInSeconds = 30;

    if (
      lastRequestTime &&
      currentTime - lastRequestTime < delayInSeconds * 1000
    ) {
      const secondsLeft = Math.ceil(
        (delayInSeconds * 1000 - (currentTime - lastRequestTime)) / 1000
      );
      setMessage(
        `Please wait for ${secondsLeft} seconds before sending another request.`,
        "red-500"
      );
    } else {
      resetMessage();
      if (data.song !== "") {
        my_socket.emit("newRequest", data);
        setData(__INIT__);
        setMessage("Thank you for your request.", "green-500");
        localStorage.setItem("lastRequestTime", currentTime);
      } else {
        setMessage("Enter song name.", "red-500");
      }
    }
  };

  return (
    <div className="bg-gray-200 min-h-screen py-10 flex items-center justify-center flex-col">
      <div className="mb-5 w-80 md:w-80 flex items-center justify-center">
        <img src={logo} className="h-40 w-full" />
      </div>
      <div className="bg-white p-8 rounded-md shadow-md w-full md:w-96">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Ask for anything
        </h1>
        <input
          type="text"
          placeholder="Enter song name"
          className="w-full border border-gray-300 rounded-md p-2 mb-4"
          name="song"
          value={data.song}
          onChange={handleInputChange}
        />
        <input
          type="text"
          placeholder="Enter artist name (Optional)"
          className="w-full border border-gray-300 rounded-md p-2 mb-4"
          name="singer"
          value={data.singer}
          onChange={handleInputChange}
        />
        <span id="error"></span>
        <button
          className="bg-purple-700 mt-3 hover:bg-purple-800 text-white py-2 px-4 rounded-md w-full"
          onClick={handleSendRequest}
        >
          Send Request
        </button>
      </div>
      {isRecent && (
        <div className="mt-5 bg-white p-8 rounded-md shadow-md w-full md:w-96">
          <h1 className="text-2xl font-bold mb-4 text-center">
            Recently Played
          </h1>
          <ul>
            {recent.map((item, index) => (
              <li key={item.id} className="mb-2">
                <span className="font-bold">
                  {index + 1}. {item.song}
                </span>{" "}
                {item.singer ? `by ${item.singer}` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SongRequest;
