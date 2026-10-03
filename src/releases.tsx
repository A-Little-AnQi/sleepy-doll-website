import {createContext,useContext,useEffect,useState,type ReactNode} from 'react';
import {releasesUrl} from './site';

export interface Release {version:string;channel:'test'|'stable';url:string;size:number;sha256:string;notes:string;publishedAt:string}
const ReleaseContext=createContext<{release:Release|null;loading:boolean}>({release:null,loading:true});

function valid(value:unknown):value is Release {
  const item=value as Partial<Release>;
  if(!item||typeof item.version!=='string'||!/^\d+\.\d+\.\d+$/.test(item.version)||typeof item.url!=='string'||typeof item.size!=='number'||item.size<=0||!['test','stable'].includes(item.channel??''))return false;
  try {const url=new URL(item.url);return url.protocol==='https:'&&url.hostname==='sleepy-doll-download.restless-nh3.com'&&url.pathname===`/releases/${item.version}/Sleepy-Doll-${item.version}-setup.exe`;}catch{return false;}
}

export function ReleaseProvider({children}:{children:ReactNode}) {
  const [state,setState]=useState<{release:Release|null;loading:boolean}>({release:null,loading:true});
  useEffect(()=>{const controller=new AbortController();let active=true;void(async()=>{
    for(const channel of ['stable','test']){
      const response=await fetch(`/api/releases/${channel}`,{signal:controller.signal});
      if(response.status===404)continue;if(!response.ok)throw Error('版本信息暂不可用');
      const value:unknown=await response.json();if(!valid(value))throw Error('版本信息格式不正确');
      if(active)setState({release:value,loading:false});return;
    }
    if(active)setState({release:null,loading:false});
  })().catch(()=>{if(active)setState({release:null,loading:false});});return()=>{active=false;controller.abort();};},[]);
  return <ReleaseContext.Provider value={state}>{children}</ReleaseContext.Provider>;
}
export function useRelease(){return useContext(ReleaseContext);}

export function recordEvent(event:'page_view'|'download_click',release:Release|null) {
  if(localStorage.getItem('sleepy-analytics-consent')!=='yes'||!release)return;
  const clientId=localStorage.getItem('sleepy-analytics-id')||crypto.randomUUID();localStorage.setItem('sleepy-analytics-id',clientId);
  const route=location.hash.startsWith('#/docs')?location.hash.slice(1).split('#')[0]:'/';
  void fetch('/api/events',{method:'POST',headers:{'Content-Type':'application/json'},keepalive:true,body:JSON.stringify({event,clientId,version:release.version,channel:release.channel,platform:'web',sessionId:Math.floor(Date.now()/1000),pagePath:route})}).catch(()=>{});
}

export function DownloadButton({className,label}:{className?:string;label?:string}) {
  const {release,loading}=useRelease();
  return <a className={className} href={release?.url??releasesUrl} onClick={()=>recordEvent('download_click',release)}>
    {loading?'读取版本…':release?(label??`下载${release.channel==='test'?'测试版':'Windows'}`):'查看发布记录 ↗'}
  </a>;
}

export function AnalyticsPreference() {
  const {release}=useRelease();
  const [enabled,setEnabled]=useState(()=>localStorage.getItem('sleepy-analytics-consent')==='yes');
  useEffect(()=>{if(!enabled||!release)return;recordEvent('page_view',release);const onHash=()=>recordEvent('page_view',release);window.addEventListener('hashchange',onHash);return()=>window.removeEventListener('hashchange',onHash);},[enabled,release]);
  return <button className="footer-analytics" type="button" title="Google Analytics，仅统计访问和下载点击" onClick={()=>{const next=!enabled;localStorage.setItem('sleepy-analytics-consent',next?'yes':'no');setEnabled(next);}}>匿名统计：{enabled?'开启':'关闭'}</button>;
}
