import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./CrearTicketEMpleado.css";

function CrearTicketEMpleado() {
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    idPrioridad: "",
    idServicio: "",
    archivos: null,
    nombre: "",
    apellido: "",
    correo: "",
  });

  const [servicios, setServicios] = useState([]);
  const [prioridades, setPrioridades] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const [serviciosRes, prioridadesRes] = await Promise.all([
          axios.get("http://localhost:5053/api/Administrador/ListaServicios", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          axios.get(
            "http://localhost:5053/api/Administrador/ListaPrioridades",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),
        ]);

        setServicios(serviciosRes.data.value);
        setPrioridades(prioridadesRes.data.value);
        setIsLoading(false);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          localStorage.removeItem("authToken");
          navigate("/login");
        } else {
          setError(err.response?.data?.message || "Error al cargar datos");
        }
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      archivos: e.target.files,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
      return;
    }

    if (
      !formData.titulo ||
      !formData.descripcion ||
      !formData.idPrioridad ||
      !formData.idServicio ||
      !formData.correo
    ) {
      setError("Por favor, completa todos los campos obligatorios.");
      return;
    }

    try {
      setError(null);
      setIsLoading(true);

      const formDataToSend = new FormData();
      formDataToSend.append("Correo", formData.correo);
      formDataToSend.append("Nombre", formData.nombre);
      formDataToSend.append("Apellido", formData.apellido);

      formDataToSend.append("IdServicio", formData.idServicio);
      formDataToSend.append("IdPrioridad", formData.idPrioridad);
      formDataToSend.append("Descripcion", formData.descripcion);
      formDataToSend.append("Titulo", formData.titulo); // si lo usas
      if (formData.archivos && formData.archivos.length > 0) {
        formDataToSend.append("Archivo", formData.archivos[0]);
      }

      const response = await axios.post(
        "http://localhost:5053/api/employees/create-ticket",
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setSuccess(`¡Ticket creado exitosamente!`);
      setTimeout(() => {
        navigate("/MenuEmpleado");
      }, 2000);

      setFormData({
        titulo: "",
        descripcion: "",
        idPrioridad: "",
        idServicio: "",
        archivos: null,
        nombre: "",
        apellido: "",
        correo: "",
      });
    } catch (err) {
      if (err.response && err.response.status === 401) {
        localStorage.removeItem("authToken");
        navigate("/login");
      } else {
        setError(err.response?.data?.message || "Error al crear el ticket");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && servicios.length === 0) {
    return <div className="dashboard-container">Cargando...</div>;
  }

  return (
    <div>
      {/* Navbar */}
      <div className="navbar">
        <h5>Crear Ticket</h5>
        <div>
          <button className="btn btn-outline-light btn-sm">
            <i className="fas fa-bell"></i>
          </button>
          <button className="btn btn-outline-light btn-sm">
            <i className="fas fa-user-circle"></i>
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="dashboard-container">
        <div className="form-card">
          <h4 className="mb-4 text-center">Nuevo Ticket</h4>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success" role="alert">
              <i className="fas fa-check-circle me-2"></i>
              {success}
            </div>
          )}

          <form
            id="ticketForm"
            onSubmit={handleSubmit}
            encType="multipart/form-data"
            autoComplete="off"
          >
            <div className="row g-3">
              <div className="col-12">
                <label htmlFor="titulo" className="form-label">
                  Título *
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="titulo"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-12">
                <label htmlFor="descripcion" className="form-label">
                  Descripción *
                </label>
                <textarea
                  className="form-control"
                  id="descripcion"
                  name="descripcion"
                  rows="3"
                  value={formData.descripcion}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>

              <div className="col-md-6">
                <label htmlFor="idPrioridad" className="form-label">
                  Prioridad *
                </label>
                <select
                  className="form-select"
                  id="idPrioridad"
                  name="idPrioridad"
                  value={formData.idPrioridad}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecciona una opción</option>
                  {prioridades.map((prioridad) => (
                    <option key={prioridad.id} value={prioridad.id}>
                      {prioridad.nombre} - {prioridad.descripcion}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label htmlFor="idServicio" className="form-label">
                  Categoría *
                </label>
                <select
                  className="form-select"
                  id="idServicio"
                  name="idServicio"
                  value={formData.idServicio}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecciona una opción</option>
                  {servicios.map((servicio) => (
                    <option key={servicio.id} value={servicio.id}>
                      {servicio.categoria} - {servicio.descripcion}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12">
                <label htmlFor="archivo" className="form-label">
                  Archivos Adjuntos
                </label>
                <input
                  className="form-control"
                  type="file"
                  id="archivo"
                  name="archivo"
                  onChange={handleFileChange}
                  multiple
                />
              </div>
            </div>

            <div className="form-section-title">Datos de contacto</div>

            <div className="row g-3">
              <div className="col-md-4">
                <label htmlFor="nombre" className="form-label">
                  Nombre *
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-4">
                <label htmlFor="apellido" className="form-label">
                  Apellido *
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="apellido"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-4">
                <label htmlFor="correo" className="form-label">
                  Correo *
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="correo"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary mt-4"
              disabled={isLoading}
            >
              {isLoading ? "Enviando..." : "Enviar Ticket"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CrearTicketEMpleado;
