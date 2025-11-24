
import React from 'react';
import { PROJECT_MODULES } from '../constants';
import { CircleCheck, Package } from 'lucide-react';

export const ProjectScope: React.FC = () => {
  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">תכולת הפרויקט המאושרת</h2>
        <p className="text-slate-500 mt-2">פירוט המודולים והרכיבים הכלולים בפיתוח אתר מוזיאון העמק.</p>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {PROJECT_MODULES.map((module, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute top-0 start-0 w-1.5 h-full bg-blue-500"></div>
            <div className="flex gap-4">
              <div className="mt-1 text-blue-500">
                <Package size={24} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-xl text-slate-900">
                    {module.name}
                  </h3>
                  {module.selected && (
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full flex items-center gap-1 font-medium">
                      <CircleCheck size={12} />
                      כלול בפרויקט
                    </span>
                  )}
                </div>
                <p className="text-slate-600 text-lg leading-relaxed">
                  {module.description}
                </p>
                
                {/* Additional simulated details based on module type */}
                <div className="mt-6 flex flex-wrap gap-2">
                   <span className="bg-slate-50 text-slate-500 px-3 py-1 rounded border border-slate-100 text-sm">אפיון מלא</span>
                   <span className="bg-slate-50 text-slate-500 px-3 py-1 rounded border border-slate-100 text-sm">עיצוב UI/UX</span>
                   <span className="bg-slate-50 text-slate-500 px-3 py-1 rounded border border-slate-100 text-sm">פיתוח וורדפרס</span>
                   <span className="bg-slate-50 text-slate-500 px-3 py-1 rounded border border-slate-100 text-sm">התאמה למובייל</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-blue-50 rounded-xl p-8 border border-blue-100 text-center">
        <h3 className="text-xl font-bold text-blue-900 mb-2">רוצים להוסיף פיצ'רים נוספים?</h3>
        <p className="text-blue-700 max-w-2xl mx-auto">
          צוות הפיתוח שלנו זמין עבורכם לשינויים ותוספות. כל בקשה לשינוי מהותי באפיון תתומחר בנפרד בהתאם לשעות הפיתוח הנדרשות.
        </p>
      </div>
    </div>
  );
};
