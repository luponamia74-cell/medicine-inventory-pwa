import type { Adjustment,Dose,Lot,Medicine,Preferences } from './types';
const DAY=86400000; export const dateKey=(d:Date)=>d.toISOString().slice(0,10); export const addDays=(s:string,n:number)=>dateKey(new Date(new Date(s+'T00:00:00Z').getTime()+n*DAY));
export const activeDose=(doses:Dose[], day:string)=>[...doses].filter(x=>x.effectiveFrom<=day).sort((a,b)=>b.effectiveFrom.localeCompare(a.effectiveFrom))[0];
/** Consumes older lots first; a real count adjustment becomes the new starting stock. */
export function forecast(lots:Lot[], doses:Dose[], adjustments:Adjustment[], from=dateKey(new Date())){
 let stock=[...lots].filter(x=>x.receivedAt<=from).sort((a,b)=>a.receivedAt.localeCompare(b.receivedAt)).map(x=>({...x,quantity:x.quantity}));
 const latest=[...adjustments].filter(x=>x.at<=from).sort((a,b)=>b.at.localeCompare(a.at))[0]; if(latest){stock=stock.length?[{...stock[0],quantity:latest.quantity}]:[{id:'adjustment',medicineId:'',receivedAt:latest.at,purchasedAt:latest.at,manufacturer:'',strengthMg:1,quantity:latest.quantity,price:0}];}
 let day=from; for(let guard=0;guard<36500;guard++,day=addDays(day,1)) { for(const l of lots.filter(x=>x.receivedAt===day && day!==from))stock.push({...l}); const dose=activeDose(doses,day); if(!dose||dose.mgPerDay<=0)return undefined; let need=dose.mgPerDay; for(const l of stock){const take=Math.min(l.quantity,need/l.strengthMg);l.quantity-=take;need-=take*l.strengthMg;} if(need>1e-7)return day; } return undefined;
}
export function currentCount(lots:Lot[], adjustments:Adjustment[], at=dateKey(new Date())){const a=[...adjustments].filter(x=>x.at<=at).sort((x,y)=>y.at.localeCompare(x.at))[0]; return a?a.quantity:lots.filter(x=>x.receivedAt<=at).reduce((n,x)=>n+x.quantity,0);}
export function spending(lots:Lot[], medicineId:string|undefined, from:string,to:string){return lots.filter(l=>(!medicineId||l.medicineId===medicineId)&&l.purchasedAt>=from&&l.purchasedAt<=to).reduce((n,l)=>n+l.price,0)}
export function status(m:Medicine,lots:Lot[],doses:Dose[],adjustments:Adjustment[],p:Preferences,today=dateKey(new Date())){const out=forecast(lots,doses,adjustments,today); const days=out?Math.ceil((new Date(out).getTime()-new Date(today).getTime())/DAY):Infinity; const muted=!!p.suppressed[m.id]; return {out,days,order:!muted&&!m.orderedAt&&days<=p.orderDays,attention:!muted&&days<=p.attentionDays&&!m.orderedAt};}
