import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer, Zoom } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./Pages/Login";
import ProtectedRoutes from "./ProtectedRoutes";
import Layout from "./Layout";
import Home from "./Pages/Home";
import Profile from "./Pages/Profile";
import MatchList from "./Pages/MatchList";
import Message from "./Pages/Message";
import { useAuth } from "./context/AuthContext";
import { initSocket } from "./utils/Socket-Notif";

function App() {
  const { userdata } = useAuth();
  const [locationAllowed, setLocationAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    // Check and request location permission on load
    if (navigator.geolocation) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then((result) => {
          if (result.state === "granted") {
            setLocationAllowed(true);
          } else if (result.state === "denied") {
            setLocationAllowed(false);
          } else {
            // Ask user (this triggers browser popup)
            navigator.geolocation.getCurrentPosition(
              () => setLocationAllowed(true),
              () => setLocationAllowed(false)
            );
          }
        })
        .catch(() => setLocationAllowed(false));
    }
  }, []);

  useEffect(() => {
    if (userdata?._id) {
      initSocket(userdata._id);
    }
  }, [userdata]);

  //  While checking
  if (locationAllowed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600 text-lg">Checking location access...</p>
      </div>
    );
  }

  if (locationAllowed === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center p-4">
        <h2 className="text-xl font-bold text-red-600 mb-2">
          Location Access Needed
        </h2>
        <p className="text-gray-700 mb-4 max-w-md">
          You have blocked location access. Please enable it manually in your browser settings.
          <br />
          <br />
          <span className="font-semibold">
            Chrome:
          </span> Click the  icon → Site settings → Allow location.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg"
        >
          I’ve Enabled It — Retry
        </button>
      </div>
    );
  }


  return (
    <div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        limit={3}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss={false}
        draggable={false}
        pauseOnHover={false}
        theme="light"
        transition={Zoom}
      />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route element={<ProtectedRoutes />}>
          <Route element={<Layout />}>
            <Route path="/Home" element={<Home />} />
            <Route path="/Profile" element={<Profile />} />
            <Route path="/MatchList" element={<MatchList />} />
            <Route path="/Message" element={<Message />} />
          </Route>
        </Route>
      </Routes>
    </div>
  );
}

export default App;
