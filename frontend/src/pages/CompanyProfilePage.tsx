import { useEffect, useState } from "react";
import CompanyService, { CompanyProfile } from "../services/company.service";

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
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    loadProfile();
  }, []);

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
    setMessage({ type: "", text: "" });

    const formData = new FormData();
    formData.append("name", profile.name);
    // Χρησιμοποιούμε || "" για να μην στείλουμε ποτέ 'undefined' ή 'null'
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
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (error) {
      console.error(error); // Για να δούμε το error στην κονσόλα αν ξανασυμβεί
      setMessage({ type: "error", text: "Failed to update profile." });
    }
  };

  if (loading) return <div className="text-white p-8">Loading profile...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6">Company Settings</h2>

      {message.text && (
        <div className={`p-4 mb-6 rounded-lg ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Branding & Info */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 border-b border-slate-700 pb-2">Branding & Info</h3>
          
          <div className="flex flex-col md:flex-row gap-8">
            
            {/* Logo Upload */}
            <div className="flex flex-col items-center space-y-4">
              <div className="w-32 h-32 rounded-full border-2 border-dashed border-slate-600 flex items-center justify-center overflow-hidden bg-slate-900 relative group">
                {previewUrl ? (
                  <img src={previewUrl} alt="Company Logo" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-slate-500 text-sm">No Logo</span>
                )}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer">
                  <span className="text-white text-xs">Change</span>
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  title="Upload Logo" // Προσθήκη για να φύγει το Accessibility Error
                  aria-label="Upload Company Logo" // Προσθήκη για Accessibility
                />
              </div>
              <span className="text-xs text-slate-400">Click to upload logo</span>
            </div>

            {/* Basic Fields - Προσθήκη || "" στα values */}
            <div className="flex-1 grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Company Name *</label>
                <input name="name" value={profile.name || ""} onChange={handleChange} required className="w-full bg-slate-700 border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-blue-500 focus:border-blue-500 outline-none" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Tax ID (AFM)</label>
                  <input name="taxId" value={profile.taxId || ""} onChange={handleChange} className="w-full bg-slate-700 border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="e.g. 123456789" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Phone</label>
                  <input name="phone" value={profile.phone || ""} onChange={handleChange} className="w-full bg-slate-700 border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="+30 210..." />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Website</label>
                <input name="website" value={profile.website || ""} onChange={handleChange} className="w-full bg-slate-700 border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="https://..." />
              </div>
            </div>
          </div>
        </div>

        {/* Address - Προσθήκη || "" στα values */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 border-b border-slate-700 pb-2">Location Details</h3>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Street Address</label>
              <input name="street" value={profile.street || ""} onChange={handleChange} className="w-full bg-slate-700 border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Leoforos Kifisias 10" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">City</label>
                <input name="city" value={profile.city || ""} onChange={handleChange} className="w-full bg-slate-700 border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Athens" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Zip Code</label>
                <input name="zipCode" value={profile.zipCode || ""} onChange={handleChange} className="w-full bg-slate-700 border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="11526" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Country</label>
                <input name="country" value={profile.country || ""} onChange={handleChange} className="w-full bg-slate-700 border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Greece" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
            <button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition"
            >
                Save Changes
            </button>
        </div>

      </form>
    </div>
  );
};

export default CompanyProfilePage;