import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { providers, ProviderConfig, ProviderField } from './providers';
import { ShieldCheck, Copy, CheckCircle2, AlertTriangle, Terminal, FileCode2, ChevronRight, HelpCircle, Settings2, Info, Cloud, HardDrive, Smartphone, Server } from 'lucide-react';

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
            <h1 className="font-bold text-lg tracking-tight text-zinc-100">Easy Rclone Setup</h1>
          </div>
          <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-full text-xs font-medium ring-1 ring-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">100% Private & Local</span>
            <span className="sm:hidden">Local</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4 text-white">Let's connect your storage.</h2>
          <p className="text-zinc-400 text-base leading-relaxed">
            Rclone can be complicated. We made it simple. Select your cloud provider below, fill out the basic info, and we'll generate a safe command for you to run. <strong className="text-zinc-300">Your passwords never leave this screen.</strong>
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Form Builder */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Step 1: Choose Provider */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-xs ring-1 ring-indigo-500/50">1</div>
                <h3 className="text-lg font-semibold text-zinc-100">Where are your files?</h3>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {providers.map((p) => {
                  const Icon = p.icon;
                  const isActive = selectedProviderId === p.id;
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
                        {p.name}
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
                <h3 className="text-lg font-semibold text-zinc-100">Fill in the details</h3>
              </div>
              
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-7 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-6 pb-6 border-b border-zinc-800/80">
                  <div className="w-12 h-12 rounded-xl bg-zinc-800/80 flex items-center justify-center shrink-0 border border-zinc-700/50 shadow-inner">
                    <activeProvider.icon className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-zinc-100">{activeProvider.name}</h4>
                    <p className="text-sm text-zinc-400 mt-1.5 leading-relaxed">{activeProvider.description}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Global Remote Name */}
                  <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50">
                    <label className="flex items-center gap-2 text-sm font-semibold text-zinc-200 mb-1">
                      Give this connection a simple nickname
                      <Tooltip text="Examples: 'movies', 'backup', 'work-drive'. Avoid spaces." />
                    </label>
                    <p className="text-xs text-zinc-500 mb-3">You will use this name in your terminal commands (like <code className="text-zinc-400 font-mono bg-zinc-800 px-1 rounded">rclone sync folder/ {remoteName}:</code>)</p>
                    <input
                      type="text"
                      value={remoteName}
                      onChange={(e) => setRemoteName(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                      className="w-full bg-zinc-950 border border-zinc-700/80 rounded-lg px-4 py-3 text-zinc-100 font-mono text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-shadow"
                      placeholder="e.g., google-drive"
                    />
                  </div>

                  {visibleFields.map((field) => (
                    <div key={field.name}>
                      <label className="flex items-center gap-2 text-sm font-medium text-zinc-300 mb-1">
                        {field.label}
                        {field.required && <span className="text-red-400 font-bold">*</span>}
                        {field.advanced && <span className="text-[10px] uppercase tracking-wider bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-bold">Pro</span>}
                      </label>
                      {field.helperText && <p className="text-xs text-zinc-500 mb-2">{field.helperText}</p>}
                      
                      {field.type === 'select' ? (
                        <div className="relative">
                          <select
                            value={formData[field.name] || ''}
                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-shadow"
                          >
                            <option value="" disabled>Select an option</option>
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
                  ))}

                  {/* Advanced Toggle */}
                  {hasAdvancedFields && (
                    <div className="pt-4 border-t border-zinc-800/50 flex justify-center">
                      <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors bg-zinc-800/50 hover:bg-zinc-800 px-4 py-2 rounded-full ring-1 ring-zinc-700/50"
                      >
                        <Settings2 className="w-4 h-4" />
                        {showAdvanced ? "Hide nerd settings" : "Show geeky advanced options"}
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
                <h3 className="text-lg font-semibold text-zinc-100">How will you access the files? (Virtual Drive)</h3>
              </div>

               <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-7 shadow-xl">
                 <p className="text-zinc-400 text-sm mb-6">
                   Rclone can "mount" your cloud storage so it looks like a regular USB drive on your device. We use VFS (Virtual File System) settings tailored to your specific device to prevent stuttering and save data.
                 </p>

                 <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-3">What kind of device is running this?</label>
                      <div className="grid grid-cols-3 gap-3">
                         <button
                           onClick={() => setMountDevice('desktop')}
                           className={`p-3 rounded-lg border text-sm font-medium flex flex-col items-center gap-2 transition-colors
                            ${mountDevice === 'desktop' ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-300' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300'}`}
                         >
                           <HardDrive className="w-5 h-5" />
                           PC / Laptop
                         </button>
                         <button
                           onClick={() => setMountDevice('android')}
                           className={`p-3 rounded-lg border text-sm font-medium flex flex-col items-center gap-2 transition-colors
                            ${mountDevice === 'android' ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-300' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300'}`}
                         >
                           <Smartphone className="w-5 h-5" />
                           Android App (RSAF/RCX)
                         </button>
                         <button
                           onClick={() => setMountDevice('server')}
                           className={`p-3 rounded-lg border text-sm flex flex-col items-center gap-2 font-medium transition-colors
                            ${mountDevice === 'server' ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-300' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300'}`}
                         >
                           <Server className="w-5 h-5" />
                           Media Server
                         </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-3">What level of access do you need?</label>
                      <div className="grid grid-cols-2 gap-3">
                         <button
                           onClick={() => setMountAccess('read')}
                           className={`p-3 rounded-lg border text-sm font-medium transition-colors
                            ${mountAccess === 'read' ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-300' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300'}`}
                         >
                           Read Only (Safer, just watching/downloading)
                         </button>
                         <button
                           onClick={() => setMountAccess('write')}
                           className={`p-3 rounded-lg border text-sm font-medium transition-colors
                            ${mountAccess === 'write' ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-300' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300'}`}
                         >
                           Full Access (Can edit & delete files)
                         </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-3">How do you prefer caching?</label>
                      <div className="grid grid-cols-2 gap-3">
                         <button
                           onClick={() => setMountCache('full')}
                           className={`p-3 rounded-lg border text-sm font-medium transition-colors text-left
                            ${mountCache === 'full' ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-300' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300'}`}
                         >
                           <div className="font-bold mb-1">Full Cache (Best)</div>
                           <div className="text-xs opacity-70 font-normal">Pre-downloads chunks for smooth media playing. Used more local storage.</div>
                         </button>
                         <button
                           onClick={() => setMountCache('minimal')}
                           className={`p-3 rounded-lg border text-sm font-medium transition-colors text-left
                            ${mountCache === 'minimal' ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-300' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300'}`}
                         >
                           <div className="font-bold mb-1">Minimal Cache</div>
                           <div className="text-xs opacity-70 font-normal">Saves your device storage. Good for small files or low-end phones.</div>
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
                <h3 className="text-lg font-semibold text-zinc-100">You're ready!</h3>
              </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
              
              {/* How-to helper */}
              <div className="bg-indigo-500/10 p-4 border-b border-indigo-500/20">
                <h4 className="flex items-center gap-2 text-indigo-300 font-semibold mb-2 text-sm">
                   <Info className="w-4 h-4" /> How do I use this?
                </h4>
                {activeTab === 'cli' && (
                  <ol className="text-sm text-indigo-200/80 space-y-1.5 list-decimal list-inside marker:text-indigo-400 font-medium">
                    <li>Copy the <strong>CLI Command</strong> below.</li>
                    <li>Open your Terminal or Command Prompt.</li>
                    <li>Paste the text and push Enter.</li>
                    {activeProvider.hasOAuth && <li>Your internet browser will pop up to log you in automatically.</li>}
                  </ol>
                )}
                {activeTab === 'mount' && mountDevice === 'android' && (
                   <ol className="text-sm text-indigo-200/80 space-y-1.5 list-decimal list-inside marker:text-indigo-400 font-medium">
                    <li>Copy the <strong>Config lines</strong> below.</li>
                    <li>Open your Android rclone app (RCX, Round Sync, RSAF).</li>
                    <li>Tap your remote to configure it, find VFS Options.</li>
                    <li>Paste the lines EXACTLY as shown one per line.</li>
                  </ol>
                )}
                {activeTab === 'mount' && mountDevice !== 'android' && (
                   <ol className="text-sm text-indigo-200/80 space-y-1.5 list-decimal list-inside marker:text-indigo-400 font-medium">
                    <li>Copy the <strong>Mount Command</strong> below.</li>
                    <li>Ensure you have run the CLI configuration setup first.</li>
                    <li>Open your Terminal or Command Prompt.</li>
                    <li>Paste the text and push Enter to start the virtual drive.</li>
                  </ol>
                )}
                {activeTab === 'conf' && (
                   <ol className="text-sm text-indigo-200/80 space-y-1.5 list-decimal list-inside marker:text-indigo-400 font-medium">
                    <li>This is the raw <code>rclone.conf</code> format.</li>
                    <li>Use this if you are manually editing your config file.</li>
                    <li>Or, import this directly into Android apps like RCX/RSAF.</li>
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
                  CLI Command
                </button>
                <button
                  onClick={() => setActiveTab('mount')}
                  className={`flex items-center whitespace-nowrap gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors
                    ${activeTab === 'mount' ? 'bg-zinc-950 text-indigo-300 border-x border-t border-zinc-800 relative bottom-[-1px]' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 border-transparent'}
                  `}
                >
                  <HardDrive className="w-4 h-4" />
                  Mount Drive (VFS)
                </button>
                <button
                  onClick={() => setActiveTab('conf')}
                  className={`flex items-center whitespace-nowrap gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors
                    ${activeTab === 'conf' ? 'bg-zinc-950 text-indigo-300 border-x border-t border-zinc-800 relative bottom-[-1px]' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 border-transparent'}
                  `}
                >
                  <FileCode2 className="w-4 h-4" />
                  rclone.conf
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
                        {mountDevice === 'android' ? 'Apply these VFS settings in your app:' : 'Run this after your config is set up:'}
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
                            <strong>Careful!</strong> Rclone needs passwords in <code>rclone.conf</code> to be securely encrypted. If you just paste your raw password here into the file, it will break. It is ALWAYS safer to use the <strong>CLI Command</strong> tab instead so Rclone handles it!
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
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-zinc-400" />
                        COPY TEXT
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

