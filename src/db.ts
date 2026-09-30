import { openDB } from 'idb'; import type { Backup,Preferences } from './types';
const names=['medicines','lots','doses','adjustments'] as const; const dbp=openDB('medicine-stock',1,{upgrade(db){names.forEach(n=>db.createObjectStore(n,{keyPath:'id'}));db.createObjectStore('settings');}});
export const defaults:Preferences={orderDays:14,attentionDays:30,suppressed:{}};
export async function load():Promise<Backup>{const db=await dbp; const [medicines,lots,doses,adjustments,preferences]=await Promise.all([...names.map(n=>db.getAll(n)),db.get('settings','preferences')]);return {medicines,lots,doses,adjustments,preferences:preferences??defaults} as Backup;}
export async function save(b:Backup){const db=await dbp;const tx=db.transaction([...names,'settings'],'readwrite');for(const n of names){await tx.objectStore(n).clear();for(const row of b[n])await tx.objectStore(n).put(row);}await tx.objectStore('settings').put(b.preferences,'preferences');await tx.done;}
export async function replace(b:Backup){await save(b)}
