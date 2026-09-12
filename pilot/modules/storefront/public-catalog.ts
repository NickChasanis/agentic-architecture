export type PublicProduct={id:string;title:string;description:string;price:{amountMinor:number;currency:'EUR'}};
export type StorefrontCard={id:string;title:string;description:string;price:string};

export function renderPublicCatalogCard(product:PublicProduct):StorefrontCard{
 const keys=Object.keys(product).sort();
 if(keys.join(',')!=='description,id,price,title')throw new Error('public catalog contract violation');
 if(product.price.currency!=='EUR'||!Number.isInteger(product.price.amountMinor)||product.price.amountMinor<0)
  throw new Error('public catalog contract violation');
 return {id:product.id,title:product.title,description:product.description,
  price:new Intl.NumberFormat('en-IE',{style:'currency',currency:'EUR'}).format(product.price.amountMinor/100)};
}
