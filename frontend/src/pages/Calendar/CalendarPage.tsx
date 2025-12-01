import React, { useEffect, useState, useCallback } from "react";
import { Calendar, momentLocalizer, SlotInfo, Navigate, Views, View } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

import EventService, {CompanyEvent} from "../../services/Calendar/event.service";
import AuthService from "../../services/Auth/auth.service";

// Setup Moment Localizer
const localizer = momentLocalizer(moment);

// --- CUSTOM TOOLBAR (FIXED DYNAMIC LABEL) ---
const CustomToolbar = (toolbar: any) => {
  const goToBack = () => toolbar.onNavigate(Navigate.PREVIOUS);
  const goToNext = () => toolbar.onNavigate(Navigate.NEXT);
  const goToCurrent = () => toolbar.onNavigate(Navigate.TODAY);

  const setMonthView = () => toolbar.onView(Views.MONTH);
  const setWeekView = () => toolbar.onView(Views.WEEK);
  const setDayView = () => toolbar.onView(Views.DAY);

  // ΔΥΝΑΜΙΚΗ ΕΤΙΚΕΤΑ ΑΝΑΛΟΓΑ ΜΕ ΤΟ VIEW
  const label = () => {
    const date = moment(toolbar.date);
    
    if (toolbar.view === 'day') {
        // Π.χ. Wednesday, 25 December 2025
        return <span className="text-xl font-bold text-white">{date.format('dddd, D MMMM YYYY')}</span>;
    } 
    else if (toolbar.view === 'week') {
        // Π.χ. Dec 01 - Dec 07, 2025
        const start = date.clone().startOf('week');
        const end = date.clone().endOf('week');
        return <span className="text-lg font-bold text-white">{start.format('MMM D')} - {end.format('MMM D, YYYY')}</span>;
    } 
    else {
        // Π.χ. December 2025
        return <span className="text-xl font-bold text-white capitalize">{date.format('MMMM YYYY')}</span>;
    }
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4 bg-slate-800 p-4 rounded-xl border border-slate-700">
      
      <div className="flex gap-2">
        <button onClick={goToBack} className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm transition">Back</button>
        <button onClick={goToCurrent} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition shadow">Today</button>
        <button onClick={goToNext} className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm transition">Next</button>
      </div>

      <div>{label()}</div>

      <div className="flex gap-2">
        <button onClick={setMonthView} className={`px-3 py-1 rounded text-sm transition ${toolbar.view === 'month' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:text-white'}`}>Month</button>
        <button onClick={setWeekView} className={`px-3 py-1 rounded text-sm transition ${toolbar.view === 'week' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:text-white'}`}>Week</button>
        <button onClick={setDayView} className={`px-3 py-1 rounded text-sm transition ${toolbar.view === 'day' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:text-white'}`}>Day</button>
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
    // Όταν κάνεις κλικ σε Day view, συνήθως θες event διάρκειας 1 ώρας, όχι 0 λεπτών
    // Αν το end είναι ίδιο με start, προσθέτουμε 1 ώρα
    let endDate = end;
    if (moment(start).isSame(end)) {
        endDate = moment(start).add(1, 'hour').toDate();
    }
    
    setFormData({ ...formData, startTime: start, endTime: endDate });
    setShowModal(true);
  };

  const handleSelectEvent = (event: CompanyEvent) => {
    setSelectedEvent(event);
  };

  const handleDeleteClick = () => {
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
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 w-full max-w-md shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-4">New Event</h3>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <input placeholder="Title" required className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-white outline-none focus:border-blue-500" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                    <textarea placeholder="Description" className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-white h-20 outline-none focus:border-blue-500" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                    <input placeholder="Location" className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-white outline-none focus:border-blue-500" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                    
                    <select className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-white outline-none focus:border-blue-500" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})}>
                        <option value="MEETING">Meeting</option>
                        <option value="EVENT">Corporate Event</option>
                        <option value="HOLIDAY">Holiday</option>
                        <option value="OTHER">Other</option>
                    </select>

                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-400 hover:text-white transition">Cancel</button>
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition">Create</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* DETAILS MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 w-full max-w-sm shadow-2xl relative">
                
                <button onClick={() => setSelectedEvent(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition p-1 rounded-full hover:bg-slate-700">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                </button>
                
                <div className="mb-4">
                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${selectedEvent.type === 'HOLIDAY' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>{selectedEvent.type}</span>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">{selectedEvent.title}</h3>
                
                <div className="space-y-4 text-sm text-slate-300 mt-4 bg-slate-900/50 p-4 rounded-lg">
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
                    <div className="mt-6 flex justify-end">
                        <button onClick={handleDeleteClick} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-lg shadow-red-500/20 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            Delete Event
                        </button>
                    </div>
                )}
            </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 w-full max-w-sm shadow-2xl text-center">
                <h3 className="text-xl font-bold text-white mb-2">Delete Event?</h3>
                <p className="text-slate-400 mb-6">Are you sure? This cannot be undone.</p>
                <div className="flex justify-center gap-3">
                    <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition">Cancel</button>
                    <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition shadow-lg">Yes, Delete</button>
                </div>
            </div>
        </div>
      )}

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