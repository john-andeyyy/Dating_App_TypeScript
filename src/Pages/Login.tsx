import React, { useState } from "react";
import type { FormEvent, ChangeEvent } from "react";

import { Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { showToast } from "../components/ToastNotif";

interface FormData {
    name: string;
    shortBio: string;
    Birthday: string;
    email: string;
    Password: string;
    Phonenumber: string;
}

export default function Login() {
    const Baseurl = import.meta.env.VITE_BASEURL as string;
    const { user, login } = useAuth();
    const navigate = useNavigate();

    if (user) return <Navigate to="/Home" replace />;

    const [isLoading, setIsLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    const [registerWith, setRegisterWith] = useState<"email" | "mobile">("email");
    const [errorMsg, setErrorMsg] = useState("");
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [profileImageFile, setProfileImageFile] = useState<File | null>(null);

    const [formData, setFormData] = useState<FormData>({
        name: "",
        shortBio: "",
        Birthday: "",
        email: "",
        Password: "",
        Phonenumber: "",
    });

    const cleanform = () => {
        setFormData({
            name: "",
            shortBio: "",
            Birthday: "",
            email: "",
            Password: "",
            Phonenumber: "",
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

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        if (isLogin) {
            try {
                const res = await axios.post(`${Baseurl}/user/auth/login`, {
                    Username: formData.name,
                    Password: formData.Password,
                });

                if (res.status === 200) {
                    localStorage.setItem("userId", res.data.Data._id);
                    localStorage.setItem("username", res.data.Data.Username);
                    localStorage.setItem("AccessToken", res.data.Data.AccessToken);
                    localStorage.setItem("Refresh_Token", res.data.Data.Refresh_Token);

                    showToast("success", "Login successful");
                    await login();
                    navigate("/Home");
                }
            } catch (err: any) {
                setErrorMsg(err.response?.data?.message || "Login failed");
                showToast("error", "Error logging in");
            }
        } else {
            try {
                const formDataToSend = new FormData();
                formDataToSend.append("Username", formData.email);
                formDataToSend.append("Name", formData.name);
                formDataToSend.append("Password", formData.Password);
                formDataToSend.append("Phonenumber", formData.Phonenumber);
                formDataToSend.append("Birthday", formData.Birthday);
                formDataToSend.append("bio", formData.shortBio);
                if (profileImageFile) formDataToSend.append("Image", profileImageFile);

                const res = await axios.post(`${Baseurl}/user/auth/signup`, formDataToSend, {
                    headers: { "Content-Type": "multipart/form-data" },
                });

                showToast("success", res.data.message);
                setIsLogin(true);
                cleanform();
            } catch (err: any) {
                setErrorMsg(err.response?.data?.message || "Sign-up failed");
                showToast("error", "Error signing up");
            }
        }

        setIsLoading(false);
    };

    return (
        <div className="hero min-h-screen bg-base-200">
            <div className="hero-content flex-col ">
                <div className="card w-full max-w-2xl shadow-2xl rounded-2xl p-8 bg-base-100 border-1 border-info-content">
                    <h1 className="text-3xl font-bold text-center mb-2 text-accent">
                        {isLogin ? "Login" : "New User Sign-Up"}
                    </h1>
                    <p className="text-center text-info-content mb-6">
                        {isLogin
                            ? "Access your account"
                            : `Register using your ${registerWith}`}
                    </p>
                    <p className={`text-red-400 text-center transition-opacity duration-300 ${errorMsg ? 'opacity-100' : 'opacity-0'}`}>
                        {errorMsg}
                    </p>


                    {!isLogin && (
                        <div className="flex justify-center gap-4 mb-4">
                            <button
                                type="button"
                                className={`btn btn-sm ${registerWith === "email" ? "btn-neutral" : "btn-outline"
                                    }`}
                                onClick={() => setRegisterWith("email")}
                            >
                                Email
                            </button>
                            <button
                                type="button"
                                className={`btn btn-sm ${registerWith === "mobile" ? "btn-neutral" : "btn-outline"
                                    }`}
                                onClick={() => setRegisterWith("mobile")}
                            >
                                Mobile
                            </button>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {isLogin ? (
                            <>
                                <div className="md:col-span-2">
                                    <label className="label font-semibold">Email/Phone Number</label>
                                    <input
                                        type="text"
                                        name="name"
                                        className="input input-bordered w-full bg-base-200"
                                        placeholder="Enter Email/ Phone Number"
                                        value={formData.name}
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
                                        placeholder="Enter Password"
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
                                    {/* <label className="label font-semibold">
                                        {registerWith === "email" ? "Email" : "Mobile Number"}
                                    </label> */}
                                    <label className="label font-semibold">
                                        {registerWith === "email" ? "Email" : "Mobile Number"}
                                    </label>
                                    <input
                                        type={registerWith === "email" ? "email" : "tel"}
                                        name={registerWith === "email" ? "email" : "mobile"}
                                        className="input input-bordered w-full bg-base-200"
                                        placeholder={`Enter your ${registerWith === "email" ? "email" : "mobile number"}`}
                                        value={registerWith === "email" ? formData.email : formData.Phonenumber}
                                        onChange={(e) => {
                                            if (registerWith === "email") {
                                                setFormData({ ...formData, email: e.target.value });
                                            } else {
                                                setFormData({
                                                    ...formData,
                                                    Phonenumber: e.target.value.replace(/\D/g, "") // only numbers
                                                });
                                            }
                                        }}
                                        {...(registerWith !== "email" && {
                                            pattern: "[0-9]{11}",
                                            maxLength: 11,
                                            inputMode: "numeric"
                                        })}
                                        required
                                        readOnly={isLoading}

                                    />


                                    <div>
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
                                    <label className="label font-semibold">Birthday</label>
                                    <input
                                        type="date"
                                        name="Birthday"
                                        className="input input-bordered w-full bg-base-200"
                                        value={formData.Birthday}
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
                                    // required
                                    ></textarea>
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
                            <button className="btn w-full bg-accent text-black transition-colors duration-300">
                                {isLoading ? (
                                    <div className="flex justify-center items-center h-full">
                                        <span className="loading loading-spinner loading-xl"></span>
                                    </div>
                                ) : (
                                    <> {isLogin ? "Login" : "Sign Up"}</>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center text-white">
                        <p className="text-sm ">
                            {isLogin
                                ? "Don't have an account?"
                                : "Already have an account?"}{" "}
                            <button
                                onClick={() => {
                                    cleanform();
                                    setIsLogin(!isLogin);

                                }}
                                className="link link-primary font-semibold"
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
