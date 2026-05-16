import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { providers, ProviderConfig, ProviderField } from './providers';
import { ShieldCheck, Copy, CheckCircle2, AlertTriangle, Terminal, FileCode2, ChevronRight, HelpCircle, Settings2, Info, Cloud, HardDrive, Smartphone, Server, Globe } from 'lucide-react';
import { translations, Language } from './i18n';

const Tooltip = ({ text }: { text: string }) => (
  <div className="group relative flex items-center">
    <HelpCircle className="w-4 h-4 text-zinc-500 cursor-help" />
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden w-max max-w-[250px] group-hover:block z-10">
      <div className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs rounded py-2 px-3 shadow-xl leading-relaxed text-center">
        {text}
      </div>
      <div className="w-2 h-2 bg-zinc-800 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2 border-r border-b border-zinc-700"></div>
    </div>
  </div>
);

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const t = translations[lang];
  const [selectedProviderId, setSelectedProviderId] = useState<string>('drive');
  const [remoteName, setRemoteName] = useState<string>('my-cloud');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [copiedTab, setCopiedTab] = useState<'conf' | 'cli' | 'mount' | null>(null);
  const [activeTab, setActiveTab] = useState<'cli' | 'conf' | 'mount'>('cli');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // VFS / Mount State
  const [mountDevice, setMountDevice] = useState<'desktop' | 'android' | 'server'>('desktop');
  const [mountAccess, setMountAccess] = useState<'read' | 'write'>('write');
  const [mountCache, setMountCache] = useState<'minimal' | 'full'>('full');

  const activeProvider = providers.find(p => p.id === selectedProviderId) as ProviderConfig;

  // Initialize form data when provider changes
  useEffect(() => {
    const initialData: Record<string, string> = {};
    activeProvider.fields.forEach(field => {
      if (field.defaultValue) {
        initialData[field.name] = field.defaultValue;
      }
    });
    setFormData(initialData);
    setShowAdvanced(false); // Reset advanced view on switch
  }, [selectedProviderId]);

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const copyToClipboard = (text: string, tab: 'conf' | 'cli' | 'mount') => {
    navigator.clipboard.writeText(text);
    setCopiedTab(tab);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const generateConfSnippet = (): string => {
    let snippet = `[${remoteName}]\n`;
    
    if (activeProvider.extraConfig) {
      Object.entries(activeProvider.extraConfig).forEach(([key, val]) => {
        snippet += `${key} = ${val}\n`;
      });
    }

    activeProvider.fields.forEach(field => {
      const val = formData[field.name];
      if (val && val.trim() !== '') {
        snippet += `${field.name} = ${val}\n`;
      }
    });

    if (activeProvider.hasOAuth) {
      snippet += `\n# --- OAUTH CONNECTION ---\n`;
      snippet += `# Rclone needs a security token. Don't worry, it's easy!\n`;
      snippet += `# Open your terminal and run this exact command to link your account:\n`;
      snippet += `# rclone config reconnect ${remoteName}:\n`;
    }

    return snippet.trim();
  };

  const generateCliCommand = (): string => {
    let cmd = `rclone config create ${remoteName} ${activeProvider.id}`;
    
    activeProvider.fields.forEach(field => {
      const val = formData[field.name];
      if (val && val.trim() !== '') {
        const safeVal = val.includes(' ') || val.includes('&') ? `"${val}"` : val;
        cmd += ` ${field.name} ${safeVal}`;
      }
    });

    return cmd;
  };

  const generateMountCommand = (): string => {
    if (mountDevice === 'android') {
      let lines = [];
      if (mountAccess === 'read') lines.push('read_only=true');
      lines.push(`vfs_cache_mode=${mountCache === 'full' ? 'full' : 'minimal'}`);
      lines.push('buffer_size=16M');
      lines.push('vfs_read_chunk_size=16M');
      lines.push('vfs_read_chunk_size_limit=256M');
      lines.push('dir_cache_time=12h');
      
      return `# For Android apps like RCX, Round Sync, or RSAF:
# 1. Tap on your remote to configure it
# 2. Look for "VFS Options" or "Mount Settings"
# 3. Paste the following lines EXACTLY as they are:

${lines.join('\n')}`;
    }

    let cmd = `rclone mount ${remoteName}: ~/mnt/${remoteName} --daemon`;

    if (mountAccess === 'read') {
      cmd += ' --read-only';
    }

    if (mountDevice === 'desktop') {
      // Desktop (standard memory usage)
      cmd += ' --vfs-cache-mode ' + (mountCache === 'full' ? 'full' : 'writes');
      cmd += ' --buffer-size 64M --vfs-read-chunk-size 32M --vfs-read-chunk-size-limit 2G';
      cmd += ' --vfs-cache-max-age 24h';
      if (mountAccess === 'write') cmd += ' --vfs-cache-max-size 10G';
    } else if (mountDevice === 'server') {
      // Server / Media streaming (high memory, pre-reading)
      cmd += ' --vfs-cache-mode full'; // Usually want full cache for media streaming (Plex, Jellyfin)
      cmd += ' --buffer-size 128M --vfs-read-chunk-size 64M --vfs-read-chunk-size-limit off';
      cmd += ' --dir-cache-time 72h --vfs-cache-max-age 48h';
      cmd += ' --vfs-read-ahead 1G';
      if (mountAccess === 'read') cmd += ' --no-modtime'; // Avoids scanning modtimes
    }

    // Explanations appended as comments
    cmd += `\n\n# NOTE: Create the mount folder first with: mkdir -p ~/mnt/${remoteName}`;
    cmd += `\n# NOTE: Use 'fusermount -u ~/mnt/${remoteName}' to safely unmount when done.`;

    return cmd;
  };

  const hasPasswordBlock = activeProvider.fields.some(f => f.type === 'password' && formData[f.name]);
  const hasAdvancedFields = activeProvider.fields.some(f => f.advanced);

  // Filter fields based on the advanced toggle
  const visibleFields = activeProvider.fields.filter(f => showAdvanced || !f.advanced);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.4)]">
              <Cloud className="w-4 h-4 text-white" />
            </div>
            <h1 className="font-bold text-lg tracking-tight text-zinc-100">{t.header.title}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-1">
              <Globe className="w-4 h-4 text-zinc-400 ml-2" />
              <select
                aria-label="Select Language"
                value={lang}
                onChange={(e) => setLang(e.target.value as Language)}
                className="appearance-none bg-transparent text-sm text-zinc-300 font-medium pl-2 pr-6 py-1 outline-none cursor-pointer hover:text-white transition-colors"
              >
                <option value="en">English</option>
                <option value="pt">Português</option>
                <option value="zh">中文</option>
              </select>
              <ChevronDown className="w-3 h-3 text-zinc-500 absolute right-2 pointer-events-none" />
            </div>
            
            <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-full text-xs font-medium ring-1 ring-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.header.badge}</span>
              <span className="sm:hidden">Local</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4 text-white">{t.hero.title}</h2>
          <p className="text-zinc-400 text-base leading-relaxed">
            {t.hero.description} <strong className="text-zinc-300">{t.hero.secure}</strong>
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Form Builder */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Step 1: Choose Provider */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-xs ring-1 ring-indigo-500/50">1</div>
                <h3 className="text-lg font-semibold text-zinc-100">{t.step1.title}</h3>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {providers.map((p) => {
                  const Icon = p.icon;
                  const isActive = selectedProviderId === p.id;
                  // @ts-ignore
                  const pName = t.providers[p.id]?.name || p.name;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedProviderId(p.id)}
                      className={`relative flex flex-col items-center p-4 rounded-xl border transition-all duration-200 text-center gap-3
                        ${isActive 
                          ? 'bg-indigo-500/10 border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.15)]' 
                          : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/80 hover:shadow-md'
                        }`}
                    >
                      <Icon className={`w-7 h-7 ${isActive ? 'text-indigo-400' : 'text-zinc-500'}`} strokeWidth={isActive ? 2 : 1.5} />
                      <span className={`text-sm font-medium ${isActive ? 'text-indigo-200' : 'text-zinc-400'}`}>
                        {pName}
                      </span>
                      {isActive && (
                        <motion.div 
                          layoutId="active-indicator"
                          className="absolute inset-0 border-2 border-indigo-500 rounded-xl pointer-events-none"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Step 2: Configure */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-xs ring-1 ring-indigo-500/50">2</div>
                <h3 className="text-lg font-semibold text-zinc-100">{t.step2.title}</h3>
              </div>
              
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-7 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-6 pb-6 border-b border-zinc-800/80">
                  <div className="w-12 h-12 rounded-xl bg-zinc-800/80 flex items-center justify-center shrink-0 border border-zinc-700/50 shadow-inner">
                    <activeProvider.icon className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    {/* @ts-ignore */}
                    <h4 className="text-xl font-semibold text-zinc-100">{t.providers[activeProvider.id]?.name || activeProvider.name}</h4>
                    {/* @ts-ignore */}
                    <p className="text-sm text-zinc-400 mt-1.5 leading-relaxed">{t.providers[activeProvider.id]?.desc || activeProvider.description}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Global Remote Name */}
                  <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50">
                    <label className="flex items-center gap-2 text-sm font-semibold text-zinc-200 mb-1">
                      {t.step2.remoteName}
                      <Tooltip text={t.step2.remoteNameTooltip} />
                    </label>
                    <p className="text-xs text-zinc-500 mb-3">{t.step2.remoteNameDesc} <code className="text-zinc-400 font-mono bg-zinc-800 px-1 rounded">rclone sync folder/ {remoteName}:</code>)</p>
                    <input
                      type="text"
                      value={remoteName}
                      onChange={(e) => setRemoteName(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                      className="w-full bg-zinc-950 border border-zinc-700/80 rounded-lg px-4 py-3 text-zinc-100 font-mono text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-shadow"
                      placeholder={t.step2.remoteNamePlaceholder}
                    />
                  </div>

                  {visibleFields.map((field) => {
                    // @ts-ignore
                    const fieldT = t.fields[field.name];
                    return (
                    <div key={field.name}>
                      <label className="flex items-center gap-2 text-sm font-medium text-zinc-300 mb-1">
                        {fieldT?.label || field.label}
                        {field.required && <span className="text-red-400 font-bold">*</span>}
                        {field.advanced && <span className="text-[10px] uppercase tracking-wider bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-bold">{t.step2.proBadge}</span>}
                      </label>
                      {(fieldT?.helper || field.helperText) && <p className="text-xs text-zinc-500 mb-2">{fieldT?.helper || field.helperText}</p>}
                      
                      {field.type === 'select' ? (
                        <div className="relative">
                          <select
                            value={formData[field.name] || ''}
                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-shadow"
                          >
                            <option value="" disabled>{t.step2.selectOption}</option>
                            {field.options?.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                          <ChevronRight className="w-4 h-4 text-zinc-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none rotate-90" />
                        </div>
                      ) : (
                        <input
                          type={field.type === 'password' ? 'text' : field.type} // Keeping passwords visible in our local UI so users see what they type.
                          value={formData[field.name] || ''}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                          placeholder={field.placeholder}
                          className={`w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-shadow ${field.type === 'password' ? 'font-mono text-sm' : ''}`}
                        />
                      )}
                    </div>
                  )})}

                  {/* Advanced Toggle */}
                  {hasAdvancedFields && (
                    <div className="pt-4 border-t border-zinc-800/50 flex justify-center">
                      <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors bg-zinc-800/50 hover:bg-zinc-800 px-4 py-2 rounded-full ring-1 ring-zinc-700/50"
                      >
                        <Settings2 className="w-4 h-4" />
                        {showAdvanced ? t.step2.hideAdvanced : t.step2.showAdvanced}
                      </button>
                    </div>
                  )}

                </div>
              </div>
            </section>

             {/* Step 3: Mount / VFS configuration */}
             <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-xs ring-1 ring-indigo-500/50">3</div>
                <h3 className="text-lg font-semibold text-zinc-100">{t.step3.title}</h3>
              </div>

               <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-7 shadow-xl">
                 <p className="text-zinc-400 text-sm mb-6">
                   {t.step3.desc}
                 </p>

                 <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-3">{t.step3.deviceLabel}</label>
                      <div className="grid grid-cols-3 gap-3">
                         <button
                           onClick={() => setMountDevice('desktop')}
                           className={`p-3 rounded-lg border text-sm font-medium flex flex-col items-center gap-2 transition-colors
                            ${mountDevice === 'desktop' ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-300' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300'}`}
                         >
                           <HardDrive className="w-5 h-5" />
                           {t.step3.deviceDesktop}
                         </button>
                         <button
                           onClick={() => setMountDevice('android')}
                           className={`p-3 rounded-lg border text-sm font-medium flex flex-col items-center gap-2 transition-colors
                            ${mountDevice === 'android' ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-300' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300'}`}
                         >
                           <Smartphone className="w-5 h-5" />
                           {t.step3.deviceAndroid}
                         </button>
                         <button
                           onClick={() => setMountDevice('server')}
                           className={`p-3 rounded-lg border text-sm flex flex-col items-center gap-2 font-medium transition-colors
                            ${mountDevice === 'server' ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-300' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300'}`}
                         >
                           <Server className="w-5 h-5" />
                           {t.step3.deviceServer}
                         </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-3">{t.step3.accessLabel}</label>
                      <div className="grid grid-cols-2 gap-3">
                         <button
                           onClick={() => setMountAccess('read')}
                           className={`p-3 rounded-lg border text-sm font-medium transition-colors
                            ${mountAccess === 'read' ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-300' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300'}`}
                         >
                           {t.step3.accessRead}
                         </button>
                         <button
                           onClick={() => setMountAccess('write')}
                           className={`p-3 rounded-lg border text-sm font-medium transition-colors
                            ${mountAccess === 'write' ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-300' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300'}`}
                         >
                           {t.step3.accessWrite}
                         </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-3">{t.step3.cacheLabel}</label>
                      <div className="grid grid-cols-2 gap-3">
                         <button
                           onClick={() => setMountCache('full')}
                           className={`p-3 rounded-lg border text-sm font-medium transition-colors text-left
                            ${mountCache === 'full' ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-300' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300'}`}
                         >
                           <div className="font-bold mb-1">{t.step3.cacheFullTitle}</div>
                           <div className="text-xs opacity-70 font-normal">{t.step3.cacheFullDesc}</div>
                         </button>
                         <button
                           onClick={() => setMountCache('minimal')}
                           className={`p-3 rounded-lg border text-sm font-medium transition-colors text-left
                            ${mountCache === 'minimal' ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-300' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300'}`}
                         >
                           <div className="font-bold mb-1">{t.step3.cacheMinimalTitle}</div>
                           <div className="text-xs opacity-70 font-normal">{t.step3.cacheMinimalDesc}</div>
                         </button>
                      </div>
                    </div>

                 </div>
               </div>
             </section>

          </div>

          {/* Right Column: Output Viewer */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
             <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs ring-1 ring-emerald-500/50">4</div>
                <h3 className="text-lg font-semibold text-zinc-100">{t.step4.title}</h3>
              </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
              
              {/* How-to helper */}
              <div className="bg-indigo-500/10 p-4 border-b border-indigo-500/20">
                <h4 className="flex items-center gap-2 text-indigo-300 font-semibold mb-2 text-sm">
                   <Info className="w-4 h-4" /> {t.step4.howTo}
                </h4>
                {activeTab === 'cli' && (
                  <ol className="text-sm text-indigo-200/80 space-y-1.5 list-decimal list-inside marker:text-indigo-400 font-medium">
                    {t.step4.cliSteps.map((step, idx) => (
                      <li key={idx}>
                        {idx === 0 ? <>{step.split('CLI Command')[0]}<strong>CLI Command</strong>{step.split('CLI Command')[1] || ''}</> : step}
                      </li>
                    ))}
                  </ol>
                )}
                {activeTab === 'mount' && mountDevice === 'android' && (
                   <ol className="text-sm text-indigo-200/80 space-y-1.5 list-decimal list-inside marker:text-indigo-400 font-medium">
                    {t.step4.mountAndroidSteps.map((step, idx) => (
                      <li key={idx}>
                        {idx === 0 ? <>{step.split('Config lines')[0]}<strong>Config lines</strong>{step.split('Config lines')[1] || ''}</> : step}
                      </li>
                    ))}
                  </ol>
                )}
                {activeTab === 'mount' && mountDevice !== 'android' && (
                   <ol className="text-sm text-indigo-200/80 space-y-1.5 list-decimal list-inside marker:text-indigo-400 font-medium">
                    {t.step4.mountDesktopSteps.map((step, idx) => (
                      <li key={idx}>
                        {idx === 0 ? <>{step.split('Mount Command')[0]}<strong>Mount Command</strong>{step.split('Mount Command')[1] || ''}</> : step}
                      </li>
                    ))}
                  </ol>
                )}
                {activeTab === 'conf' && (
                   <ol className="text-sm text-indigo-200/80 space-y-1.5 list-decimal list-inside marker:text-indigo-400 font-medium">
                    {t.step4.confSteps.map((step, idx) => (
                      <li key={idx}>
                        {idx === 0 ? <>{step.split('rclone.conf')[0]}<code>rclone.conf</code>{step.split('rclone.conf')[1] || ''}</> : step}
                      </li>
                    ))}
                  </ol>
                )}
              </div>

              {/* Tabs */}
              <div className="flex px-3 pt-3 bg-zinc-900/80 border-b border-zinc-800 gap-1 overflow-x-auto custom-scrollbar">
                <button
                  onClick={() => setActiveTab('cli')}
                  className={`flex items-center whitespace-nowrap gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors
                    ${activeTab === 'cli' ? 'bg-zinc-950 text-indigo-300 border-x border-t border-zinc-800 relative bottom-[-1px]' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 border-transparent'}
                  `}
                >
                  <Terminal className="w-4 h-4" />
                  {t.step4.tabCli}
                </button>
                <button
                  onClick={() => setActiveTab('mount')}
                  className={`flex items-center whitespace-nowrap gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors
                    ${activeTab === 'mount' ? 'bg-zinc-950 text-indigo-300 border-x border-t border-zinc-800 relative bottom-[-1px]' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 border-transparent'}
                  `}
                >
                  <HardDrive className="w-4 h-4" />
                  {t.step4.tabMount}
                </button>
                <button
                  onClick={() => setActiveTab('conf')}
                  className={`flex items-center whitespace-nowrap gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors
                    ${activeTab === 'conf' ? 'bg-zinc-950 text-indigo-300 border-x border-t border-zinc-800 relative bottom-[-1px]' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 border-transparent'}
                  `}
                >
                  <FileCode2 className="w-4 h-4" />
                  {t.step4.tabConf}
                </button>
              </div>

              {/* Content Area */}
              <div className="p-0 bg-zinc-950 relative grow flex flex-col group min-h-[160px]">
                <AnimatePresence mode="wait">
                  {activeTab === 'cli' && (
                    <motion.div
                      key="cli"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, position: 'absolute' }}
                      className="p-5"
                    >
                      <pre className="font-mono text-[13px] text-zinc-300 whitespace-pre-wrap leading-relaxed break-all selection:bg-indigo-500/40">
                        {generateCliCommand()}
                      </pre>
                    </motion.div>
                  )}

                  {activeTab === 'mount' && (
                    <motion.div
                      key="mount"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, position: 'absolute' }}
                      className="p-5"
                    >
                      <p className="text-zinc-500 text-xs mb-3 font-medium uppercase tracking-wider">
                        {mountDevice === 'android' ? t.step4.applyVfs : t.step4.runAfterConfig}
                      </p>
                      <pre className="font-mono text-[13px] text-cyan-400 whitespace-pre-wrap leading-relaxed break-all selection:bg-cyan-500/40">
                        {generateMountCommand()}
                      </pre>
                    </motion.div>
                  )}

                  {activeTab === 'conf' && (
                    <motion.div
                      key="conf"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, position: 'absolute' }}
                      className="p-5"
                    >
                      {hasPasswordBlock && (
                        <div className="mb-4 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex gap-3 text-sm text-amber-200">
                          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                          <div>
                            {t.step4.warningRcloneConf}
                          </div>
                        </div>
                      )}
                      <pre className="font-mono text-[13px] text-emerald-400 whitespace-pre-wrap leading-relaxed break-all selection:bg-emerald-500/40">
                        {generateConfSnippet()}
                      </pre>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Copy Button */}
                <div className="absolute top-4 right-4">
                  <button
                    onClick={() => {
                        let txt = '';
                        if (activeTab === 'cli') txt = generateCliCommand();
                        if (activeTab === 'conf') txt = generateConfSnippet();
                        if (activeTab === 'mount') txt = generateMountCommand();
                        copyToClipboard(txt, activeTab);
                    }}
                    className="flex flex-col items-center justify-center gap-1.5 px-4 py-2 border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 hover:border-zinc-500 text-zinc-200 text-xs font-semibold rounded-lg shadow-xl outline-none focus:ring-2 ring-indigo-500/50 transition-all transform active:scale-95"
                  >
                    {copiedTab === activeTab ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400">{t.step4.copied}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-zinc-400" />
                        {t.step4.copyText}
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

