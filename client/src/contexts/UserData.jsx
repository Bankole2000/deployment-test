import React from "react";

const UserData = React.createContext({
  session: {
    access_token: "",
    personal: {
      id: "",
      email: "",
      username: "",
      role: "",
    },
    isLoggedIn: false,
  },
  setSession: () => {},
});

export default UserData;
