
import { useState, useEffect } from "react";
import { WifiMonitor } from "@/components/WifiMonitor";
import { AlertFeed } from "@/components/AlertFeed";
import { DeviceTracker } from "@/components/DeviceTracker";
import { ThreatAnalytics } from "@/components/ThreatAnalytics";
import { SystemStatus } from "@/components/SystemStatus";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Wifi, AlertTriangle, Activity } from "lucide-react";
import { apiService, SystemStatus as SystemStatusType } from "@/services/api";

const Index = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [alertCount, setAlertCount] = useState(0);
  const [systemStatus, setSystemStatus] = useState<SystemStatusType | null>(null);

  // Poll system status every 3 seconds
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const status = await apiService.getStatus();
        setSystemStatus(status);
        setIsMonitoring(status.is_monitoring);
      } catch (error) {
        console.error('Failed to fetch system status:', error);
        // Set default values if backend is not available
        setSystemStatus({
          is_monitoring: false,
          packets_captured: 0,
          threat_alerts: 0,
          suspicious_ips: 0,
          uptime: 0
        });
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);

    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Shield className="h-10 w-10 text-purple-400" />
            <div>
              <h1 className="text-3xl font-bold text-white">WBIDS Dashboard</h1>
              <p className="text-gray-300">Wi-Fi Behavior Intrusion Detection System</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
              isMonitoring ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-sm font-medium">
                {isMonitoring ? 'Monitoring Active' : 'Monitoring Inactive'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Active Threats</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">
                {systemStatus?.threat_alerts || alertCount}
              </div>
              <p className="text-xs text-gray-400">Real-time detection</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Packets Captured</CardTitle>
              <Wifi className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">
                {systemStatus?.packets_captured.toLocaleString() || 0}
              </div>
              <p className="text-xs text-gray-400">Live monitoring</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Suspicious IPs</CardTitle>
              <Activity className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-400">
                {systemStatus?.suspicious_ips || 0}
              </div>
              <p className="text-xs text-gray-400">Flagged addresses</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">System Uptime</CardTitle>
              <Shield className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-400">
                {systemStatus ? formatUptime(systemStatus.uptime) : '0h 0m'}
              </div>
              <p className="text-xs text-gray-400">Backend online</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="monitor" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-gray-800/50">
            <TabsTrigger value="monitor" className="data-[state=active]:bg-purple-600">Monitor</TabsTrigger>
            <TabsTrigger value="alerts" className="data-[state=active]:bg-purple-600">Alerts</TabsTrigger>
            <TabsTrigger value="devices" className="data-[state=active]:bg-purple-600">Devices</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-600">Analytics</TabsTrigger>
            <TabsTrigger value="system" className="data-[state=active]:bg-purple-600">System</TabsTrigger>
          </TabsList>

          <TabsContent value="monitor" className="space-y-6">
            <WifiMonitor 
              isMonitoring={isMonitoring} 
              setIsMonitoring={setIsMonitoring}
            />
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <AlertFeed onAlertCountChange={setAlertCount} />
          </TabsContent>

          <TabsContent value="devices" className="space-y-6">
            <DeviceTracker />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <ThreatAnalytics />
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <SystemStatus />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
