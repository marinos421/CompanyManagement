import React, { useEffect, useState } from "react";
import CompanyService, { CompanyProfile } from "../../services/Company/company.service";

// Components
import Button from "../../components/Button";
import Input from "../../components/Input";

const CompanyProfilePage = () => {
  const [profile, setProfile] = useState<CompanyProfile>({
    name: "",
    email: "",
    taxId: "",
    phone: "",
    website: "",
    street: "",
    city: "",
    zipCode: "",
    country: "",
    logoBase64: null,
    logoContentType: null,
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
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
      const data = await CompanyService.getProfile();
      setProfile(data);
      if (data.logoBase64) {
        setPreviewUrl(`data:${data.logoContentType};base64,${data.logoBase64}`);
      }
    } catch (error) {
      console.error("Error loading profile", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append("name", profile.name);
    formData.append("taxId", profile.taxId || "");
    formData.append("phone", profile.phone || "");
    formData.append("website", profile.website || "");
    formData.append("street", profile.street || "");
    formData.append("city", profile.city || "");
    formData.append("zipCode", profile.zipCode || "");
    formData.append("country", profile.country || "");

    if (logoFile) {
      formData.append("logo", logoFile);
    }

    try {
      await CompanyService.updateProfile(formData);
      setNotification({ message: "Profile updated successfully!", type: "success" });
    } catch (error) {
      setNotification({ message: "Failed to update profile.", type: "error" });
    }
  };

  if (loading) return <div className="text-white p-8">Loading profile...</div>;

  return (
    <div className="max-w-4xl mx-auto relative">
      
      {/* NOTIFICATION BANNER */}
      {notification && (
        <div className={`fixed top-4 right-4 z-[60] px-6 py-3 rounded-lg shadow-xl text-white font-medium animate-bounce ${
            notification.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
        }`}>
            {notification.message}
        </div>
      )}

      <h2 className="text-2xl font-bold text-white mb-6">Company Settings</h2>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* SECTION 1: Branding & Basic Info */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-6 border-b border-slate-700 pb-2">Branding & Info</h3>
          
          <div className="flex flex-col md:flex-row gap-8">
            
            {/* Logo Upload Area (Custom UI kept for UX) */}
            <div className="flex flex-col items-center space-y-4">
              <div className="w-32 h-32 rounded-full border-2 border-dashed border-slate-600 flex items-center justify-center overflow-hidden bg-slate-900 relative group transition hover:border-blue-500">
                {previewUrl ? (
                  <img src={previewUrl} alt="Company Logo" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-slate-500 text-sm">No Logo</span>
                )}
                {/* Overlay on Hover */}
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer">
                  <span className="text-white text-xs font-bold">Change</span>
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  title="Upload Logo"
                />
              </div>
              <span className="text-xs text-slate-400">Click to upload logo</span>
            </div>

            {/* Basic Fields using <Input> */}
            <div className="flex-1 grid grid-cols-1 gap-4">
              <Input label="Company Name *" name="name" value={profile.name || ""} onChange={handleChange} required />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Tax ID (AFM)" name="taxId" value={profile.taxId || ""} onChange={handleChange} placeholder="e.g. 123456789" />
                <Input label="Phone" name="phone" value={profile.phone || ""} onChange={handleChange} placeholder="+30 210..." />
              </div>

              <Input label="Website" name="website" value={profile.website || ""} onChange={handleChange} placeholder="https://..." />
            </div>
          </div>
        </div>

        {/* SECTION 2: Address using <Input> */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-6 border-b border-slate-700 pb-2">Location Details</h3>
          
          <div className="grid grid-cols-1 gap-4">
            <Input label="Street Address" name="street" value={profile.street || ""} onChange={handleChange} placeholder="Leoforos Kifisias 10" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="City" name="city" value={profile.city || ""} onChange={handleChange} placeholder="Athens" />
              <Input label="Zip Code" name="zipCode" value={profile.zipCode || ""} onChange={handleChange} placeholder="11526" />
              <Input label="Country" name="country" value={profile.country || ""} onChange={handleChange} placeholder="Greece" />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
            <Button type="submit" size="md">
                Save Changes
            </Button>
        </div>

      </form>
    </div>
  );
};

export default CompanyProfilePage;