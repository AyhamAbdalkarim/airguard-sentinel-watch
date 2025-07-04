
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Play, Pause, WifiHigh, WifiLow, WifiOff } from "lucide-react";
import { apiService } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface WifiMonitorProps {
  isMonitoring: boolean;
  setIsMonitoring: (monitoring: boolean) => void;
}

interface SignalData {
  time: string;
  packets: number;
  devices: number;
}

export const WifiMonitor = ({ isMonitoring, setIsMonitoring }: WifiMonitorProps) => {
  const [signalData, setSignalData] = useState<SignalData[]>([]);
  const [currentChannel, setCurrentChannel] = useState(6);
  const [packetsCount, setPacketsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [detectedNetworks] = useState([
    { ssid: "HomeNetwork_5G", channel: 6, rssi: -45, security: "WPA2", suspicious: false },
    { ssid: "UNKNOWN_AP", channel: 11, rssi: -72, security: "Open", suspicious: true },
    { ssid: "CoffeeShop_WiFi", channel: 1, rssi: -58, security: "WPA2", suspicious: false },
    { ssid: "Evil_Twin_AP", channel: 6, rssi: -40, security: "Open", suspicious: true },
  ]);

  useEffect(() => {
    // Poll system status every 2 seconds when monitoring
    if (isMonitoring) {
      const interval = setInterval(async () => {
        try {
          const status = await apiService.getStatus();
          setPacketsCount(status.packets_captured);
          
          const now = new Date();
          const newData: SignalData = {
            time: now.toLocaleTimeString(),
            packets: status.packets_captured,
            devices: Math.floor(15 + Math.random() * 15) // Simulated device count
          };
          
          setSignalData(prev => [...prev.slice(-19), newData]);
        } catch (error) {
          console.error('Failed to fetch status:', error);
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isMonitoring]);

  const toggleMonitoring = async () => {
    setIsLoading(true);
    try {
      if (isMonitoring) {
        const response = await apiService.stopMonitoring();
        setIsMonitoring(false);
        toast({
          title: "Monitoring Stopped",
          description: response.status,
        });
      } else {
        const response = await apiService.startMonitoring();
        setIsMonitoring(true);
        setSignalData([]); // Reset data when starting
        toast({
          title: "Monitoring Started",
          description: response.status,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isMonitoring ? 'stop' : 'start'} monitoring. Make sure the Python backend is running.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSignalIcon = (rssi: number) => {
    if (rssi > -50) return <WifiHigh className="h-4 w-4 text-green-400" />;
    if (rssi > -70) return <WifiLow className="h-4 w-4 text-yellow-400" />;
    return <WifiOff className="h-4 w-4 text-red-400" />;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Control Panel */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            Monitor Control
            <Button 
              onClick={toggleMonitoring}
              variant={isMonitoring ? "destructive" : "default"}
              className="flex items-center space-x-2"
              disabled={isLoading}
            >
              {isMonitoring ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              <span>{isLoading ? 'Loading...' : (isMonitoring ? 'Stop' : 'Start')} Monitoring</span>
            </Button>
          </CardTitle>
          <CardDescription className="text-gray-400">
            Monitor Wi-Fi environment for suspicious activity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-300">Current Channel</label>
              <div className="text-2xl font-bold text-purple-400">{currentChannel}</div>
            </div>
            <div>
              <label className="text-sm text-gray-300">Packets Captured</label>
              <div className="text-2xl font-bold text-green-400">{packetsCount.toLocaleString()}</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm text-gray-300">Channel Range</label>
            <div className="flex flex-wrap gap-1">
              {[1, 6, 11].map(channel => (
                <Badge 
                  key={channel}
                  variant={channel === currentChannel ? "default" : "secondary"}
                  className={channel === currentChannel ? "bg-purple-600" : ""}
                >
                  Ch {channel}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Signal Chart */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Real-time Activity Monitor</CardTitle>
          <CardDescription className="text-gray-400">
            Live packet capture and device tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={signalData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="packets" 
                stroke="#8B5CF6" 
                strokeWidth={2}
                dot={false}
                name="Packets"
              />
              <Line 
                type="monotone" 
                dataKey="devices" 
                stroke="#10B981" 
                strokeWidth={2}
                dot={false}
                name="Devices"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detected Networks */}
      <Card className="bg-gray-800/50 border-gray-700 lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-white">Detected Access Points</CardTitle>
          <CardDescription className="text-gray-400">
            Currently visible Wi-Fi networks and their security status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-2 text-gray-300">SSID</th>
                  <th className="text-left py-2 text-gray-300">Channel</th>
                  <th className="text-left py-2 text-gray-300">Signal</th>
                  <th className="text-left py-2 text-gray-300">Security</th>
                  <th className="text-left py-2 text-gray-300">Status</th>
                </tr>
              </thead>
              <tbody>
                {detectedNetworks.map((network, index) => (
                  <tr key={index} className="border-b border-gray-700/50">
                    <td className="py-3 text-white font-medium">{network.ssid}</td>
                    <td className="py-3 text-gray-300">{network.channel}</td>
                    <td className="py-3">
                      <div className="flex items-center space-x-2">
                        {getSignalIcon(network.rssi)}
                        <span className="text-gray-300">{network.rssi} dBm</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <Badge variant={network.security === "Open" ? "destructive" : "default"}>
                        {network.security}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <Badge 
                        variant={network.suspicious ? "destructive" : "default"}
                        className={network.suspicious ? "bg-red-600" : "bg-green-600"}
                      >
                        {network.suspicious ? "Suspicious" : "Normal"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
