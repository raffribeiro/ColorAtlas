import Cocoa
import WebKit

final class DataStore {
 let directory:URL
 init(_ directory:URL)throws{self.directory=directory;try FileManager.default.createDirectory(at:directory,withIntermediateDirectories:true)}
 func read(_ file:String)throws->[String:Any]{let url=directory.appendingPathComponent(file);guard FileManager.default.fileExists(atPath:url.path) else{return [:]};let data=try Data(contentsOf:url);guard let obj=try JSONSerialization.jsonObject(with:data) as? [String:Any] else{throw NSError(domain:"Invalid Data file",code:1)};return obj}
 func write(_ file:String,_ obj:[String:Any])throws{let data=try JSONSerialization.data(withJSONObject:obj,options:[.sortedKeys]);try data.write(to:directory.appendingPathComponent(file),options:.atomic)}
 func run(_ action:String,_ payload:Any)throws->Any{
  let p=payload as? [String:Any] ?? [:]
  if action.hasPrefix("settings-"){var settings=try read("settings.json");guard let key=p["key"] as? String,key.count<1024 else{throw NSError(domain:"Invalid settings key",code:1)}
   if action=="settings-set"{guard let value=p["value"] as? String,value.utf8.count<=32768 else{throw NSError(domain:"Invalid settings",code:1)};settings[key]=value}else if action=="settings-delete"{settings.removeValue(forKey:key)}else{throw NSError(domain:"Unknown action",code:1)}
   try write("settings.json",settings);return NSNull()
  }
  var document=try read("preview.json"),presets=document["presets"] as? [[String:Any]] ?? []
  let id=p["id"] as? String ?? ""
  if action.hasPrefix("preset-") && action != "preset-list"{guard !id.isEmpty,id.count<=64,id.range(of:"^[A-Za-z0-9-]+$",options:.regularExpression) != nil else{throw NSError(domain:"Invalid preset ID",code:1)}}
  switch action{
  case "read":return document["stack"] ?? NSNull()
  case "write":guard let stack=payload as? [String:Any],stack["version"] as? Int==1 else{throw NSError(domain:"Invalid scene",code:1)};document["stack"]=stack
  case "preset-list":return presets.map{["id":$0["id"] ?? "","name":$0["name"] ?? ""]}
  case "preset-read":return presets.first{($0["id"] as? String)==id}?["doc"] ?? NSNull()
  case "preset-save":guard let name=p["name"] as? String,!name.trimmingCharacters(in:.whitespacesAndNewlines).isEmpty,name.count<=64,let doc=p["doc"] as? [String:Any],doc["version"] as? Int==1,let layers=doc["layers"] as? [Any],layers.count<=8 else{throw NSError(domain:"Invalid preset",code:1)};presets.removeAll{($0["id"] as? String)==id};presets.append(p);document["presets"]=presets
  case "preset-delete":presets.removeAll{($0["id"] as? String)==id};document["presets"]=presets
  default:throw NSError(domain:"Unknown Data action",code:1)
  }
  let size=try JSONSerialization.data(withJSONObject:document).count;guard size<=128*1024*1024 else{throw NSError(domain:"Data exceeds 128 MB",code:1)};try write("preview.json",document);return NSNull()
 }
}
final class App:NSObject,NSApplicationDelegate,WKScriptMessageHandler,WKNavigationDelegate,WKDownloadDelegate{
 var window:NSWindow!,web:WKWebView!,store:DataStore!
 func applicationDidFinishLaunching(_ n:Notification){
  do{
   let directory=Bundle.main.bundleURL.deletingLastPathComponent().appendingPathComponent("Data",isDirectory:true);store=try DataStore(directory)
   let controller=WKUserContentController();controller.add(self,name:"atlas")
   let initial=try JSONSerialization.data(withJSONObject:store.read("settings.json"),options:[.sortedKeys]);let js="window.AtlasDesktopInitial="+String(data:initial,encoding:.utf8)!+";"
   controller.addUserScript(WKUserScript(source:js,injectionTime:.atDocumentStart,forMainFrameOnly:true))
   let config=WKWebViewConfiguration();config.userContentController=controller;web=WKWebView(frame:.zero,configuration:config);web.navigationDelegate=self
   window=NSWindow(contentRect:NSRect(x:0,y:0,width:1400,height:900),styleMask:[.titled,.closable,.miniaturizable,.resizable],backing:.buffered,defer:false);window.title="Color Atlas v"+(Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "0.10");window.contentView=web;window.center();window.makeKeyAndOrderFront(nil)
   let url=Bundle.main.url(forResource:"COLOR_ATLAS_START_HERE",withExtension:"html")!;web.loadFileURL(url,allowingReadAccessTo:url.deletingLastPathComponent());NSApp.activate(ignoringOtherApps:true)
  }catch{let alert=NSAlert();alert.messageText="Color Atlas could not open Data";alert.informativeText=error.localizedDescription;alert.runModal();NSApp.terminate(nil)}
 }
 func applicationShouldTerminateAfterLastWindowClosed(_ sender:NSApplication)->Bool{true}
 func userContentController(_ controller:WKUserContentController,didReceive message:WKScriptMessage){guard message.frameInfo.isMainFrame,let m=message.body as? [String:Any],let id=m["id"] as? String,let action=m["action"] as? String else{return};var value:Any=NSNull(),error:Any=NSNull();do{value=try store.run(action,m["payload"] ?? NSNull())}catch let e{error=e.localizedDescription};guard let data=try? JSONSerialization.data(withJSONObject:[id,value,error],options:[.fragmentsAllowed]),let json=String(data:data,encoding:.utf8) else{return};web.evaluateJavaScript("window.AtlasDesktopReply(..."+json+")",completionHandler:nil)}
 func webView(_ view:WKWebView,decidePolicyFor action:WKNavigationAction,decisionHandler:@escaping(WKNavigationActionPolicy)->Void){if action.shouldPerformDownload{decisionHandler(.download);return};if let url=action.request.url,["https","http"].contains(url.scheme ?? ""){NSWorkspace.shared.open(url);decisionHandler(.cancel);return};decisionHandler(.allow)}
 func webView(_ view:WKWebView,navigationAction:WKNavigationAction,didBecome download:WKDownload){download.delegate=self}
 func webView(_ view:WKWebView,navigationResponse:WKNavigationResponse,didBecome download:WKDownload){download.delegate=self}
 func download(_ download:WKDownload,decideDestinationUsing response:URLResponse,suggestedFilename:String,completionHandler:@escaping(URL?)->Void){let panel=NSSavePanel();panel.nameFieldStringValue=suggestedFilename;panel.beginSheetModal(for:window){result in completionHandler(result == .OK ? panel.url:nil)}}
}
if CommandLine.arguments.contains("--self-test"){
 do{let dir=FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString);defer{try? FileManager.default.removeItem(at:dir)};let s=try DataStore(dir);_ = try s.run("settings-set",["key":"editor","value":"test"]);_ = try s.run("preset-save",["id":"preset-test","name":"Test","doc":["version":1,"layers":[]]]);_ = try s.run("write",["version":1,"layers":[]]);let reopened=try DataStore(dir);let settings=try reopened.read("settings.json");assert(settings["editor"] as? String=="test");let list=try reopened.run("preset-list",NSNull()) as! [[String:Any]];assert(list.count==1);_ = try reopened.run("preset-delete",["id":"preset-test"]);let after=try reopened.run("preset-list",NSNull()) as! [[String:Any]];assert(after.isEmpty);print("PASS: native Data writes, reload, scene, settings, presets and deletion.")}catch{fputs("Self-test failed: \(error)\n",stderr);exit(1)}
}else{let app=NSApplication.shared;let delegate=App();app.delegate=delegate;app.setActivationPolicy(.regular);app.run()}
