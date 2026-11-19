export function themeScript(storageKey = "psg-theme"): string {
  const key = JSON.stringify(storageKey);
  const reread =
    "try{var v=ls.getItem(k);" +
    "if(v==='light'||v==='dark'){r.dataset.theme=v}else{delete r.dataset.theme}" +
    "}catch(_){}";
  return "(function(w,d,ls){" +
    "var k=" + key + ";" +
    "var r=d.documentElement;" +
    "try{var s=ls.getItem(k);" +
    "if(s==='light'||s==='dark'){r.dataset.theme=s}" +
    "}catch(_){}" +
    "w.addEventListener('pageshow',function(e){" +
    "if(!e.persisted)return;" + reread +
    "});" +
    "})";
}
