import { useEffect, useState, } from "react";
import type { ChangeEvent } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { showToast } from "../components/ToastNotif";
import ThemeToggle from "../components/ThemeToggle";

interface UserData {
    id: string;
    email: string;
    name: string;
    Age: number;
    bio: string;
    image: any;
    gender: string;
    interestedIn: string;
    photo: File | null;
}



interface PasswordData {
    Password: string;
    NewPass: string;
}

export default function Profile() {
    const { user } = useAuth();
    const Baseurl = import.meta.env.VITE_BASEURL as string;
    const accessToken = localStorage.getItem("AccessToken") ?? "";

    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPass, setIsChangingPass] = useState(false);
    const [isLoading, setisLoading] = useState(true);
    const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState("");


    const [Userdata, setUser] = useState<UserData>({
        id: user?._id || "",
        email: user?.Email || "",
        name: user?.Name || "",
        Age: user?.Age || "",
        bio: user?.bio || "",
        gender: user?.gender || "",
        interestedIn: user?.interestedIn || "",
        image: user?.Image || null,
        photo: null,
    });

    const [passwordData, setPasswordData] = useState<PasswordData>({
        Password: "",
        NewPass: "",
    });


    const inputClass =
        "w-full border border-gray-500 bg-base-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400";
    const buttonBase =
        "px-4 py-2 rounded-lg transition-all duration-200 text-white";

    // Load user data on mount
    useEffect(() => {
        if (user) {
            setisLoading(true);

            const timer = setTimeout(() => {
                setUser({
                    id: user._id || "",
                    email: user.Email || "",
                    name: user.Name || "",
                    Age: user.Age || "",
                    bio: user.bio || "",
                    image: user.Image || null,
                    photo: null,
                    gender: user.gender || "",
                    interestedIn: user?.interestedIn || "",
                });

                setisLoading(false);
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [user]);


    // --- Handlers ---
    const handleCancel = () => {
        setIsEditing(false);
        setErrorMsg("")
        setPasswordData({
            Password: "",
            NewPass: "",
        });
        if (user) {
            setUser({
                id: user._id || "",
                email: user.Email || "",
                name: user.Name || "",
                Age: user.Age || "",
                bio: user.bio || "",
                image: user.Image || null,
                photo: null,
                gender: user.gender || "",
                interestedIn: user?.interestedIn || "",
            });
            setPreviewPhoto(user.Image ? getImageSrc(user.Image) : null);
        }
    };

    // input change handler
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setUser((prev) => ({ ...prev, [name]: value }));
    };
    // photo change handler
    const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUser((prev) => ({ ...prev, photo: file }));
            setPreviewPhoto(URL.createObjectURL(file));
        }
    };

    // --- API Calls ---
    const handleSave = async () => {
        try {
            const formData = new FormData();
            formData.append("Id", Userdata.id);
            formData.append("Email", Userdata.email);
            formData.append("Name", Userdata.name);
            formData.append("Age", Userdata.Age.toString());
            formData.append("bio", Userdata.bio || "");
            formData.append("gender", Userdata.gender || "");
            formData.append("interestedIn", Userdata.interestedIn || "");

            if (Userdata.photo) formData.append("Image", Userdata.photo);

            await axios.put(`${Baseurl}/user/auth/update`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            showToast("success", "Profile updated successfully!");
            setIsEditing(false);
        } catch (error: any) {
            console.error("Error updating profile:", error);
            showToast("error", error.response?.data?.message || "Failed to update profile");
        }
    };
    //  --- Change Password ---
    const handleChangePassword = async () => {
        if (!passwordData.Password || !passwordData.NewPass) {
            showToast("error", "Please fill in both fields.");
            return;
        }
        try {
            await axios.put(
                `${Baseurl}/user/auth/ChangePass`,
                {
                    Id: Userdata.id,
                    Password: passwordData.Password,
                    NewPass: passwordData.NewPass,
                },
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            showToast("success", "Password changed successfully!");
            setIsChangingPass(false);
            setPasswordData({ Password: "", NewPass: "" });
        } catch (error: any) {
            console.error("error changing password:", error);
            setErrorMsg(error.response?.data?.message || "Failed to change password");
            showToast("error", error.response?.data?.message || "Failed to change password");
        }
    };

    const getImageSrc = (imageBuffer: any): string | null => {
        if (!imageBuffer || !imageBuffer.data) return null;
        const byteArray = new Uint8Array(imageBuffer.data);
        const blob = new Blob([byteArray], { type: "image/png" });
        return URL.createObjectURL(blob);
    };

    // show if loading 
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-accent"></div>
            </div>
        );
    }



    return (
        <div className="p-4  flex justify-center  overflow-auto h-screen items-start md:items-center
        bg-base-200">  {/* base 200 */}
            <div className="bg-base-100 shadow-xl rounded-2xl p-6 max-w-4xl w-full ">
                <h1 className="text-3xl font-bold text-center mb-8 text-base-content">User Profile</h1>

                {/* Profile Image */}
                <div className="flex flex-col items-center gap-4 mb-8 relative">
                    <img
                        src={
                            previewPhoto ||
                            getImageSrc(Userdata.image) ||
                            "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small_2x/default-avatar-icon-of-social-media-user-vector.jpg"
                        }
                        alt="Profile"
                        className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full object-cover border-4 border-base-300 shadow-md transition-transform duration-200 hover:scale-105"
                    />
                    {isEditing && (
                        <label className="absolute bottom-0 right-0 flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-full cursor-pointer hover:bg-accent/90 transition-all shadow-lg">
                            Change
                            <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                        </label>
                    )}
                </div>

                {/* Edit / Change Password / View Mode */}
                <div className="space-y-6">
                    {isChangingPass ? (
                        // ! Change Password Mode
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleChangePassword();
                            }}
                            className="space-y-4 bg-base-200 p-6 rounded-xl shadow-inner"
                        >
                            <h2 className="text-xl font-semibold text-center mb-4 text-info-content">Change Password</h2>
                            {errorMsg && (
                                <div className="bg-red-100 text-red-600 text-center py-2 rounded-lg mb-4 animate-pulse">
                                    {errorMsg}
                                </div>
                            )}
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-info-content">Current Password</label>
                                <input
                                    type="password"
                                    name="Password"
                                    required
                                    value={passwordData.Password}
                                    onChange={(e) => setPasswordData({ ...passwordData, Password: e.target.value })}
                                    className={inputClass}
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-info-content">New Password</label>
                                <input
                                    type="password"
                                    name="NewPass"
                                    required
                                    value={passwordData.NewPass}
                                    onChange={(e) => setPasswordData({ ...passwordData, NewPass: e.target.value })}
                                    className={inputClass}
                                />
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 justify-end mt-4">
                                <button
                                    type="submit"
                                    className={`${buttonBase} bg-green-500 hover:bg-green-600 w-full sm:w-auto`}
                                >
                                    Save Password
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsChangingPass(false),
                                            handleCancel()
                                    }}
                                    className={`${buttonBase} bg-warning hover:bg-yellow-600 w-full sm:w-auto`}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : isEditing ? (
                        //! Edit Mode 
                        <div className="space-y-6 bg-base-200 p-6 rounded-xl shadow-inner">
                            <h2 className="text-xl font-semibold text-center mb-1 text-info-content">Edit Profile</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Full Name */}
                                <div>
                                    <label className="block text-sm mb-1 text-info-content">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={Userdata.name}
                                        onChange={handleChange}
                                        className={inputClass}
                                    />
                                </div>

                                {/* Age */}
                                <div>
                                    <label className="block text-sm mb-1 text-info-content">Age</label>
                                    <input
                                        type="number"
                                        name="Age"
                                        min={18}
                                        max={99}
                                        value={Userdata.Age}
                                        onChange={handleChange}
                                        className={inputClass}
                                    />
                                </div>

                                {/* Gender */}
                                <div>
                                    <label className="block text-sm mb-1 text-info-content">Gender</label>
                                    <select
                                        name="gender"
                                        value={Userdata.gender}
                                        onChange={handleChange as any}
                                        className={inputClass}
                                        required
                                    >
                                        <option value="" disabled hidden>
                                            Select gender
                                        </option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                {/* Interested In */}
                                <div>
                                    <label className="block text-sm mb-1 text-info-content">Interested In</label>
                                    <select
                                        name="interestedIn"
                                        value={Userdata.interestedIn}
                                        onChange={handleChange as any}
                                        className={inputClass}
                                        required
                                    >
                                        <option value="" disabled hidden>
                                            Select interest
                                        </option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>

                                </div>

                                {/* Bio */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm mb-1 text-info-content">Bio</label>
                                    <textarea
                                        name="bio"
                                        value={Userdata.bio}
                                        onChange={handleChange}
                                        className={`${inputClass} min-h-24`}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 justify-end mt-4">
                                <button
                                    onClick={handleSave}
                                    className={`${buttonBase} bg-green-500 hover:bg-green-600 w-full sm:w-auto`}
                                >
                                    Save Changes
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className={`${buttonBase} bg-warning hover:bg-yellow-600 w-full sm:w-auto`}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Full Name */}
                            <div className="bg-base-200 p-2 rounded-2xl shadow-sm">
                                <p className="text-sm text-base-content mb-1">Full Name</p>
                                <div className="p-2 rounded-lg bg-base-100">
                                    <p className="font-semibold text-info-content break-words">
                                        {Userdata.name ? Userdata.name.replace(/\b\w/g, (c) => c.toUpperCase()) : "Not set"}
                                    </p>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="bg-base-200 p-2 rounded-2xl shadow-sm">
                                <p className="text-sm text-base-content mb-1">Email</p>
                                <div className="p-2 rounded-lg bg-base-100">
                                    <p className="font-semibold text-info-content break-words normal-case lowercase">
                                        {Userdata.email || "Not set"}
                                    </p>
                                </div>
                            </div>


                            {/* Age */}
                            <div className="bg-base-200 p-2 rounded-2xl shadow-sm">
                                <p className="text-sm text-base-content mb-1">Age</p>
                                <div className="p-2 rounded-lg bg-base-100">
                                    <p className="font-semibold text-info-content">{Userdata.Age || "Not set"}</p>
                                </div>
                            </div>

                            {/* Gender + Interested In side by side */}
                            <div className="bg-base-200 p-2 rounded-2xl shadow-sm">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-base-content mb-1">Gender</p>
                                        <div className="p-2 rounded-lg bg-base-100">
                                            <p className="font-semibold text-info-content">{Userdata.gender || "Not set"}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-base-content mb-1">Interested In</p>
                                        <div className="p-2 rounded-lg bg-base-100">
                                            <p className="font-semibold text-info-content">{Userdata.interestedIn || "Not set"}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bio full width */}
                            <div className="bg-base-200 p-2 rounded-2xl shadow-sm md:col-span-2">
                                <p className="text-sm text-base-content mb-1">Bio</p>
                                <div className="p-2 rounded-lg bg-base-100 max-h-28 overflow-y-auto text-xs">
                                    <p className="font-semibold text-info-content break-words">
                                        {Userdata.bio || "No bio"}
                                    </p>
                                </div>
                            </div>
                            {/* Action Buttons */}
                            <div className="md:col-span-2 flex flex-col sm:flex-row gap-3 justify-end mt-4">
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-5 py-2 rounded-lg bg-accent text-white font-semibold hover:bg-accent/90 w-full sm:w-auto transition-all duration-200"
                                >
                                    Edit Profile
                                </button>
                                <button
                                    onClick={() => setIsChangingPass(true)}
                                    className="px-5 py-2 rounded-lg bg-accent text-white font-semibold hover:bg-accent/90 w-full sm:w-auto transition-all duration-200"
                                >
                                    Change Password
                                </button>
                                <div className="flex justify-center items-center h-full px-4">
                                    <div className="inline-block px-5 py-2 rounded-lg bg-accent text-black transition-all duration-200">
                                        <ThemeToggle />
                                    </div>
                                </div>
                            </div>
                        </div>

                    )}
                </div>
            </div>
        </div>

    );
}
