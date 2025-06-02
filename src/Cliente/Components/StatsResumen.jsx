function StatsResumen({ abiertos, enProceso, resueltos }) {
  return (
    <div className="ticket-stats">
      <div className="stat-card"><div className="number">{abiertos}</div><div className="label">Tickets abiertos</div></div>
      <div className="stat-card"><div className="number">{enProceso}</div><div className="label">En progreso</div></div>
      <div className="stat-card"><div className="number">{resueltos}</div><div className="label">Resueltos</div></div>
    </div>
  );
}
export default StatsResumen;
