import React, { useState, useEffect } from 'react';
import { ExternalLink, Layers, Sparkles, Filter } from 'lucide-react';
import type { Project } from '../types';
import { siteStore } from '../services/store';

export const Portfolio: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const loadProjects = async () => {
    try {
      const data = await siteStore.getProjects();
      setProjects(data);
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
  };

  useEffect(() => {
    loadProjects();
    const unsubscribe = siteStore.subscribe(loadProjects);
    return unsubscribe;
  }, []);

  const categories = ['All', ...Array.from(new Set(projects.map(p => p.category)))];

  const filteredProjects = activeCategory === 'All'
    ? projects
    : projects.filter(p => p.category === activeCategory);

  return (
    <section id="our-work" className="py-24 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 mb-3">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider">
              Recent Builds & Case Studies
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Forged By SiteForge
          </h2>
          <p className="mt-4 text-slate-300 text-lg">
            Explore sample projects crafted with high aesthetic standards, responsive layouts, and production code.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeCategory === cat
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20'
                  : 'glass-panel text-slate-400 hover:text-slate-200 border-white/10 hover:border-white/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="glass-card rounded-3xl overflow-hidden flex flex-col justify-between group border-white/10 hover:border-orange-500/30 transition-all duration-300"
            >
              {/* Image Preview Container */}
              <div className="relative h-56 overflow-hidden bg-slate-950">
                <img
                  src={project.imageUrl}
                  alt={project.title}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f18] via-transparent to-transparent opacity-80" />

                <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-900/80 text-orange-300 border border-white/10 backdrop-blur-md">
                  {project.category}
                </span>

                {project.isFeatured && (
                  <span className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-slate-950">
                    Featured
                  </span>
                )}
              </div>

              {/* Card Details */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed mb-4 line-clamp-3">
                    {project.description}
                  </p>

                  {/* Feature Pills */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {project.features.map((feat, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] font-medium text-slate-300"
                      >
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedProject(project)}
                  className="w-full py-3 px-4 rounded-xl text-xs font-semibold text-slate-200 glass-panel hover:bg-orange-500 hover:text-white border border-white/10 transition-all flex items-center justify-center gap-2 group/btn"
                >
                  <span>View Project Details</span>
                  <ExternalLink className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                </button>
              </div>

            </div>
          ))}
        </div>

        {/* Project Modal Preview */}
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-2xl glass-panel border border-white/15 rounded-3xl p-6 sm:p-8 overflow-hidden shadow-2xl">
              <div className="relative h-64 rounded-2xl overflow-hidden mb-6">
                <img
                  src={selectedProject.imageUrl}
                  alt={selectedProject.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-orange-400 uppercase tracking-widest">
                  {selectedProject.category}
                </span>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="text-slate-400 hover:text-white text-xl font-bold"
                >
                  ✕
                </button>
              </div>

              <h3 className="text-2xl font-bold text-white mb-3">
                {selectedProject.title}
              </h3>
              <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                {selectedProject.description}
              </p>

              <div className="space-y-2 mb-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase">Key Deliverables Built:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.features.map((f, i) => (
                    <span key={i} className="px-3 py-1 rounded-lg bg-white/10 text-xs text-amber-300 font-medium">
                      ✓ {f}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedProject(null)}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-orange-500 hover:bg-orange-600"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
