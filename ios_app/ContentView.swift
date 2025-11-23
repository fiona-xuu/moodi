import SwiftUI
import SmartSpectraSwiftSDK

struct ContentView: View {
    @ObservedObject var sdk = SmartSpectraSwiftSDK.shared
    @ObservedObject var vitalsProcessor = SmartSpectraVitalsProcessor.shared
    @ObservedObject var ws = WebSocketManager.shared

    @State private var pulseText = "--"
    @State private var breathText = "--"
    @State private var ieText = "--"
    @State private var ampText = "--"
    @State private var bpText = "--"
    @State private var apneaText = "--"
    @State private var isSpotMode = true
    @State private var isSDKConfigured = false
    @State private var wasRecording = false
    @State private var spotScanBuffer: Presage_Physiology_MetricsBuffer? = nil
    @State private var spotScanStartTime: Date? = nil
    @State private var hasSentData = false

    init() {
        let apiKey = "2Iqz0NEe5p6CAGJIv0OEc3AHIuCtvC9v2ikxCULc"
        sdk.setApiKey(apiKey)
        sdk.showControlsInScreeningView(true)
        sdk.setMeasurementDuration(25.0)
        sdk.setRecordingDelay(1)
    }

    var body: some View {
        ZStack(alignment: .topLeading) {
            SmartSpectraView()
                .onDisappear {
                    if isSpotMode && wasRecording && !hasSentData {
                        sendManualReport()
                        hasSentData = true
                        wasRecording = false
                    }
                }
                .onChange(of: vitalsProcessor.statusHint) { newStatus in
                    if isSpotMode {
                        if newStatus.localizedCaseInsensitiveContains("Recording") || newStatus.localizedCaseInsensitiveContains("Capturing") {
                            wasRecording = true
                            spotScanBuffer = nil
                            hasSentData = false
                            pulseText = "--"
                            breathText = "--"
                            ieText = "--"
                            ampText = "--"
                            bpText = "--"
                            apneaText = "--"
                        }
                        
                        if wasRecording && (newStatus.localizedCaseInsensitiveContains("Idle") || newStatus.localizedCaseInsensitiveContains("Done")) {
                            DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
                                if !self.hasSentData {
                                    self.sendManualReport()
                                    self.hasSentData = true
                                    self.wasRecording = false
                                }
                            }
                        }
                    }
                }
                .onChange(of: sdk.metricsBuffer) { newBuffer in
                    if isSpotMode {
                        if let buffer = newBuffer {
                            spotScanBuffer = buffer
                            updateLocalMetrics(buffer)
                            
                            if spotScanStartTime == nil {
                                spotScanStartTime = Date()
                                wasRecording = true
                            }
                        }
                        return
                    }
                    
                    guard let buffer = newBuffer else { return }
                    updateLocalMetrics(buffer)
                    sendBuffer(buffer)
                }
                .onAppear {
                    WebSocketManager.shared.connect()
                    if !isSDKConfigured {
                        sdk.setSmartSpectraMode(.spot)
                        isSDKConfigured = true
                    }
                }
            
            VStack(alignment: .leading, spacing: 4) {
                Text("SDK Status: \(vitalsProcessor.statusHint)")
                    .font(.system(size: 12))
                    .foregroundColor(.yellow)
                Text("Pulse: \(pulseText)")
                Text("Breath: \(breathText)")
                Text("I/E: \(ieText)")
                Text("Amp: \(ampText)")
                Text("BP: \(bpText)")
                Text("Apnea: \(apneaText)")
                
                HStack {
                    Circle()
                        .fill(ws.isConnected ? Color.green : Color.red)
                        .frame(width: 8, height: 8)
                    Text(ws.isConnected ? "WS Connected" : "WS Disconnected")
                        .font(.system(size: 12))
                        .foregroundColor(ws.isConnected ? .green : .red)
                }
                .padding(.top, 4)
                
                HStack(spacing: 8) {
                    Button(action: {
                        isSpotMode.toggle()
                        wasRecording = false
                        spotScanBuffer = nil
                        sdk.setSmartSpectraMode(isSpotMode ? .spot : .continuous)
                    }) {
                        Text("Mode: \(isSpotMode ? "Spot" : "Cont")")
                            .font(.system(size: 12, weight: .bold))
                            .padding(6)
                            .background(Color.blue)
                            .foregroundColor(.white)
                            .cornerRadius(6)
                    }
                    
                    Button(action: {
                        sendManualReport()
                    }) {
                        Text("Send")
                            .font(.system(size: 12, weight: .bold))
                            .padding(6)
                            .background(Color.green)
                            .foregroundColor(.white)
                            .cornerRadius(6)
                    }
                }
                .padding(.top, 4)
            }
            .font(.system(size: 14, weight: .bold, design: .monospaced))
            .foregroundColor(.green)
            .padding(8)
            .background(Color.black.opacity(0.5))
            .cornerRadius(8)
            .padding(.top, 50)
            .padding(.leading, 10)
            
            if !ws.isConnected {
                Text("Disconnected - Reconnecting...")
                    .font(.caption)
                    .foregroundColor(.white)
                    .padding(8)
                    .background(Color.red.opacity(0.8))
                    .cornerRadius(20)
                    .padding(.top, 60)
            }
        }
    }
    
    private func updateLocalMetrics(_ buffer: Presage_Physiology_MetricsBuffer) {
        if let v = buffer.pulse.rate.last?.value { 
            pulseText = String(format: "%.1f", v) 
        } else if isSpotMode && !buffer.pulse.rate.isEmpty {
             pulseText = String(format: "%.1f", buffer.pulse.rate[buffer.pulse.rate.count-1].value)
        }
        
        if let v = buffer.breathing.rate.last?.value { 
            breathText = String(format: "%.1f", v) 
        }
        
        if let v = buffer.breathing.inhaleExhaleRatio.last?.value { 
            ieText = String(format: "%.2f", v) 
        }
        
        if let v = buffer.breathing.amplitude.last?.value { 
            ampText = String(format: "%.2f", v) 
        }
        
        if let v = buffer.bloodPressure.phasic.last?.value { 
            bpText = String(format: "%.1f", v) 
        }
        
        if let lastApnea = buffer.breathing.apnea.last {
            apneaText = lastApnea.detected ? "DETECTED" : "Normal"
        }
        
        if isSpotMode && pulseText != "--" && !hasSentData && wasRecording {
            hasSentData = true
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                self.sendManualReport()
                self.wasRecording = false
                self.spotScanBuffer = nil
                self.spotScanStartTime = nil
            }
        }
    }

    private func sendBuffer(_ buffer: Presage_Physiology_MetricsBuffer) {
        let pulseData = buffer.pulse.rate.map { Double($0.value) }
        let breathData = buffer.breathing.rate.map { Double($0.value) }
        let ieData = buffer.breathing.inhaleExhaleRatio.map { Double($0.value) }
        let ampData = buffer.breathing.amplitude.map { Double($0.value) }
        let bpData = buffer.bloodPressure.phasic.map { Double($0.value) }
        
        var apneaData: [Double] = []
        if buffer.breathing.apnea.isEmpty {
            if !breathData.isEmpty {
                apneaData = [0.0]
            }
        } else {
            apneaData = buffer.breathing.apnea.map { $0.detected ? 1.0 : 0.0 }
        }
        
        sendScan(pulse: pulseData, breathing: breathData, ie_ratio: ieData, breath_amp: ampData, blood_pressure: bpData, apnea: apneaData)
    }

    private func sendScan(pulse: [Double], breathing: [Double], ie_ratio: [Double], breath_amp: [Double], blood_pressure: [Double], apnea: [Double]) {
        struct ScanData: Encodable {
            let pulse: [Double]
            let breathing: [Double]
            let ie_ratio: [Double]
            let breath_amp: [Double]
            let blood_pressure: [Double]
            let apnea: [Double]
        }
        struct ScanMessage: Encodable {
            let type: String
            let data: ScanData
        }
        
        print("📤 SENDING DATA:")
        print("   Pulse: \(pulse)")
        print("   Breathing: \(breathing)")
        print("   I/E Ratio: \(ie_ratio)")
        print("   Amplitude: \(breath_amp)")
        print("   BP: \(blood_pressure)")
        print("   Apnea: \(apnea)")
        
        let data = ScanData(pulse: pulse, breathing: breathing, ie_ratio: ie_ratio, breath_amp: breath_amp, blood_pressure: blood_pressure, apnea: apnea)
        let message = ScanMessage(type: "scan", data: data)
        
        WebSocketManager.shared.send(data: message)
    }
    
    private func sendManualReport() {
        var pulseVal: [Double] = []
        var breathVal: [Double] = []
        var ieVal: [Double] = []
        var ampVal: [Double] = []
        var bpVal: [Double] = []
        var apneaVal: [Double] = [0.0]
        
        if let p = Double(pulseText), pulseText != "--" {
            pulseVal = [p]
        }
        if let b = Double(breathText), breathText != "--" {
            breathVal = [b]
        }
        if let ie = Double(ieText), ieText != "--" {
            ieVal = [ie]
        }
        if let amp = Double(ampText), ampText != "--" {
            ampVal = [amp]
        }
        if let bp = Double(bpText), bpText != "--" {
            bpVal = [bp]
        }
        if apneaText == "DETECTED" {
            apneaVal = [1.0]
        }
        
        if pulseVal.isEmpty && breathVal.isEmpty && ieVal.isEmpty && ampVal.isEmpty && bpVal.isEmpty {
            pulseVal = [0.0]
            breathVal = [0.0]
        }
        
        sendScan(pulse: pulseVal, breathing: breathVal, ie_ratio: ieVal, breath_amp: ampVal, blood_pressure: bpVal, apnea: apneaVal)
    }
}
