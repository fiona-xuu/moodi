import Foundation
import Combine

class WebSocketManager: ObservableObject {
    static let shared = WebSocketManager()
    private var webSocketTask: URLSessionWebSocketTask?
    private let url = URL(string: "ws://172.20.10.2:8080")! 
    
    @Published var isConnected = false
    
    private init() {}
    
    func connect() {
        guard !isConnected else { return }
        
        let session = URLSession(configuration: .default)
        webSocketTask = session.webSocketTask(with: url)
        webSocketTask?.resume()
        isConnected = true
        receiveMessage()
        print("WebSocket connecting to \(url)")
    }
    
    func disconnect() {
        webSocketTask?.cancel(with: .goingAway, reason: nil)
        isConnected = false
        print("WebSocket disconnected")
    }
    
    func send(message: String) {
        guard isConnected else { return }
        
        let message = URLSessionWebSocketTask.Message.string(message)
        webSocketTask?.send(message) { [weak self] error in
            if let error = error {
                print("WebSocket sending error: \(error)")
                DispatchQueue.main.async {
                    self?.isConnected = false
                }
            }
        }
    }
    
    func send<T: Encodable>(data: T) {
        guard isConnected else {
            print("WebSocketManager: Not connected, skipping send.")
            return 
        }
        
        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            guard let self = self else { return }
            do {
                let jsonData = try JSONEncoder().encode(data)
                if let jsonString = String(data: jsonData, encoding: .utf8) {
                    self.send(message: jsonString)
                }
            } catch {
                print("Error encoding data: \(error)")
            }
        }
    }
    
    private func receiveMessage() {
        webSocketTask?.receive { [weak self] result in
            guard let self = self else { return }
            switch result {
            case .failure(let error):
                print("WebSocket receive error: \(error)")
                DispatchQueue.main.async {
                    self.isConnected = false
                    print("Attempting to reconnect in 3s...")
                    DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
                        self.connect()
                    }
                }
            case .success(let message):
                switch message {
                case .string(let text):
                    print("Received string: \(text)")
                case .data(let data):
                    print("Received data: \(data)")
                @unknown default:
                    break
                }
                self.receiveMessage()
            }
        }
    }
}
