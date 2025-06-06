import React, { useState, useEffect } from 'react';
import { Calendar as BigCalendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { CalendarEvent, Project } from '../../types';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

// Configure moment for Spanish locale
moment.locale('es');
const localizer = momentLocalizer(moment);

const Calendar: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentView, setCurrentView] = useState(Views.MONTH);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project_id: '',
    start_date: '',
    end_date: '',
    all_day: false,
    event_type: 'meeting',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [eventsData, projectsData] = await Promise.all([
        window.database.getCalendarEvents(),
        window.database.getProjects(),
      ]);
      setEvents(eventsData);
      setProjects(projectsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await window.database.createCalendarEvent(formData);
      await loadData();
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create event:', error);
    }
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    
    try {
      await window.database.updateCalendarEvent({ ...editingEvent, ...formData });
      await loadData();
      setEditingEvent(null);
      resetForm();
    } catch (error) {
      console.error('Failed to update event:', error);
    }
  };

  const handleDeleteEvent = async (event: CalendarEvent) => {
    if (window.confirm(`¿Está seguro de que desea eliminar el evento "${event.title}"?`)) {
      try {
        await window.database.deleteCalendarEvent(event.id);
        await loadData();
      } catch (error) {
        console.error('Failed to delete event:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      project_id: '',
      start_date: '',
      end_date: '',
      all_day: false,
      event_type: 'meeting',
    });
    setSelectedDate(null);
  };

  const openCreateModal = (date?: Date) => {
    if (date) {
      const dateStr = date.toISOString().split('T')[0];
      setFormData({
        ...formData,
        start_date: dateStr,
        end_date: dateStr,
      });
      setSelectedDate(date);
    }
    setShowCreateModal(true);
  };

  const openEditModal = (event: CalendarEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      project_id: event.project_id || '',
      start_date: event.start_date.split('T')[0],
      end_date: event.end_date.split('T')[0],
      all_day: event.all_day,
      event_type: event.event_type || 'meeting',
    });
  };

  // Transform events for react-big-calendar
  const calendarEvents = events.map(event => ({
    id: event.id,
    title: event.title,
    start: new Date(event.start_date),
    end: new Date(event.end_date),
    allDay: event.all_day,
    resource: event,
  }));

  const eventStyleGetter = (event: any) => {
    const eventType = event.resource.event_type;
    let backgroundColor = '#3174ad';
    
    switch (eventType) {
      case 'meeting':
        backgroundColor = '#3174ad';
        break;
      case 'site_visit':
        backgroundColor = '#f59e0b';
        break;
      case 'deadline':
        backgroundColor = '#ef4444';
        break;
      case 'milestone':
        backgroundColor = '#10b981';
        break;
      default:
        backgroundColor = '#6b7280';
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  };

  const EventForm = ({ onSubmit, isEditing }: { onSubmit: (e: React.FormEvent) => void; isEditing: boolean }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Título *
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Obra
          </label>
          <select
            value={formData.project_id}
            onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
          >
            <option value="">Sin obra asociada</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name} - {project.client_name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de evento
          </label>
          <select
            value={formData.event_type}
            onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
          >
            <option value="meeting">Reunión</option>
            <option value="site_visit">Visita a obra</option>
            <option value="deadline">Fecha límite</option>
            <option value="milestone">Hito</option>
            <option value="other">Otro</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de inicio
          </label>
          <input
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de fin
          </label>
          <input
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.all_day}
              onChange={(e) => setFormData({ ...formData, all_day: e.target.checked })}
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700">Todo el día</span>
          </label>
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            if (isEditing) {
              setEditingEvent(null);
            } else {
              setShowCreateModal(false);
            }
            resetForm();
          }}
        >
          Cancelar
        </Button>
        {isEditing && (
          <Button
            type="button"
            variant="danger"
            onClick={() => {
              if (editingEvent) {
                handleDeleteEvent(editingEvent);
                setEditingEvent(null);
                resetForm();
              }
            }}
          >
            Eliminar
          </Button>
        )}
        <Button type="submit">
          {isEditing ? 'Actualizar' : 'Crear'} Evento
        </Button>
      </div>
    </form>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-color"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Agenda</h1>
        <Button icon={Plus} onClick={() => openCreateModal()}>
          Nuevo Evento
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6" style={{ height: '600px' }}>
        <BigCalendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          view={currentView}
          onView={setCurrentView}
          date={currentDate}
          onNavigate={setCurrentDate}
          eventPropGetter={eventStyleGetter}
          onSelectSlot={(slotInfo) => {
            openCreateModal(slotInfo.start);
          }}
          onSelectEvent={(event) => {
            openEditModal(event.resource);
          }}
          selectable
          popup
          messages={{
            next: 'Siguiente',
            previous: 'Anterior',
            today: 'Hoy',
            month: 'Mes',
            week: 'Semana',
            day: 'Día',
            agenda: 'Agenda',
            date: 'Fecha',
            time: 'Hora',
            event: 'Evento',
            noEventsInRange: 'No hay eventos en este rango',
            showMore: (total) => `+ Ver más (${total})`,
          }}
          formats={{
            monthHeaderFormat: 'MMMM YYYY',
            dayHeaderFormat: 'dddd DD/MM',
            dayRangeHeaderFormat: ({ start, end }) =>
              `${moment(start).format('DD/MM')} - ${moment(end).format('DD/MM/YYYY')}`,
          }}
        />
      </div>

      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Nuevo Evento"
        size="lg"
      >
        <EventForm onSubmit={handleCreateEvent} isEditing={false} />
      </Modal>

      <Modal
        isOpen={!!editingEvent}
        onClose={() => {
          setEditingEvent(null);
          resetForm();
        }}
        title="Editar Evento"
        size="lg"
      >
        <EventForm onSubmit={handleUpdateEvent} isEditing={true} />
      </Modal>
    </div>
  );
};

export default Calendar;