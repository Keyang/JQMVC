#!/usr/bin/env python

import re;
import cStringIO;
import os;
import subprocess;
import sys;
import urllib2;


PATH_PREFIX = "";
YUI_COMPRESSOR_PATH = "../lib/yui.jar";
SCRIPT_PATTERN = re.compile(r"(<script)(.*?)(src=)([\"|'])(.*?)([\"|'])(.*?)(>(</script>)?)");
CSS_PATTERN = re.compile(r"(<link)(.*?)(href=)([\"|'])(.*?)([\"|'])(.*?)(>)");
IGNORE_PATTERN = re.compile(r"(<!--BEGIN-FH-IGNORE-->)(.*?)(<!--END-FH-IGNORE-->)", re.DOTALL);
INDEX_DEV_FILE = "/index-dev.html";
JS_HTTP = [];
EXPORTED_PATH="../bin";
MERGED_FILE="jqmvc_debug";
MINIFIED_FILE="jqmvc.min";

def readIndexFile():
  indexFilePath = PATH_PREFIX + INDEX_DEV_FILE;
  indexFile = open(indexFilePath, 'r');
  fileContent = indexFile.read();
  findIgnore(fileContent);
  fileContent = IGNORE_PATTERN.sub("", fileContent);  
  findScripts(fileContent);
  #findCss(fileContent);
  #addReferences(fileContent);

def findScripts(content):
  m = SCRIPT_PATTERN.findall(content);
  scripts = [];
  if len(m) > 0:
    for match in m:
      script = match[4];
      print("Found "  + script);
      if script.startswith('http'):
        global JS_HTTP;
        JS_HTTP.append(script);
      else:
        scripts.append(script);
  
  mergeScripts(scripts);
      
      
def findCss(content):
  m = CSS_PATTERN.findall(content);
  csses = [];
  if len(m) > 0:
    for match in m:
      css = match[4];
      print("Found " + css);
      csses.append(css);
  
  mergeCsses(csses);


def findIgnore(content):
  print("Start FindIgnore");
  m = IGNORE_PATTERN.findall(content);
  if len(m) > 0:
    for match in m:
      css = match[1];
      #print("Found " + css);
 
def mergeScripts(fileList):
  mergeFiles(fileList, 'js');
  
def mergeCsses(fileList):
  mergeFiles(fileList, 'css');
  
def mergeFiles(fileList, type):
  stringBuffer = cStringIO.StringIO();
  for filePath in fileList:
    if not filePath.startswith("http"):
      try:
        filePath = PATH_PREFIX + "/" + filePath;
        if os.path.exists(filePath):
          print("merge " + filePath);
          file = open(filePath, 'r');
          fileContent = file.read();
          stringBuffer.write(fileContent);
        else:
          print("File " + filePath + " does not exist.");
      except:
        print("Can not load file : " + filePath);
    else:
      print("Get script over HTTP: " + filePath);
      req = urllib2.Request(url=filePath);
      res = urllib2.urlopen(req, timeout=150);
      content = res.read();
      stringBuffer.write(content);
  
  mergedFilePath  = EXPORTED_PATH + "/"+MERGED_FILE+"." + type;
  if os.path.exists(mergedFilePath):
    os.remove(mergedFilePath);
  
  mergedFile = open(mergedFilePath, 'w');
  mergedFile.write(stringBuffer.getvalue());
  mergedFile.flush();
  mergedFile.close();
  stringBuffer.close();  
  print("all " + type + " files are merged : " + mergedFilePath);
  doMinify(mergedFilePath,type);
  
def doMinify(originFile,type):
  minifedFilePath = EXPORTED_PATH + "/"+MINIFIED_FILE+"." + type;
  if os.path.exists(minifedFilePath):
    os.remove(minifedFilePath);
    
  print('minified file path is ' + minifedFilePath);
  proc = subprocess.Popen(['java', '-jar', YUI_COMPRESSOR_PATH, '--type', type, '-o', minifedFilePath, originFile], stdout=subprocess.PIPE, stderr=subprocess.PIPE);
  out = proc.communicate();
  print(out);
    
def usage():
  print("build.py <PATH_TO_YUI_COMPRESSOR_JAR>");
  sys.exit(2);
  
def main():
  global YUI_COMPRESSOR_PATH;
  if not os.path.exists(YUI_COMPRESSOR_PATH):
    print("Can not find file " + YUI_COMPRESSOR_PATH);
    sys.exit(2);
  if len(sys.argv)!=2:
      print("Usage: pythong build.py {core|plugin}");
      sys.exit(3);
  
  global PATH_PREFIX;
  PATH_PREFIX='../'+sys.argv[1];
  print ("Start to build folder:"+PATH_PREFIX);
  readIndexFile();
  
  
if __name__ == '__main__':
  main()
