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

  const handleComentarioSubmit = async (e) => {
  e.preventDefault();
  if (!nuevoComentario.trim()) return;

  try {
    const token = localStorage.getItem("authToken");

    // 1. Enviar el comentario al backend
    const body = {
      idTicket: ticket.id,
      idUsuario: ticket.idUsaurio,
      comentario: nuevoComentario,
    };

    await axios.post(
      "http://localhost:5053/api/Administrador/agregarComentario",
      body,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // 2. Preparar el correo HTML
    const emailData = {
      Destinatario: ticket.correoUsuario,
      Asunto: `Nuevo comentario en tu ticket #${ticket.id.toString().padStart(3, "0")}`,
      Cuerpo: `
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
        .comment-box {
            background-color: #f8f9fa;
            border-left: 4px solid #007bff;
            padding: 10px 15px;
            margin: 15px 0;
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
            <h2>Nuevo Comentario en tu Ticket</h2>
        </div>
        
        <div class="content">
            <div class="ticket-info">
                <p><span class="label">ID del Ticket:</span> #${ticket.id.toString().padStart(3, "0")}</p>
                <p><span class="label">Categoria:</span> ${ticket.categoria|| "Sin título"}</p>
                <p><span class="label">Prioridad:</span> 
                    <span class="priority" style="background-color: ${
                      ticket.prioridad?.toLowerCase() === 'alta' 
                        ? '#dc3545' 
                        : ticket.prioridad?.toLowerCase() === 'media' 
                          ? '#ffc107' 
                          : '#28a745'
                    }; color: ${
                      ticket.prioridad?.toLowerCase() === 'alta' 
                        ? 'white' 
                        : 'black'
                    };">
                        ${ticket.prioridad || "No especificada"}
                    </span>
                </p>
            </div>
            
            <h4>Nuevo Comentario:</h4>
            <div class="comment-box">
                ${nuevoComentario.replace(/\n/g, '<br>')}
            </div>
            
            <p>Puedes responder a este ticket ingresando al sistema.</p>
            
            <a href="http://localhost:5173/ticket/${ticket.id}" class="btn">
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

    // 3. Enviar el correo
    await axios.post(
      "http://localhost:5053/api/Administrador/EnviarCorreo",
      emailData,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Actualizar la UI
    setTicket(prevTicket => ({
      ...prevTicket,
      comentarios: [
        ...prevTicket.comentarios,
        { 
          comenDescripcion: nuevoComentario, 
          fechaComentario: new Date().toLocaleString(), 
          nombreUsuario: "Tú" 
        }
      ],
    }));

    setNuevoComentario("");
    alert("Comentario enviado y notificación por correo enviada correctamente");

  } catch (error) {
    console.error("Error:", error);
    alert("Error al enviar el comentario: " + (error.response?.data?.message || error.message));
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
