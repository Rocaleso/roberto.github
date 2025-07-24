// script.js - Versión profesional para App Electoral

class ElectoralApp {
  constructor() {
    this.currentPage = 'map';
    this.reports = [];
    this.messages = [];
    this.adminStats = {
      activeFiscals: 0,
      todayIncidents: 0,
      reportedTables: 0,
      emergencyCount: 0
    };
    this.incidentsChart = null;
    this.fiscalData = {
      assignedTable: '',
      assignedSchool: '',
      status: 'inactive'
    };
    
    this.init();
  }

  init() {
    this.setupUI();
    this.loadData();
    this.setupEventListeners();
    this.showPage(this.currentPage);
    
    // Configuración PWA
    this.setupPWA();
  }

  setupUI() {
    // Inicializar elementos de la UI que necesitan configuración especial
    this.setupDatePicker();
    this.setupChart();
  }

  loadData() {
    // Datos de ejemplo (en una app real, esto vendría de una API)
    this.reports = this.generateSampleReports();
    this.messages = this.generateSampleMessages();
    this.fiscalData = {
      assignedTable: '1234',
      assignedSchool: 'Escuela Normal Superior N°1',
      status: 'active'
    };
    
    this.calculateStats();
  }

  setupEventListeners() {
    // Navegación
    document.querySelectorAll('.nav-item').forEach(item => {
      const page = item.getAttribute('onclick').match(/'([^']+)'/)[1];
      item.addEventListener('click', () => this.navigateToPage(page));
    });
    
    // Botones de retroceso
    document.querySelectorAll('.back-button').forEach(btn => {
      btn.addEventListener('click', () => this.navigateBack());
    });
    
    // Panel de administración
    document.querySelectorAll('.admin-actions button').forEach(btn => {
      const action = btn.getAttribute('onclick').match(/(\w+)\(/)[1];
      btn.addEventListener('click', () => this[action]());
    });
    
    // Reportes
    document.getElementById('report-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.submitReport();
    });
    
    document.getElementById('report-photo').addEventListener('change', (e) => {
      this.previewPhoto(e);
    });
    
    document.getElementById('apply-filters').addEventListener('click', () => {
      this.loadReports();
    });
    
    // Fiscal móvil
    document.getElementById('send-message').addEventListener('click', () => {
      this.sendMessage();
    });
  }

  // ============ NAVEGACIÓN ============
  navigateToPage(page) {
    // Ocultar página actual
    document.getElementById(`${this.currentPage}-page`).classList.add('hidden');
    document.getElementById(`nav-${this.currentPage.split('-')[0]}`)?.classList.remove('active');
    
    // Mostrar nueva página
    document.getElementById(`${page}-page`).classList.remove('hidden');
    document.getElementById(`nav-${page.split('-')[0]}`)?.classList.add('active');
    
    // Actualizar estado
    this.currentPage = page;
    
    // Ejecutar acciones específicas de la página
    switch(page) {
      case 'admin-panel':
        this.setupAdminPanel();
        break;
      case 'reports':
        this.loadReports();
        break;
      case 'fiscal-mobile':
        this.setupFiscalMobile();
        break;
    }
    
    // Animación de transición
    this.animatePageTransition();
  }

  navigateBack() {
    const backRoutes = {
      'admin-panel': 'map',
      'reports': 'admin-panel',
      'fiscal-mobile': 'map',
      'coordinator-register': 'map',
      'fiscal-register': 'map'
    };
    
    this.navigateToPage(backRoutes[this.currentPage] || 'map');
  }

  animatePageTransition() {
    const pageElement = document.getElementById(`${this.currentPage}-page`);
    pageElement.classList.add('fade-in');
    
    setTimeout(() => {
      pageElement.classList.remove('fade-in');
    }, 300);
  }

  // ============ PANEL DE ADMINISTRACIÓN ============
  setupAdminPanel() {
    this.updateAdminStats();
    this.setupChart();
    this.loadUserManagement('coordinators');
  }

  updateAdminStats() {
    // Actualizar estadísticas
    this.calculateStats();
    
    // Actualizar UI
    document.getElementById('active-fiscals').textContent = this.adminStats.activeFiscals;
    document.getElementById('today-incidents').textContent = this.adminStats.todayIncidents;
    document.getElementById('reported-tables').textContent = this.adminStats.reportedTables;
    document.getElementById('emergency-count').textContent = this.adminStats.emergencyCount;
  }

  calculateStats() {
    const today = new Date().toDateString();
    
    this.adminStats = {
      activeFiscals: 87, // Simulado
      todayIncidents: this.reports.filter(r => 
        new Date(r.date).toDateString() === today && r.type === 'incident'
      ).length,
      reportedTables: [...new Set(this.reports.map(r => r.mesa))].length,
      emergencyCount: this.reports.filter(r => 
        r.type === 'emergency' && r.status === 'pending'
      ).length
    };
  }

  setupChart() {
    const ctx = document.getElementById('incidentsChart').getContext('2d');
    
    if (this.incidentsChart) {
      this.incidentsChart.destroy();
    }
    
    // Datos para la última semana
    const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const incidentData = [5, 8, 12, 6, 9, 4, 2];
    const emergencyData = [1, 2, 3, 1, 2, 0, 1];
    
    this.incidentsChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: days,
        datasets: [
          {
            label: 'Incidentes',
            data: incidentData,
            backgroundColor: 'rgba(139, 92, 246, 0.7)',
            borderColor: 'rgba(139, 92, 246, 1)',
            borderWidth: 1
          },
          {
            label: 'Urgencias',
            data: emergencyData,
            backgroundColor: 'rgba(239, 68, 68, 0.7)',
            borderColor: 'rgba(239, 68, 68, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#120e1b'
            }
          }
        }
      }
    });
  }

  refreshAdminData() {
    this.showLoading('admin-panel');
    
    // Simular carga de datos
    setTimeout(() => {
      this.loadData();
      this.updateAdminStats();
      this.setupChart();
      this.showToast('Datos actualizados correctamente');
      this.hideLoading('admin-panel');
    }, 1500);
  }

  loadUserManagement(type) {
    const users = {
      'coordinators': this.generateSampleCoordinators(),
      'fiscals': this.generateSampleFiscals(),
      'admins': this.generateSampleAdmins()
    };
    
    // En una app real, aquí harías una petición a la API
    console.log(`Cargando gestión de ${type}`, users[type]);
    this.showToast(`Mostrando gestión de ${type}`);
  }

  exportData() {
    this.showLoading('admin-panel');
    
    // Simular exportación
    setTimeout(() => {
      const data = {
        stats: this.adminStats,
        reports: this.reports,
        lastUpdated: new Date()
      };
      
      // Crear archivo descargable
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `datos-electorales-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      
      this.showToast('Datos exportados correctamente');
      this.hideLoading('admin-panel');
    }, 2000);
  }

  // ============ REPORTES ============
  loadReports() {
    const typeFilter = document.getElementById('report-type').value;
    const dateFilter = document.getElementById('report-date').value;
    const statusFilter = document.getElementById('report-status').value;
    
    let filteredReports = [...this.reports];
    
    // Aplicar filtros
    if (typeFilter !== 'all') {
      filteredReports = filteredReports.filter(r => r.type === typeFilter);
    }
    
    if (dateFilter) {
      const filterDate = new Date(dateFilter).toDateString();
      filteredReports = filteredReports.filter(r => 
        new Date(r.date).toDateString() === filterDate
      );
    }
    
    if (statusFilter !== 'all') {
      filteredReports = filteredReports.filter(r => r.status === statusFilter);
    }
    
    // Ordenar por fecha (más recientes primero)
    filteredReports.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Renderizar
    this.renderReports(filteredReports);
  }

  renderReports(reports) {
    const container = document.getElementById('report-list');
    container.innerHTML = '';
    
    if (reports.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="#6d28d9" viewBox="0 0 256 256">
            <path d="M240,114a14.56,14.56,0,0,1-7-1.84l-84-47.48A22.74,22.74,0,0,0,136,64a22.74,22.74,0,0,0-13,3.68L39,112.16a14,14,0,0,1-14.06-24.32l84-47.48a22.65,22.65,0,0,0,13-3.68l84,47.48A14,14,0,0,1,240,114ZM94,120a6,6,0,0,0,3,.81A6,6,0,0,0,100,120v72a6,6,0,0,0,12,0V133.39l72.94,41.22A14,14,0,0,1,188,184a14.56,14.56,0,0,1-7-1.84l-72-40.68A6,6,0,0,0,100,142v72a6,6,0,0,0,12,0V152.61l72.94,41.22A14,14,0,0,1,188,208a14.56,14.56,0,0,1-7-1.84l-72-40.68A6,6,0,0,0,100,174v40a6,6,0,0,0,12,0V184.61l72.94,41.22A14,14,0,0,1,188,232a14.56,14.56,0,0,1-7-1.84l-84-47.48A14,14,0,0,1,88,168V120a6,6,0,0,0-6-6Z"></path>
          </svg>
          <p>No hay reportes que coincidan con los filtros</p>
        </div>
      `;
      return;
    }
    
    reports.forEach(report => {
      const reportEl = document.createElement('div');
      reportEl.className = 'report-item';
      
      const typeText = report.type === 'incident' ? 'Incidente' : 'Urgencia';
      const statusClass = report.status === 'pending' ? 'pending' : 'resolved';
      const statusText = report.status === 'pending' ? 'Pendiente' : 'Resuelto';
      
      reportEl.innerHTML = `
        <div class="report-header">
          <span class="report-type">${typeText}</span>
          <span class="report-date">${this.formatDate(report.date)}</span>
          <span class="report-status ${statusClass}">${statusText}</span>
        </div>
        <div class="report-content">
          <h4>Mesa ${report.mesa} - ${report.school}</h4>
          <p>${report.description}</p>
          <p><strong>Tipo:</strong> ${this.getIncidentTypeText(report.incidentType)}</p>
          <p><strong>Gravedad:</strong> ${this.getSeverityText(report.severity)}</p>
          ${report.photo ? `<img src="${report.photo}" class="report-photo" alt="Foto del reporte">` : ''}
        </div>
        <div class="report-actions">
          ${report.status === 'pending' ? `
            <button class="resolve-btn" onclick="app.resolveReport(${report.id})">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
              </svg>
              Resolver
            </button>
          ` : ''}
          <button class="details-btn" onclick="app.showReportDetails(${report.id})">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
              <path d="M247.31,124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57,61.26,162.88,48,128,48S61.43,61.26,36.34,86.35C17.51,105.18,9,124,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208s66.57-13.26,91.66-38.34c18.83-18.83,27.3-37.61,27.65-38.4A8,8,0,0,0,247.31,124.76ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,128,133.33,133.33,0,0,1,48.07,97.25C70.33,75.19,97.22,64,128,64s57.67,11.19,79.93,33.25A133.46,133.46,0,0,1,231.05,128C223.84,141.46,192.43,192,128,192Zm0-112a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z"></path>
            </svg>
            Detalles
          </button>
        </div>
      `;
      
      container.appendChild(reportEl);
    });
  }

  openReportModal(type) {
    const modal = document.getElementById('report-modal');
    const title = document.getElementById('report-modal-title');
    const typeInput = document.getElementById('report-type-input');
    
    if (type === 'emergency') {
      title.textContent = 'REPORTAR URGENCIA';
      typeInput.value = 'emergency';
      document.getElementById('incident-type').value = 'conflict';
      document.getElementById('report-severity').value = 'high';
    } else {
      title.textContent = 'REPORTAR INCIDENTE';
      typeInput.value = 'incident';
      document.getElementById('incident-type').value = '';
      document.getElementById('report-severity').value = 'medium';
    }
    
    // Resetear formulario
    document.getElementById('report-form').reset();
    document.getElementById('photo-preview').innerHTML = '';
    
    // Mostrar modal
    modal.classList.remove('hidden');
  }

  closeReportModal() {
    document.getElementById('report-modal').classList.add('hidden');
  }

  previewPhoto(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.type.match('image.*')) {
      this.showToast('Por favor seleccione una imagen válida', 'error');
      return;
    }
    
    const reader = new FileReader();
    const preview = document.getElementById('photo-preview');
    
    reader.onload = (e) => {
      preview.innerHTML = `
        <img src="${e.target.result}" class="photo-thumbnail" alt="Vista previa">
        <button class="remove-photo" onclick="app.removePhoto()">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
            <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path>
          </svg>
        </button>
      `;
    };
    
    reader.readAsDataURL(file);
  }

  removePhoto() {
    document.getElementById('report-photo').value = '';
    document.getElementById('photo-preview').innerHTML = '';
  }

  submitReport() {
    const type = document.getElementById('report-type-input').value;
    const incidentType = document.getElementById('incident-type').value;
    const description = document.getElementById('report-description').value.trim();
    const severity = document.getElementById('report-severity').value;
    const photoInput = document.getElementById('report-photo');
    
    // Validación
    if (!incidentType || !description) {
      this.showToast('Complete todos los campos requeridos', 'error');
      return;
    }
    
    // Crear reporte
    const newReport = {
      id: this.reports.length + 1,
      type: type,
      incidentType: incidentType,
      description: description,
      severity: severity,
      date: new Date(),
      status: 'pending',
      mesa: this.fiscalData.assignedTable || 'N/A',
      school: this.fiscalData.assignedSchool || 'N/A'
    };
    
    // Procesar foto
    if (photoInput.files.length > 0) {
      const reader = new FileReader();
      reader.onload = (e) => {
        newReport.photo = e.target.result;
        this.saveReport(newReport);
      };
      reader.readAsDataURL(photoInput.files[0]);
    } else {
      this.saveReport(newReport);
    }
  }

  saveReport(report) {
    this.reports.unshift(report); // Agregar al inicio del array
    this.calculateStats();
    this.closeReportModal();
    
    if (this.currentPage === 'reports') {
      this.loadReports();
    }
    
    this.showToast(
      report.type === 'emergency' 
        ? '¡Urgencia reportada con éxito!' 
        : 'Incidente reportado con éxito'
    );
    
    // Simular notificación al coordinador
    if (report.type === 'emergency') {
      setTimeout(() => {
        this.messages.unshift({
          id: this.messages.length + 1,
          text: `URGENCIA en mesa ${report.mesa}: ${report.description.substring(0, 50)}...`,
          time: new Date(),
          incoming: true,
          isEmergency: true
        });
        
        if (this.currentPage === 'fiscal-mobile') {
          this.loadMessages();
        }
        
        // Mostrar alerta si no está en la página de fiscal
        if (this.currentPage !== 'fiscal-mobile') {
          this.showAlert(
            'Nueva urgencia reportada',
            `Mesa ${report.mesa}: ${report.description.substring(0, 100)}...`,
            'emergency'
          );
        }
      }, 2000);
    }
  }

  resolveReport(id) {
    const reportIndex = this.reports.findIndex(r => r.id === id);
    if (reportIndex !== -1) {
      this.reports[reportIndex].status = 'resolved';
      this.calculateStats();
      this.loadReports();
      this.showToast('Reporte marcado como resuelto');
    }
  }

  showReportDetails(id) {
    const report = this.reports.find(r => r.id === id);
    if (!report) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 90%;">
        <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
        <h2>Detalles del Reporte #${report.id}</h2>
        
        <div class="report-details">
          <div class="detail-row">
            <span class="detail-label">Tipo:</span>
            <span class="detail-value">${report.type === 'incident' ? 'Incidente' : 'Urgencia'}</span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">Categoría:</span>
            <span class="detail-value">${this.getIncidentTypeText(report.incidentType)}</span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">Mesa:</span>
            <span class="detail-value">${report.mesa}</span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">Escuela:</span>
            <span class="detail-value">${report.school}</span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">Fecha:</span>
            <span class="detail-value">${this.formatDateTime(report.date)}</span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">Estado:</span>
            <span class="detail-value ${report.status}">${report.status === 'pending' ? 'Pendiente' : 'Resuelto'}</span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">Gravedad:</span>
            <span class="detail-value">${this.getSeverityText(report.severity)}</span>
          </div>
          
          <div class="detail-row full-width">
            <span class="detail-label">Descripción:</span>
            <p class="detail-value">${report.description}</p>
          </div>
          
          ${report.photo ? `
            <div class="detail-row full-width">
              <span class="detail-label">Foto adjunta:</span>
              <img src="${report.photo}" class="detail-photo" alt="Foto del reporte">
            </div>
          ` : ''}
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  }

  exportReports() {
    this.showLoading('reports');
    
    // Simular exportación
    setTimeout(() => {
      const filteredReports = [...this.reports]; // Usar los reportes filtrados actuales
      
      // Crear CSV
      let csv = 'ID,Tipo,Fecha,Mesa,Descripción,Estado\n';
      filteredReports.forEach(r => {
        csv += `"${r.id}","${r.type === 'incident' ? 'Incidente' : 'Urgencia'}","${this.formatDate(r.date)}","${r.mesa}","${r.description.replace(/"/g, '""')}","${r.status === 'pending' ? 'Pendiente' : 'Resuelto'}"\n`;
      });
      
      // Descargar archivo
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reportes-electorales-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      
      this.showToast('Reportes exportados como CSV');
      this.hideLoading('reports');
    }, 1500);
  }

  // ============ FISCAL MÓVIL ============
  setupFiscalMobile() {
    // Actualizar datos del fiscal
    document.getElementById('assigned-table').textContent = this.fiscalData.assignedTable;
    document.getElementById('assigned-school').textContent = this.fiscalData.assignedSchool;
    document.getElementById('fiscal-status').textContent = this.fiscalData.status === 'active' ? 'Activo' : 'Inactivo';
    
    // Cargar mensajes
    this.loadMessages();
  }

  refreshFiscalData() {
    this.showLoading('fiscal-mobile');
    
    // Simular actualización de datos
    setTimeout(() => {
      this.fiscalData = {
        assignedTable: '1234',
        assignedSchool: 'Escuela Normal Superior N°1',
        status: 'active'
      };
      
      this.setupFiscalMobile();
      this.showToast('Datos actualizados');
      this.hideLoading('fiscal-mobile');
    }, 1200);
  }

  loadMessages() {
    const container = document.getElementById('message-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Ordenar mensajes (más recientes al final)
    const sortedMessages = [...this.messages].sort((a, b) => a.time - b.time);
    
    sortedMessages.forEach(msg => {
      const msgEl = document.createElement('div');
      msgEl.className = `message ${msg.incoming ? 'incoming' : 'outgoing'} ${msg.isEmergency ? 'emergency' : ''}`;
      
      msgEl.innerHTML = `
        <p>${msg.text}</p>
        <div class="message-time">${this.formatTime(msg.time)}</div>
      `;
      
      container.appendChild(msgEl);
    });
    
    // Scroll al final
    container.scrollTop = container.scrollHeight;
  }

  sendMessage() {
    const input = document.getElementById('message-text');
    const text = input.value.trim();
    
    if (!text) return;
    
    // Agregar mensaje saliente
    this.messages.push({
      id: this.messages.length + 1,
      text: text,
      time: new Date(),
      incoming: false
    });
    
    // Limpiar input
    input.value = '';
    
    // Actualizar UI
    this.loadMessages();
    
    // Simular respuesta (en una app real sería una llamada a la API)
    setTimeout(() => {
      this.messages.push({
        id: this.messages.length + 1,
        text: 'Mensaje recibido. ¿Necesitas asistencia con algo más?',
        time: new Date(),
        incoming: true
      });
      
      this.loadMessages();
    }, 1500);
  }

  // ============ UTILIDADES ============
  formatDate(date) {
    return new Date(date).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatTime(date) {
    return new Date(date).toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDateTime(date) {
    return `${this.formatDate(date)} ${this.formatTime(date)}`;
  }

  getSeverityText(severity) {
    const texts = {
      'low': 'Baja',
      'medium': 'Media',
      'high': 'Alta'
    };
    return texts[severity] || severity;
  }

  getIncidentTypeText(type) {
    const texts = {
      'irregularity': 'Irregularidad',
      'problem': 'Problema logístico',
      'conflict': 'Conflicto',
      'other': 'Otro'
    };
    return texts[type] || type;
  }

  showToast(message, type = 'success') {
    // Crear toast si no existe
    let toast = document.getElementById('toast');
    
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      document.body.appendChild(toast);
    }
    
    // Configurar toast
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <div class="toast-content">
        ${type === 'error' ? `
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
            <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216ZM165.66,90.34a8,8,0,0,1,0,11.32L139.31,128l26.35,26.34a8,8,0,0,1-11.32,11.32L128,139.31l-26.34,26.35a8,8,0,0,1-11.32-11.32L116.69,128,90.34,101.66a8,8,0,0,1,11.32-11.32L128,116.69l26.34-26.35A8,8,0,0,1,165.66,90.34Z"></path>
          </svg>
        ` : `
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
            <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
          </svg>
        `}
        <span>${message}</span>
      </div>
    `;
    
    // Mostrar
    toast.classList.add('show');
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  showAlert(title, message, type = 'info') {
    const alert = document.createElement('div');
    alert.className = `alert ${type}`;
    alert.innerHTML = `
      <div class="alert-header">
        <h3>${title}</h3>
        <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
      </div>
      <div class="alert-body">
        <p>${message}</p>
      </div>
      <div class="alert-footer">
        <button onclick="this.parentElement.parentElement.remove()">Aceptar</button>
      </div>
    `;
    
    document.body.appendChild(alert);
  }

  showLoading(page) {
    const loader = document.createElement('div');
    loader.className = 'page-loader';
    loader.id = `${page}-loader`;
    loader.innerHTML = `
      <div class="loader-spinner">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <p>Cargando...</p>
    `;
    
    document.getElementById(`${page}-page`).appendChild(loader);
  }

  hideLoading(page) {
    const loader = document.getElementById(`${page}-loader`);
    if (loader) {
      loader.remove();
    }
  }

  setupDatePicker() {
    // Configurar el date picker para que no permita fechas futuras
    const dateInput = document.getElementById('report-date');
    if (dateInput) {
      dateInput.max = new Date().toISOString().split('T')[0];
    }
  }

  setupPWA() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
          console.log('ServiceWorker registrado con éxito:', registration.scope);
        }).catch(err => {
          console.log('Error al registrar ServiceWorker:', err);
        });
      });
    }
  }

  // ============ DATOS DE EJEMPLO ============
  generateSampleReports() {
    const types = ['incident', 'emergency'];
    const incidentTypes = ['irregularity', 'problem', 'conflict', 'other'];
    const severities = ['low', 'medium', 'high'];
    const statuses = ['pending', 'resolved'];
    const schools = [
      'Escuela Normal Superior N°1',
      'Colegio Nacional',
      'Escuela Técnica',
      'Instituto Comercial'
    ];
    
    const reports = [];
    const now = new Date();
    
    for (let i = 0; i < 15; i++) {
      const daysAgo = Math.floor(Math.random() * 7);
      const date = new Date(now);
      date.setDate(date.getDate() - daysAgo);
      
      reports.push({
        id: i + 1,
        type: types[Math.floor(Math.random() * types.length)],
        incidentType: incidentTypes[Math.floor(Math.random() * incidentTypes.length)],
        description: this.getRandomDescription(),
        severity: severities[Math.floor(Math.random() * severities.length)],
        date: date,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        mesa: Math.floor(1000 + Math.random() * 9000).toString(),
        school: schools[Math.floor(Math.random() * schools.length)],
        photo: Math.random() > 0.7 ? 'https://via.placeholder.com/300x200?text=Foto+del+reporte' : null
      });
    }
    
    return reports;
  }

  getRandomDescription() {
    const descriptions = [
      'Falta de boletas en la mesa',
      'Problemas con el padrón electoral',
      'Conflicto entre fiscales de diferentes partidos',
      'Demora en el inicio de la votación',
      'Personas votando sin documentación adecuada',
      'Fiscal general no se presentó',
      'Problemas con la urna electoral',
      'Corte de energía eléctrica',
      'Falta de espacio en el cuarto oscuro',
      'Votantes intentando votar más de una vez'
    ];
    
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }

  generateSampleMessages() {
    const now = new Date();
    
    return [
      {
        id: 1,
        text: 'Buenos días fiscal, ¿todo en orden en tu mesa?',
        time: new Date(now.getTime() - 3600000 * 2),
        incoming: true
      },
      {
        id: 2,
        text: 'Sí, todo en orden por ahora. ¿Hay alguna novedad?',
        time: new Date(now.getTime() - 3600000),
        incoming: false
      },
      {
        id: 3,
        text: 'Recuerden verificar que cada votante firme el padrón',
        time: new Date(now.getTime() - 1800000),
        incoming: true
      },
      {
        id: 4,
        text: 'Entendido, así lo estamos haciendo',
        time: new Date(now.getTime() - 900000),
        incoming: false
      }
    ];
  }

  generateSampleCoordinators() {
    return [
      { id: 1, name: 'María Gómez', zone: 'Zona Norte', active: true },
      { id: 2, name: 'Carlos López', zone: 'Zona Sur', active: true },
      { id: 3, name: 'Ana Rodríguez', zone: 'Zona Centro', active: false }
    ];
  }

  generateSampleFiscales() {
    return [
      { id: 1, name: 'Juan Pérez', mesa: '1234', school: 'Escuela N°1', status: 'active' },
      { id: 2, name: 'Laura Martínez', mesa: '5678', school: 'Colegio Nacional', status: 'active' },
      { id: 3, name: 'Pedro Sánchez', mesa: '9012', school: 'Instituto Comercial', status: 'inactive' }
    ];
  }

  generateSampleAdmins() {
    return [
      { id: 1, name: 'Roberto Lencina', role: 'Superadmin', lastLogin: '2023-10-15' },
      { id: 2, name: 'Admin Regional', role: 'Regional', lastLogin: '2023-10-14' }
    ];
  }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.app = new ElectoralApp();
});

// Hacer funciones disponibles globalmente para los onclick en HTML
function navigateToPage(page) {
  window.app.navigateToPage(page);
}

function navigateBack() {
  window.app.navigateBack();
}

function refreshAdminData() {
  window.app.refreshAdminData();
}

function showUserManagement(type) {
  window.app.loadUserManagement(type);
}

function exportData() {
  window.app.exportData();
}

function showStats() {
  window.app.showStats();
}

function showSettings() {
  window.app.showSettings();
}

function handleLogoClick() {
  window.app.handleLogoClick();
}

function handleColorSchemeClick() {
  window.app.handleColorSchemeClick();
}

function openReportModal(type) {
  window.app.openReportModal(type);
}

function closeReportModal() {
  window.app.closeReportModal();
}

function removePhoto() {
  window.app.removePhoto();
}

function resolveReport(id) {
  window.app.resolveReport(id);
}

function showReportDetails(id) {
  window.app.showReportDetails(id);
}

function exportReports() {
  window.app.exportReports();
}

function filterReports() {
  window.app.filterReports();
}

function refreshFiscalData() {
  window.app.refreshFiscalData();
}

function sendMessage() {
  window.app.sendMessage();
}

function openCamera() {
  window.app.openCamera();
}