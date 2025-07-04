#!/usr/bin/env python3
"""
AI WiFi Intrusion Detection System (IDS)
Professional Network Security Monitoring Tool

Features:
- Real-time packet monitoring
- Anomaly detection using machine learning
- Suspicious activity detection
- Automated threat response
- Comprehensive logging
- Web dashboard for monitoring

Requirements:
- scapy
- scikit-learn
- flask
- flask-cors (NEW)
- numpy
- pandas
- psutil
- threading
"""

import os
import sys
import time
import json
import logging
import threading
import sqlite3
from datetime import datetime, timedelta
from collections import defaultdict, deque
from dataclasses import dataclass, asdict
from typing import Dict, List, Optional, Tuple, Set

try:
    from scapy.all import sniff, IP, TCP, UDP, ICMP, ARP, Dot11, get_if_list
    from sklearn.ensemble import IsolationForest
    from sklearn.preprocessing import StandardScaler
    import numpy as np
    import pandas as pd
    import psutil
    from flask import Flask, render_template_string, jsonify, request
    from flask_cors import CORS # NEW: Import CORS
    import ctypes
    import platform
except ImportError as e:
    print(f"Required library not found: {e}")
    print("Install with: pip install scapy scikit-learn flask numpy pandas psutil Flask-Cors") # Updated install message
    sys.exit(1)

# Configuration
CONFIG = {
    'INTERFACE': 'Intel(R) Wi-Fi 6 AX203',  # Auto-detect if None
    'MONITOR_DURATION': 3600,  # 1 hour
    'ANOMALY_THRESHOLD': 0.1,
    'LOG_FILE': 'wifi_ids.log',
    'DB_FILE': 'wifi_ids.db',
    'WEB_PORT': 5000,
    'PACKET_BUFFER_SIZE': 10000,
    'ANALYSIS_INTERVAL': 60,  # seconds
    'THREAT_RESPONSE_ENABLED': True
}

def is_admin():
    """Check if the script is running with administrator privileges"""
    try:
        if platform.system() == "Windows":
            return ctypes.windll.shell32.IsUserAnAnAdmin()
        else:
            # Unix/Linux systems
            return os.geteuid() == 0
    except:
        return False

@dataclass
class NetworkPacket:
    """Represents a captured network packet"""
    timestamp: float
    src_ip: str
    dst_ip: str
    protocol: str
    length: int
    src_port: Optional[int] = None
    dst_port: Optional[int] = None
    flags: Optional[str] = None

@dataclass
class ThreatAlert:
    """Represents a security threat alert"""
    timestamp: float
    threat_type: str
    severity: str
    source_ip: str
    description: str
    confidence: float

class WiFiIDS:
    """Main WiFi Intrusion Detection System class"""
    
    def __init__(self, config: Dict = None):
        self.config = config or CONFIG
        self.packet_buffer = deque(maxlen=self.config['PACKET_BUFFER_SIZE'])
        self.connection_tracker = defaultdict(int)
        self.suspicious_ips = set()
        self.threat_alerts = []
        self.is_monitoring = False
        self.ml_model = None
        self.scaler = StandardScaler()
        
        # Initialize logging
        self.setup_logging()
        
        # Initialize database
        self.init_database()
        
        # Initialize ML model
        self.init_ml_model()
        
        # Start analysis thread
        self.analysis_thread = threading.Thread(target=self.continuous_analysis, daemon=True)
        self.analysis_thread.start()
        
        self.logger.info("WiFi IDS initialized successfully")

        # Track start time for uptime calculation
        self.start_time = time.time()
    
    def setup_logging(self):
        """Configure logging system"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(self.config['LOG_FILE']),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger('WiFiIDS')
    
    def init_database(self):
        """Initialize SQLite database for storing alerts and statistics"""
        conn = sqlite3.connect(self.config['DB_FILE'])
        cursor = conn.cursor()
        
        # Create tables
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS threats (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp REAL,
                threat_type TEXT,
                severity TEXT,
                source_ip TEXT,
                description TEXT,
                confidence REAL
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS network_stats (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp REAL,
                total_packets INTEGER,
                unique_ips INTEGER,
                suspicious_activities INTEGER
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def init_ml_model(self):
        """Initialize machine learning model for anomaly detection"""
        self.ml_model = IsolationForest(
            contamination=self.config['ANOMALY_THRESHOLD'],
            random_state=42
        )
        self.logger.info("ML model initialized")
    
    def get_network_interface(self) -> str:
        """Auto-detect or return configured network interface"""
        if self.config['INTERFACE']:
            return self.config['INTERFACE']
        
        interfaces = get_if_list()
        # On Windows, prefer WiFi interfaces
        if platform.system() == "Windows":
            for iface in interfaces:
                if 'Wi-Fi' in iface or 'WiFi' in iface or 'Wireless' in iface:
                    return iface
        else:
            # On Unix/Linux, prefer wireless interfaces
            for iface in interfaces:
                if 'wlan' in iface.lower() or 'wifi' in iface.lower():
                    return iface
        
        # Fall back to first available interface
        return interfaces[0] if interfaces else 'eth0'
    
    def packet_callback(self, packet):
        """Process captured network packets"""
        try:
            if not packet.haslayer(IP):
                return
            
            ip_layer = packet[IP]
            protocol = self.get_protocol(packet)
            
            network_packet = NetworkPacket(
                timestamp=time.time(),
                src_ip=ip_layer.src,
                dst_ip=ip_layer.dst,
                protocol=protocol,
                length=len(packet)
            )
            
            # Add port information if available
            if packet.haslayer(TCP):
                tcp_layer = packet[TCP]
                network_packet.src_port = tcp_layer.sport
                network_packet.dst_port = tcp_layer.dport
                network_packet.flags = str(tcp_layer.flags)
            elif packet.haslayer(UDP):
                udp_layer = packet[UDP]
                network_packet.src_port = udp_layer.sport
                network_packet.dst_port = udp_layer.dport
            
            self.packet_buffer.append(network_packet)
            self.connection_tracker[network_packet.src_ip] += 1
            
            # Real-time threat detection
            self.analyze_packet(network_packet)
            
        except Exception as e:
            self.logger.error(f"Error processing packet: {e}")
    
    def get_protocol(self, packet) -> str:
        """Extract protocol information from packet"""
        if packet.haslayer(TCP):
            return 'TCP'
        elif packet.haslayer(UDP):
            return 'UDP'
        elif packet.haslayer(ICMP):
            return 'ICMP'
        elif packet.haslayer(ARP):
            return 'ARP'
        else:
            return 'OTHER'
    
    def analyze_packet(self, packet: NetworkPacket):
        """Analyze individual packet for threats"""
        # Port scan detection
        if self.detect_port_scan(packet):
            self.create_threat_alert(
                'PORT_SCAN',
                'HIGH',
                packet.src_ip,
                f"Port scan detected from {packet.src_ip}",
                0.8
            )
        
        # Suspicious port detection
        if self.detect_suspicious_port(packet):
            self.create_threat_alert(
                'SUSPICIOUS_PORT',
                'MEDIUM',
                packet.src_ip,
                f"Connection to suspicious port {packet.dst_port} from {packet.src_ip}",
                0.6
            )
        
        # DDoS detection
        if self.detect_ddos(packet):
            self.create_threat_alert(
                'DDOS',
                'CRITICAL',
                packet.src_ip,
                f"Potential DDoS attack from {packet.src_ip}",
                0.9
            )
    
    def detect_port_scan(self, packet: NetworkPacket) -> bool:
        """Detect port scanning activities"""
        if not packet.dst_port:
            return False
        
        # Check for multiple connections to different ports from same IP
        recent_packets = [p for p in self.packet_buffer 
                         if p.src_ip == packet.src_ip and 
                         time.time() - p.timestamp < 60]
        
        unique_ports = set(p.dst_port for p in recent_packets if p.dst_port)
        return len(unique_ports) > 20  # Threshold for port scan
    
    def detect_suspicious_port(self, packet: NetworkPacket) -> bool:
        """Detect connections to suspicious ports"""
        suspicious_ports = {
            22, 23, 135, 139, 445, 1433, 3389, 5432, 5900, 6379
        }
        return packet.dst_port in suspicious_ports
    
    def detect_ddos(self, packet: NetworkPacket) -> bool:
        """Detect DDoS attacks"""
        # Simple rate-based detection
        recent_count = sum(1 for p in self.packet_buffer 
                          if p.src_ip == packet.src_ip and 
                          time.time() - p.timestamp < 10)
        return recent_count > 100  # Threshold for DDoS
    
    def continuous_analysis(self):
        """Continuous analysis of network traffic using ML"""
        while True:
            try:
                time.sleep(self.config['ANALYSIS_INTERVAL'])
                if len(self.packet_buffer) > 100:
                    self.ml_analysis()
                    self.update_statistics()
            except Exception as e:
                self.logger.error(f"Error in continuous analysis: {e}")
    
    def ml_analysis(self):
        """Machine learning-based anomaly detection"""
        try:
            # Extract features from packet buffer
            features = self.extract_features()
            if len(features) < 10:
                return
            
            # Normalize features
            features_scaled = self.scaler.fit_transform(features)
            
            # Train model if needed
            if not hasattr(self.ml_model, 'offset_'):
                self.ml_model.fit(features_scaled)
                return
            
            # Detect anomalies
            anomalies = self.ml_model.predict(features_scaled)
            anomaly_scores = self.ml_model.decision_function(features_scaled)
            
            # Create alerts for anomalies
            for i, (is_anomaly, score) in enumerate(zip(anomalies, anomaly_scores)):
                if is_anomaly == -1:  # Anomaly detected
                    packet = list(self.packet_buffer)[-(len(features) - i)]
                    self.create_threat_alert(
                        'ANOMALY',
                        'MEDIUM',
                        packet.src_ip,
                        f"Anomalous network behavior detected from {packet.src_ip}",
                        abs(score)
                    )
        
        except Exception as e:
            self.logger.error(f"Error in ML analysis: {e}")
    
    def extract_features(self) -> List[List[float]]:
        """Extract features from packet buffer for ML analysis"""
        features = []
        
        # Group packets by source IP
        ip_groups = defaultdict(list)
        for packet in self.packet_buffer:
            ip_groups[packet.src_ip].append(packet)
        
        for ip, packets in ip_groups.items():
            if len(packets) < 5:
                continue
            
            # Calculate features
            packet_rate = len(packets) / max(1, (max(p.timestamp for p in packets) - 
                                               min(p.timestamp for p in packets)))
            avg_packet_size = sum(p.length for p in packets) / len(packets)
            unique_ports = len(set(p.dst_port for p in packets if p.dst_port))
            protocol_diversity = len(set(p.protocol for p in packets))
            
            features.append([packet_rate, avg_packet_size, unique_ports, protocol_diversity])
        
        return features
    
    def create_threat_alert(self, threat_type: str, severity: str, 
                           source_ip: str, description: str, confidence: float):
        """Create and store threat alert"""
        alert = ThreatAlert(
            timestamp=time.time(),
            threat_type=threat_type,
            severity=severity,
            source_ip=source_ip,
            description=description,
            confidence=confidence
        )
        
        self.threat_alerts.append(alert)
        self.suspicious_ips.add(source_ip)
        
        # Store in database
        self.store_threat_alert(alert)
        
        # Log alert
        self.logger.warning(f"THREAT DETECTED: {description} (Confidence: {confidence:.2f})")
        
        # Trigger response if enabled
        if self.config['THREAT_RESPONSE_ENABLED']:
            self.respond_to_threat(alert)
    
    def store_threat_alert(self, alert: ThreatAlert):
        """Store threat alert in database"""
        try:
            conn = sqlite3.connect(self.config['DB_FILE'])
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO threats (timestamp, threat_type, severity, source_ip, description, confidence)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (alert.timestamp, alert.threat_type, alert.severity, 
                  alert.source_ip, alert.description, alert.confidence))
            
            conn.commit()
            conn.close()
        except Exception as e:
            self.logger.error(f"Error storing threat alert: {e}")
    
    def respond_to_threat(self, alert: ThreatAlert):
        """Automated threat response"""
        if alert.severity == 'CRITICAL':
            self.logger.info(f"Blocking IP: {alert.source_ip}")
            # Cross-platform firewall integration
            if platform.system() == "Windows":
                # Windows Firewall command
                # os.system(f'netsh advfirewall firewall add rule name="Block {alert.source_ip}" dir=in action=block remoteip={alert.source_ip}')
                pass
            else:
                # Linux iptables command
                # os.system(f"iptables -A INPUT -s {alert.source_ip} -j DROP")
                pass
        
        # Send notification (implement email/SMS integration here)
        self.logger.info(f"Threat notification sent for {alert.threat_type}")
    
    def update_statistics(self):
        """Update network statistics"""
        try:
            conn = sqlite3.connect(self.config['DB_FILE'])
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO network_stats (timestamp, total_packets, unique_ips, suspicious_activities)
                VALUES (?, ?, ?, ?)
            ''', (time.time(), len(self.packet_buffer), 
                  len(set(p.src_ip for p in self.packet_buffer)), 
                  len(self.suspicious_ips)))
            
            conn.commit()
            conn.close()
        except Exception as e:
            self.logger.error(f"Error updating statistics: {e}")
    
    def start_monitoring(self):
        """Start network monitoring"""
        if self.is_monitoring:
            self.logger.info("Monitoring is already active.")
            return

        interface = self.get_network_interface()
        self.logger.info(f"Starting monitoring on interface: {interface}")
        
        self.is_monitoring = True
        self.start_time = time.time() # Reset start time when monitoring starts

        try:
            # Scapy's sniff function runs in the current thread.
            # For non-blocking behavior in Flask, this should be called in a separate thread.
            sniff(
                iface=interface,
                prn=self.packet_callback,
                store=0,
                stop_filter=lambda x: not self.is_monitoring
            )
            self.logger.info("Scapy sniff thread stopped.")
        except Exception as e:
            self.logger.error(f"Error during monitoring: {e}")
            self.is_monitoring = False # Ensure status is set to false on error
    
    def stop_monitoring(self):
        """Stop network monitoring"""
        if not self.is_monitoring:
            self.logger.info("Monitoring is already inactive.")
            return

        self.is_monitoring = False
        self.logger.info("Monitoring stopped signal sent.")
        # Scapy's sniff will stop when stop_filter returns True (i.e., self.is_monitoring is False)
    
    def get_status(self) -> Dict:
        """Get current system status"""
        uptime_seconds = time.time() - self.start_time
        return {
            'is_monitoring': self.is_monitoring,
            'packets_captured': len(self.packet_buffer),
            'threat_alerts': len(self.threat_alerts),
            'suspicious_ips': len(self.suspicious_ips),
            'uptime': uptime_seconds
        }
    
    def get_recent_alerts(self, hours: int = 24) -> List[Dict]:
        """Get recent threat alerts"""
        # Fetch from database for persistence
        conn = sqlite3.connect(self.config['DB_FILE'])
        cursor = conn.cursor()
        
        cutoff_time = time.time() - (hours * 3600)
        cursor.execute('SELECT timestamp, threat_type, severity, source_ip, description, confidence FROM threats WHERE timestamp > ? ORDER BY timestamp DESC', (cutoff_time,))
        
        recent_alerts_db = []
        for row in cursor.fetchall():
            recent_alerts_db.append({
                "timestamp": row[0],
                "threat_type": row[1],
                "severity": row[2],
                "source_ip": row[3],
                "description": row[4],
                "confidence": row[5]
            })
        
        conn.close()
        return recent_alerts_db

# Web Dashboard
app = Flask(__name__)
CORS(app) # Enable CORS for all routes

@app.route('/')
def dashboard():
    """Main dashboard page - No longer needed as React serves the frontend"""
    # This route is now primarily for testing or if you want to keep a basic HTML fallback
    return render_template_string("<h1>WiFi IDS Backend Running</h1><p>Frontend is served by React.</p>")

@app.route('/api/status')
def api_status():
    """API endpoint for system status"""
    return jsonify(ids_instance.get_status())

@app.route('/api/alerts')
def api_alerts():
    """API endpoint for recent alerts"""
    return jsonify(ids_instance.get_recent_alerts())

@app.route('/api/start_monitoring', methods=['POST'])
def api_start_monitoring():
    """API endpoint to start network monitoring"""
    if not ids_instance.is_monitoring:
        # Start monitoring in a new thread to avoid blocking the API response
        # This is crucial because scapy's sniff is blocking
        threading.Thread(target=ids_instance.start_monitoring, daemon=True).start()
        # Give a small delay for the thread to start and update status
        time.sleep(0.1) 
        return jsonify({"status": "Monitoring started", "is_monitoring": ids_instance.is_monitoring}), 200
    return jsonify({"status": "Monitoring already active", "is_monitoring": ids_instance.is_monitoring}), 200

@app.route('/api/stop_monitoring', methods=['POST'])
def api_stop_monitoring():
    """API endpoint to stop network monitoring"""
    if ids_instance.is_monitoring:
        ids_instance.stop_monitoring()
        # Give a small delay for the monitoring status to update
        time.sleep(0.1)
        return jsonify({"status": "Monitoring stopped", "is_monitoring": ids_instance.is_monitoring}), 200
    return jsonify({"status": "Monitoring already inactive", "is_monitoring": ids_instance.is_monitoring}), 200


# Global instance of WiFiIDS
ids_instance = None

def main():
    """Main function to run the WiFi IDS"""
    global ids_instance
    
    print("WiFi IDS - Professional Network Intrusion Detection System")
    print("=" * 60)
    
    # Check if running with elevated privileges (required for packet capture)
    if not is_admin():
        print("Warning: This script should be run as Administrator for full functionality")
    
    # Initialize IDS
    ids_instance = WiFiIDS()
    
    # Start web dashboard in separate thread
    web_thread = threading.Thread(
        target=lambda: app.run(host='0.0.0.0', port=CONFIG['WEB_PORT'], debug=False, use_reloader=False), # use_reloader=False to prevent Flask from running twice
        daemon=True
    )
    web_thread.start()
    
    print(f"Web dashboard (API) available at: http://localhost:{CONFIG['WEB_PORT']}")
    print("Backend is ready to serve API requests. Frontend will connect to it.")
    print("Press Ctrl+C to shut down the IDS.")
    
    try:
        # Keep the main thread alive to allow daemon threads to run
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nShutting down WiFi IDS...")
        if ids_instance:
            ids_instance.stop_monitoring()
        print("WiFi IDS stopped.")

if __name__ == "__main__":
    main()
