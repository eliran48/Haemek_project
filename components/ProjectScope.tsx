
import React from 'react';
import { PROJECT_MODULES, PROPOSAL_STEPS } from '../constants';
import { CircleCheck, Package, Flag } from 'lucide-react';

export const ProjectScope: React.FC = () => {
  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      
      {/* Intro */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">תכולת פרויקט והצעת מחיר</h2>
        <p className="text-slate-500 mt-2">פירוט המודולים המאושרים ותהליך העבודה (ללא מחירים)</p>
      </div>
      
      {/* Modules */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-slate-700">מודולים נבחרים</h3>
        <div className="grid grid-cols-1 gap-6">
            {PROJECT_MODULES.map((module, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="absolute top-0 start-0 w-1.5 h-full bg-blue-500"></div>
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="mt-1 text-blue-500 hidden md:block">
                        <Package size={28} />
                    </div>
                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
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
                        <p className="text-slate-600 text-lg mb-4">
                            {module.description}
                        </p>
                        
                        {/* Features List */}
                        {module.features && module.features.length > 0 && (
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mt-4">
                                {module.features.map((feature, fIdx) => (
                                    <li key={fIdx} className="flex items-start gap-2 text-slate-600 text-sm">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-300 shrink-0"></div>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
            ))}
        </div>
      </div>

      {/* Process Timeline (Proposal Steps) */}
      <div className="mt-12 space-y-6">
        <h3 className="text-xl font-bold text-slate-700">תהליך העבודה שלנו</h3>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <div className="relative border-r-2 border-slate-100 space-y-10 pr-4">
                {PROPOSAL_STEPS.map((step, idx) => (
                    <div key={idx} className="relative flex gap-6">
                        <div className="absolute -right-[23px] top-0 w-4 h-4 rounded-full bg-blue-100 border-2 border-blue-500 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                    {step.step}
                                </span>
                                <h4 className="font-bold text-slate-800">{step.title}</h4>
                            </div>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                {step.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
      
    </div>
  );
};
