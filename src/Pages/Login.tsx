import { useState, } from "react";
import type { ChangeEvent, FormEvent, } from "react";

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
    });

    const cleanForm = () => {
        setFormData({
            name: "",
            shortBio: "",
            Age: "",
            Email: "",
            Password: "",
        });
        setErrorMsg("");
        setProfileImage(null);
        setProfileImageFile(null);
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProfileImage(URL.createObjectURL(file));
            setProfileImageFile(file);
        }
    };
 // hanle Login and Signup submit
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        if (isLogin) {
            // LOGIN
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
                    localStorage.setItem("theme", "dark");

                    showToast("success", "Login successful");
                    await login();
                    navigate("/Home");
                }
            } catch (err: any) {
                setErrorMsg(err.response?.data?.message || "Login failed");
                showToast("error", "Error logging in");
            }
        } else {
            // SIGNUP
            try {
                const formDataToSend = new FormData();
                formDataToSend.append("Email", formData.Email);
                formDataToSend.append("Name", formData.name);
                formDataToSend.append("Password", formData.Password);
                formDataToSend.append("Age", formData.Age);
                formDataToSend.append("bio", formData.shortBio);
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
        <div className="hero min-h-screen bg-base-200">
            <div className="hero-content flex-col">
                <div className="card w-full max-w-2xl shadow-2xl rounded-2xl p-8 bg-base-100 border border-info-content">
                    <h1 className="text-3xl font-bold text-center mb-2 text-accent">
                        {isLogin ? "Login" : "New User Sign-Up"}
                    </h1>
                    <p className="text-center text-info-content mb-6">
                        {isLogin ? "Access your account" : "Register using your Email"}
                    </p>
                    <p className={`text-red-400 text-center transition-opacity duration-300 ${errorMsg ? 'opacity-100' : 'opacity-0'}`}>
                        {errorMsg}
                    </p>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {isLogin ? (
                            <>
                                
                                <div className="md:col-span-2">
                                    <label className="label font-semibold">Email</label>
                                    <input
                                        type="Email"
                                        name="Email"
                                        className="input input-bordered w-full bg-base-200"
                                        placeholder="Enter your Email"
                                        value={formData.Email}
                                        onChange={handleChange}
                                        required
                                        readOnly={isLoading}
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="label font-semibold">Password</label>
                                    <input
                                        type="password"
                                        name="Password"
                                        className="input input-bordered w-full bg-base-200"
                                        placeholder="Enter password"
                                        value={formData.Password}
                                        onChange={handleChange}
                                        required
                                        readOnly={isLoading}
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="md:col-span-2">
                                    <label className="label font-semibold">Email</label>
                                    <input
                                        type="Email"
                                        name="Email"
                                        className="input input-bordered w-full bg-base-200"
                                        placeholder="Enter your Email"
                                        value={formData.Email}
                                        onChange={handleChange}
                                        required
                                        readOnly={isLoading}
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="label font-semibold">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        className="input input-bordered w-full bg-base-200"
                                        placeholder="Enter your name"
                                        value={formData.name}
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
                                        className="input input-bordered w-full bg-base-200"
                                        placeholder="Enter password"
                                        value={formData.Password}
                                        onChange={handleChange}
                                        required
                                        readOnly={isLoading}
                                    />
                                </div>

                                <div>
                                    <label className="label font-semibold">Age</label>
                                    <input
                                        type="Number"
                                        name="Age"
                                        className="input input-bordered w-full bg-base-200"
                                        value={formData.Age}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="label font-semibold">Short Bio</label>
                                    <textarea
                                        name="shortBio"
                                        className="textarea textarea-bordered w-full bg-base-200"
                                        placeholder="Tell us about yourself..."
                                        rows={3}
                                        value={formData.shortBio}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="md:col-span-2">
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
                                                className="w-24 h-24 object-cover rounded-full shadow-md"
                                            />
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        <div className="md:col-span-2 mt-4">
                            <button
                                className="btn w-full bg-accent text-white transition-colors duration-300"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <span className="loading loading-spinner loading-xl "></span>
                                ) : (
                                    isLogin ? "Login" : "Sign Up"
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center text-accent">
                        <p className="text-sm">
                            {isLogin
                                ? "Don't have an account?"
                                : "Already have an account?"}{" "}
                            <button
                                onClick={() => {
                                    cleanForm();
                                    setIsLogin(!isLogin);
                                }}
                                className="link link-primary font-semibold "
                            >
                                {isLogin ? "Sign Up" : "Login"}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
