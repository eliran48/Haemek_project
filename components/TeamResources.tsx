
import React from 'react';
import { TEAM_MEMBERS } from '../constants';
import { Mail, Phone, ExternalLink, HardDrive, Figma, Layout } from 'lucide-react';

export const TeamResources: React.FC = () => {
  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      
      {/* Resources Section */}
      <section>
        <h2 className="text-2xl font-bold text-slate-800 mb-6">משאבי פרויקט וקישורים</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <a href="#" className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <HardDrive size={24} />
                </div>
                <h3 className="font-bold text-slate-800 mb-2">Google Drive</h3>
                <p className="text-sm text-slate-500 mb-4">מאגר חומרים, תמונות וטקסטים של המוזיאון</p>
                <span className="text-blue-600 text-sm font-medium flex items-center gap-1">
                    פתח תיקייה <ExternalLink size={14} />
                </span>
            </a>

            <a href="#" className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Figma size={24} />
                </div>
                <h3 className="font-bold text-slate-800 mb-2">Figma Design</h3>
                <p className="text-sm text-slate-500 mb-4">סקיצות עיצוב, UI/UX ומערכת העיצוב</p>
                <span className="text-purple-600 text-sm font-medium flex items-center gap-1">
                    צפה בעיצוב <ExternalLink size={14} />
                </span>
            </a>

            <a href="#" className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Layout size={24} />
                </div>
                <h3 className="font-bold text-slate-800 mb-2">סביבת פיתוח (Staging)</h3>
                <p className="text-sm text-slate-500 mb-4">אתר בפיתוח - pioneers.co.il/dev</p>
                <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                    לאתר הפיתוח <ExternalLink size={14} />
                </span>
            </a>
        </div>
      </section>

      {/* Team Section */}
      <section>
        <h2 className="text-2xl font-bold text-slate-800 mb-6">אנשי קשר</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TEAM_MEMBERS.map(member => (
            <div key={member.id} className="bg-white rounded-xl border border-slate-200 p-6 flex items-start gap-4">
               <img src={member.avatar} alt={member.name} className="w-16 h-16 rounded-full bg-slate-100 object-cover" />
               <div className="flex-1">
                  <h3 className="font-bold text-slate-800 text-lg">{member.name}</h3>
                  <span className="inline-block bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded mb-3">{member.role}</span>
                  
                  <div className="space-y-2">
                    {member.email && (
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Mail size={14} />
                            <a href={`mailto:${member.email}`} className="hover:text-blue-600 transition-colors">{member.email}</a>
                        </div>
                    )}
                    {member.phone && (
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Phone size={14} />
                            <a href={`tel:${member.phone}`} className="hover:text-blue-600 transition-colors">{member.phone}</a>
                        </div>
                    )}
                  </div>
               </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
