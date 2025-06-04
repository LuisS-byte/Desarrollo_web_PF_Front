import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./MenuEmpleado.css";

function MenuEmpleado() {
  const [ticketsData, setTicketsData] = useState({
    metadata: {},
    statistics: {},
    tickets: [],
    usuario: null, // Agregamos usuario al estado inicial
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get(
          `http://localhost:5053/api/employees/assigned-tickets?currentPage=${currentPage}&pageSize=10`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setTicketsData(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const filteredTickets = ticketsData.tickets.filter(
    (ticket) =>
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="loading">Cargando...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="container-fluid">
      {/* Navbar */}
      <div className="navbar">
        <h5>
          <i className="fas fa-ticket-alt me-2"></i>Sistema de Tickets
        </h5>
        <div>
          <div className="dropdown d-inline-block">
            <button
              className="btn btn-outline-light btn-sm dropdown-toggle"
              id="userDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i className="fas fa-user-circle me-1"></i>{" "}
              {ticketsData.usuario?.nombreCompleto || "Usuario"}
            </button>
            <ul
              className="dropdown-menu dropdown-menu-end"
              aria-labelledby="userDropdown"
            >
              <li>
                <a className="dropdown-item" href="#">
                  <i className="fas fa-user me-2"></i>Mi perfil
                </a>
              </li>
              <li>
                <a className="dropdown-item" href="#">
                  <i className="fas fa-cog me-2"></i>Configuración
                </a>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>
              <li>
                <a className="dropdown-item" href="#">
                  <i className="fas fa-sign-out-alt me-2"></i>Cerrar sesión
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="container-fluid">
        <div className="user-welcome">
          <h4>
            Saludos, {ticketsData.usuario?.nombreCompleto || "Usuario"}
          </h4>
          <p>Aquí puedes ver y gestionar todos tus tickets.</p>
        </div>

        {/* Resto del código permanece igual */}
        <div className="ticket-stats">
          <div className="stat-card">
            <div className="number">{ticketsData.statistics?.open || 0}</div>
            <div className="label">Tickets abiertos</div>
          </div>
          <div className="stat-card">
            <div className="number">
              {ticketsData.statistics?.inProgress || 0}
            </div>
            <div className="label">En progreso</div>
          </div>
          <div className="stat-card">
            <div className="number">
              {ticketsData.statistics?.resolved || 0}
            </div>
            <div className="label">Resueltos</div>
          </div>
        </div>

        <div className="tickets-table mb-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
            <button
              className="btn btn-add-ticket"
              onClick={() => navigate("/CrearTicketEmpleado")}
            >
              <i className="fas fa-plus"></i> Nuevo Ticket
            </button>

            <input
              type="text"
              className="form-control search-bar"
              placeholder="Buscar ticket..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="table-responsive">
            <table className="table custom-table align-middle">
              <thead>
                <tr>
                  <th style={{ width: "7%" }}>ID</th>
                  <th style={{ width: "28%" }}>Título</th>
                  <th style={{ width: "15%" }}>Estado</th>
                  <th style={{ width: "15%" }}>Prioridad</th>
                  <th style={{ width: "20%" }}>Fecha</th>
                  <th style={{ width: "15%" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td>#{ticket.id}</td>
                    <td className="td-title">{ticket.title}</td>
                    <td>
                      <span
                        className={`badge-status ${ticket.status
                          .toLowerCase()
                          .replace(/\s/g, "")}`}
                      >
                        {ticket.status}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge-prio ${ticket.priority
                          .toLowerCase()
                          .replace(/\s/g, "")}`}
                      >
                        {ticket.priority}
                      </span>
                    </td>
                    <td>
                      {new Date(ticket.creationDate).toLocaleDateString()}
                    </td>
                    <td>
                      <button
                        className="btn-action ver-detalle-btn"
                        title="Ver Detalle"
                        onClick={() => navigate(`/ticket/${ticket.id}`)}
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Crear Ticket (igual que antes) */}
    </div>
  );
}

export default MenuEmpleado;
