import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useNavigate } from 'react-router-dom';

import './GenerarReporte.css';

const Reportes = () => {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedServicio, setSelectedServicio] = useState('');
  const [reportData, setReportData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // Obtener lista de servicios
  useEffect(() => {
    const fetchServicios = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(
          'http://localhost:5053/api/Administrador/ListaServicios',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setServicios(response.data.value);
      } catch (err) {
        setError('Error al cargar la lista de servicios');
        console.error(err);
      }
    };

    fetchServicios();
  }, []);


  const navigate = useNavigate();

const handleVolver = () => {
  navigate('/MenuAdministrador');
};


  // Generar vista previa del reporte
  const handleGeneratePreview = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("authToken");
      
      if (!selectedServicio) {
        throw new Error('Debe seleccionar una categoría');
      }

      const response = await axios.get(
        `http://localhost:5053/api/Administrador/GenerarReportePorCategoria?id=${selectedServicio}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setReportData(response.data.value);
      console.log(response.data.value);
      setShowPreview(true);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      console.error('Error al generar reporte:', err);
    } finally {
      setLoading(false);
    }
  };

  // Generar PDF
  const generatePDF = () => {
    if (!reportData || reportData.length === 0) return;

    const doc = new jsPDF();
    
    // Encabezado del PDF
    doc.setFontSize(18);
    doc.setTextColor(40);
    doc.text('Sistema de Gestión de Tickets', 105, 15, { align: 'center' });
    
    // Título del reporte
    doc.setFontSize(14);
    const servicio = servicios.find(s => s.id == selectedServicio);
    const reportTitle = `Reporte de Tickets por Categoría: ${servicio?.categoria || 'Todos'}`;
    doc.text(reportTitle, 105, 25, { align: 'center' });
    
    // Fecha de generación
    doc.setFontSize(10);
    doc.text(`Generado: ${new Date().toLocaleDateString()}`, 105, 32, { align: 'center' });
    
    // Datos de la tabla
    const tableData = reportData.map(ticket => [
      ticket.id,
      ticket.titulo || ticket.descripcion,
      ticket.estado,
      ticket.prioridad,
      new Date(ticket.fechaCreacion).toLocaleDateString(),
      ticket.encargado|| 'N/A'
    ]); 
    
    // Configuración de la tabla
    autoTable(doc, {
  startY: 40,
  head: [['ID', 'Título/Descripción', 'Estado', 'Prioridad', 'Fecha', 'Usuario']],
  body: tableData,
  theme: 'grid',
  headStyles: {
    fillColor: [41, 128, 185],
    textColor: 255,
    fontStyle: 'bold'
  },
  alternateRowStyles: {
    fillColor: [245, 245, 245]
  },
  margin: { top: 40 }
});

    
    // Resumen estadístico
    const summaryY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setTextColor(40);
    doc.text('Resumen Estadístico', 14, summaryY);
    
    const estadosCount = {};
    const prioridadesCount = {};
    
    reportData.forEach(ticket => {
      estadosCount[ticket.estado] = (estadosCount[ticket.estado] || 0) + 1;
      prioridadesCount[ticket.prioridad] = (prioridadesCount[ticket.prioridad] || 0) + 1;
    });
    
    let summaryText = [
      `Total de tickets: ${reportData.length}`,
      `Estados: ${Object.entries(estadosCount).map(([e, c]) => `${e} (${c})`).join(', ')}`,
      `Prioridades: ${Object.entries(prioridadesCount).map(([p, c]) => `${p} (${c})`).join(', ')}`
    ];
    
    doc.setFontSize(10);
    summaryText.forEach((line, i) => {
      doc.text(line, 16, summaryY + 10 + (i * 7));
    });
    
    // Pie de página
    const footerY = doc.internal.pageSize.height - 10;
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('© Sistema de Gestión de Tickets - Todos los derechos reservados', 105, footerY, { align: 'center' });
    
    // Guardar el PDF
    doc.save(`reporte_${servicio?.categoria || 'tickets'}_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="report-container">
      
      <div className="admin-card">
        <h5 className="card-title"><i className="fas fa-file-pdf"></i> Generar Reporte por Categoría</h5>
        
        <div className="form-card">
          <form onSubmit={handleGeneratePreview}>
            <div className="mb-3">
              <label htmlFor="servicio" className="form-label">Seleccionar Categoría</label>
              <select 
                className="form-select" 
                id="servicio"
                value={selectedServicio}
                onChange={(e) => setSelectedServicio(e.target.value)}
                required
              >
                <option value="">Seleccione una categoría</option>
                {servicios.map(servicio => (
                  <option key={servicio.id} value={servicio.id}>
                    {servicio.categoria}
                  </option>
                ))}
              </select>
              {servicios.find(s => s.id == selectedServicio)?.descripcion && (
                <small className="text-muted">
                  {servicios.find(s => s.id == selectedServicio).descripcion}
                </small>
              )}
            </div>

            <div className="d-flex justify-content-between">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                    <span role="status">Generando...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-search me-2"></i>Generar Vista Previa
                  </>
                )}
              </button>
              <button 
                type="button" 
                className="btn btn-danger" 
                onClick={generatePDF}
                disabled={!showPreview || loading}
              >
                <i className="fas fa-file-pdf me-2"></i>Descargar PDF
              </button>
            </div>
          </form>
        </div>

        {/* Vista previa del reporte */}
        {showPreview && reportData && (
          <div className="report-preview">
            <div className="report-header">
              <h4>Sistema de Gestión de Tickets</h4>
              <h5>
                Reporte de Tickets por Categoría: {
                  selectedServicio ? servicios.find(s => s.id == selectedServicio)?.categoria : 'Todos'
                }
              </h5>
              <p>Generado: {new Date().toLocaleDateString()}</p>
            </div>
            <div className="report-body">
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Título/Descripción</th>
                      <th>Estado</th>
                      <th>Prioridad</th>
                      <th>Fecha</th>
                      <th>Usuario</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map(ticket => (
                      <tr key={ticket.id}>
                        <td>#{ticket.id}</td>
                        <td>{ticket.titulo || ticket.descripcion}</td>
                        <td>
                          <span className={`badge-status ${ticket.estado.toLowerCase().replace(/\s/g, '')}`}>
                            {ticket.estado}
                          </span>
                        </td>
                        <td>
                          <span className={`badge-prio ${ticket.prioridad.toLowerCase().replace(/\s/g, '')}`}>
                            {ticket.prioridad}
                          </span>
                        </td>
                        <td>{new Date(ticket.fechaCreacion).toLocaleDateString()}</td>
                        <td>{ticket.encargado || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="report-summary mt-4">
              <h6>Resumen:</h6>
              <p>
                <strong>Total de tickets:</strong> {reportData.length}
                <br />
                <strong>Estados:</strong> {Object.entries(
                  reportData.reduce((acc, ticket) => {
                    acc[ticket.estado] = (acc[ticket.estado] || 0) + 1;
                    return acc;
                  }, {})
                ).map(([estado, count]) => `${estado} (${count})`).join(', ')}
                <br />
                <strong>Prioridades:</strong> {Object.entries(
                  reportData.reduce((acc, ticket) => {
                    acc[ticket.prioridad] = (acc[ticket.prioridad] || 0) + 1;
                    return acc;
                  }, {})
                ).map(([prioridad, count]) => `${prioridad} (${count})`).join(', ')}
              </p>
            </div>
          </div>
        )}
<div className="mt-3">
  <button className="btn btn-secondary" onClick={handleVolver}>
    <i className="fas fa-arrow-left me-2"></i>Volver
  </button>
</div>

        {/* Mensaje de error */}
        {error && (
          <div className="alert alert-danger mt-3">
            <i className="fas fa-exclamation-circle me-2"></i>
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reportes;