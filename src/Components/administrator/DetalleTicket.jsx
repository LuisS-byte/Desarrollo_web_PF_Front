import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import "./DetalleTicket.css";

function DetalleTicket() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nuevoComentario, setNuevoComentario] = useState(""); // Estado para el comentario
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(
          `http://localhost:5053/api/Administrador/AllInfoTicket?id=${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setTicket(response.data.value[0]);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("authToken");
          navigate("/login");
        } else {
          setError("Error al cargar el ticket");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id, navigate]);

  // Función para manejar el submit del formulario
  const handleComentarioSubmit = async (e) => {
    e.preventDefault();
    if (!nuevoComentario.trim()) return; // No enviar si está vacío

    try {
      const token = localStorage.getItem("authToken");

      // Construimos el body para la petición
      const body = {
        idTicket: ticket.id,
        idUsuario: ticket.idUsaurio, // ojo que en el backend tienes "idUsaurio" (revisar typo)
        comentario: nuevoComentario,
      };

      await axios.post(
        "http://localhost:5053/api/Administrador/agregarComentario",
        body,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Actualizamos la lista de comentarios localmente sin recargar
      setTicket((prevTicket) => ({
        ...prevTicket,
        comentarios: [
          ...prevTicket.comentarios,
          { comenDescripcion: nuevoComentario, fechaComentario: new Date().toLocaleString(), nombreUsuario: "Tú" } // puedes ajustar nombreUsuario si tienes más datos
        ],
      }));

      setNuevoComentario(""); // Limpiar textarea
    } catch (error) {
      alert("Error al enviar el comentario");
    }
  };

  if (loading) return <div className="ticket-detail-card">Cargando detalle del ticket...</div>;
  if (error) return <div className="ticket-detail-card">{error}</div>;
  if (!ticket) return <div className="ticket-detail-card">No se encontró el ticket</div>;

  return (
    <div className="dashboard-container">
      <div className="ticket-detail-card">
        <div className="ticket-header">
          <h4><i className="fas fa-ticket-alt me-2"></i>#{ticket.id} - {ticket.asunto || "Sin asunto"}</h4>
          <span className={`badge-status ${ticket.estado?.toLowerCase()}`}>{ticket.estado}</span>
        </div>

        <ul className="ticket-info-list">
          <li>
            <span>Prioridad:</span>{" "}
            <span className={`badge-prio ${ticket.prioridad?.toLowerCase()}`}>{ticket.prioridad}</span>
          </li>
          <li><span>Categoría:</span> {ticket.categoria}</li>
          <li><span>Fecha creación:</span> {new Date(ticket.fechaCreacion).toLocaleDateString()}</li>
          <li><span>Solicitante:</span> {ticket.nombreCompletoUsuairo} ({ticket.correoUsuario})</li>
        </ul>

        {ticket.descripcionLarga && (
          <div className="ticket-desc">
            <strong>Descripción:</strong>
            <div>{ticket.descripcionLarga}</div>
          </div>
        )}

        {ticket.rutaArchivo && (
          <div className="ticket-attachments">
            <strong>Archivos adjuntos:</strong>
            <a
              href={`http://localhost:5053/${ticket.rutaArchivo.replace(/\\/g, "/")}`}
              download
            >
              <i className="fas fa-paperclip"></i> Descargar archivo
            </a>
          </div>
        )}

        <div className="ticket-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)}>
            <i className="fas fa-arrow-left"></i> Volver
          </button>
        </div>

        <div className="activity-section">
          <h6><i className="fas fa-history me-2"></i>Historial y Comentarios</h6>
          <ul className="activity-list">
            {ticket.comentarios?.map((comentario, index) => (
              <li key={index}>
                <div className="activity-meta">{comentario.fechaComentario} - {comentario.nombreUsuario}</div>
                {comentario.comenDescripcion}
              </li>
            ))}
          </ul>
          <form className="comment-form mt-3" onSubmit={handleComentarioSubmit}>
            <label htmlFor="nuevoComentario" className="form-label">Agregar comentario</label>
            <textarea
              className="form-control"
              id="nuevoComentario"
              placeholder="Escribe un comentario..."
              value={nuevoComentario}
              onChange={(e) => setNuevoComentario(e.target.value)}
            ></textarea>
            <button type="submit" className="btn btn-primary btn-sm">Comentar</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default DetalleTicket;
