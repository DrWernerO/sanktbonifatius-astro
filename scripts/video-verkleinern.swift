// Video für den Rundgang (Geschichten) klein rechnen: feste Größe und Bitrate, H.264 + AAC (mono, 48 kbit/s),
// damit es unter der 1-MB-Grenze des Pre-Push-Hooks bleibt. Nur macOS (AVFoundation), kein ffmpeg nötig.
// Aufruf:  swift scripts/video-verkleinern.swift <eingabe.mov> <ausgabe.mp4> <breite> <höhe> <videoBitrate>
// Beispiel: swift scripts/video-verkleinern.swift Werner.MOV werner.mp4 640 360 330000   (18 s → 870 KB)
// Faustregel: Bitrate ≈ 7 000 000 / Sekunden Länge – 50 000.
import AVFoundation

let a = CommandLine.arguments
let ein = URL(fileURLWithPath: a[1]), aus = URL(fileURLWithPath: a[2])
let breite = Int(a[3])!, hoehe = Int(a[4])!, bitrate = Int(a[5])!
try? FileManager.default.removeItem(at: aus)

let asset = AVURLAsset(url: ein)
let leser = try AVAssetReader(asset: asset)
let schreiber = try AVAssetWriter(outputURL: aus, fileType: .mp4)
schreiber.shouldOptimizeForNetworkUse = true

let vSpur = asset.tracks(withMediaType: .video)[0]
let vAus = AVAssetReaderTrackOutput(track: vSpur, outputSettings: [kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_420YpCbCr8BiPlanarVideoRange])
leser.add(vAus)
let vEin = AVAssetWriterInput(mediaType: .video, outputSettings: [
  AVVideoCodecKey: AVVideoCodecType.h264, AVVideoWidthKey: breite, AVVideoHeightKey: hoehe,
  AVVideoScalingModeKey: AVVideoScalingModeResizeAspectFill,
  AVVideoCompressionPropertiesKey: [AVVideoAverageBitRateKey: bitrate, AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel, AVVideoMaxKeyFrameIntervalKey: 60],
])
vEin.transform = vSpur.preferredTransform
vEin.expectsMediaDataInRealTime = false
schreiber.add(vEin)

var aAus: AVAssetReaderTrackOutput? = nil, aEin: AVAssetWriterInput? = nil
if let aSpur = asset.tracks(withMediaType: .audio).first {
  aAus = AVAssetReaderTrackOutput(track: aSpur, outputSettings: [AVFormatIDKey: kAudioFormatLinearPCM])
  leser.add(aAus!)
  aEin = AVAssetWriterInput(mediaType: .audio, outputSettings: [AVFormatIDKey: kAudioFormatMPEG4AAC, AVNumberOfChannelsKey: 1, AVSampleRateKey: 44100, AVEncoderBitRateKey: 48000])
  schreiber.add(aEin!)
}

leser.startReading(); schreiber.startWriting(); schreiber.startSession(atSourceTime: .zero)
let gruppe = DispatchGroup()
func pumpe(_ ein: AVAssetWriterInput, _ aus: AVAssetReaderTrackOutput, _ q: String) {
  gruppe.enter()
  ein.requestMediaDataWhenReady(on: DispatchQueue(label: q)) {
    while ein.isReadyForMoreMediaData {
      if let p = aus.copyNextSampleBuffer() { ein.append(p) } else { ein.markAsFinished(); gruppe.leave(); return }
    }
  }
}
pumpe(vEin, vAus, "v")
if let e = aEin, let o = aAus { pumpe(e, o, "a") }
gruppe.wait()
let fertig = DispatchSemaphore(value: 0)
schreiber.finishWriting { fertig.signal() }
fertig.wait()
print(schreiber.status == .completed ? "ok" : "Fehler: \(String(describing: schreiber.error))")
