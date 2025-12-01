import React, { useEffect, useState, useRef } from "react";
import { Outlet, Navigate, Link, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import AuthService from "../services/auth/auth.service";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import NotificationService, { Notification } from "../services/notification/notification.service";
import { formatDistanceToNow } from "date-fns"; 

const Layout = () => {
  const currentUser = AuthService.getCurrentUser();
  const myEmail = currentUser?.email || currentUser?.sub;
  
  // States
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const stompClientRef = useRef<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const processedIds = useRef(new Set<number>());
  
  const location = useLocation();

  // 1. Load Notifications & Connect WebSocket
  useEffect(() => {
    if (!myEmail) return;
    
    // Load initial data (Χωρίς να πειράζουμε το count εδώ)
    NotificationService.getMyNotifications().then(data => {
        setNotifications(data);
        data.forEach((n: any) => processedIds.current.add(n.id));
    }).catch(err => console.log("Notifications load error (ignore if offline)"));

    const socket = new SockJS("http://localhost:8080/ws");
    const client = Stomp.over(socket);
    client.debug = () => {}; 

    client.connect({}, () => {
        if (!stompClientRef.current) return;

        client.subscribe(`/topic/notifications/${myEmail}`, (payload) => {
            const newNotif = JSON.parse(payload.body);
            
            // Deduplication Logic
            if (processedIds.current.has(newNotif.id)) {
                return; 
            }
            processedIds.current.add(newNotif.id);

            // Απλά προσθέτουμε στη λίστα. Ο υπολογισμός του Count γίνεται αυτόματα παρακάτω.
            setNotifications(prev => [newNotif, ...prev]);
        });
    }, (err) => {});
    
    stompClientRef.current = client;

    return () => {
        const client = stompClientRef.current;
        if (client && client.connected) {
            try { client.disconnect(() => {}); } catch (e) {}
        }
        stompClientRef.current = null;
    };
  }, [myEmail]);

  // 2. ΑΥΤΟΜΑΤΟΣ ΥΠΟΛΟΓΙΣΜΟΣ UNREAD COUNT (Η Λύση)
  // Κάθε φορά που αλλάζει η λίστα (notifications), ξαναμετράμε τα αδιάβαστα.
  useEffect(() => {
    const count = notifications.filter(n => !n.read).length;
    setUnreadCount(count);
  }, [notifications]);


  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // OPEN / CLOSE & Visual Reset
  const handleToggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
    // Σημείωση: Δεν μηδενίζουμε το count εδώ "βίαια", 
    // γιατί αν δεν τα διαβάσει, πρέπει να ξαναδεί το νούμερο όταν κλείσει το μενού.
    // Αν θες να φεύγει η βούλα μόλις ανοίξεις, άσε το setUnreadCount(0) εδώ.
    // Αλλά το σωστό UX είναι να μειώνεται καθώς τα πατάς (που γίνεται αυτόματα τώρα).
  };

  const handleMarkAsRead = async (notif: Notification) => {
    if (!notif.read) {
        try {
            await NotificationService.markAsRead(notif.id);
            // Αυτό θα triggάρει το useEffect παραπάνω και θα μειώσει το count αυτόματα
            setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
        } catch (error) {
            console.error("Failed to mark read");
        }
    }
  };

  // --- SVG ICONS ---
  const getIcon = (type: string) => {
    switch (type) {
      case "TASK": 
        return (
            <div className="bg-blue-500/20 p-2 rounded-full text-blue-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            </div>
        );
      case "PAYROLL": 
        return (
            <div className="bg-emerald-500/20 p-2 rounded-full text-emerald-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
        );
      case "CHAT": 
        return (
            <div className="bg-indigo-500/20 p-2 rounded-full text-indigo-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            </div>
        );
      case "EVENT": 
        return (
            <div className="bg-purple-500/20 p-2 rounded-full text-purple-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </div>
        );
      default: 
        return (
            <div className="bg-slate-700 p-2 rounded-full text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
            </div>
        );
    }
  };

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
      <Sidebar />

      <div className="flex-1 ml-64 flex flex-col">
        
        {/* TOP BAR */}
        <header className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-end px-8 gap-6 relative z-40">
            
            {/* User Info */}
            <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-white">
                    {currentUser.companyName || "EconomIT"}
                </p>
                <p className="text-xs text-slate-400">{myEmail}</p>
            </div>

            {/* NOTIFICATION BELL */}
            <div className="relative" ref={dropdownRef}>
                <button 
                    onClick={handleToggleDropdown}
                    className={`relative p-2 rounded-full transition ${isDropdownOpen ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
                >
                    {/* Bell Icon SVG */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                    </svg>
                    
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-pulse border-2 border-slate-800">
                            {unreadCount}
                        </span>
                    )}
                </button>

                {/* DROPDOWN */}
                {isDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-80 md:w-96 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        
                        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
                            <h3 className="font-bold text-white text-sm">Notifications</h3>
                            <Link 
                                to="/notifications" 
                                onClick={() => setIsDropdownOpen(false)}
                                className="text-xs text-blue-400 hover:text-blue-300 hover:underline"
                            >
                                View all
                            </Link>
                        </div>

                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-slate-500 flex flex-col items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                    <p className="text-sm">No notifications yet</p>
                                </div>
                            ) : (
                                notifications.slice(0, 6).map((notif) => (
                                    <div 
                                        key={notif.id} 
                                        onClick={() => handleMarkAsRead(notif)}
                                        className={`p-4 border-b border-slate-700/50 flex gap-3 hover:bg-slate-700/40 transition cursor-pointer ${!notif.read ? 'bg-blue-500/5' : ''}`}
                                    >
                                        <div className="mt-0.5">{getIcon(notif.type)}</div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm truncate ${!notif.read ? 'font-semibold text-white' : 'text-slate-300'}`}>
                                                {notif.message}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                {formatDistanceToNow(new Date(notif.timestamp), { addSuffix: true })}
                                            </p>
                                        </div>
                                        {!notif.read && (
                                            <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

        </header>

        {/* MAIN CONTENT */}
        <div className="p-8">
            <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;