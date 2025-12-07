import React, { useEffect, useState, useCallback } from "react";
import { Calendar, momentLocalizer, SlotInfo, Navigate, Views, View } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

import EventService, { CompanyEvent } from "../../services/calendar/event.service";
import AuthService from "../../services/auth/auth.service";

// Components
import Button from "../../components/Button";
import Input from "../../components/Input";
import Select from "../../components/Select";
import Modal from "../../components/Modal";

// Setup Moment Localizer
const localizer = momentLocalizer(moment);

// --- CUSTOM TOOLBAR ---
const CustomToolbar = (toolbar: any) => {
  const goToBack = () => toolbar.onNavigate(Navigate.PREVIOUS);
  const goToNext = () => toolbar.onNavigate(Navigate.NEXT);
  const goToCurrent = () => toolbar.onNavigate(Navigate.TODAY);

  const setMonthView = () => toolbar.onView(Views.MONTH);
  const setWeekView = () => toolbar.onView(Views.WEEK);
  const setDayView = () => toolbar.onView(Views.DAY);

  const label = () => {
    const date = moment(toolbar.date);
    if (toolbar.view === 'day') {
        return <span className="text-xl font-bold text-white">{date.format('dddd, D MMMM YYYY')}</span>;
    } else if (toolbar.view === 'week') {
        const start = date.clone().startOf('week');
        const end = date.clone().endOf('week');
        return <span className="text-lg font-bold text-white">{start.format('MMM D')} - {end.format('MMM D, YYYY')}</span>;
    } else {
        return <span className="text-xl font-bold text-white capitalize">{date.format('MMMM YYYY')}</span>;
    }
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4 bg-slate-800 p-4 rounded-xl border border-slate-700">
      
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" onClick={goToBack}>Back</Button>
        <Button size="sm" onClick={goToCurrent}>Today</Button>
        <Button size="sm" variant="secondary" onClick={goToNext}>Next</Button>
      </div>

      <div>{label()}</div>

      <div className="flex gap-2">
        <Button size="sm" variant={toolbar.view === 'month' ? 'primary' : 'secondary'} onClick={setMonthView}>Month</Button>
        <Button size="sm" variant={toolbar.view === 'week' ? 'primary' : 'secondary'} onClick={setWeekView}>Week</Button>
        <Button size="sm" variant={toolbar.view === 'day' ? 'primary' : 'secondary'} onClick={setDayView}>Day</Button>
      </div>
    </div>
  );
};

const CalendarPage = () => {
  const [events, setEvents] = useState<CompanyEvent[]>([]);
  
  // Controlled State
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());

  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CompanyEvent | null>(null);
  
  const role = AuthService.getUserRole();
  const isAdmin = role === "COMPANY_ADMIN";

  const [formData, setFormData] = useState<CompanyEvent>({
    title: "",
    description: "",
    startTime: new Date(),
    endTime: new Date(),
    location: "",
    type: "MEETING",
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const data = await EventService.getAll();
      const formattedEvents = data.map((ev: any) => ({
        ...ev,
        startTime: new Date(ev.startTime),
        endTime: new Date(ev.endTime)
      }));
      setEvents(formattedEvents);
    } catch (error) {
      console.error("Error loading events", error);
    }
  };

  const onNavigate = useCallback((newDate: Date) => setDate(newDate), [setDate]);
  const onView = useCallback((newView: View) => setView(newView), [setView]);

  const handleSelectSlot = ({ start, end }: SlotInfo) => {
    if (!isAdmin) return;
    let endDate = end;
    if (moment(start).isSame(end)) {
        endDate = moment(start).add(1, 'hour').toDate();
    }
    setFormData({ ...formData, startTime: start, endTime: endDate });
    setShowModal(true);
  };

  const handleSelectEvent = (event: CompanyEvent) => {
    setSelectedEvent(event);
    setShowDetailsModal(true);
  };

  const handleDeleteClick = () => {
    setShowDetailsModal(false); // Close details first
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (selectedEvent?.id) {
        try {
            await EventService.remove(selectedEvent.id);
            setEvents(events.filter(e => e.id !== selectedEvent.id));
            setShowDeleteModal(false);
            setSelectedEvent(null);
        } catch (error) {
            alert("Failed to delete event");
        }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        await EventService.create(formData);
        setShowModal(false);
        loadEvents();
        setFormData({ title: "", description: "", startTime: new Date(), endTime: new Date(), location: "", type: "MEETING" });
    } catch (error) {
        alert("Failed to create event");
    }
  };

  const eventStyleGetter = (event: CompanyEvent) => {
    let backgroundColor = "#3b82f6";
    if (event.type === "HOLIDAY") backgroundColor = "#10b981";
    if (event.type === "MEETING") backgroundColor = "#8b5cf6";
    if (event.type === "EVENT") backgroundColor = "#f59e0b";

    return {
      style: {
        backgroundColor,
        borderRadius: "4px",
        opacity: 0.9,
        color: "white",
        border: "none",
        display: "block",
      },
    };
  };

  const formatDateDisplay = (date: Date | string) => {
    return moment(date).format('dddd, D MMMM YYYY - HH:mm');
  };

  const eventTypeOptions = [
      { value: "MEETING", label: "Meeting" },
      { value: "EVENT", label: "Corporate Event" },
      { value: "HOLIDAY", label: "Holiday" },
      { value: "OTHER", label: "Other" }
  ];

  return (
    <div className="h-[85vh] flex flex-col text-slate-300">
      
      <div className="flex justify-between items-center mb-4">
        <div>
            <h2 className="text-2xl font-bold text-white">Company Calendar</h2>
            {isAdmin && <p className="text-xs text-slate-400">Click dates to add events</p>}
        </div>
      </div>

      <div className="flex-1 bg-slate-900 rounded-xl shadow-2xl overflow-hidden border border-slate-700 p-2">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="startTime"
          endAccessor="endTime"
          style={{ height: "100%" }}
          selectable={isAdmin}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
          view={view}
          date={date}
          onNavigate={onNavigate}
          onView={onView}
          views={["month", "week", "day"]}
          components={{ toolbar: CustomToolbar }}
        />
      </div>

      {/* CREATE MODAL */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Event">
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
            
            <div>
                <label className="block text-xs text-slate-400 mb-1 uppercase font-bold">Description</label>
                <textarea 
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500 h-20"
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})} 
                />
            </div>
            
            <Input label="Location" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
            
            <Select 
                label="Type" 
                options={eventTypeOptions} 
                value={formData.type} 
                onChange={e => setFormData({...formData, type: e.target.value as any})} 
            />

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-700">
                <Button variant="secondary" onClick={() => setShowModal(false)} type="button">Cancel</Button>
                <Button type="submit">Create</Button>
            </div>
        </form>
      </Modal>

      {/* DETAILS MODAL */}
      <Modal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)} title={selectedEvent?.title || "Event Details"}>
        {selectedEvent && (
            <div className="space-y-4">
                <div className="mb-2">
                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${selectedEvent.type === 'HOLIDAY' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                        {selectedEvent.type}
                    </span>
                </div>
                
                <div className="space-y-4 text-sm text-slate-300 bg-slate-900/50 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <div className="flex flex-col">
                            <span className="text-xs text-slate-500 uppercase font-bold">Start Time</span>
                            <span className="text-white font-medium">
                                {formatDateDisplay(selectedEvent.startTime)}
                            </span>
                        </div>
                    </div>
                    
                    {selectedEvent.location && (
                        <div className="flex items-start gap-3 pt-2 border-t border-slate-700/50 mt-2">
                            <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            <div className="flex flex-col">
                                <span className="text-xs text-slate-500 uppercase font-bold">Location</span>
                                <span className="text-white font-medium">{selectedEvent.location}</span>
                            </div>
                        </div>
                    )}
                </div>

                {selectedEvent.description && (
                    <div className="mt-4 p-3 border-l-4 border-slate-600 bg-slate-700/20">
                        <p className="text-slate-300 italic">{selectedEvent.description}</p>
                    </div>
                )}

                {isAdmin && (
                    <div className="mt-6 pt-4 border-t border-slate-700 flex justify-end">
                        <Button variant="danger" size="sm" onClick={handleDeleteClick}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            Delete Event
                        </Button>
                    </div>
                )}
            </div>
        )}
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Event?">
        <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>
            <p className="text-slate-400 mb-6">Are you sure? This cannot be undone.</p>
            <div className="flex justify-center gap-3">
                <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
                <Button variant="danger" onClick={confirmDelete}>Yes, Delete</Button>
            </div>
        </div>
      </Modal>

      <style>{`
        .rbc-calendar { color: #cbd5e1; font-family: inherit; }
        .rbc-off-range-bg { background: #0f172a; }
        .rbc-today { background: #1e293b; border: 1px solid #3b82f6 !important; }
        .rbc-header { border-bottom: 1px solid #334155; padding: 12px; color: #94a3b8; font-size: 0.8rem; text-transform: uppercase; }
        .rbc-month-view, .rbc-time-view, .rbc-agenda-view { border: 1px solid #334155; background: #111827; }
        .rbc-day-bg + .rbc-day-bg { border-left: 1px solid #334155; }
        .rbc-month-row + .rbc-month-row { border-top: 1px solid #334155; }
        .rbc-day-slot .rbc-time-slot { border-top: 1px solid #334155; }
        .rbc-event { border: none !important; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
      `}</style>
    </div>
  );
};

export default CalendarPage;