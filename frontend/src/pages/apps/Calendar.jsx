import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';

export default function Calendar() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // month, week, day, agenda
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    allDay: false,
    location: '',
    type: 'EVENT',
    color: 'primary',
    reminder: null
  });

  const getDateRange = useCallback(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const date = currentDate.getDate();
    
    if (viewMode === 'month') {
      return {
        start: new Date(year, month, 1),
        end: new Date(year, month + 1, 0, 23, 59, 59)
      };
    } else if (viewMode === 'week') {
      const day = currentDate.getDay();
      const diff = date - day + (day === 0 ? -6 : 1); // Lundi
      return {
        start: new Date(year, month, diff),
        end: new Date(year, month, diff + 6, 23, 59, 59)
      };
    } else if (viewMode === 'day') {
      return {
        start: new Date(year, month, date, 0, 0, 0),
        end: new Date(year, month, date, 23, 59, 59)
      };
    } else { // agenda - afficher les 3 prochains mois
      return {
        start: new Date(),
        end: new Date(year, month + 3, date, 23, 59, 59)
      };
    }
  }, [currentDate, viewMode]);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Vous devez être connecté pour accéder au calendrier');
        setLoading(false);
        return;
      }
      
      // Calculer les dates de début et fin selon la vue
      const { start, end } = getDateRange();
      
      const response = await fetch(
        `http://localhost:5000/api/v1/calendar/events?start=${start.toISOString()}&end=${end.toISOString()}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      const data = await response.json();
      if (data.success) {
        setEvents(data.events);
      } else {
        toast.error(data.message || 'Erreur de chargement des événements');
      }
    } catch (error) {
      toast.error('Impossible de se connecter au serveur');
    } finally {
      setLoading(false);
    }
  }, [getDateRange]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.startDate || !formData.endDate) {
      return toast.error('Titre, date de début et date de fin requis');
    }

    try {
      const token = localStorage.getItem('token');
      
      // Préparer les données en nettoyant les valeurs null/undefined
      const eventData = {
        title: formData.title,
        description: formData.description || undefined,
        startDate: formData.startDate,
        endDate: formData.endDate,
        allDay: formData.allDay || false,
        location: formData.location || undefined,
        type: formData.type || 'EVENT',
        color: formData.color || 'primary',
        reminder: formData.reminder ? parseInt(formData.reminder) : undefined
      };
      
      const response = await fetch('http://localhost:5000/api/v1/calendar/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(eventData)
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Événement créé !');
        setShowEventModal(false);
        setShowQuickAdd(false);
        resetForm();
        loadEvents();
      } else {
        toast.error(data.message || 'Erreur lors de la création');
      }
    } catch (error) {
      toast.error('Erreur de connexion au serveur');
    }
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.startDate || !formData.endDate) {
      return toast.error('Titre, date de début et date de fin requis');
    }
    
    try {
      const token = localStorage.getItem('token');
      
      // Préparer les données
      const eventData = {
        title: formData.title,
        description: formData.description || undefined,
        startDate: formData.startDate,
        endDate: formData.endDate,
        allDay: formData.allDay || false,
        location: formData.location || undefined,
        type: formData.type || 'EVENT',
        color: formData.color || 'primary',
        reminder: formData.reminder ? parseInt(formData.reminder) : undefined
      };
      
      const response = await fetch(`http://localhost:5000/api/v1/calendar/events/${selectedEvent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(eventData)
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Événement mis à jour !');
        setShowEventModal(false);
        setSelectedEvent(null);
        resetForm();
        loadEvents();
      } else {
        toast.error(data.message || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      toast.error('Erreur de connexion au serveur');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Supprimer cet événement ?')) return;

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/v1/calendar/events/${eventId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Événement supprimé !');
        setShowEventModal(false);
        setSelectedEvent(null);
        loadEvents();
      } else {
        toast.error(data.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      toast.error('Erreur de connexion au serveur');
    }
  };

  const openCreateModal = () => {
    resetForm();
    setSelectedEvent(null);
    setShowEventModal(true);
  };

  const openEditModal = (event) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      startDate: event.startDate.substring(0, 16),
      endDate: event.endDate.substring(0, 16),
      allDay: event.allDay,
      location: event.location || '',
      type: event.type,
      color: event.color,
      reminder: event.reminder
    });
    setShowEventModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      allDay: false,
      location: '',
      type: 'EVENT',
      color: 'primary',
      reminder: null
    });
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

  const navigateDay = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + direction);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getMonthCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - (startDate.getDay() === 0 ? 6 : startDate.getDay() - 1));
    
    const calendar = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let week = 0; week < 6; week++) {
      const weekDays = [];
      for (let day = 0; day < 7; day++) {
        const currentDay = new Date(startDate);
        currentDay.setDate(startDate.getDate() + (week * 7) + day);
        
        const isCurrentMonth = currentDay.getMonth() === month;
        const isToday = currentDay.getTime() === today.getTime();
        const dayEvents = events.filter(event => {
          const eventDate = new Date(event.startDate);
          eventDate.setHours(0, 0, 0, 0);
          return eventDate.getTime() === currentDay.getTime();
        });
        
        weekDays.push({
          date: currentDay,
          day: currentDay.getDate(),
          isCurrentMonth,
          isToday,
          events: dayEvents
        });
      }
      calendar.push(weekDays);
      
      // Stop après dernière semaine du mois
      if (week > 0 && weekDays[0].date > lastDay) break;
    }
    
    return calendar;
  };

  const getTodayEvents = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate.getTime() === today.getTime();
    }).sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  };

  const getWeekDays = () => {
    const day = currentDate.getDay();
    const diff = currentDate.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(currentDate.getFullYear(), currentDate.getMonth(), diff);
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.startDate);
        eventDate.setHours(0, 0, 0, 0);
        const compareDate = new Date(date);
        compareDate.setHours(0, 0, 0, 0);
        return eventDate.getTime() === compareDate.getTime();
      });
      days.push({ date, events: dayEvents });
    }
    return days;
  };

  const getHourSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      slots.push(hour);
    }
    return slots;
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatMonthYear = () => {
    return currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  };

  const formatWeekRange = () => {
    const weekDays = getWeekDays();
    const start = weekDays[0].date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    const end = weekDays[6].date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${start} - ${end}`;
  };

  const formatDayDate = () => {
    return currentDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getTypeLabel = (type) => {
    const types = {
      EVENT: 'Événement',
      MEETING: 'Réunion',
      CALL: 'Appel',
      TASK: 'Tâche',
      REMINDER: 'Rappel',
      LUNCH: 'Déjeuner'
    };
    return types[type] || type;
  };

  return (
    <>
      <div className="main-content">
        <div className="row">
          <div className="col-lg-12">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <div>
                <h4 className="mb-1">Calendrier</h4>
                <p className="mb-0 text-muted">Gérez vos événements et rendez-vous</p>
              </div>
              <button className="btn btn-primary" onClick={openCreateModal}>
                <i className="feather-plus me-2"></i>
                Nouvel Événement
              </button>
            </div>
          </div>
        </div>

        <div className="row">
          {/* Calendar View */}
          <div className="col-lg-9">
            <div className="card stretch stretch-full">
              <div className="card-header">
                <div className="d-flex align-items-center justify-content-between w-100">
                  <h5 className="card-title mb-0 text-capitalize">
                    {viewMode === 'month' ? formatMonthYear() : 
                     viewMode === 'week' ? formatWeekRange() : 
                     viewMode === 'day' ? formatDayDate() : 
                     'Agenda'}
                  </h5>
                  <div className="hstack gap-2">
                    <button 
                      className="btn btn-sm btn-light-brand"
                      onClick={() => viewMode === 'month' ? navigateMonth(-1) : viewMode === 'week' ? navigateWeek(-1) : navigateDay(-1)}
                    >
                      <i className="feather-chevron-left"></i>
                    </button>
                    <button className="btn btn-sm btn-light-brand" onClick={goToToday}>
                      Aujourd'hui
                    </button>
                    <button 
                      className="btn btn-sm btn-light-brand"
                      onClick={() => viewMode === 'month' ? navigateMonth(1) : viewMode === 'week' ? navigateWeek(1) : navigateDay(1)}
                    >
                      <i className="feather-chevron-right"></i>
                    </button>
                    <select 
                      className="form-select form-select-sm ms-2" 
                      style={{ width: 'auto' }}
                      value={viewMode}
                      onChange={(e) => setViewMode(e.target.value)}
                    >
                      <option value="month">Mois</option>
                      <option value="week">Semaine</option>
                      <option value="day">Jour</option>
                      <option value="agenda">Agenda</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="card-body">
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary"></div>
                  </div>
                ) : viewMode === 'month' ? (
                  <div className="table-responsive">
                    <table className="table table-bordered mb-0">
                      <thead>
                        <tr className="bg-light">
                          <th className="text-center p-3">Lun</th>
                          <th className="text-center p-3">Mar</th>
                          <th className="text-center p-3">Mer</th>
                          <th className="text-center p-3">Jeu</th>
                          <th className="text-center p-3">Ven</th>
                          <th className="text-center p-3">Sam</th>
                          <th className="text-center p-3">Dim</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getMonthCalendar().map((week, weekIdx) => (
                          <tr key={weekIdx}>
                            {week.map((dayInfo, dayIdx) => (
                              <td 
                                key={dayIdx} 
                                className={`text-center p-2 ${!dayInfo.isCurrentMonth ? 'text-muted bg-soft-secondary' : ''} ${dayInfo.isToday ? 'bg-soft-primary' : ''}`}
                                style={{ height: '120px', verticalAlign: 'top', cursor: 'pointer' }}
                              >
                                <div className={`fw-bold mb-2 ${dayInfo.isToday ? 'text-primary' : ''}`}>
                                  {dayInfo.day}
                                </div>
                                {dayInfo.events.slice(0, 3).map((event, idx) => (
                                  <div 
                                    key={idx} 
                                    className={`badge bg-soft-${event.color} text-${event.color} fs-10 mb-1 d-block text-truncate`}
                                    onClick={() => openEditModal(event)}
                                    style={{ cursor: 'pointer' }}
                                  >
                                    {formatTime(event.startDate)} {event.title}
                                  </div>
                                ))}
                                {dayInfo.events.length > 3 && (
                                  <div className="text-muted fs-10">+{dayInfo.events.length - 3} plus</div>
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : viewMode === 'week' ? (
                  <div className="table-responsive">
                    <table className="table table-bordered mb-0">
                      <thead>
                        <tr className="bg-light">
                          <th style={{ width: '70px' }}>Heure</th>
                          {getWeekDays().map((day, idx) => (
                            <th key={idx} className="text-center p-2">
                              <div className="fw-bold">{day.date.toLocaleDateString('fr-FR', { weekday: 'short' })}</div>
                              <div className="fs-11 text-muted">{day.date.getDate()}</div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {getHourSlots().map((hour) => (
                          <tr key={hour}>
                            <td className="text-center p-2 bg-light fs-11">{hour}:00</td>
                            {getWeekDays().map((day, dayIdx) => {
                              const hourEvents = day.events.filter(event => {
                                const eventHour = new Date(event.startDate).getHours();
                                return eventHour === hour;
                              });
                              return (
                                <td key={dayIdx} className="p-1" style={{ height: '40px', verticalAlign: 'top' }}>
                                  {hourEvents.map((event, eventIdx) => (
                                    <div
                                      key={eventIdx}
                                      className={`badge bg-soft-${event.color} text-${event.color} fs-10 text-truncate d-block mb-1`}
                                      onClick={() => openEditModal(event)}
                                      style={{ cursor: 'pointer' }}
                                    >
                                      {event.title}
                                    </div>
                                  ))}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : viewMode === 'day' ? (
                  <div className="table-responsive">
                    <table className="table table-bordered mb-0">
                      <thead>
                        <tr className="bg-light">
                          <th style={{ width: '100px' }}>Heure</th>
                          <th className="text-center p-3">
                            <div className="fw-bold">{currentDate.toLocaleDateString('fr-FR', { weekday: 'long' })}</div>
                            <div className="text-muted">{currentDate.toLocaleDateString('fr-FR')}</div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {getHourSlots().map((hour) => {
                          const hourEvents = events.filter(event => {
                            const eventDate = new Date(event.startDate);
                            const eventHour = eventDate.getHours();
                            const sameDay = eventDate.toDateString() === currentDate.toDateString();
                            return sameDay && eventHour === hour;
                          });
                          return (
                            <tr key={hour}>
                              <td className="text-center p-3 bg-light">{hour}:00</td>
                              <td className="p-2" style={{ minHeight: '60px' }}>
                                {hourEvents.map((event, idx) => (
                                  <div
                                    key={idx}
                                    className={`alert alert-${event.color} p-2 mb-2`}
                                    onClick={() => openEditModal(event)}
                                    style={{ cursor: 'pointer' }}
                                  >
                                    <div className="d-flex align-items-center">
                                      <div className="flex-grow-1">
                                        <h6 className="mb-1">{event.title}</h6>
                                        <div className="fs-11">
                                          <i className="feather-clock me-1"></i>
                                          {formatTime(event.startDate)} - {formatTime(event.endDate)}
                                        </div>
                                        {event.location && (
                                          <div className="fs-11 mt-1">
                                            <i className="feather-map-pin me-1"></i>
                                            {event.location}
                                          </div>
                                        )}
                                      </div>
                                      <span className={`badge badge-soft-${event.color}`}>
                                        {getTypeLabel(event.type)}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : viewMode === 'agenda' ? (
                  <div className="list-group list-group-flush">
                    {events.length === 0 ? (
                      <div className="text-center py-5 text-muted">
                        <i className="feather-calendar" style={{ fontSize: '3rem', opacity: 0.3 }}></i>
                        <p className="mt-3">Aucun événement</p>
                      </div>
                    ) : (
                      events.map((event) => (
                        <div 
                          key={event.id} 
                          className="list-group-item list-group-item-action"
                          onClick={() => openEditModal(event)}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="d-flex w-100 justify-content-between">
                            <div className="d-flex align-items-start">
                              <div className={`wd-7 ht-7 bg-${event.color} rounded-circle me-3 mt-2`}></div>
                              <div>
                                <h6 className="mb-1">{event.title}</h6>
                                <p className="mb-1 text-muted">{event.description}</p>
                                <div className="hstack gap-2">
                                  <span className="badge badge-soft-secondary fs-10">
                                    {new Date(event.startDate).toLocaleDateString('fr-FR')}
                                  </span>
                                  <span className="text-muted fs-11">
                                    {formatTime(event.startDate)} - {formatTime(event.endDate)}
                                  </span>
                                  <span className={`badge badge-soft-${event.color} fs-10`}>
                                    {getTypeLabel(event.type)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Today's Events */}
          <div className="col-lg-3">
            <div className="card stretch stretch-full">
              <div className="card-header">
                <h5 className="card-title">Aujourd'hui</h5>
                <span className="badge bg-soft-primary text-primary">
                  {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                </span>
              </div>
              <div className="card-body">
                {getTodayEvents().length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    <i className="feather-calendar" style={{ fontSize: '2rem', opacity: 0.3 }}></i>
                    <p className="mt-2 mb-0">Aucun événement</p>
                  </div>
                ) : (
                  <ul className="list-unstyled mb-0">
                    {getTodayEvents().map((event) => (
                      <li 
                        key={event.id} 
                        className="mb-4 pb-4 border-bottom"
                        onClick={() => openEditModal(event)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="d-flex align-items-start">
                          <div className={`wd-7 ht-7 bg-${event.color} rounded-circle me-3 mt-2`}></div>
                          <div className="flex-grow-1">
                            <h6 className="mb-1 fs-13">{event.title}</h6>
                            <div className="hstack gap-2 mb-1">
                              <i className="feather-clock fs-11 text-muted"></i>
                              <span className="fs-11 text-muted">
                                {formatTime(event.startDate)} - {formatTime(event.endDate)}
                              </span>
                            </div>
                            <span className={`badge badge-soft-${event.color} fs-10`}>
                              {getTypeLabel(event.type)}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Quick Add */}
            <div className="card stretch stretch-full mt-3">
              <div className="card-header">
                <h5 className="card-title">Ajout Rapide</h5>
              </div>
              <div className="card-body">
                <form onSubmit={(e) => { e.preventDefault(); setShowQuickAdd(true); openCreateModal(); }}>
                  <button type="button" className="btn btn-primary w-100" onClick={openCreateModal}>
                    <i className="feather-plus me-2"></i>
                    Nouvel Événement
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {selectedEvent ? 'Modifier l\'événement' : 'Nouvel événement'}
                </h5>
                <button type="button" className="btn-close" onClick={() => { setShowEventModal(false); setSelectedEvent(null); }}></button>
              </div>
              <form onSubmit={selectedEvent ? handleUpdateEvent : handleCreateEvent}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label">Titre *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="col-12">
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      ></textarea>
                    </div>
                    
                    <div className="col-md-6">
                      <label className="form-label">Date de début *</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="col-md-6">
                      <label className="form-label">Date de fin *</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="col-md-6">
                      <label className="form-label">Type</label>
                      <select
                        className="form-select"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      >
                        <option value="EVENT">Événement</option>
                        <option value="MEETING">Réunion</option>
                        <option value="CALL">Appel</option>
                        <option value="TASK">Tâche</option>
                        <option value="REMINDER">Rappel</option>
                        <option value="LUNCH">Déjeuner</option>
                      </select>
                    </div>
                    
                    <div className="col-md-6">
                      <label className="form-label">Couleur</label>
                      <select
                        className="form-select"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      >
                        <option value="primary">Bleu</option>
                        <option value="success">Vert</option>
                        <option value="info">Cyan</option>
                        <option value="warning">Jaune</option>
                        <option value="danger">Rouge</option>
                      </select>
                    </div>
                    
                    <div className="col-12">
                      <label className="form-label">Lieu</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      />
                    </div>
                    
                    <div className="col-md-6">
                      <label className="form-label">Rappel</label>
                      <select
                        className="form-select"
                        value={formData.reminder || ''}
                        onChange={(e) => setFormData({ ...formData, reminder: e.target.value ? parseInt(e.target.value) : null })}
                      >
                        <option value="">Aucun</option>
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="60">1 heure</option>
                        <option value="1440">1 jour</option>
                      </select>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="form-check mt-4">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="allDay"
                          checked={formData.allDay}
                          onChange={(e) => setFormData({ ...formData, allDay: e.target.checked })}
                        />
                        <label className="form-check-label" htmlFor="allDay">
                          Toute la journée
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  {selectedEvent && (
                    <button
                      type="button"
                      className="btn btn-danger me-auto"
                      onClick={() => handleDeleteEvent(selectedEvent.id)}
                    >
                      <i className="feather-trash-2 me-2"></i>
                      Supprimer
                    </button>
                  )}
                  <button type="button" className="btn btn-light" onClick={() => { setShowEventModal(false); setSelectedEvent(null); }}>
                    Annuler
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <i className="feather-check me-2"></i>
                    {selectedEvent ? 'Mettre à jour' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
