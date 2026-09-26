import { Link } from "react-router-dom";

function Sidebar() {
    return (
        <aside className="sidebar">
            <h2>Hackathon Admin</h2>

            <nav>
                <Link to="/">Dashboard</Link>
                <Link to="/events">Events</Link>
                <Link to="/users">Users</Link>
                <Link to="/judges">Judges</Link>
                <Link to="/submissions">Submissions</Link>
                <Link to="/results">Results</Link>
                <Link to="/community">Community</Link>
            </nav>
        </aside>
    );
}

export default Sidebar;