import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

import { Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { showToast } from "../components/ToastNotif";

interface FormData {
    name: string;
    shortBio: string;
    Age: string;
    Email: string;
    Password: string;
    Latitude: string;
    Longitude: string;
}

export default function Login() {
    const Baseurl = import.meta.env.VITE_BASEURL as string;
    const { user, login } = useAuth();
    const navigate = useNavigate();

    if (user) return <Navigate to="/Home" replace />;

    const [isLoading, setIsLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [profileImageFile, setProfileImageFile] = useState<File | null>(null);

    const [formData, setFormData] = useState<FormData>({
        name: "",
        shortBio: "",
        Age: "",
        Email: "",
        Password: "",
        Latitude: "",
        Longitude: "",
    });

    // Reset form data and error messages
    const cleanForm = () => {
        setFormData({
            name: "",
            shortBio: "",
            Age: "",
            Email: "",
            Password: "",
            Latitude: "",
            Longitude: "",
        });
        setErrorMsg("");
        setProfileImage(null);
        setProfileImageFile(null);
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProfileImage(URL.createObjectURL(file));
            setProfileImageFile(file);
        }
    };

    // Get user's current geolocation
    const getLocation = (): Promise<{ lat: string; lng: string }> => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) return reject("Not supported");

            navigator.geolocation.getCurrentPosition(
                (pos) =>
                    resolve({
                        lat: pos.coords.latitude.toString(),
                        lng: pos.coords.longitude.toString(),
                    }),
                (err) => reject(err)
            );
        });
    };

    //! Handle form submission for login and sign-up
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        if (isLogin) {
            try {
                const res = await axios.post(`${Baseurl}/user/auth/login`, {
                    Email: formData.Email,
                    Password: formData.Password,
                });

                if (res.status === 200) {
                    localStorage.setItem("userId", res.data.Data._id);
                    localStorage.setItem("Email", res.data.Data.Email);
                    localStorage.setItem("AccessToken", res.data.Data.AccessToken);
                    localStorage.setItem("Refresh_Token", res.data.Data.Refresh_Token);

                    showToast("success", "Login successful");
                    await login();
                    navigate("/Home");
                }
            } catch (err: any) {
                setErrorMsg(err.response?.data?.message || "Login failed");
                // showToast("error", "Error logging in");
            }
        } else {
            try {

                if (formData.Age && parseInt(formData.Age) < 18) {
                    setErrorMsg("You must be at least 18 years old to sign up.");
                    setIsLoading(false);
                    return;
                }
                const formDataToSend = new FormData();
                formDataToSend.append("Email", formData.Email);
                formDataToSend.append("Name", formData.name);
                formDataToSend.append("Password", formData.Password);
                formDataToSend.append("Age", formData.Age);
                formDataToSend.append("bio", formData.shortBio);

                const { lat, lng } = await getLocation();
                formDataToSend.append("Latitude", lat);
                formDataToSend.append("Longitude", lng);

                if (profileImageFile) formDataToSend.append("Image", profileImageFile);

                const res = await axios.post(`${Baseurl}/user/auth/signup`, formDataToSend, {
                    headers: { "Content-Type": "multipart/form-data" },
                });

                showToast("success", res.data.message);
                setIsLogin(true);
                cleanForm();
            } catch (err: any) {
                setErrorMsg(err.response?.data?.message || "Sign-up failed");
                showToast("error", "Error signing up");
            }
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
            <div className="bg-base-100 shadow-2xl rounded-3xl p-8 w-full max-w-md">
                <h1 className="text-3xl font-bold text-center text-accent mb-1">
                    {isLogin ? "Welcome Back!" : "Create Account"}
                </h1>
                <p className="text-center text-base-content/70 mb-6">
                    {isLogin ? "Sign in to continue" : "Sign up to get started"}
                </p>


                {errorMsg && (
                    <div className="bg-red-100 text-red-600 text-center py-2 rounded-lg mb-4 animate-pulse">
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label font-semibold">Email</label>
                        <input
                            type="email"
                            name="Email"
                            placeholder="Enter your email"
                            className="input input-bordered w-full bg-base-200 focus:bg-base-100 focus:border-accent transition rounded-lg px-4 py-3"
                            value={formData.Email}
                            onChange={handleChange}
                            required
                            readOnly={isLoading}
                        />
                    </div>

                    <div>
                        <label className="label font-semibold">Password</label>
                        <input
                            type="password"
                            name="Password"
                            placeholder="Enter password"
                            className="input input-bordered w-full bg-base-200 focus:bg-base-100 focus:border-accent transition rounded-lg px-4 py-3"
                            value={formData.Password}
                            onChange={handleChange}
                            required
                            readOnly={isLoading}
                        />
                    </div>

                    {/* // for the Signup */}
                    {!isLogin && (
                        <>
                            <div>
                                <label className="label font-semibold">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Enter your full name"
                                    className="input input-bordered w-full bg-base-200 focus:bg-base-100 focus:border-accent transition rounded-lg px-4 py-3 truncate"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    readOnly={isLoading}
                                />
                            </div>

                            <div>
                                <label className="label font-semibold">Age</label>
                                <input
                                    type="number"
                                    name="Age"
                                    placeholder="Enter your age"
                                    className="input input-bordered w-full bg-base-200 focus:bg-base-100 focus:border-accent transition rounded-lg px-4 py-3"
                                    value={formData.Age}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div>
                                <label className="label font-semibold">Short Bio</label>
                                <textarea
                                    name="shortBio"
                                    placeholder="Tell us about yourself..."
                                    className="textarea textarea-bordered w-full bg-base-200 focus:bg-base-100 focus:border-accent transition rounded-lg px-4 py-3"
                                    rows={3}
                                    value={formData.shortBio}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <label className="label font-semibold">Profile Picture</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="file-input file-input-bordered w-full"
                                    onChange={handleImageChange}
                                />
                                {profileImage && (
                                    <div className="mt-3 flex justify-center">
                                        <img
                                            src={profileImage}
                                            alt="Profile Preview"
                                            className="w-28 h-28 object-cover rounded-full shadow-md"
                                        />
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn w-full bg-accent hover:bg-accent-focus text-white font-semibold py-3 rounded-xl transition-all"
                    >
                        {isLoading ? (
                            <span className="loading loading-spinner loading-lg"></span>
                        ) : isLogin ? (
                            "Login"
                        ) : (
                            "Sign Up"
                        )}
                    </button>
                </form>
                
                {/* // Toggle between Login and Sign-up */}
                <p className="mt-6 text-center text-base-content/70 text-sm">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                    <button
                        onClick={() => {
                            cleanForm();
                            setIsLogin(!isLogin);
                        }}
                        className="text-accent font-semibold hover:underline"
                    >
                        {isLogin ? "Sign Up" : "Login"}
                    </button>
                </p>
            </div>
        </div>
    );
}
