import { useState, useEffect } from "react";
import axios from "axios";
import "./GestionUsuario.css";

function GestionUsuario() {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    id: 0,
    nombre: "",
    apellido: "", // Nuevo campo añadido
    correo: "",
    clave: "",
    idRol: 0,
    interno: 1, // 1 para Sí, 0 para No
  });
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const resetCurrentUser = () => {
    setCurrentUser({
      id: 0,
      nombre: "",
      apellido: "",
      correo: "",
      clave: "",
      idRol: 0,
      interno: 1,
    });
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const [usuariosRes, rolesRes] = await Promise.all([
          axios.get(
            "http://localhost:5053/api/Administrador/InformacionUsuarios",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
          axios.get("http://localhost:5053/api/Administrador/ListaRoles", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setUsuarios(usuariosRes.data.value);
        setRoles(rolesRes.data.value);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentUser({
      ...currentUser,
      [name]: value,
    });
  };

  const sendEmail = async (emailData) => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.post(
        "http://localhost:5053/api/Administrador/EnviarCorreo",
        emailData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (err) {
      console.error("Error al enviar correo:", err);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("authToken");

      const userToCreate = {
        ...currentUser,
        idRol: parseInt(currentUser.idRol),
        interno: currentUser.interno === "1" ? 1 : 0,
      };

      await axios.post(
        "http://localhost:5053/api/Administrador/RegistrarUsuario",
        userToCreate,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const emailContent = {
        destinatario: currentUser.correo,
        asunto: "Tu cuenta ha sido creada en el Sistema de Tickets",
        cuerpo: `
          <h2>¡Bienvenido/a al Sistema de Tickets!</h2>
          <p>Se ha creado una cuenta para ti con los siguientes detalles:</p>
          <ul>
            <li><strong>Nombre:</strong> ${currentUser.nombre}</li>
            <li><strong>Apellido:</strong> ${currentUser.apellido}</li>
            <li><strong>Correo:</strong> ${currentUser.correo}</li>
            <li><strong>Contraseña:</strong> ${currentUser.clave}</li>
            <li><strong>Rol:</strong> ${
              roles.find((r) => r.id === parseInt(currentUser.idRol))?.nombreRol
            }</li>
            <li><strong>Interno:</strong> ${
              currentUser.interno === "1" ? "Sí" : "No"
            }</li>
          </ul>
          <p>Por favor, cambia tu contraseña después de iniciar sesión por primera vez.</p>
        `,
      };

      await sendEmail(emailContent);

      const response = await axios.get(
        "http://localhost:5053/api/Administrador/InformacionUsuarios",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsuarios(response.data.value);

      setSubmitSuccess(true);
      resetCurrentUser();
      setCurrentUser({
        id: 0,
        nombre: "",
        apellido: "",
        correo: "",
        clave: "",
        idRol: 0,
        interno: 1,
      });

      setTimeout(() => {
        setSubmitSuccess(false);
        setShowCreateModal(false);
      }, 2000);
    } catch (err) {
      console.error("Error al crear usuario:", err);
      alert(
        "Error al crear usuario: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("authToken");

      const userToUpdate = {
        ...currentUser,
        idRol: parseInt(currentUser.idRol),
        interno: currentUser.interno === "1" ? 1 : 0,
      };

      await axios.patch(
        "http://localhost:5053/api/Administrador/ActualizarUsuario",
        userToUpdate,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (currentUser.clave) {
        const emailContent = {
          destinatario: currentUser.correo,
          asunto: "Tu cuenta ha sido actualizada en el Sistema de Tickets",
          cuerpo: `
            <h2>Actualización de cuenta</h2>
            <p>Se han actualizado los datos de tu cuenta:</p>
            <ul>
              <li><strong>Nombre:</strong> ${currentUser.nombre}</li>
              <li><strong>Apellido:</strong> ${currentUser.apellido}</li>
              <li><strong>Correo:</strong> ${currentUser.correo}</li>
              <li><strong>Nueva contraseña:</strong> ${currentUser.clave}</li>
              <li><strong>Rol:</strong> ${
                roles.find((r) => r.id === parseInt(currentUser.idRol))
                  ?.nombreRol
              }</li>
              <li><strong>Interno:</strong> ${
                currentUser.interno === "1" ? "Sí" : "No"
              }</li>
            </ul>
          `,
        };

        await sendEmail(emailContent);
      } else {
        const emailContent = {
          destinatario: currentUser.correo,
          asunto: "Tu cuenta ha sido actualizada en el Sistema de Tickets",
          cuerpo: `
            <h2>Actualización de cuenta</h2>
            <p>Se han actualizado los datos de tu cuenta:</p>
            <ul>
              <li><strong>Nombre:</strong> ${currentUser.nombre}</li>
              <li><strong>Apellido:</strong> ${currentUser.apellido}</li>
              <li><strong>Correo:</strong> ${currentUser.correo}</li>
              <li><strong>Rol:</strong> ${
                roles.find((r) => r.id === parseInt(currentUser.idRol))
                  ?.nombreRol
              }</li>
              <li><strong>Interno:</strong> ${
                currentUser.interno === "1" ? "Sí" : "No"
              }</li>
            </ul>
          `,
        };

        await sendEmail(emailContent);
      }

      const response = await axios.get(
        "http://localhost:5053/api/Administrador/InformacionUsuarios",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsuarios(response.data.value);

      setSubmitSuccess(true);
      resetCurrentUser();
      setTimeout(() => {
        setSubmitSuccess(false);
        setShowEditModal(false);
      }, 2000);
    } catch (err) {
      console.error("Error al actualizar usuario:", err);
      alert(
        "Error al actualizar usuario: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  const handleEditClick = (user) => {
    setCurrentUser({
      id: user.id,
      nombre: user.nombre,
      apellido: user.apellido, // Nuevo campo añadido
      correo: user.correo,
      clave: "",
      idRol: user.idRol,
      interno: user.interno === 1 ? "1" : "0",
    });
    setShowEditModal(true);
  };

  const filteredUsers = usuarios.filter(
    (user) =>
      user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.correo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="loading">Cargando usuarios...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="doo">
      <div className="container-fluid">
        {/* Sidebar */}
        <div className="sidebar2">
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

        {/* Contenido principal */}
        <div className="dashboard-container">
          <div className="users-table mb-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
              <button
                className="btn btn-add-user"
                onClick={() => setShowCreateModal(true)}
              >
                <i className="fas fa-user-plus"></i> Nuevo Usuario
              </button>
              <input
                type="text"
                className="form-control search-bar"
                placeholder="Buscar usuario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th style={{ width: "7%" }}>ID</th>
                    <th style={{ width: "20%" }}>Nombre</th>
                    <th style={{ width: "20%" }}>Apellido</th>
                    <th style={{ width: "20%" }}>Correo</th>
                    <th style={{ width: "13%" }}>Rol</th>
                    <th style={{ width: "10%" }}>Interno</th>
                    <th style={{ width: "10%" }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>#{user.id.toString().padStart(3, "0")}</td>
                      <td className="td-name">{user.nombre}</td>
                      <td className="td-name">{user.apellido}</td>
                      <td>{user.correo}</td>
                      <td>
                        <span
                          className={`badge-role ${user.rol
                            .toLowerCase()
                            .replace(/\s/g, "")}`}
                        >
                          {user.rol}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            user.interno === 1 ? "bg-success" : "bg-secondary"
                          }`}
                        >
                          {user.interno === 1 ? "Sí" : "No"}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn-action"
                          title="Editar"
                          onClick={() => handleEditClick(user)}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Crear Usuario */}
        {showCreateModal && (
          <div className="modal-overlay">
            <div className="modal-container">
              <div className="modal-header">
                <h5>
                  <i className="fas fa-user-plus me-2"></i>Nuevo Usuario
                </h5>
                <button
                  className="modal-close"
                  onClick={() => {
  setShowCreateModal(false);
  resetCurrentUser();
}}>
  &times;
</button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleCreateSubmit} autoComplete="off">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label htmlFor="nombre" className="form-label">
                        Nombre *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="nombre"
                        name="nombre"
                        value={currentUser.nombre}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="apellido" className="form-label">
                        Apellido *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="apellido"
                        name="apellido"
                        value={currentUser.apellido}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="correo" className="form-label">
                        Correo *
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        id="correo"
                        name="correo"
                        value={currentUser.correo}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="idRol" className="form-label">
                        Rol *
                      </label>
                      <select
                        className="form-select"
                        id="idRol"
                        name="idRol"
                        value={currentUser.idRol}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Selecciona un rol</option>
                        {roles.map((rol) => (
                          <option key={rol.id} value={rol.id}>
                            {rol.nombreRol}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="interno" className="form-label">
                        Interno *
                      </label>
                      <select
                        className="form-select"
                        id="interno"
                        name="interno"
                        value={currentUser.interno}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="1">Sí</option>
                        <option value="0">No</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="clave" className="form-label">
                        Contraseña *
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        id="clave"
                        name="clave"
                        value={currentUser.clave}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary mt-4">
                    Crear Usuario
                  </button>
                  {submitSuccess && (
                    <div className="confirmation">
                      <i className="fas fa-check-circle me-2"></i>¡Usuario
                      creado exitosamente!
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal Editar Usuario */}
        {showEditModal && (
          <div className="modal-overlay">
            <div className="modal-container">
              <div className="modal-header">
                <h5>
                  <i className="fas fa-user-edit me-2"></i>Editar Usuario
                </h5>
                <button
                  className="modal-close"
                  onClick={() => {
  setShowEditModal(false);
  resetCurrentUser();
}}>
  &times;
</button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleEditSubmit} autoComplete="off">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label htmlFor="nombre" className="form-label">
                        Nombre *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="nombre"
                        name="nombre"
                        value={currentUser.nombre}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="apellido" className="form-label">
                        Apellido *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="apellido"
                        name="apellido"
                        value={currentUser.apellido}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="correo" className="form-label">
                        Correo *
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        id="correo"
                        name="correo"
                        value={currentUser.correo}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="idRol" className="form-label">
                        Rol *
                      </label>
                      <select
                        className="form-select"
                        id="idRol"
                        name="idRol"
                        value={currentUser.idRol}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Selecciona un rol</option>
                        {roles.map((rol) => (
                          <option key={rol.id} value={rol.id}>
                            {rol.nombreRol}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="interno" className="form-label">
                        Interno *
                      </label>
                      <select
                        className="form-select"
                        id="interno"
                        name="interno"
                        value={currentUser.interno}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="1">Sí</option>
                        <option value="0">No</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="clave" className="form-label">
                        Nueva Contraseña (dejar vacío para no cambiar)
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        id="clave"
                        name="clave"
                        value={currentUser.clave}
                        onChange={handleInputChange}
                        placeholder="Dejar vacío para mantener la contraseña actual"
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary mt-4">
                    Actualizar Usuario
                  </button>
                  {submitSuccess && (
                    <div className="confirmation">
                      <i className="fas fa-check-circle me-2"></i>¡Usuario
                      actualizado exitosamente!
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GestionUsuario;
