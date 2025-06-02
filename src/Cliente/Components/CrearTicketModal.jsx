import { useEffect, useState } from 'react';
import axios from 'axios';

function CrearTicketModal({ onTicketCreated }) {
  const [descripcion, setDescripcion] = useState('');
  const [prioridad, setPrioridad] = useState('');
  const [categoria, setCategoria] = useState('');
  const [archivo, setArchivo] = useState(null);
  const [mensajeExito, setMensajeExito] = useState('');
  const [mensajeError, setMensajeError] = useState('');

  // Nuevos estados para catálogos
  const [servicios, setServicios] = useState([]);
  const [prioridades, setPrioridades] = useState([]);

  // Cargar catálogos al iniciar
  useEffect(() => {
    const fetchCatalogos = async () => {
      try {
        const resServicios = await axios.get('http://localhost:5053/api/Catalogo/servicios');
        setServicios(resServicios.data);
        const resPrioridades = await axios.get('http://localhost:5053/api/Catalogo/prioridades');
        setPrioridades(resPrioridades.data);
      } catch (error) {
        console.error('Error al cargar catálogos', error);
        setMensajeError('Error al cargar los catálogos');
      }
    };

    fetchCatalogos();
  }, []);

  // Manejar selección de archivo con validaciones
  const handleFileChange = (e) => {
    console.log("=== SELECCIONANDO ARCHIVO ===");
    setMensajeError(''); // Limpiar errores previos
    
    try {
      const file = e.target.files[0];
      
      if (!file) {
        console.log("No se seleccionó archivo");
        setArchivo(null);
        return;
      }
      
      console.log("Archivo seleccionado:", file.name);
      console.log("Tamaño:", file.size, "bytes", "(" + (file.size / 1024 / 1024).toFixed(2) + " MB)");
      console.log("Tipo:", file.type);
      
      // Validar tamaño (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setMensajeError('El archivo es demasiado grande. Tamaño máximo: 10MB');
        e.target.value = ''; // Limpiar input
        setArchivo(null);
        return;
      }
      
      // Validar que no esté vacío
      if (file.size === 0) {
        setMensajeError('El archivo está vacío');
        e.target.value = '';
        setArchivo(null);
        return;
      }
      
      // Validar tipos de archivo permitidos
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 
                           'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                           'text/plain'];
      
      if (!allowedTypes.includes(file.type)) {
        setMensajeError('Tipo de archivo no permitido. Solo se permiten: imágenes, PDF, Word y texto.');
        e.target.value = '';
        setArchivo(null);
        return;
      }
      
      console.log("=== ARCHIVO VÁLIDO - GUARDANDO EN ESTADO ===");
      setArchivo(file);
      console.log("=== ARCHIVO GUARDADO EXITOSAMENTE ===");
      
    } catch (error) {
      console.error("=== ERROR AL SELECCIONAR ARCHIVO ===", error);
      setMensajeError('Error al seleccionar el archivo');
      setArchivo(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("=== INICIANDO ENVÍO DE TICKET ===");
    
    const token = localStorage.getItem('authToken');
    setMensajeError('');
    setMensajeExito('');

    if (!descripcion || !prioridad || !categoria) {
      setMensajeError('Por favor completa todos los campos obligatorios.');
      return;
    }

    try {
      console.log("=== PREPARANDO FORM DATA ===");
      const formData = new FormData();
      formData.append('Descripcion', descripcion);
      formData.append('IdPrioridad', prioridad);
      formData.append('IdServicio', categoria);
      
      if (archivo) {
        console.log("=== AGREGANDO ARCHIVO AL FORM DATA ===");
        console.log("Archivo a enviar:", archivo.name, archivo.size, "bytes");
        formData.append('Archivo', archivo);
      }

      console.log("=== ENVIANDO REQUEST AL BACKEND ===");
      const res = await axios.post('http://localhost:5053/api/Ticket/crear', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          // NO incluir Content-Type para multipart/form-data - axios lo maneja automáticamente
        },
        timeout: 30000 // 30 segundos de timeout
      });

      console.log("=== RESPUESTA EXITOSA ===", res.data);
      setMensajeExito(`Ticket #${res.data.ticketId} creado correctamente.`);

      // Limpiar formulario
      setDescripcion('');
      setPrioridad('');
      setCategoria('');
      setArchivo(null);
      
      // Limpiar el input file
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';

      setTimeout(() => {
        document.getElementById('btnCerrarModalCrear').click();
        setMensajeExito('');
        if (onTicketCreated) onTicketCreated();
      }, 2000);

    } catch (error) {
      console.error('=== ERROR AL CREAR TICKET ===', error);
      
      let errorMessage = 'Ocurrió un error al crear el ticket.';
      
      if (error.response) {
        // Error del servidor
        console.error('Error del servidor:', error.response.data);
        errorMessage = error.response.data.mensaje || error.response.data || errorMessage;
      } else if (error.request) {
        // Sin respuesta del servidor
        console.error('Sin respuesta del servidor:', error.request);
        errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
      } else {
        // Error en la configuración
        console.error('Error de configuración:', error.message);
        errorMessage = error.message;
      }
      
      setMensajeError(errorMessage);
    }
  };

  return (
    <div className="modal fade" id="modalCrearTicket" tabIndex="-1" aria-labelledby="modalCrearTicketLabel" aria-hidden="true">
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="fas fa-ticket-alt me-2"></i>Nuevo Ticket
            </h5>
            <button id="btnCerrarModalCrear" type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit} id="ticketForm">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Prioridad *</label>
                  <select 
                    className="form-select" 
                    value={prioridad} 
                    onChange={e => setPrioridad(e.target.value)} 
                    required
                  >
                    <option value="">Selecciona una opción</option>
                    {prioridades.map(p => (
                      <option key={p.idPrioridad} value={p.idPrioridad}>
                        {p.prioriNombre}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="col-md-6">
                  <label className="form-label">Categoría / Servicio *</label>
                  <select 
                    className="form-select" 
                    value={categoria} 
                    onChange={e => setCategoria(e.target.value)} 
                    required
                  >
                    <option value="">Selecciona una opción</option>
                    {servicios.map(s => (
                      <option key={s.idServicio} value={s.idServicio}>
                        {s.servNombre}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="col-12">
                  <label className="form-label">Descripción del Problema *</label>
                  <textarea 
                    className="form-control" 
                    rows="3" 
                    value={descripcion} 
                    onChange={e => setDescripcion(e.target.value)} 
                    required
                    placeholder="Describe detalladamente el problema..."
                  ></textarea>
                </div>
                
                <div className="col-12">
                  <label className="form-label">Archivo adjunto</label>
                  <input 
                    className="form-control" 
                    type="file" 
                    onChange={handleFileChange}
                    accept="image/*,.pdf,.doc,.docx,.txt"
                  />
                  <div className="form-text">
                    Tipos permitidos: Imágenes, PDF, Word, Texto. Tamaño máximo: 10MB
                  </div>
                  {archivo && (
                    <div className="mt-2 p-2 bg-light rounded">
                      <small className="text-success">
                        <i className="fas fa-file me-1"></i>
                        Archivo seleccionado: {archivo.name} 
                        ({(archivo.size / 1024 / 1024).toFixed(2)} MB)
                      </small>
                    </div>
                  )}
                </div>
              </div>

              {/* Mensajes de error */}
              {mensajeError && (
                <div className="alert alert-danger mt-3" role="alert">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {mensajeError}
                </div>
              )}

              {/* Mensaje de éxito */}
              {mensajeExito && (
                <div className="alert alert-success mt-3" role="alert">
                  <i className="fas fa-check-circle me-2"></i>
                  {mensajeExito}
                </div>
              )}

              <button type="submit" className="btn btn-primary mt-4 w-100">
                <i className="fas fa-paper-plane me-2"></i>
                Enviar Ticket
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CrearTicketModal;