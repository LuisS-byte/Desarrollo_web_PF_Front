import { useState, useEffect } from "react";
import axios from "axios";
import "./MenuTickets.css";
import { useNavigate } from "react-router-dom";

function MenuTickets() {
  const [ticketsPendientes, setTicketsPendientes] = useState([]);
  const [ticketsAsignados, setTicketsAsignados] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [prioridades, setPrioridades] = useState([]);
  const [estados, setEstados] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para el modal de asignación
  const [showModal, setShowModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedTecnico, setSelectedTecnico] = useState("");
  const [comentario, setComentario] = useState("");
  const navigate = useNavigate();

  const [filtroPendientes, setFiltroPendientes] = useState({
    busqueda: "",
    prioridad: "",
    categoria: "",
  });

  const [filtroAsignados, setFiltroAsignados] = useState({
    busqueda: "",
    tecnico: "",
    estado: "",
  });

  // Configuración de Axios con interceptor para el token
  useEffect(() => {
    // Interceptor para añadir el token a las peticiones
    axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("authToken");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Interceptor para manejar errores de autenticación
    axios.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        if (error.response && error.response.status === 401) {
          // Token inválido o expirado
          localStorage.removeItem("authToken");
          navigate("/login");
        }
        return Promise.reject(error);
      }
    );
  }, [navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [
        pendientesRes,
        asignadosRes,
        tecnicosRes,
        prioridadesRes,
        estadosRes,
        serviciosRes,
      ] = await Promise.all([
        axios.get(
          "http://localhost:5053/api/Administrador/TicketsPendientesAsignacion"
        ),
        axios.get("http://localhost:5053/api/Administrador/TicketsAsignados"),
        axios.get("http://localhost:5053/api/Administrador/ListaTecnicos"),
        axios.get("http://localhost:5053/api/Administrador/ListaPrioridades"),
        axios.get("http://localhost:5053/api/Administrador/ListaEstados"),
        axios.get("http://localhost:5053/api/Administrador/ListaServicios"),
      ]);

      setTicketsPendientes(pendientesRes.data.value);
      setTicketsAsignados(asignadosRes.data.value);
      setTecnicos(tecnicosRes.data.value);
      setPrioridades(prioridadesRes.data.value);
      setEstados(estadosRes.data.value);
      setServicios(serviciosRes.data.value);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        navigate("/login");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Verificar si hay token antes de hacer las peticiones
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
      return;
    }

    fetchData();
  }, [navigate]);

  const filtrarPendientes = () => {
    return ticketsPendientes
      .filter((ticket) => {
        const tituloMatch = ticket.titulo
          .toLowerCase()
          .includes(filtroPendientes.busqueda.toLowerCase());
        const prioridadMatch =
          !filtroPendientes.prioridad ||
          ticket.prioridad === filtroPendientes.prioridad;
        const categoriaMatch =
          !filtroPendientes.categoria ||
          ticket.categoria === filtroPendientes.categoria;
        return tituloMatch && prioridadMatch && categoriaMatch;
      })
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  };

  const filtrarAsignados = () => {
    return ticketsAsignados
      .filter((ticket) => {
        const tituloMatch = ticket.titulo
          .toLowerCase()
          .includes(filtroAsignados.busqueda.toLowerCase());
        const tecnicoMatch =
          !filtroAsignados.tecnico ||
          ticket.tecnico === filtroAsignados.tecnico;
        const estadoMatch =
          !filtroAsignados.estado || ticket.estado === filtroAsignados.estado;
        return tituloMatch && tecnicoMatch && estadoMatch;
      })
      .sort(
        (a, b) => new Date(b.fechaAsignacion) - new Date(a.fechaAsignacion)
      );
  };

  const handleAsignarClick = (ticket) => {
    setSelectedTicket(ticket);
    setSelectedTecnico("");
    setComentario("");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSubmitAsignacion = async () => {
    try {
      if (!selectedTecnico) {
        alert("Por favor seleccione un técnico");
        return;
      }

      const tecnicoSeleccionado = tecnicos.find(
        (t) => t.nombre === selectedTecnico
      );

      if (!tecnicoSeleccionado) {
        alert("Técnico no válido");
        return;
      }

      const payload = {
        idTicket: selectedTicket.id,
        idUsuairo: tecnicoSeleccionado.id, // Corregir typo (debería ser idUsuario)
        descripcion: comentario,
      };

      // Primero asignamos el ticket
      const response = await axios.post(
        "http://localhost:5053/api/Administrador/CrearTicketAsignacion",
        payload
      );

      if (response.data.success) {
        // Enviar correo al técnico
        const correoPayload = {
        destinatario: tecnicoSeleccionado.correo,
        asunto: `Nuevo Ticket Asignado - #${selectedTicket.id.toString().padStart(3, "0")}`,
        cuerpo: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 15px; text-align: center; border-bottom: 1px solid #e9ecef; }
        .content { padding: 20px; background-color: #fff; }
        .ticket-info { margin-bottom: 20px; }
        .ticket-info p { margin: 5px 0; }
        .label { font-weight: bold; color: #495057; }
        .priority { 
            display: inline-block; 
            padding: 3px 8px; 
            border-radius: 4px; 
            font-weight: bold; 
            font-size: 0.9em;
        }
        .footer { 
            margin-top: 20px; 
            padding-top: 15px; 
            border-top: 1px solid #e9ecef; 
            font-size: 0.9em; 
            color: #6c757d; 
            text-align: center;
        }
        .btn {
            display: inline-block;
            padding: 10px 20px;
            background-color: #007bff;
            color: white !important;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 15px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Nuevo Ticket Asignado</h2>
        </div>
        
        <div class="content">
            <div class="ticket-info">
                <p><span class="label">ID del Ticket:</span> #${selectedTicket.id.toString().padStart(3, "0")}</p>
                <p><span class="label">Título:</span> ${selectedTicket.titulo}</p>
                <p><span class="label">Prioridad:</span> 
                    <span class="priority" style="background-color: ${
                      selectedTicket.prioridad.toLowerCase() === 'alta' 
                        ? '#dc3545' 
                        : selectedTicket.prioridad.toLowerCase() === 'media' 
                          ? '#ffc107' 
                          : '#28a745'
                    }; color: ${
                      selectedTicket.prioridad.toLowerCase() === 'alta' 
                        ? 'white' 
                        : 'black'
                    };">
                        ${selectedTicket.prioridad}
                    </span>
                </p>
                <p><span class="label">Categoría:</span> ${selectedTicket.categoria || "N/A"}</p>
                <p><span class="label">Fecha de Creación:</span> ${new Date(selectedTicket.fecha).toLocaleDateString()}</p>
                <p><span class="label">Comentarios:</span> ${comentario || "Sin comentarios adicionales"}</p>
            </div>
            
            <p>Por favor ingrese al sistema para gestionar este ticket.</p>
            
            <a href="http://localhost:5173/" class="btn">
                Ver Ticket en el Sistema
            </a>
        </div>
        
        <div class="footer">
            <p>Este es un mensaje automático, por favor no responda a este correo.</p>
            <p>&copy; ${new Date().getFullYear()} Sistema de Tickets</p>
        </div>
    </div>
</body>
</html>
`
      };

        await axios.post(
          "http://localhost:5053/api/Administrador/EnviarCorreo",
          correoPayload
        );

        // Actualizar los datos
        await fetchData();
        setShowModal(false);
        alert(
          "Ticket asignado correctamente y notificación enviada al técnico"
        );
      } else {
        alert("Error al asignar el ticket: " + response.data.message);
      }
    } catch (error) {
      console.error("Error al asignar ticket:", error);
      if (error.response && error.response.status === 401) {
        alert("Sesión expirada. Por favor inicie sesión nuevamente.");
        navigate("/login");
      } else {
        alert(
          "Error al asignar el ticket: " +
            (error.response?.data?.message || error.message)
        );
      }
    }
  };

  if (loading) return <div className="loading">Cargando...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="tick-root">
      {/* Modal de Asignación */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h5>
                Asignar Ticket #{selectedTicket.id.toString().padStart(3, "0")}
              </h5>
              <button className="modal-close" onClick={handleCloseModal}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Técnico:</label>
                <select
                  className="form-select"
                  value={selectedTecnico}
                  onChange={(e) => setSelectedTecnico(e.target.value)}
                >
                  <option value="">Seleccione un técnico</option>
                  {tecnicos.map((tecnico) => (
                    <option key={tecnico.id} value={tecnico.nombre}>
                      {tecnico.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Comentario:</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  placeholder="Ingrese un comentario para la asignación..."
                ></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={handleCloseModal}>
                <i className="fas fa-times-circle me-2"></i> Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSubmitAsignacion}
              >
                <i className="fas fa-user-plus me-2"></i> Asignar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="sidebar">
        <h4>Menú</h4>
        <a href="/MenuAdministrador">
          <i className="fas fa-home"></i> Dashboard
        </a>
        <a href="/MenuTickets">
          <i className="fas fa-ticket-alt"></i> Tickets
        </a>
        <a href="/GestionUsuario">
          <i className="fas fa-users"></i> Usuarios
        </a>

        <a href="/GenerarReporte">
          <i className="fas fa-users"></i> Reportes
        </a>
        <li>
          <a
            className="dropdown-item"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              localStorage.removeItem("authToken");
              window.location.href = "/login";
            }}
          >
            <i className="fas fa-sign-out-alt me-2"></i>
            Cerrar sesión
          </a>
        </li>
      </div>

      <div className="navbar">
        <h5>Administración</h5>
      </div>

      <div className="dashboard-container2">
        {/* Sección de Tickets Pendientes */}
        <div className="admin-card">
          <h5 className="card-title">
            <i className="fas fa-clipboard-list"></i> Tickets pendientes de
            asignación
          </h5>

          <div className="filter-group">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar ticket..."
              value={filtroPendientes.busqueda}
              onChange={(e) =>
                setFiltroPendientes({
                  ...filtroPendientes,
                  busqueda: e.target.value,
                })
              }
            />
            <select
              className="form-select"
              value={filtroPendientes.prioridad}
              onChange={(e) =>
                setFiltroPendientes({
                  ...filtroPendientes,
                  prioridad: e.target.value,
                })
              }
            >
              <option value="">Prioridad</option>
              {prioridades.map((prioridad) => (
                <option key={prioridad.id} value={prioridad.nombre}>
                  {prioridad.nombre}
                </option>
              ))}
            </select>
            <select
              className="form-select"
              value={filtroPendientes.categoria}
              onChange={(e) =>
                setFiltroPendientes({
                  ...filtroPendientes,
                  categoria: e.target.value,
                })
              }
            >
              <option value="">Categoría</option>
              {servicios.map((servicio) => (
                <option key={servicio.id} value={servicio.nombre}>
                  {servicio.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Título</th>
                  <th>Prioridad</th>
                  <th>Categoría</th>
                  <th>Fecha Creación</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtrarPendientes().map((ticket) => (
                  <tr key={ticket.id}>
                    <td>#{ticket.id.toString().padStart(3, "0")}</td>
                    <td>{ticket.titulo}</td>
                    <td>
                      <span
                        className={`badge-prio ${ticket.prioridad
                          .toLowerCase()
                          .replace(/\s/g, "")}`}
                      >
                        {ticket.prioridad}
                      </span>
                    </td>
                    <td>{ticket.categoria || "N/A"}</td>
                    <td>{new Date(ticket.fecha).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="btn-action"
                        title="Asignar"
                        onClick={() => handleAsignarClick(ticket)}
                      >
                        <i className="fas fa-user-plus me-1"></i>
                      </button>
                      <button
                        className="btn-action ver-detalle-btn"
                        title="Ver Detalle"
                        onClick={() => navigate(`/Detalle/${ticket.id}`)}
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

        {/* Sección de Tickets Asignados */}
        <div className="admin-card">
          <h5 className="card-title">
            <i className="fas fa-tasks"></i> Tickets asignados
          </h5>

          <div className="filter-group">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar ticket..."
              value={filtroAsignados.busqueda}
              onChange={(e) =>
                setFiltroAsignados({
                  ...filtroAsignados,
                  busqueda: e.target.value,
                })
              }
            />
            <select
              className="form-select"
              value={filtroAsignados.tecnico}
              onChange={(e) =>
                setFiltroAsignados({
                  ...filtroAsignados,
                  tecnico: e.target.value,
                })
              }
            >
              <option value="">Técnico</option>
              {tecnicos.map((tecnico) => (
                <option key={tecnico.id} value={tecnico.nombre}>
                  {tecnico.nombre}
                </option>
              ))}
            </select>
            <select
              className="form-select"
              value={filtroAsignados.estado}
              onChange={(e) =>
                setFiltroAsignados({
                  ...filtroAsignados,
                  estado: e.target.value,
                })
              }
            >
              <option value="">Estado</option>
              {estados.map((estado) => (
                <option key={estado.id} value={estado.nombre}>
                  {estado.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Título</th>
                  <th>Técnico</th>
                  <th>Estado</th>
                  <th>Fecha Asignación</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtrarAsignados().map((ticket) => (
                  <tr key={ticket.id}>
                    <td>#{ticket.id.toString().padStart(3, "0")}</td>
                    <td>{ticket.titulo}</td>
                    <td>{ticket.tecnico}</td>
                    <td>
                      <span
                        className={`badge-status ${ticket.estado
                          .toLowerCase()
                          .replace(/\s/g, "")}`}
                      >
                        {ticket.estado}
                      </span>
                    </td>
                    <td>
                      {new Date(ticket.fechaAsignacion).toLocaleDateString()}
                    </td>
                    <td>
                      <button
                        className="btn-action ver-detalle-btn"
                        title="Ver Detalle"
                        onClick={() => navigate(`/Detalle/${ticket.id}`)}
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
    </div>
  );
}

export default MenuTickets;
