import React from "react";
import { Routes, Route, BrowserRouter as Router } from "react-router-dom";
import Home from "./views/Home";
import SongRequest from "./views/SongRequest";
import Admin from "./views/Admin";
import Layout from "./layout/Layout";

function App() {
  return (
    <div className="App">
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<SongRequest />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </Layout>
      </Router>
    </div>
  );
}

export default App;
