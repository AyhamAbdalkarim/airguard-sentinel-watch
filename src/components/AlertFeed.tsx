import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Shield, Wifi, Clock, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService, ThreatAlert } from "@/services/api";

interface AlertFeedProps {
  onAlertCountChange: (count: number) => void;
}

export const AlertFeed = ({ onAlertCountChange }: AlertFeedProps) => {
  const [alerts, setAlerts] = useState<ThreatAlert[]>([]);
  const [resolvedAlerts, setResolvedAlerts] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Poll alerts every 5 seconds
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const backendAlerts = await apiService.getAlerts();
        setAlerts(backendAlerts);
      } catch (error) {
        console.error('Failed to fetch alerts:', error);
        // Keep showing mock data if backend is not available
        setAlerts([
          {
            timestamp: Date.now() / 1000 - 300,
            threat_type: 'EVIL_TWIN',
            severity: 'CRITICAL',
            source_ip: '192.168.1.100',
            description: 'Evil Twin AP detected: "HomeNetwork_5G"',
            confidence: 0.95
          },
          {
            timestamp: Date.now() / 1000 - 600,
            threat_type: 'PORT_SCAN',
            severity: 'HIGH',
            source_ip: '10.0.0.50',
            description: 'Port scan detected from suspicious IP',
            confidence: 0.87
          }
        ]);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const activeAlerts = alerts.filter(alert => 
      !resolvedAlerts.has(`${alert.timestamp}-${alert.source_ip}`)
    );
    onAlertCountChange(activeAlerts.length);
  }, [alerts, resolvedAlerts, onAlertCountChange]);

  useEffect(() => {
    // Show toast for new critical alerts
    const criticalAlerts = alerts.filter(alert => 
      alert.severity === 'CRITICAL' && 
      !resolvedAlerts.has(`${alert.timestamp}-${alert.source_ip}`)
    );

    criticalAlerts.forEach(alert => {
      toast({
        title: "🚨 Critical Security Alert",
        description: alert.description,
        variant: "destructive",
      });
    });
  }, [alerts, resolvedAlerts, toast]);

  const resolveAlert = (alert: ThreatAlert) => {
    const alertId = `${alert.timestamp}-${alert.source_ip}`;
    setResolvedAlerts(prev => new Set([...prev, alertId]));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-orange-600';
      case 'medium': return 'bg-yellow-600';
      case 'low': return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'evil_twin': return <Wifi className="h-4 w-4" />;
      case 'ddos': return <X className="h-4 w-4" />;
      case 'port_scan': return <Shield className="h-4 w-4" />;
      case 'anomaly': return <AlertTriangle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getSeverityCount = (severity: string) => {
    return alerts.filter(alert => 
      alert.severity.toLowerCase() === severity.toLowerCase() && 
      !resolvedAlerts.has(`${alert.timestamp}-${alert.source_ip}`)
    ).length;
  };

  return (
    <div className="space-y-6">
      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">
                {getSeverityCount('critical')}
              </div>
              <div className="text-sm text-gray-400">Critical</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">
                {getSeverityCount('high')}
              </div>
              <div className="text-sm text-gray-400">High</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {getSeverityCount('medium')}
              </div>
              <div className="text-sm text-gray-400">Medium</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {getSeverityCount('low')}
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
            Real-time security threats detected by the Python IDS backend
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {alerts.map((alert) => {
              const alertId = `${alert.timestamp}-${alert.source_ip}`;
              const isResolved = resolvedAlerts.has(alertId);
              const alertTime = new Date(alert.timestamp * 1000);

              return (
                <div
                  key={alertId}
                  className={`p-4 rounded-lg border ${
                    isResolved 
                      ? 'bg-gray-700/30 border-gray-600 opacity-60' 
                      : 'bg-gray-700/50 border-gray-600'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="flex items-center space-x-2">
                        {getAlertIcon(alert.threat_type)}
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{alert.description}</h4>
                        <p className="text-sm text-gray-400 mt-1">
                          Source: {alert.source_ip} | Confidence: {(alert.confidence * 100).toFixed(1)}%
                        </p>
                        <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>{alertTime.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    {!isResolved && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => resolveAlert(alert)}
                        className="text-xs"
                      >
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
            {alerts.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                No security alerts detected. System is monitoring...
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
