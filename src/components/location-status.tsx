import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

interface LocationStatusProps {
  status: 'detecting' | 'success' | 'error' | 'fallback' | null;
  message?: string;
}

export function LocationStatus({ status, message }: LocationStatusProps) {
  if (!status) return null;

  const statusConfig = {
    detecting: {
      icon: Info,
      title: 'Detecting your location...',
      description: message || 'This may take a few seconds',
      variant: 'default' as const
    },
    success: {
      icon: CheckCircle,
      title: 'Location detected successfully',
      description: message || 'Your location has been set',
      variant: 'default' as const
    },
    error: {
      icon: AlertCircle,
      title: 'Location detection failed',
      description: message || 'Please enter your location manually',
      variant: 'destructive' as const
    },
    fallback: {
      icon: Info,
      title: 'Using default location',
      description: message || 'Location detection not available, using Mumbai as default',
      variant: 'default' as const
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Alert variant={config.variant} className="text-sm">
      <Icon className="h-4 w-4" />
      <AlertDescription>
        <span className="font-medium">{config.title}</span>
        {config.description && (
          <>
            <br />
            <span className="text-xs opacity-90">{config.description}</span>
          </>
        )}
      </AlertDescription>
    </Alert>
  );
}