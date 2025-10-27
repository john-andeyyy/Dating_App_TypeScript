import { useEffect } from "react";
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

  useEffect(() => {
    if (userdata?._id) {
      initSocket(userdata._id);
    }
  }, [userdata]);

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
};

export default App;
