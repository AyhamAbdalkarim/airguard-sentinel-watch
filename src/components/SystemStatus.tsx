
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Cpu, HardDrive, Wifi, Activity, Settings, Power } from "lucide-react";

export const SystemStatus = () => {
  const [systemStats, setSystemStats] = useState({
    cpuUsage: 45,
    memoryUsage: 67,
    diskUsage: 23,
    uptime: '4h 23m',
    packetsProcessed: 1547832,
    threatsBlocked: 23
  });

  const [adapterStatus, setAdapterStatus] = useState({
    name: "Alfa AWUS036ACS",
    status: "connected",
    mode: "monitor",
    channel: 6,
    powerLevel: 20
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStats(prev => ({
        ...prev,
        cpuUsage: Math.max(10, Math.min(90, prev.cpuUsage + (Math.random() - 0.5) * 10)),
        memoryUsage: Math.max(20, Math.min(90, prev.memoryUsage + (Math.random() - 0.5) * 5)),
        packetsProcessed: prev.packetsProcessed + Math.floor(Math.random() * 100)
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* System Performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{systemStats.cpuUsage}%</div>
            <Progress value={systemStats.cpuUsage} className="mt-2" />
            <p className="text-xs text-gray-400 mt-2">
              {systemStats.cpuUsage < 70 ? 'Normal' : 'High'} load
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Memory Usage</CardTitle>
            <Activity className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{systemStats.memoryUsage}%</div>
            <Progress value={systemStats.memoryUsage} className="mt-2" />
            <p className="text-xs text-gray-400 mt-2">
              {Math.round((systemStats.memoryUsage / 100) * 8)}GB / 8GB
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Disk Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{systemStats.diskUsage}%</div>
            <Progress value={systemStats.diskUsage} className="mt-2" />
            <p className="text-xs text-gray-400 mt-2">
              {Math.round((systemStats.diskUsage / 100) * 500)}GB / 500GB
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Wi-Fi Adapter Status */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Wifi className="h-5 w-5" />
            <span>Wi-Fi Adapter Status</span>
          </CardTitle>
          <CardDescription className="text-gray-400">
            Monitor mode adapter configuration and status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-300">Adapter Name</label>
                <div className="text-lg font-medium text-white">{adapterStatus.name}</div>
              </div>
              <div>
                <label className="text-sm text-gray-300">Status</label>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge 
                    variant={adapterStatus.status === 'connected' ? 'default' : 'destructive'}
                    className={adapterStatus.status === 'connected' ? 'bg-green-600' : 'bg-red-600'}
                  >
                    {adapterStatus.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-300">Mode</label>
                <div className="text-lg font-medium text-purple-400">{adapterStatus.mode}</div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-300">Current Channel</label>
                <div className="text-lg font-medium text-white">{adapterStatus.channel}</div>
              </div>
              <div>
                <label className="text-sm text-gray-300">Power Level</label>
                <div className="text-lg font-medium text-white">{adapterStatus.powerLevel} dBm</div>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure
                </Button>
                <Button size="sm" variant="outline">
                  <Power className="h-4 w-4 mr-2" />
                  Restart
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Processing Statistics</CardTitle>
            <CardDescription className="text-gray-400">
              Real-time packet processing metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">System Uptime</span>
              <span className="text-white font-medium">{systemStats.uptime}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Packets Processed</span>
              <span className="text-white font-medium">{systemStats.packetsProcessed.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Threats Detected</span>
              <span className="text-red-400 font-medium">{systemStats.threatsBlocked}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Processing Rate</span>
              <span className="text-green-400 font-medium">~2,500 pkt/sec</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Service Status</CardTitle>
            <CardDescription className="text-gray-400">
              Status of core system services
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Packet Sniffer</span>
              <Badge className="bg-green-600">Running</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">ML Engine</span>
              <Badge className="bg-green-600">Running</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Alert System</span>
              <Badge className="bg-green-600">Running</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Data Logger</span>
              <Badge className="bg-green-600">Running</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
