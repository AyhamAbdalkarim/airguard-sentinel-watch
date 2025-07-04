
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Smartphone, Laptop, Router, HelpCircle, Search, Shield } from "lucide-react";

interface Device {
  mac: string;
  vendor: string;
  deviceType: 'smartphone' | 'laptop' | 'router' | 'unknown';
  firstSeen: Date;
  lastSeen: Date;
  rssi: number;
  suspicious: boolean;
  probeRequests: string[];
}

export const DeviceTracker = () => {
  const [devices, setDevices] = useState<Device[]>([
    {
      mac: "AA:BB:CC:DD:EE:FF",
      vendor: "Apple Inc.",
      deviceType: "smartphone",
      firstSeen: new Date(Date.now() - 3600000),
      lastSeen: new Date(Date.now() - 300000),
      rssi: -45,
      suspicious: false,
      probeRequests: ["HomeNetwork", "Starbucks", "iPhone"]
    },
    {
      mac: "11:22:33:44:55:66",
      vendor: "Unknown",
      deviceType: "unknown",
      firstSeen: new Date(Date.now() - 600000),
      lastSeen: new Date(Date.now() - 60000),
      rssi: -30,
      suspicious: true,
      probeRequests: ["", "HomeNetwork_5G", "NETGEAR_GUEST"]
    },
    {
      mac: "77:88:99:AA:BB:CC",
      vendor: "Dell Inc.",
      deviceType: "laptop",
      firstSeen: new Date(Date.now() - 7200000),
      lastSeen: new Date(Date.now() - 120000),
      rssi: -52,
      suspicious: false,
      probeRequests: ["OfficeWiFi", "HomeNetwork"]
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredDevices, setFilteredDevices] = useState(devices);

  useEffect(() => {
    const filtered = devices.filter(device =>
      device.mac.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.vendor.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDevices(filtered);
  }, [searchTerm, devices]);

  const getDeviceIcon = (type: Device['deviceType']) => {
    switch (type) {
      case 'smartphone': return <Smartphone className="h-4 w-4 text-blue-400" />;
      case 'laptop': return <Laptop className="h-4 w-4 text-green-400" />;
      case 'router': return <Router className="h-4 w-4 text-purple-400" />;
      default: return <HelpCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getSignalStrength = (rssi: number) => {
    if (rssi > -50) return { level: "Strong", color: "text-green-400" };
    if (rssi > -70) return { level: "Medium", color: "text-yellow-400" };
    return { level: "Weak", color: "text-red-400" };
  };

  const flagDevice = (mac: string) => {
    setDevices(prev => prev.map(device =>
      device.mac === mac ? { ...device, suspicious: !device.suspicious } : device
    ));
  };

  return (
    <div className="space-y-6">
      {/* Device Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{devices.length}</div>
              <div className="text-sm text-gray-400">Total Devices</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">
                {devices.filter(d => d.suspicious).length}
              </div>
              <div className="text-sm text-gray-400">Suspicious</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {devices.filter(d => Date.now() - d.lastSeen.getTime() < 300000).length}
              </div>
              <div className="text-sm text-gray-400">Active (5min)</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {devices.filter(d => d.vendor === "Unknown").length}
              </div>
              <div className="text-sm text-gray-400">Unknown Vendor</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Device List */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Device Tracker</CardTitle>
              <CardDescription className="text-gray-400">
                Monitor and analyze Wi-Fi enabled devices in the area
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search devices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 text-gray-300">Device</th>
                  <th className="text-left py-3 text-gray-300">MAC Address</th>
                  <th className="text-left py-3 text-gray-300">Vendor</th>
                  <th className="text-left py-3 text-gray-300">Signal</th>
                  <th className="text-left py-3 text-gray-300">Last Seen</th>
                  <th className="text-left py-3 text-gray-300">Status</th>
                  <th className="text-left py-3 text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDevices.map((device) => {
                  const signal = getSignalStrength(device.rssi);
                  return (
                    <tr key={device.mac} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                      <td className="py-4">
                        <div className="flex items-center space-x-2">
                          {getDeviceIcon(device.deviceType)}
                          <span className="text-gray-300 capitalize">{device.deviceType}</span>
                        </div>
                      </td>
                      <td className="py-4 font-mono text-gray-300">{device.mac}</td>
                      <td className="py-4 text-gray-300">{device.vendor}</td>
                      <td className="py-4">
                        <div className="flex items-center space-x-2">
                          <span className={signal.color}>{device.rssi} dBm</span>
                          <Badge variant="outline" className={signal.color}>
                            {signal.level}
                          </Badge>
                        </div>
                      </td>
                      <td className="py-4 text-gray-400">
                        {Math.floor((Date.now() - device.lastSeen.getTime()) / 60000)}m ago
                      </td>
                      <td className="py-4">
                        <Badge
                          variant={device.suspicious ? "destructive" : "default"}
                          className={device.suspicious ? "bg-red-600" : "bg-green-600"}
                        >
                          {device.suspicious ? "Suspicious" : "Normal"}
                        </Badge>
                      </td>
                      <td className="py-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => flagDevice(device.mac)}
                          className="flex items-center space-x-1"
                        >
                          <Shield className="h-3 w-3" />
                          <span>{device.suspicious ? "Unflag" : "Flag"}</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
