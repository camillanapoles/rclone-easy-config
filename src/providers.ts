import { Cloud, Database, Lock, Server, Box, Webhook, HardDrive, MonitorUp, Zap } from 'lucide-react';

export type FieldType = 'text' | 'password' | 'select' | 'number';

export interface ProviderField {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  advanced?: boolean; // Flag to hide from normal users by default
  options?: string[];
  placeholder?: string;
  helperText?: string;
  defaultValue?: string;
}

export interface ProviderConfig {
  id: string;
  name: string;
  icon: any; 
  description: string;
  fields: ProviderField[];
  extraConfig?: Record<string, string>;
  hasOAuth?: boolean;
}

export const providers: ProviderConfig[] = [
  {
    id: 'drive',
    name: 'Google Drive',
    icon: Database,
    description: 'The easiest way to connect your Google Drive. Rclone will open your browser to log you in.',
    hasOAuth: true,
    fields: [
      {
        name: 'scope',
        label: 'What do you want Rclone to do?',
        type: 'select',
        options: ['drive', 'drive.readonly', 'drive.file'],
        defaultValue: 'drive',
        required: true,
        helperText: '"drive" gives full access to read and write. Choose "readonly" if you only want to download files.',
      },
      {
        name: 'root_folder_id',
        label: 'Specific Folder ID (Optional)',
        type: 'text',
        placeholder: '1aB2c...XYZ',
        advanced: true,
        helperText: 'Want to sync just one specific folder instead of everything? Paste the ID from its Google Drive URL here.',
      },
      {
        name: 'client_id',
        label: 'Custom Google Client ID',
        type: 'text',
        placeholder: '12345...apps.googleusercontent.com',
        advanced: true,
        helperText: 'For power users to avoid Google rate limits. Leave blank to use the easy default setup.',
      },
      {
        name: 'client_secret',
        label: 'Custom Google Client Secret',
        type: 'password',
        placeholder: 'GOCSPX-...',
        advanced: true,
        helperText: 'Only needed if you provided a Custom Client ID above.',
      }
    ],
    extraConfig: {
      type: 'drive'
    }
  },
  {
    id: 'onedrive',
    name: 'Microsoft OneDrive',
    icon: MonitorUp,
    description: 'Connect your personal or Office 365 OneDrive. Safe and automatic login.',
    hasOAuth: true,
    fields: [
      {
        name: 'region',
        label: 'Region',
        type: 'select',
        options: ['global', 'us', 'de', 'cn'],
        defaultValue: 'global',
        required: true,
        helperText: 'Almost everyone should choose "global" unless you are on a specific government or regional cloud.',
      },
      {
        name: 'client_id',
        label: 'Microsoft App Client ID',
        type: 'text',
        placeholder: 'abc-123...',
        advanced: true,
        helperText: 'Leave blank to use the built-in easy login. Used by IT admins to set up custom Azure apps.',
      },
      {
        name: 'client_secret',
        label: 'Microsoft App Secret',
        type: 'password',
        placeholder: 'xyz...',
        advanced: true,
        helperText: 'Only needed if using a custom Azure app.',
      }
    ],
    extraConfig: {
      type: 'onedrive'
    }
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    icon: Box,
    description: 'Securely sync files to your Dropbox. Uses your web browser to approve access.',
    hasOAuth: true,
    fields: [
      {
        name: 'client_id',
        label: 'Dropbox App Key',
        type: 'text',
        placeholder: 'abc123xyz...',
        advanced: true,
        helperText: 'Leave blank for regular usage! Supply your own only if you created a Dropbox developer app.',
      },
      {
        name: 'client_secret',
        label: 'Dropbox App Secret',
        type: 'password',
        placeholder: 'def456uvw...',
        advanced: true,
      }
    ],
    extraConfig: {
      type: 'dropbox'
    }
  },
  {
    id: 'mega',
    name: 'Mega.nz',
    icon: Zap,
    description: 'Connect directly to your Mega account using your email and password.',
    fields: [
      {
        name: 'user',
        label: 'Mega Account Email',
        type: 'text',
        placeholder: 'you@example.com',
        required: true,
        helperText: 'The email address you use to log into Mega.',
      },
      {
        name: 'pass',
        label: 'Mega Password',
        type: 'password',
        required: true,
        helperText: 'Rclone will securely obscure this password before saving it. We never store this.',
      }
    ],
    extraConfig: {
      type: 'mega'
    }
  },
  {
    id: 's3',
    name: 'Amazon S3 / Developers',
    icon: Cloud,
    description: 'For AWS S3, DigitalOcean, Minio, Backblaze B2, and other object storage.',
    fields: [
      {
        name: 'provider',
        label: 'S3 Provider Name',
        type: 'select',
        options: ['AWS', 'Minio', 'DigitalOcean', 'Ceph', 'Other'],
        defaultValue: 'AWS',
        required: true,
        helperText: 'Tell rclone who is hosting your S3 bucket so it knows what to expect.',
      },
      {
        name: 'access_key_id',
        label: 'Access Key ID',
        type: 'text',
        placeholder: 'AKIA...EXAMPLE',
        required: true,
        helperText: 'Your public API key provided by your cloud provider.',
      },
      {
        name: 'secret_access_key',
        label: 'Secret Access Key',
        type: 'password',
        placeholder: 'wJalr...EXAMPLE',
        required: true,
        helperText: 'Your private, secret API key. Do not share this!',
      },
      {
        name: 'region',
        label: 'Region',
        type: 'text',
        placeholder: 'us-east-1',
        advanced: true,
        helperText: 'Where your bucket lives geographically. Very important for AWS!',
      },
      {
        name: 'endpoint',
        label: 'Custom Endpoint URL',
        type: 'text',
        placeholder: 'https://...',
        advanced: true,
        helperText: 'Needed for DigitalOcean (like sfo2.digitaloceanspaces.com) or personal Minio servers. Leave blank for AWS.',
      },
    ],
    extraConfig: {
      type: 's3',
      env_auth: 'false'
    }
  },
  {
    id: 'sftp',
    name: 'SFTP / Remote Server',
    icon: Lock,
    description: 'Connect securely to another computer or web server via SSH.',
    fields: [
      {
        name: 'host',
        label: 'Server IP or Address',
        type: 'text',
        placeholder: '192.168.0.10',
        required: true,
        helperText: 'Where are we connecting to?',
      },
      {
        name: 'user',
        label: 'Computer Username',
        type: 'text',
        placeholder: 'root or ubuntu',
        required: true,
        helperText: 'Your login name on that server.',
      },
      {
        name: 'pass',
        label: 'Password',
        type: 'password',
        helperText: 'Safe enough for basic setups. For advanced security, use an Identity Key File below instead.',
      },
      {
        name: 'port',
        label: 'SSH Port',
        type: 'number',
        defaultValue: '22',
        advanced: true,
        helperText: 'Leave as 22 unless you know your server uses a custom port.',
      },
      {
        name: 'key_file',
        label: 'Identity Key Path',
        type: 'text',
        placeholder: '~/.ssh/id_rsa',
        advanced: true,
        helperText: 'Path to your SSH private key on the machine running Rclone. Better than using a password!',
      }
    ],
    extraConfig: {
      type: 'sftp'
    }
  }
];
