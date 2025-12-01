import React, { useEffect, useState, useRef } from "react";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import axios from "axios";
import AuthService from "../../services/Auth/auth.service";
import EmployeeService from "../../services/Workforce/employee.service";

const ChatPage = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [activeUser, setActiveUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  
  const currentUser = AuthService.getCurrentUser();
  const myEmail = currentUser?.email || currentUser?.sub; 

  const stompClientRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  console.log("My Email:", myEmail);
  console.log("Current User Object:", currentUser);

  useEffect(() => {
    if (!myEmail) return;
    loadUsers();
    connectWebSocket();

    return () => {
        if (stompClientRef.current && stompClientRef.current.connected) {
            stompClientRef.current.disconnect();
        }
    };
  }, [myEmail]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (activeUser && myEmail) {
        loadChatHistory(activeUser.email);
    }
  }, [activeUser, myEmail]);

  const loadUsers = async () => {
    try {
        const data = await EmployeeService.getChatUsers();
        
        console.log("Data from API:", data);
        setUsers(data.filter((u: any) => u.email !== myEmail));
    } catch (error) {
        console.error("Error loading users", error);
    }
  };

  const connectWebSocket = () => {
    const socket = new SockJS("http://localhost:8080/ws");
    const client = Stomp.over(socket);
    client.debug = () => {}; 

    client.connect({}, () => {
        client.subscribe(`/topic/messages/${myEmail}`, (payload) => {
            const receivedMessage = JSON.parse(payload.body);
            setMessages((prev) => {
                if (prev.some(m => m.id === receivedMessage.id)) return prev;
                return [...prev, receivedMessage];
            });
        });
    }, (err) => {
        console.error("WebSocket Error:", err);
    });

    stompClientRef.current = client;
  };

  const loadChatHistory = async (otherUserEmail: string) => {
    try {
        const response = await axios.get(
            `http://localhost:8080/api/messages/${myEmail}/${otherUserEmail}`,
            { headers: { Authorization: "Bearer " + currentUser.token } }
        );
        setMessages(response.data);
    } catch (error) {
        console.error("Error loading messages", error);
    }
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeUser || !myEmail) return;

    const chatMessage = {
        senderId: myEmail,
        recipientId: activeUser.email,
        content: newMessage,
        timestamp: new Date().toISOString()
    };

    stompClientRef.current.send("/app/chat", {}, JSON.stringify(chatMessage));
    setNewMessage("");
  };

  const filteredMessages = messages.filter(msg => 
    (msg.senderId === myEmail && msg.recipientId === activeUser?.email) ||
    (msg.senderId === activeUser?.email && msg.recipientId === myEmail)
  );

  return (
    <div className="h-[85vh] flex bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-2xl">
      
      {/* LIST */}
      <div className="w-1/3 border-r border-slate-700 bg-slate-900 flex flex-col">
        <div className="p-4 border-b border-slate-700">
            <h3 className="text-white font-bold text-lg">Messages</h3>
        </div>
        <div className="overflow-y-auto flex-1">
            {users.length === 0 ? (
                <p className="text-slate-500 p-4 text-sm text-center">No other users found.</p>
            ) : (
                users.map(user => (
                    <div 
                        key={user.id} 
                        onClick={() => setActiveUser(user)}
                        className={`flex items-center gap-3 p-4 cursor-pointer transition border-b border-slate-800 ${activeUser?.email === user.email ? 'bg-blue-600/10 border-l-4 border-l-blue-500' : 'hover:bg-slate-800'}`}
                    >
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold border border-slate-600">
                            {user.firstName ? user.firstName[0] : user.email[0].toUpperCase()}
                        </div>
                        <div>
                            <p className="text-white font-medium text-sm">
                                {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email}
                            </p>
                            <p className="text-slate-500 text-xs truncate w-32">{user.jobTitle || "User"}</p>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>

      {/* CHAT */}
      <div className="w-2/3 flex flex-col bg-slate-800">
        
        {activeUser ? (
            <>
                <div className="p-4 border-b border-slate-700 flex items-center gap-3 bg-slate-900/50">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                        {activeUser.firstName ? activeUser.firstName[0] : activeUser.email[0].toUpperCase()}
                    </div>
                    <span className="text-white font-bold">
                        {activeUser.firstName && activeUser.lastName ? `${activeUser.firstName} ${activeUser.lastName}` : activeUser.email}
                    </span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-800">
                    {filteredMessages.length === 0 && (
                        <div className="text-center text-slate-500 mt-10">
                            <p>No messages yet.</p>
                            <p className="text-sm">Say hello!</p>
                        </div>
                    )}
                    
                    {filteredMessages.map((msg, index) => {
                        const isMe = msg.senderId === myEmail;
                        return (
                            <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-700 text-slate-200 rounded-tl-none'}`}>
                                    <p>{msg.content}</p>
                                    <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>
                                        {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={sendMessage} className="p-4 border-t border-slate-700 bg-slate-900/50 flex gap-2">
                    <input 
                        className="flex-1 bg-slate-700 border border-slate-600 text-white rounded-full px-4 py-2 focus:outline-none focus:border-blue-500 transition"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition shadow-lg disabled:opacity-50" disabled={!newMessage.trim()}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                        </svg>
                    </button>
                </form>
            </>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                <p>Select a colleague to start chatting</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;