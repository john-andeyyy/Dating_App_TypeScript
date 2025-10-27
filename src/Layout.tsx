import type { ReactElement } from 'react';

import Sidebar from './components/Sidebar';
import { Outlet } from 'react-router-dom';

export default function Layout(): ReactElement {
    return (
        <div className="flex h-screen overflow-hidden z-50">
            <aside className="flex">
                <Sidebar />
            </aside>
            <main className="flex-grow rounded-xl">
                <Outlet />
            </main>
        </div>
    );
}
