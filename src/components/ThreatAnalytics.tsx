
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const threatData = [
  { name: 'Evil Twin', count: 5, severity: 'Critical' },
  { name: 'Beacon Flood', count: 12, severity: 'High' },
  { name: 'MAC Spoofing', count: 3, severity: 'Medium' },
  { name: 'Unknown Device', count: 8, severity: 'Low' },
  { name: 'Jamming', count: 2, severity: 'High' },
];

const severityData = [
  { name: 'Critical', value: 5, color: '#DC2626' },
  { name: 'High', value: 14, color: '#EA580C' },
  { name: 'Medium', value: 3, color: '#CA8A04' },
  { name: 'Low', value: 8, color: '#2563EB' },
];

const timelineData = [
  { hour: '00:00', threats: 2 },
  { hour: '02:00', threats: 1 },
  { hour: '04:00', threats: 0 },
  { hour: '06:00', threats: 3 },
  { hour: '08:00', threats: 7 },
  { hour: '10:00', threats: 5 },
  { hour: '12:00', threats: 8 },
  { hour: '14:00', threats: 12 },
  { hour: '16:00', threats: 9 },
  { hour: '18:00', threats: 6 },
  { hour: '20:00', threats: 4 },
  { hour: '22:00', threats: 3 },
];

export const ThreatAnalytics = () => {
  return (
    <div className="space-y-6">
      {/* Threat Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Threat Types Distribution</CardTitle>
            <CardDescription className="text-gray-400">
              Breakdown of detected security threats by type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={threatData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="count" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Severity Distribution</CardTitle>
            <CardDescription className="text-gray-400">
              Distribution of threats by severity level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {severityData.map((item) => (
                <div key={item.name} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-300">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 24-Hour Timeline */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">24-Hour Threat Timeline</CardTitle>
          <CardDescription className="text-gray-400">
            Threat detection patterns over the last 24 hours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="hour" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="threats" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ML Model Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-lg">Detection Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">94.2%</div>
              <div className="text-sm text-gray-400">Current Model Performance</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-lg">False Positives</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">2.1%</div>
              <div className="text-sm text-gray-400">Last 24 Hours</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-lg">Model Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">v2.1</div>
              <div className="text-sm text-gray-400">Current Version</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
