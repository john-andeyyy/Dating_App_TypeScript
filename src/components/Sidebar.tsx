import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface MenuItem {
    name: string;
    path: string;
}

const menuItems: MenuItem[] = [
    { name: "User Profile Management", path: "/Profile" },
    { name: "Home", path: "/Home" },
    { name: "Match List", path: "/MatchList" },
    { name: "Message", path: "/Message" },
];

export default function Sidebar() {
    const { logout } = useAuth();

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
                    className="btn btn-square drawer-button lg:hidden text-2xl text-base-content  
          hover:bg-[#6EACDA] transition-colors m-1"
                >
                    ☰
                </label>
            </div>

            {/* Sidebar */}
            <div className="drawer-side">
                <label
                    htmlFor="sidebar-drawer"
                    className="drawer-overlay"
                    aria-label="Close sidebar"
                />

                <aside className="menu w-64 min-h-full flex flex-col bg-base-200 text-base-content shadow-lg">
                    <div className="p-6 border-b border-[#03346E] text-center">
                        <h1 className="text-2xl font-bold tracking-wide">Dating Web App</h1>
                        <p className="text-sm italic text-info-content mt-1">
                            Find your perfect match
                        </p>
                    </div>

                    {/* Menu Links */}
                    <nav className="flex-1 px-4 py-6 space-y-2">
                        {menuItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className="block py-2 px-3 rounded-md bg-base-100/20 
                border-2 border-base-content hover:bg-accent/25 hover:text-white transition-colors"
                                onClick={closeSidebar}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Logout Button */}
                    <div className="p-4 border-t border-[#03346E]">
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
