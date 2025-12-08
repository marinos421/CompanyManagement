import React from "react";
import { Link } from "react-router-dom";
import Button from "../../components/Button";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-white selection:bg-blue-500 selection:text-white font-sans">
      
      {/* --- NAVBAR --- */}
      <nav className="border-b border-slate-800 backdrop-blur-md bg-slate-900/80 fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                {/* Logo Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
                </svg>
            </div>
            <span className="text-xl font-bold tracking-tight">EconomIT</span>
          </div>
          
          <div className="flex gap-4">
            <Link to="/login">
              <Button variant="outline" size="sm">Log In</Button>
            </Link>
            <Link to="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="pt-40 pb-20 px-6 text-center relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[100px] -z-10"></div>

        <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-sm font-medium mb-6">
                {/* Rocket Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" />
                </svg>
                The Ultimate SaaS for Business Management
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                Manage your entire business <br /> in one dashboard.
            </h1>
            <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
                Track finances, manage employees, assign tasks, and communicate with your team in real-time. All the tools you need, simplified.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register">
                    <Button size="md" className="px-8 py-4 text-lg">Start Free Trial</Button>
                </Link>
                <Link to="/login">
                    <Button variant="secondary" size="md" className="px-8 py-4 text-lg">Live Demo</Button>
                </Link>
            </div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section className="py-20 bg-slate-800/30 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold mb-4">Everything you need to run your company</h2>
                <p className="text-slate-400">Replace 5 different apps with EconomIT.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Feature 1: Finance */}
                <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 hover:border-blue-500/50 transition duration-300">
                    <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold mb-3">Finance & Payroll</h3>
                    <p className="text-slate-400">Track income and expenses, automate monthly payrolls, and export detailed PDF/CSV reports for your accountant.</p>
                </div>

                {/* Feature 2: Workforce */}
                <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 hover:border-blue-500/50 transition duration-300">
                    <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold mb-3">Workforce & Tasks</h3>
                    <p className="text-slate-400">Manage your employees, assign tasks with deadlines, and track progress with our intuitive Kanban-style board.</p>
                </div>

                {/* Feature 3: Chat */}
                <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 hover:border-blue-500/50 transition duration-300">
                    <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold mb-3">Chat & Collaboration</h3>
                    <p className="text-slate-400">Stop using WhatsApp for work. Use our built-in real-time chat and company calendar to stay organized.</p>
                </div>
            </div>
        </div>
      </section>

      {/* --- PRICING SECTION --- */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold mb-4">Simple, transparent pricing</h2>
                <p className="text-slate-400">No hidden fees. Cancel anytime.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {/* Free Plan */}
                <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8">
                    <h3 className="text-lg font-semibold text-slate-300">Starter</h3>
                    <p className="text-4xl font-bold mt-4 mb-2">Free</p>
                    <p className="text-slate-500 text-sm mb-6">Forever free for small teams.</p>
                    <ul className="space-y-3 text-sm text-slate-300 mb-8">
                        <li className="flex gap-2">
                            <CheckIcon /> Up to 3 Employees
                        </li>
                        <li className="flex gap-2">
                            <CheckIcon /> Basic Finance Tracking
                        </li>
                        <li className="flex gap-2">
                            <CheckIcon /> Shared Calendar
                        </li>
                    </ul>
                    <Button variant="outline" className="w-full">Get Started</Button>
                </div>

                {/* Pro Plan */}
                <div className="bg-slate-800 border border-blue-500 rounded-2xl p-8 relative shadow-2xl shadow-blue-900/20 transform scale-105">
                    <div className="absolute top-0 right-0 bg-blue-600 text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">POPULAR</div>
                    <h3 className="text-lg font-semibold text-white">Business</h3>
                    <p className="text-4xl font-bold mt-4 mb-2">$29<span className="text-lg text-slate-500 font-normal">/mo</span></p>
                    <p className="text-slate-400 text-sm mb-6">For growing companies.</p>
                    <ul className="space-y-3 text-sm text-slate-300 mb-8">
                        <li className="flex gap-2"><CheckIcon color="text-blue-400" /> Unlimited Employees</li>
                        <li className="flex gap-2"><CheckIcon color="text-blue-400" /> Payroll Automation</li>
                        <li className="flex gap-2"><CheckIcon color="text-blue-400" /> Real-time Chat</li>
                        <li className="flex gap-2"><CheckIcon color="text-blue-400" /> Advanced Reports (PDF/CSV)</li>
                    </ul>
                    <Button className="w-full py-3">Try for Free</Button>
                </div>

                {/* Enterprise Plan */}
                <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8">
                    <h3 className="text-lg font-semibold text-slate-300">Enterprise</h3>
                    <p className="text-4xl font-bold mt-4 mb-2">Custom</p>
                    <p className="text-slate-500 text-sm mb-6">For large organizations.</p>
                    <ul className="space-y-3 text-sm text-slate-300 mb-8">
                        <li className="flex gap-2"><CheckIcon /> Dedicated Support</li>
                        <li className="flex gap-2"><CheckIcon /> Custom Integrations</li>
                        <li className="flex gap-2"><CheckIcon /> SLA Guarantee</li>
                    </ul>
                    <Button variant="outline" className="w-full">Contact Sales</Button>
                </div>
            </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-10 border-t border-slate-800 text-center text-slate-500 text-sm">
        <p>&copy; 2025 EconomIT Inc. All rights reserved.</p>
      </footer>
    </div>
  );
};

// Helper Component for Check Icon
const CheckIcon = ({ color = "text-slate-500" }: { color?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-5 h-5 ${color}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
);

export default LandingPage;