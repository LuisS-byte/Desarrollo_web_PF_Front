import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "./MenuAdministrador.css";

function MenuAdministrador() {
  const location = useLocation();
  const usuario = location.state?.usuario;
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5053/api/Administrador/ListaConteoTickets"
        );
        const sortedTickets = response.data.value.sort((a, b) => b.id - a.id);
        const latestTickets = sortedTickets.slice(0, 5); // Obtener los 5 tickets más recientes
        setTickets(latestTickets);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  // Contar tickets por estado
  const countTicketsByStatus = (status) => {
    return tickets.filter((ticket) => ticket.estado === status).length;
  };

  if (loading) return <div className="text-center py-5">Cargando...</div>;
  if (error) return <div className="alert alert-danger">Error: {error}</div>;

  return (
    <div className="admin-root">
      <div className="dashboard-wrapper">
        {/* Sidebar */}
        <div className="sidebar">
          <h4>Menú</h4>
          <a href="/MenuAdministrador">
            <i className="fas fa-home"></i> Dashboard
          </a>
          <a href="/MenuTickets">
            <i className="fas fa-ticket-alt"></i> Tickets
          </a>
          <a href="#">
            <i className="fas fa-users"></i> Usuarios
          </a>
          <a href="#">
            <i className="fas fa-sign-out-alt"></i> Cerrar Sesión
          </a>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {/* Navbar */}
          <div className="navbar">
            <h5>Dashboard</h5>
            <div>
              <button className="btn btn-outline-light btn-sm">
                <i className="fas fa-bell"></i>
              </button>
              <button className="btn btn-outline-light btn-sm">
                <i className="fas fa-user-circle"></i>
              </button>
            </div>
          </div>

          {/* Dashboard Container */}
          <div className="dashboard-container">
            {/* Resumen de tickets */}
            <div className="stats-row">
              <div className="stats-card">
                <i className="fas fa-folder-open"></i>
                <h3>{countTicketsByStatus("Abierto")}</h3>
                <p>Tickets Abiertos</p>
              </div>
              <div className="stats-card">
                <i className="fas fa-spinner"></i>
                <h3>{countTicketsByStatus("En Proceso")}</h3>
                <p>En Progreso</p>
              </div>
              <div className="stats-card">
                <i className="fas fa-check-circle"></i>
                <h3>{countTicketsByStatus("Cerrado")}</h3>
                <p>Resueltos</p>
              </div>
            </div>

            {/* Últimos tickets */}
            <div className="row">
              <div className="col-12">
                <div className="tickets-table mb-4">
                  <h4>Últimos Tickets</h4>
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Título</th>
                        <th>Estado</th>
                        <th>Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tickets.map((ticket) => (
                        <tr key={ticket.id}>
                          <td>#{ticket.id.toString().padStart(3, "0")}</td>
                          <td>{ticket.titulo}</td>
                          <td>
                            <span
                              className={`badge ${getBadgeClass(
                                ticket.estado
                              )}`}
                            >
                              {ticket.estado}
                            </span>
                          </td>
                          <td>{formatDate(ticket.fecha)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Función para obtener la clase CSS según el estado del ticket
function getBadgeClass(status) {
  switch (status) {
    case "Abierto":
      return "badge-open";
    case "En Proceso":
      return "badge-progress";
    case "Cerrado":
      return "badge-resolved";
    default:
      return "badge-secondary";
  }
}

// Función para formatear la fecha
function formatDate(dateString) {
  const options = { day: "2-digit", month: "2-digit", year: "numeric" };
  return new Date(dateString).toLocaleDateString("es-ES", options);
}

export default MenuAdministrador;
