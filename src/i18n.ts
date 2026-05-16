export type Language = 'en' | 'pt' | 'zh';

export const translations = {
  en: {
    header: {
      title: 'Easy Rclone Setup',
      badge: '100% Private & Local',
    },
    hero: {
      title: "Let's connect your storage.",
      description: "Rclone can be complicated. We made it simple. Select your cloud provider below, fill out the basic info, and we'll generate a safe command for you to run. ",
      secure: "Your passwords never leave this screen.",
    },
    step1: {
      title: "Where are your files?",
    },
    step2: {
      title: "Fill in the details",
      remoteName: "Give this connection a simple nickname",
      remoteNameTooltip: "Examples: 'movies', 'backup', 'work-drive'. Avoid spaces.",
      remoteNameDesc: "You will use this name in your terminal commands",
      remoteNamePlaceholder: "e.g., google-drive",
      proBadge: "Pro",
      selectOption: "Select an option",
      showAdvanced: "Show geeky advanced options",
      hideAdvanced: "Hide nerd settings",
    },
    step3: {
      title: "How will you access the files? (Virtual Drive)",
      desc: 'Rclone can "mount" your cloud storage so it looks like a regular USB drive on your device. We use VFS (Virtual File System) settings tailored to your specific device to prevent stuttering and save data.',
      deviceLabel: "What kind of device is running this?",
      deviceDesktop: "PC / Laptop",
      deviceAndroid: "Android App (RSAF/RCX)",
      deviceServer: "Media Server",
      accessLabel: "What level of access do you need?",
      accessRead: "Read Only (Safer)",
      accessWrite: "Full Access (Can edit & delete)",
      cacheLabel: "How do you prefer caching?",
      cacheFullTitle: "Full Cache (Best)",
      cacheFullDesc: "Pre-downloads chunks for smooth media playing.",
      cacheMinimalTitle: "Minimal Cache",
      cacheMinimalDesc: "Saves device storage. Good for small files.",
    },
    step4: {
      title: "You're ready!",
      howTo: "How do I use this?",
      cliSteps: [
        "Copy the CLI Command below.",
        "Open your Terminal or Command Prompt.",
        "Paste the text and push Enter.",
        "Your browser will pop up to log you in automatically."
      ],
      mountAndroidSteps: [
        "Copy the Config lines below.",
        "Open your Android rclone app.",
        "Find VFS Options.",
        "Paste the lines EXACTLY as shown."
      ],
      mountDesktopSteps: [
        "Copy the Mount Command below.",
        "Run the CLI configuration setup first.",
        "Open your Terminal.",
        "Paste the text and push Enter."
      ],
      confSteps: [
        "This is the raw rclone.conf format.",
        "Use this if manually editing your config file."
      ],
      tabCli: "CLI Command",
      tabMount: "Mount Drive",
      tabConf: "rclone.conf",
      runAfterConfig: "Run this after your config is set up:",
      applyVfs: "Apply these VFS settings in your app:",
      warningRcloneConf: "Careful! Rclone needs passwords in rclone.conf to be securely encrypted. Use the CLI Command tab instead!",
      copied: "Copied!",
      copyText: "COPY TEXT"
    },
    providers: {
      drive: { name: 'Google Drive', desc: 'The easiest way to connect your Google Drive.' },
      onedrive: { name: 'Microsoft OneDrive', desc: 'Connect your personal or Office 365 OneDrive.' },
      dropbox: { name: 'Dropbox', desc: 'Securely sync files to your Dropbox.' },
      mega: { name: 'Mega.nz', desc: 'Connect directly to your Mega account.' },
      s3: { name: 'Amazon S3 / Developers', desc: 'For AWS S3, DigitalOcean, Minio, Backblaze B2, etc.' },
      sftp: { name: 'SFTP / Remote Server', desc: 'Connect securely via SSH.' },
    },
    fields: {
      'scope': { label: 'What do you want Rclone to do?', helper: '"drive" gives full access.' },
      'root_folder_id': { label: 'Specific Folder ID', helper: 'Paste the ID from its Google Drive URL here.' },
      'client_id': { label: 'Custom App Client ID', helper: 'For power users to avoid rate limits.' },
      'client_secret': { label: 'Custom App Secret', helper: 'Only needed if you provided a Custom Client ID.' },
      'region': { label: 'Region', helper: 'Where your bucket lives geographically.' },
      'user': { label: 'Username / Email', helper: 'Your login identifier.' },
      'pass': { label: 'Password', helper: 'We never store this. Rclone securely encrypts it.' },
      'provider': { label: 'S3 Provider Name', helper: 'Tell rclone who is hosting your S3 bucket.' },
      'access_key_id': { label: 'Access Key ID', helper: 'Your public API key.' },
      'secret_access_key': { label: 'Secret Access Key', helper: 'Your private API key.' },
      'endpoint': { label: 'Custom Endpoint URL', helper: 'Needed for DigitalOcean etc.' },
      'host': { label: 'Server IP or Address', helper: 'Where are we connecting to?' },
      'port': { label: 'SSH Port', helper: 'Default is 22.' },
      'key_file': { label: 'Identity Key Path', helper: 'Path to your SSH private key.' }
    }
  },
  pt: {
    header: {
      title: 'Configurador Rclone',
      badge: '100% Privado e Local',
    },
    hero: {
      title: "Vamos conectar seu armazenamento.",
      description: "O Rclone pode ser complicado. Nós simplificamos. Escolha seu provedor abaixo, preencha as informações básicas e nós geraremos um comando seguro para você.",
      secure: "Suas senhas nunca saem desta tela.",
    },
    step1: {
      title: "Onde estão seus arquivos?",
    },
    step2: {
      title: "Preencha os detalhes",
      remoteName: "Dê um apelido simples para esta conexão",
      remoteNameTooltip: "Exemplos: 'filmes', 'backup'. Evite espaços.",
      remoteNameDesc: "Você usará este nome no terminal",
      remoteNamePlaceholder: "ex: google-drive",
      proBadge: "Pro",
      selectOption: "Selecione uma opção",
      showAdvanced: "Mostrar opções avançadas",
      hideAdvanced: "Ocultar opções",
    },
    step3: {
      title: "Como você vai acessar? (Drive Virtual)",
      desc: 'O Rclone pode "montar" seu armazenamento na nuvem para parecer um pendrive. Usamos as melhores configurações VFS para o seu dispositivo.',
      deviceLabel: "Que tipo de dispositivo é este?",
      deviceDesktop: "PC / Notebook",
      deviceAndroid: "App Android",
      deviceServer: "Servidor de Mídia",
      accessLabel: "Qual nível de acesso?",
      accessRead: "Somente Leitura (Seguro)",
      accessWrite: "Acesso Total (Pode editar)",
      cacheLabel: "Como prefere o cache?",
      cacheFullTitle: "Cache Total (Melhor)",
      cacheFullDesc: "Faz pré-download para vídeo sem travar.",
      cacheMinimalTitle: "Cache Mínimo",
      cacheMinimalDesc: "Economiza espaço. Bom para celular.",
    },
    step4: {
      title: "Tudo pronto!",
      howTo: "Como eu uso isso?",
      cliSteps: [
        "Copie o comando CLI abaixo.",
        "Abra o Terminal ou Prompt de Comando.",
        "Cole o texto e aperte Enter.",
        "Seu navegador vai abrir para você fazer o login."
      ],
      mountAndroidSteps: [
        "Copie as linhas abaixo.",
        "Abra seu aplicativo rclone no Android.",
        "Encontre as Opções VFS.",
        "Cole as linhas EXATAMENTE como mostradas."
      ],
      mountDesktopSteps: [
        "Copie o comando de Montagem abaixo.",
        "Execute a configuração CLI primeiro.",
        "Abra o Terminal e cole o comando."
      ],
      confSteps: [
        "Este é o formato direto do rclone.conf.",
        "Use isso se estiver editando manualmente."
      ],
      tabCli: "Comando CLI",
      tabMount: "Montar Drive",
      tabConf: "Arquivo rclone.conf",
      runAfterConfig: "Execute isso depois de configurar:",
      applyVfs: "Aplique estas configurações VFS no app:",
      warningRcloneConf: "Cuidado! O format rclone.conf exige senhas criptografadas. Use a guia Comando CLI para ser seguro!",
      copied: "Copiado!",
      copyText: "COPIAR"
    },
    providers: {
      drive: { name: 'Google Drive', desc: 'A forma mais fácil de conectar seu Drive.' },
      onedrive: { name: 'Microsoft OneDrive', desc: 'Conecte seu OneDrive pessoal ou Office.' },
      dropbox: { name: 'Dropbox', desc: 'Sincronize com seu Dropbox de forma segura.' },
      mega: { name: 'Mega.nz', desc: 'Conecte-se com email e senha.' },
      s3: { name: 'Amazon S3 / Devs', desc: 'AWS S3, DigitalOcean, Minio, etc.' },
      sftp: { name: 'SFTP / Servidor', desc: 'Acesso seguro via SSH.' },
    },
    fields: {
      'scope': { label: 'O que o Rclone deve poder fazer?', helper: '"drive" dá acesso total.' },
      'root_folder_id': { label: 'ID da Pasta (Opcional)', helper: 'Cole o ID da URL da pasta específica aqui.' },
      'client_id': { label: 'Client ID', helper: 'Para evitar limite de uso. Opcional.' },
      'client_secret': { label: 'Client Secret', helper: 'Apenas se tiver o Client ID.' },
      'region': { label: 'Região', helper: 'Local geográfico do bucket.' },
      'user': { label: 'Usuário / Email', helper: 'Seu login.' },
      'pass': { label: 'Senha', helper: 'Rclone criptografa com segurança.' },
      'provider': { label: 'Provedor S3', helper: 'Selecione a empresa.' },
      'access_key_id': { label: 'Access Key ID', helper: 'Sua chave de acesso.' },
      'secret_access_key': { label: 'Secret Access Key', helper: 'Sua chave secreta.' },
      'endpoint': { label: 'URL Endpoint', helper: 'Para DigitalOcean ou Minio.' },
      'host': { label: 'IP ou Servidor', helper: 'Para onde conectar?' },
      'port': { label: 'Porta SSH', helper: 'Padrão é 22.' },
      'key_file': { label: 'Chave SSH', helper: 'Caminho para arquivo de chave.' }
    }
  },
  zh: {
    header: {
      title: 'Rclone 轻松配置',
      badge: '100% 隐私和本地',
    },
    hero: {
      title: "让我们连接您的存储。",
      description: "Rclone 可能会很复杂，但我们让它变得简单。在下面选择您的云存储，我们将为您生成安全命令。",
      secure: "您的密码永远不会离开此设备。",
    },
    step1: {
      title: "您的文件在哪里？",
    },
    step2: {
      title: "填写详情",
      remoteName: "给这个连接起一个简单的昵称",
      remoteNameTooltip: "示例：'movies', 'backup'。避免使用空格。",
      remoteNameDesc: "在此使用名称如 ",
      remoteNamePlaceholder: "如, google-drive",
      proBadge: "高级",
      selectOption: "选择操作",
      showAdvanced: "显示极客高级选项",
      hideAdvanced: "隐藏设置",
    },
    step3: {
      title: "您将如何访问文件？(虚拟驱动器)",
      desc: 'Rclone 可以将云存储"挂载"为普通 USB 驱动器。我们使用为您设备量身定制的 VFS 设置以防止卡顿。',
      deviceLabel: "这是什么设备？",
      deviceDesktop: "PC / 笔记本电脑",
      deviceAndroid: "Android 应用",
      deviceServer: "媒体服务器",
      accessLabel: "您需要什么访问权限？",
      accessRead: "只读 (更安全)",
      accessWrite: "完全访问 (可读写)",
      cacheLabel: "您喜欢什么缓存模式？",
      cacheFullTitle: "全面缓存 (最佳)",
      cacheFullDesc: "预下载块以播放流畅的媒体。",
      cacheMinimalTitle: "最小缓存",
      cacheMinimalDesc: "节省设备存储空间。",
    },
    step4: {
      title: "一切就绪！",
      howTo: "我该如何使用？",
      cliSteps: [
        "复制下方的 CLI 命令。",
        "打开终端或命令提示符。",
        "粘贴文本并按回车。",
        "您的浏览器将自动打开以登录。"
      ],
      mountAndroidSteps: [
        "复制下方的配置行。",
        "打开您的 Android Rclone 应用程序。",
        "找到 VFS 选项。",
        "逐行准确粘贴。"
      ],
      mountDesktopSteps: [
        "复制下方的挂载命令。",
        "确保您已先运行 CLI 配置设置。",
        "打开终端并粘贴运行。"
      ],
      confSteps: [
        "这是原始的 rclone.conf 格式。",
        "如果要手动编辑配置文件可使用这个。"
      ],
      tabCli: "CLI 命令",
      tabMount: "挂载驱动器",
      tabConf: "rclone.conf",
      runAfterConfig: "配置完成后运行此命令：",
      applyVfs: "在您的应用中应用这些 VFS 设置：",
      warningRcloneConf: "注意！Rclone 需要安全加密密码。如果您只粘贴明文密码将无法工作。请使用 CLI 命令选项卡！",
      copied: "已复制！",
      copyText: "复制"
    },
    providers: {
      drive: { name: 'Google Drive', desc: '连接 Google Drive 的最简单方法。' },
      onedrive: { name: 'Microsoft OneDrive', desc: '连接个人或 Office 365 OneDrive。' },
      dropbox: { name: 'Dropbox', desc: '安全同步到 Dropbox。' },
      mega: { name: 'Mega.nz', desc: '直接连接到 Mega 帐户。' },
      s3: { name: 'Amazon S3 / 开发者', desc: '适用于 AWS, DigitalOcean 等。' },
      sftp: { name: 'SFTP / 服务器', desc: '通过 SSH 安全连接。' },
    },
    fields: {
      'scope': { label: '希望做啥？', helper: '"drive" 提供完全权限。' },
      'root_folder_id': { label: '特定文件夹ID', helper: '将对应的 ID 粘贴在此处。' },
      'client_id': { label: '自定义客户端 ID', helper: '避免速率限制。' },
      'client_secret': { label: '自定义密钥', helper: '对应的密钥。' },
      'region': { label: '区域', helper: '您的存储桶地理位置。' },
      'user': { label: '用户名 / 邮箱', helper: '您的登录标识。' },
      'pass': { label: '密码', helper: '此操作安全加密。' },
      'provider': { label: 'S3 提供商', helper: '谁托管 S3。' },
      'access_key_id': { label: 'Access Key ID', helper: '公共 API 密钥。' },
      'secret_access_key': { label: 'Secret Access Key', helper: '私人密钥。' },
      'endpoint': { label: '自定义 Endpoint URL', helper: 'DigitalOcean 等所需。' },
      'host': { label: '服务器 IP 或地址', helper: '我们要连接到哪里？' },
      'port': { label: 'SSH 端口', helper: '默认22。' },
      'key_file': { label: '密钥文件路径', helper: 'SSH 私钥路径。' }
    }
  }
};
