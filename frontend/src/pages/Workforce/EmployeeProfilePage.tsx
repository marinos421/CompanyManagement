import { useEffect, useState } from "react";
import EmployeeService, { Employee } from "../../services/Workforce/employee.service";

const EmployeeProfilePage = () => {
  const [profile, setProfile] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Edit Mode State
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Notification State
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  // Auto-hide notification
  useEffect(() => {
    if (notification) {
        const timer = setTimeout(() => setNotification(null), 3000);
        return () => clearTimeout(timer);
    }
  }, [notification]);

  const loadProfile = async () => {
    try {
      const data = await EmployeeService.getMe();
      setProfile(data);
    } catch (error) {
      console.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    setFormData({
        phoneNumber: profile?.phoneNumber || "",
        personalTaxId: profile?.personalTaxId || "",
        idNumber: profile?.idNumber || "",
        address: profile?.address || "",
        newPassword: ""
    });
    setPreviewUrl(profile?.avatarBase64 ? `data:${profile.avatarContentType};base64,${profile.avatarBase64}` : null);
    setShowEditModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setAvatarFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = new FormData();
    submitData.append("phoneNumber", formData.phoneNumber);
    submitData.append("personalTaxId", formData.personalTaxId);
    submitData.append("idNumber", formData.idNumber);
    submitData.append("address", formData.address);
    if (formData.newPassword) {
        submitData.append("newPassword", formData.newPassword);
    }
    if (avatarFile) {
        submitData.append("avatar", avatarFile);
    }

    try {
        const updatedProfile = await EmployeeService.updateMe(submitData);
        setProfile(updatedProfile);
        setShowEditModal(false);
        setNotification({ message: "Profile updated successfully!", type: "success" });
    } catch (error) {
        setNotification({ message: "Failed to update profile.", type: "error" });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("el-GR", { style: "currency", currency: "EUR" }).format(amount);
  };

  if (loading) return <div className="text-white p-8">Loading profile...</div>;
  if (!profile) return <div className="text-white p-8">Profile not found.</div>;

  return (
    <div className="max-w-4xl mx-auto relative">
      
      {/* NOTIFICATION BANNER */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-xl text-white font-medium animate-bounce ${
            notification.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
        }`}>
            {notification.message}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
            <h2 className="text-3xl font-bold text-white mb-2">My Profile</h2>
            <p className="text-slate-400">Manage your personal information</p>
        </div>
        <button 
            onClick={handleEditClick}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium shadow-lg transition"
        >
            Edit Profile
        </button>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
        
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-blue-900 to-slate-900 relative">
            <div className="absolute -bottom-12 left-8">
                {/* Avatar Display */}
                <div className="w-24 h-24 rounded-full bg-slate-800 border-4 border-slate-800 flex items-center justify-center overflow-hidden shadow-lg">
                    {profile.avatarBase64 ? (
                        <img src={`data:${profile.avatarContentType};base64,${profile.avatarBase64}`} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <div className="text-3xl font-bold text-blue-500">
                            {profile.firstName[0]}{profile.lastName[0]}
                        </div>
                    )}
                </div>
            </div>
        </div>

        <div className="pt-16 pb-8 px-8">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white">{profile.firstName} {profile.lastName}</h1>
                    <p className="text-blue-400 font-medium">{profile.jobTitle}</p>
                </div>
                <div className="bg-slate-700/50 px-4 py-2 rounded-lg border border-slate-600">
                    <span className="text-slate-400 text-xs uppercase font-bold">Company</span>
                    <p className="text-white font-semibold">{profile.companyName}</p>
                </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Personal Info */}
                <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700">
                    <h3 className="text-slate-400 text-sm uppercase font-bold mb-4 border-b border-slate-700 pb-2">Personal Details</h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Mobile Phone</label>
                                <p className="text-white">{profile.phoneNumber || "-"}</p>
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">ID Number</label>
                                <p className="text-white">{profile.idNumber || "-"}</p>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs text-slate-500 mb-1">Tax ID (AFM)</label>
                            <p className="text-white">{profile.personalTaxId || "-"}</p>
                        </div>
                        <div>
                            <label className="block text-xs text-slate-500 mb-1">Address / Origin</label>
                            <p className="text-white">{profile.address || "-"}</p>
                        </div>
                    </div>
                </div>

                {/* Employment Info */}
                <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700">
                    <h3 className="text-slate-400 text-sm uppercase font-bold mb-4 border-b border-slate-700 pb-2">Employment & Account</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs text-slate-500 mb-1">Work Email</label>
                            <p className="text-white">{profile.email}</p>
                        </div>
                        <div>
                            <label className="block text-xs text-slate-500 mb-1">Monthly Salary</label>
                            <div className="inline-block bg-emerald-500/10 text-emerald-400 font-bold px-3 py-1 rounded border border-emerald-500/20">
                                {formatCurrency(profile.salary)}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4">
            <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
                <h3 className="text-xl font-bold text-white mb-6">Edit Profile</h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* Image Upload */}
                    <div className="flex flex-col items-center mb-6">
                        <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-600 flex items-center justify-center overflow-hidden bg-slate-900 relative group cursor-pointer">
                            {previewUrl ? (
                                <img src={previewUrl} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-slate-500 text-sm">No Photo</span>
                            )}
                            <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                        <span className="text-xs text-slate-400 mt-2">Click to change photo</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Mobile Phone</label>
                            <input name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500" placeholder="+30..." />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">ID Number</label>
                            <input name="idNumber" value={formData.idNumber} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500" placeholder="AK..." />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Tax ID (AFM)</label>
                        <input name="personalTaxId" value={formData.personalTaxId} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500" placeholder="123456789" />
                    </div>

                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Address / Origin</label>
                        <input name="address" value={formData.address} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500" placeholder="Street, City, Country" />
                    </div>

                    <hr className="border-slate-700 my-4" />

                    <div>
                        <label className="block text-xs text-blue-400 mb-1 font-bold">New Password (Optional)</label>
                        <input type="password" name="newPassword" value={formData.newPassword} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500" placeholder="Leave empty to keep current" />
                    </div>

                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-700">
                        <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 text-slate-400 hover:text-white transition">Cancel</button>
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition shadow-lg">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeProfilePage;