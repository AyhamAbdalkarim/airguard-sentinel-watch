
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Shield, Wifi, Clock, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Alert {
  id: string;
  type: 'evil_twin' | 'jamming' | 'beacon_flood' | 'mac_spoofing' | 'unknown_device';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  details: string;
  resolved: boolean;
}

interface AlertFeedProps {
  onAlertCountChange: (count: number) => void;
}

export const AlertFeed = ({ onAlertCountChange }: AlertFeedProps) => {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      type: 'evil_twin',
      severity: 'critical',
      message: 'Evil Twin AP detected: "HomeNetwork_5G"',
      timestamp: new Date(Date.now() - 300000),
      details: 'Duplicate SSID with identical name but different BSSID detected on channel 6',
      resolved: false
    },
    {
      id: '2',
      type: 'beacon_flood',
      severity: 'high',
      message: 'Beacon flooding attack detected',
      timestamp: new Date(Date.now() - 600000),
      details: 'Excessive beacon frames (>500/sec) detected from multiple fake APs',
      resolved: false
    },
    {
      id: '3',
      type: 'unknown_device',
      severity: 'medium',
      message: 'New unknown device: AA:BB:CC:DD:EE:FF',
      timestamp: new Date(Date.now() - 900000),
      details: 'Device appeared suddenly with strong signal strength (-30 dBm)',
      resolved: true
    }
  ]);

  const { toast } = useToast();

  useEffect(() => {
    const activeAlerts = alerts.filter(alert => !alert.resolved);
    onAlertCountChange(activeAlerts.length);
  }, [alerts, onAlertCountChange]);

  useEffect(() => {
    // Simulate new alerts
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newAlert: Alert = {
          id: Date.now().toString(),
          type: ['evil_twin', 'jamming', 'beacon_flood', 'mac_spoofing', 'unknown_device'][Math.floor(Math.random() * 5)] as Alert['type'],
          severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as Alert['severity'],
          message: 'New security threat detected',
          timestamp: new Date(),
          details: 'Automated threat detection triggered by anomalous behavior patterns',
          resolved: false
        };

        setAlerts(prev => [newAlert, ...prev]);

        toast({
          title: "🚨 Security Alert",
          description: newAlert.message,
          variant: newAlert.severity === 'critical' ? 'destructive' : 'default',
        });
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [toast]);

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
  };

  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-orange-600';
      case 'medium': return 'bg-yellow-600';
      case 'low': return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'evil_twin': return <Wifi className="h-4 w-4" />;
      case 'jamming': return <X className="h-4 w-4" />;
      case 'beacon_flood': return <AlertTriangle className="h-4 w-4" />;
      case 'mac_spoofing': return <Shield className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">
                {alerts.filter(a => !a.resolved && a.severity === 'critical').length}
              </div>
              <div className="text-sm text-gray-400">Critical</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">
                {alerts.filter(a => !a.resolved && a.severity === 'high').length}
              </div>
              <div className="text-sm text-gray-400">High</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {alerts.filter(a => !a.resolved && a.severity === 'medium').length}
              </div>
              <div className="text-sm text-gray-400">Medium</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {alerts.filter(a => !a.resolved && a.severity === 'low').length}
              </div>
              <div className="text-sm text-gray-400">Low</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert Feed */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Recent Alerts</CardTitle>
          <CardDescription className="text-gray-400">
            Real-time security threats and anomalous behavior detection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border ${
                  alert.resolved 
                    ? 'bg-gray-700/30 border-gray-600 opacity-60' 
                    : 'bg-gray-700/50 border-gray-600'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="flex items-center space-x-2">
                      {getAlertIcon(alert.type)}
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-white">{alert.message}</h4>
                      <p className="text-sm text-gray-400 mt-1">{alert.details}</p>
                      <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{alert.timestamp.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  {!alert.resolved && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => resolveAlert(alert.id)}
                      className="text-xs"
                    >
                      Resolve
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
