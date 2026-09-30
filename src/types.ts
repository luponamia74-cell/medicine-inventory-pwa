export type Medicine={id:string;name:string;identity:string;ended:boolean;orderedAt?:string;createdAt:string};
export type Lot={id:string;medicineId:string;purchasedAt:string;manufacturer:string;strengthMg:number;quantity:number;price:number;receivedAt:string};
export type Dose={id:string;medicineId:string;effectiveFrom:string;mgPerDay:number;display:string};
export type Adjustment={id:string;medicineId:string;at:string;quantity:number};
export type Preferences={orderDays:number;attentionDays:number;suppressed:Record<string,boolean>};
export type Backup={medicines:Medicine[];lots:Lot[];doses:Dose[];adjustments:Adjustment[];preferences:Preferences};
