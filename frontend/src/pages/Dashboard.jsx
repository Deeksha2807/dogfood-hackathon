import { dashboardStats } from "../data/mockData";
import StatCard from "../components/StatCard";
import Sidebar from "../components/Sidebar";

function Dashboard() {
    return (
        <div className="admin-layout">
            <Sidebar />

            <main className="dashboard">
                <h1>Admin Dashboard</h1>

                <div className="stats-grid">
                    <StatCard
                        title="Users"
                        value={dashboardStats.users}
                    />

                    <StatCard
                        title="Events"
                        value={dashboardStats.events}
                    />

                    <StatCard
                        title="Judges"
                        value={dashboardStats.judges}
                    />

                    <StatCard
                        title="Submissions"
                        value={dashboardStats.submissions}
                    />
                </div>
            </main>
        </div>
    );
}

export default Dashboard;