
function StatCard({ title, value, icon: Icon, color, subtitle }) {
    return (
        <div className="stat-card">
            <div className="stat-info">
                <p>{title}</p>
                <h2>{value ?? 0}</h2>
                <span>{subtitle}</span>
            </div>

            <div
                className="stat-icon"
                style={{
                    background: `${color}18`,
                    color: color
                }}
            >
                <Icon size={25} />
            </div>
        </div>
    );
}

export default StatCard;
