import Foundation
import AVFoundation
import Vision
import CoreImage

let input=URL(fileURLWithPath:CommandLine.arguments[1])
let output=URL(fileURLWithPath:CommandLine.arguments[2])
try? FileManager.default.removeItem(at:output)
let asset=AVURLAsset(url:input)
guard let track=asset.tracks(withMediaType:.video).first else { fatalError("No video") }
let size=track.naturalSize
let reader=try AVAssetReader(asset:asset)
let frames=AVAssetReaderTrackOutput(track:track,outputSettings:[kCVPixelBufferPixelFormatTypeKey as String:kCVPixelFormatType_32BGRA])
reader.add(frames)
let writer=try AVAssetWriter(outputURL:output,fileType:.mp4)
let channel=AVAssetWriterInput(mediaType:.video,outputSettings:[AVVideoCodecKey:AVVideoCodecType.h264,AVVideoWidthKey:Int(size.width),AVVideoHeightKey:Int(size.height),AVVideoCompressionPropertiesKey:[AVVideoAverageBitRateKey:4000000]])
writer.add(channel)
let adaptor=AVAssetWriterInputPixelBufferAdaptor(assetWriterInput:channel,sourcePixelBufferAttributes:[kCVPixelBufferPixelFormatTypeKey as String:kCVPixelFormatType_32BGRA,kCVPixelBufferWidthKey as String:Int(size.width),kCVPixelBufferHeightKey as String:Int(size.height),kCVPixelBufferIOSurfacePropertiesKey as String:[:]])
let context=CIContext(options:[.cacheIntermediates:false])
let request=VNGeneratePersonSegmentationRequest()
request.qualityLevel = .accurate
request.outputPixelFormat=kCVPixelFormatType_OneComponent8
let background=CIImage(color:CIColor(red:1,green:1,blue:1)).cropped(to:CGRect(origin:.zero,size:size))
let colorSpace=CGColorSpaceCreateDeviceRGB()
let insetRegions = CommandLine.arguments.count > 3 && CommandLine.arguments[3] == "views"
  ? [CGRect(x:0,y:290,width:110,height:155),CGRect(x:350,y:290,width:120,height:155)]
  : [CGRect(x:20,y:20,width:90,height:105),CGRect(x:385,y:20,width:70,height:105)]
let insetRequests = insetRegions.map { _ -> VNGeneratePersonSegmentationRequest in
  let r=VNGeneratePersonSegmentationRequest();r.qualityLevel = .accurate
  r.outputPixelFormat=kCVPixelFormatType_OneComponent8;return r
}
writer.shouldOptimizeForNetworkUse=true
writer.startWriting();writer.startSession(atSourceTime:.zero);reader.startReading()
var count=0
while let sample=frames.copyNextSampleBuffer() {
  try autoreleasepool {
    guard let buffer=CMSampleBufferGetImageBuffer(sample) else { return }
    let handler=VNImageRequestHandler(cvPixelBuffer:buffer,orientation:.up,options:[:])
    try handler.perform([request])
    guard let matte=request.results?.first?.pixelBuffer else { fatalError("No segmentation") }
    let original=CIImage(cvPixelBuffer:buffer)
    var mask=CIImage(cvPixelBuffer:matte)
    mask=mask.transformed(by:CGAffineTransform(scaleX:size.width/mask.extent.width,y:size.height/mask.extent.height))
    for (index, rect) in insetRegions.enumerated() {
      let inset=original.cropped(to:rect).transformed(by:CGAffineTransform(translationX:-rect.minX,y:-rect.minY)).transformed(by:CGAffineTransform(scaleX:4,y:4))
      try VNImageRequestHandler(ciImage:inset,orientation:.up,options:[:]).perform([insetRequests[index]])
      if let pixels=insetRequests[index].results?.first?.pixelBuffer {
        var insetMask=CIImage(cvPixelBuffer:pixels)
        insetMask=insetMask.transformed(by:CGAffineTransform(scaleX:rect.width/insetMask.extent.width,y:rect.height/insetMask.extent.height)).transformed(by:CGAffineTransform(translationX:rect.minX,y:rect.minY)).cropped(to:rect)
        mask=insetMask.composited(over:mask)
      }
    }
    mask=mask.applyingFilter("CIMorphologyMinimum",parameters:["inputRadius":1.5])
    let result=original.applyingFilter("CIBlendWithMask",parameters:[kCIInputBackgroundImageKey:background,kCIInputMaskImageKey:mask])
    while !channel.isReadyForMoreMediaData { Thread.sleep(forTimeInterval:0.002) }
    var destination:CVPixelBuffer?
    guard let pool=adaptor.pixelBufferPool else { fatalError("Missing writer pool") }
    CVPixelBufferPoolCreatePixelBuffer(nil,pool,&destination)
    context.render(result,to:destination!,bounds:CGRect(origin:.zero,size:size),colorSpace:colorSpace)
    guard adaptor.append(destination!,withPresentationTime:CMSampleBufferGetPresentationTimeStamp(sample)) else { fatalError("Write failed") }
    count += 1
  }
}
channel.markAsFinished()
let done=DispatchSemaphore(value:0)
writer.finishWriting { done.signal() }
done.wait()
if reader.status == .failed { throw reader.error! }
if writer.status == .failed { throw writer.error! }
print("Processed \(count) frames")
