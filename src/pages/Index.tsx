
import { useState, useEffect } from "react";
import { WifiMonitor } from "@/components/WifiMonitor";
import { AlertFeed } from "@/components/AlertFeed";
import { DeviceTracker } from "@/components/DeviceTracker";
import { ThreatAnalytics } from "@/components/ThreatAnalytics";
import { SystemStatus } from "@/components/SystemStatus";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Wifi, AlertTriangle, Activity } from "lucide-react";

const Index = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [alertCount, setAlertCount] = useState(0);

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
              <div className="text-2xl font-bold text-red-400">{alertCount}</div>
              <p className="text-xs text-gray-400">+2 from last hour</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Devices Tracked</CardTitle>
              <Wifi className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">23</div>
              <p className="text-xs text-gray-400">+5 new devices</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Signal Strength</CardTitle>
              <Activity className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">-45 dBm</div>
              <p className="text-xs text-gray-400">Average RSSI</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Uptime</CardTitle>
              <Shield className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-400">4h 23m</div>
              <p className="text-xs text-gray-400">System online</p>
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
