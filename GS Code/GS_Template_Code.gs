function getSkrpt_(a){
try{
  var errHtml,f,h,i,L,rE,thisFile;
  
  h="";
  errHtml="";
  L = a.length;
  
  for (i=0;i<L;i++) {
    f=a[i];//one file
    //Logger.log('f: ' + f)
    
    try{
      thisFile = HtmlService.createHtmlOutputFromFile(f).getContent();
      
      //Logger.log('thisFile: ' + thisFile)
      //Logger.log('indexOf script 18: ' + thisFile.indexOf('<script>'));
    }catch(e) {
      thisFile = undefined;
    }
    if (!thisFile) {
      errHtml = errHtml + "<div>" + f + " missing - Add the file<div>";
      //zz8('There is no file for',f);
      continue;
    }
    
    h = h + thisFile;
  }
  
  //Logger.log('h: ' + h)
  //Logger.log('indexOf script 27: ' + h.indexOf('<script>'));
  
  rE = new RegExp("<" + "script>","g");
  h = h.replace(rE,"");//Replace all occurances of the tag

  rE = new RegExp("</" + "script>","g");
  h = h.replace(rE,"");  
  
  return '<' + 'script language="javascript">' + h + "</" + "script>" + errHtml;
}catch(e){
  return "<div>Error: " + e.message + "<div>";
};
};

function loadCSS_(arr) {
  var i,h,l;
  h="";
  l = arr.length;
  for (i=0;i<l;i++){
    h = h + HtmlService.createHtmlOutputFromFile(arr[i]).getContent();
  }
  
  return h;
};

