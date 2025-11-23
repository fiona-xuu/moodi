import SwiftUI
import SmartSpectraSwiftSDK

struct ContentView: View {
    @ObservedObject var sdk = SmartSpectraSwiftSDK.shared
    @ObservedObject var ws = WebSocketManager.shared

    @State private var pulseText = "--"
    @State private var breathText = "--"
    @State private var ieText = "--"
    @State private var ampText = "--"
    @State private var bpText = "--"
    @State private var apneaText = "--"
    @State private var isSpotMode = false

    init() {
        sdk.setApiKey(APIKeys.smartSpectraKey)
        
        // Enable controls again so user can see what's happening if needed
        sdk.showControlsInScreeningView(true)
        
        // Default measurement duration for Spot mode
        sdk.setMeasurementDuration(20.0)
    }

    var body: some View {
        ZStack(alignment: .topLeading) {
            SmartSpectraView()
                .onChange(of: sdk.metricsBuffer) { newBuffer in
                    guard let buffer = newBuffer else { return }
                    updateLocalMetrics(buffer)
                    logAndOptionallyStream(buffer)
                }
                .onAppear {
                    WebSocketManager.shared.connect()
                    // Default to Continuous
                    sdk.setSmartSpectraMode(.continuous)
                    if let buffer = sdk.metricsBuffer {
                        updateLocalMetrics(buffer)
                        logAndOptionallyStream(buffer)
                    }
                }
            
            VStack(alignment: .leading, spacing: 4) {
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
                
                Button(action: {
                    isSpotMode.toggle()
                    let mode: SmartSpectraMode = isSpotMode ? .spot : .continuous
                    sdk.setSmartSpectraMode(mode)
                    print("Switched to \(isSpotMode ? "Spot" : "Continuous") mode")
                }) {
                    Text("Mode: \(isSpotMode ? "Spot" : "Cont")")
                        .font(.system(size: 12, weight: .bold))
                        .padding(6)
                        .background(Color.blue)
                        .foregroundColor(.white)
                        .cornerRadius(6)
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
        if let v = buffer.pulse.rate.last?.value { pulseText = String(format: "%.1f", v) }
        if let v = buffer.breathing.rate.last?.value { breathText = String(format: "%.1f", v) }
        if let v = buffer.breathing.inhaleExhaleRatio.last?.value { ieText = String(format: "%.2f", v) }
        if let v = buffer.breathing.amplitude.last?.value { ampText = String(format: "%.2f", v) }
        if let v = buffer.bloodPressure.phasic.last?.value { bpText = String(format: "%.1f", v) }
        if let lastApnea = buffer.breathing.apnea.last {
            apneaText = lastApnea.detected ? "DETECTED" : "Normal"
        }
    }

    private func logAndOptionallyStream(_ buffer: Presage_Physiology_MetricsBuffer) {
        let debugMsg = "Buffer counts - Pulse: \(buffer.pulse.rate.count), Breath: \(buffer.breathing.rate.count), IE: \(buffer.breathing.inhaleExhaleRatio.count), Amp: \(buffer.breathing.amplitude.count), BP: \(buffer.bloodPressure.phasic.count), Apnea: \(buffer.breathing.apnea.count)"
        print(debugMsg)
        
        // Aggregate data for "scan" message
        let pulseData = buffer.pulse.rate.map { Double($0.value) }
        let breathData = buffer.breathing.rate.map { Double($0.value) }
        let ieData = buffer.breathing.inhaleExhaleRatio.map { Double($0.value) }
        let ampData = buffer.breathing.amplitude.map { Double($0.value) }
        let bpData = buffer.bloodPressure.phasic.map { Double($0.value) }
        
        var apneaData: [Double] = []
        if buffer.breathing.apnea.isEmpty && !buffer.breathing.rate.isEmpty {
            // If breathing detected but no apnea events, assume normal (0)
            apneaData = [0.0]
        } else {
            apneaData = buffer.breathing.apnea.map { $0.detected ? 1.0 : 0.0 }
        }
        
        // Only send if we have some data
        if !pulseData.isEmpty || !breathData.isEmpty {
            sendScan(pulse: pulseData, breathing: breathData, ie_ratio: ieData, breath_amp: ampData, blood_pressure: bpData, apnea: apneaData)
        }
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
        
        let data = ScanData(pulse: pulse, breathing: breathing, ie_ratio: ie_ratio, breath_amp: breath_amp, blood_pressure: blood_pressure, apnea: apnea)
        let message = ScanMessage(type: "scan", data: data)
        
        WebSocketManager.shared.send(data: message)
    }
}
