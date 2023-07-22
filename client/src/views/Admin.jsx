import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import {
  ADMIN_CREDENTIALS,
  CONSTANT,
  resetMessage,
  setMessage,
} from "../CONSTANT";

const Admin = () => {
  const [my_socket, setMySocket] = useState(null);

  useEffect(() => {
    const socket = io(CONSTANT.server);
    setMySocket(socket);
    socket.on("hello", (message) => {
      console.log(message);
    });
    socket.on("recentStatus", (status) => {
      setIsRecent(status);
    });

    socket.on("allRequests", (data) => {
      console.log(data);
      setSongRequests(data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);
  const [showLoginForm, setShowLoginForm] = useState(true);
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [selectedFilter, setSelectedFilter] = useState("");
  // You can replace the 'songRequests' array with actual data fetched from the server.
  const [songRequests, setSongRequests] = useState([]);
  const [isRecent, setIsRecent] = useState(true);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setCredentials((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  useEffect(() => {
    // Check if the user is already logged in (session exists)
    const isLoggedInFromSession =
      sessionStorage.getItem("isLoggedIn") === "true";
    if (isLoggedInFromSession) {
      setShowLoginForm(false);
    }
  }, []);

  const handleRecentStatus = () => {
    my_socket.emit("changeRecent", !isRecent);
    setIsRecent(!isRecent);
  };

  const handleLogin = () => {
    resetMessage();
    if (credentials.username !== "" && credentials.password !== "") {
      if (
        credentials.username === ADMIN_CREDENTIALS.username &&
        credentials.password === ADMIN_CREDENTIALS.password
      ) {
        sessionStorage.setItem("isLoggedIn", "true");
        setShowLoginForm(false);
      } else {
        setMessage("Invalid credentials.", "red-500");
      }
    } else {
      setMessage("Enter credentials.", "red-500");
    }
  };

  const handleFilterChange = (event) => {
    setSelectedFilter(event.target.value);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("isLoggedIn");
    setShowLoginForm(true);
  };

  const handleCheck = (payload) => {
    fetch(`${CONSTANT.server}requests/update/${payload._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ isFulfilled: !payload.isFulfilled }),
    })
      .then((response) => response.json())
      .then((data) => {
        let newUpdate = songRequests.map((a, b) => {
          if (a._id.toString() === payload._id.toString()) {
            return data;
          }
          return a;
        });
        setSongRequests(newUpdate);
      })
      .catch((error) => {
        console.error("Error updating song request:", error);
      });
  };

  return (
    <div className="bg-gray-200 min-h-screen flex items-center justify-center w-full">
      <div className="bg-white p-4 md:p-8 rounded-md shadow-md  md:w-11/12 w-full">
        {showLoginForm ? (
          <>
            <h1 className="text-2xl font-bold mb-4 text-center">Admin Login</h1>
            <input
              type="text"
              placeholder="Enter username..."
              className="w-full border border-gray-300 rounded-md p-2 mb-4"
              name="username"
              value={credentials.username}
              onChange={handleInputChange}
            />
            <input
              type="password"
              placeholder="Enter password..."
              className="w-full border border-gray-300 rounded-md p-2 mb-4"
              name="password"
              value={credentials.password}
              onChange={handleInputChange}
            />
            <span id="error"></span>
            <button
              className="bg-purple-700 mt-3 hover:bg-purple-800 text-white py-2 px-4 rounded-md w-full"
              onClick={handleLogin}
            >
              Login
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold">Admin</h1>
              <div className="flex md:flex-row flex-col md:space-x-5 space-x-0 space-y-5 md:space-y-0">
                <button
                  className="text-purple-700 hover:text-purple-800"
                  onClick={handleRecentStatus}
                >
                  {isRecent ? "Hide" : "Show"} Recent Tab
                </button>
                <button
                  className="text-red-700 hover:text-red-800"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </div>
            <select
              className="w-full md:w-1/4 border border-gray-300 rounded-md p-2"
              value={selectedFilter}
              onChange={handleFilterChange}
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="fulfilled">Fulfilled</option>
            </select>
            <div className="overflow-x-auto mt-5">
              <table className="w-full table-auto border border-gray-300">
                <thead>
                  <tr>
                    <th className="border border-gray-300 px-4 py-2">Song</th>
                    <th className="border border-gray-300 px-4 py-2">Singer</th>
                    <th className="border border-gray-300 px-4 py-2">
                      Timestamp
                    </th>
                    <th className="border border-gray-300 px-4 py-2">
                      Fulfilled
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {songRequests
                    .filter((request, index) => {
                      if (selectedFilter === "") {
                        return true;
                      }
                      return (
                        (request.isFulfilled &&
                          selectedFilter === "fulfilled") ||
                        (!request.isFulfilled && selectedFilter === "pending")
                      );
                    })
                    .map((request, index) => (
                      <tr key={index}>
                        <td className="border border-gray-300 px-4 py-2">
                          {request.song}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {request.singer}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {new Date(request.addedAt).toLocaleString()}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          <label className="flex items-center justify-center">
                            <input
                              onClick={() => {
                                handleCheck(request);
                              }}
                              type="checkbox"
                              checked={request.isFulfilled}
                              className="form-checkbox cursor-pointer rounded h-5 w-5 text-purple-700"
                              readOnly
                            />
                          </label>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {songRequests.length <= 0 && (
                <div className="mt-5 text-center w-full text-gray-400">
                  No requests...
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Admin;
