import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface MenuItem {
    name: string;
    path: string;
}

const menuItems: MenuItem[] = [
    { name: "Home", path: "/Home" },
    { name: "Match List", path: "/MatchList" },
    { name: "Message", path: "/Message" },
    { name: "User Profile", path: "/Profile" },
];

export default function Sidebar() {
    const { logout } = useAuth();
    const location = useLocation(); // ✅ to detect current path

    const handleLogout = () => {
        logout();
        closeSidebar();
    };

    const closeSidebar = () => {
        const checkbox = document.getElementById("sidebar-drawer") as HTMLInputElement | null;
        if (checkbox && checkbox.checked) {
            checkbox.checked = false;
        }
    };

    return (
        <div className="drawer lg:drawer-open z-50 bg-base-300">
            {/* Drawer toggle */}
            <input id="sidebar-drawer" type="checkbox" className="drawer-toggle" />

            {/* Main content */}
            <div className="drawer-content flex flex-col items-center py-4 px-1">
                <label
                    htmlFor="sidebar-drawer"
                    className="btn btn-square drawer-button lg:hidden text-2xl text-base-content hover:bg-[#6EACDA] transition-colors m-1"
                >
                    ☰
                </label>
            </div>

            {/* Sidebar */}
            <div className="drawer-side">
                <label htmlFor="sidebar-drawer" className="drawer-overlay" aria-label="Close sidebar" />

                <aside className="menu w-64 min-h-full flex flex-col bg-black text-white shadow-lg">
                    <div className="p-6 border-b border-[#03346E] text-left pb-10">
                        <h1 className="text-2xl font-bold tracking-wide">Sparked</h1>
                        <p className="text-sm italic text-white mt-1">Find your perfect match</p>
                    </div>

                    {/* Menu Links */}
                    <nav className="flex-1 px-4 py-6 space-y-2">
                        {menuItems.map((item) => {
                            const isActive = location.pathname === item.path; // ✅ check if current route
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={closeSidebar}
                                    className={`block py-2 px-3 rounded-md border-2 transition-colors 
                                        ${isActive
                                            ? "bg-accent text-white border-accent/70 hover:bg-accent/90"
                                            : "bg-white text-black border-accent hover:bg-accent hover:text-white"
                                        }`}
                                >
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Logout Button */}
                    <div className="p-4">
                        <button
                            onClick={handleLogout}
                            className="w-full py-2 px-4 rounded-md bg-accent text-white font-semibold hover:bg-accent/90 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </aside>
            </div>
        </div>
    );
}
