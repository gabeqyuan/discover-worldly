'use client';

export default function LogoutButton({ onLogout }) {
    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        onLogout();
    };

    return (
        <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border-2 border-white/20 backdrop-blur-lg"
        >
            Sign Out
        </button>
    );
}