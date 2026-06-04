
function money(num){return "$"+Number(num||0).toFixed(2)}
function pct(num){return Number(num||0).toFixed(1)+"%"}
function getValue(id){return parseFloat(document.getElementById(id)?.value)||0}
function getText(id){return (document.getElementById(id)?.value||"").trim()}
function setText(id,text){const el=document.getElementById(id);if(el)el.textContent=text}
function setHTML(id,html){const el=document.getElementById(id);if(el)el.innerHTML=html}

function switchTool(id){
  document.querySelectorAll(".tool-tab").forEach(b=>b.classList.remove("active"));
  document.querySelectorAll(".tool-panel").forEach(p=>p.classList.remove("active"));
  const btn=document.querySelector(`[data-tool="${id}"]`);
  const panel=document.getElementById(id);
  if(btn)btn.classList.add("active");
  if(panel)panel.classList.add("active");
  runAllCalculators();
}

function basicProfitNumbers(prefix=""){
  const price=getValue(prefix+"price");
  const shippingCharged=getValue(prefix+"shippingCharged");
  const productCost=getValue(prefix+"productCost");
  const shippingCost=getValue(prefix+"shippingCost");
  const packagingCost=getValue(prefix+"packagingCost");
  const listingFee=getValue(prefix+"listingFee");
  const transactionFee=getValue(prefix+"transactionFee")/100;
  const processingFee=getValue(prefix+"processingFee")/100;
  const fixedFee=getValue(prefix+"fixedFee");
  const offsiteFee=getValue(prefix+"offsiteFee")/100;
  const discount=getValue(prefix+"discount")/100;
  const adCost=getValue(prefix+"adCost");

  const discountedPrice=price*(1-discount);
  const revenue=discountedPrice+shippingCharged;
  const etsyTransaction=revenue*transactionFee;
  const paymentProcessing=revenue*processingFee+fixedFee;
  const offsiteAds=revenue*offsiteFee;
  const totalFees=listingFee+etsyTransaction+paymentProcessing+offsiteAds;
  const totalCosts=productCost+shippingCost+packagingCost+adCost;
  const profit=revenue-totalFees-totalCosts;
  const margin=revenue>0?(profit/revenue)*100:0;
  const breakEvenPrice = productCost + shippingCost + packagingCost + adCost + listingFee + fixedFee - shippingCharged;
  return {price,shippingCharged,productCost,shippingCost,packagingCost,listingFee,transactionFee,processingFee,fixedFee,offsiteFee,discount,adCost,revenue,totalFees,totalCosts,profit,margin,breakEvenPrice};
}

function calculateBasic(){
  if(!document.getElementById("price"))return;
  const n=basicProfitNumbers("");
  setText("revenue",money(n.revenue));setText("fees",money(n.totalFees));setText("costs",money(n.totalCosts));setText("profit",money(n.profit));setText("margin",pct(n.margin));
  const p=document.getElementById("profit"); if(p)p.className=n.profit>=0?"profit":"loss";
}

function calculateFee(){
  if(!document.getElementById("fee_price"))return;
  const n=basicProfitNumbers("fee_");
  setText("fee_totalRevenue",money(n.revenue));
  setText("fee_totalFees",money(n.totalFees));
  setText("fee_feeRate", n.revenue>0 ? pct((n.totalFees/n.revenue)*100) : "0%");
}

function calculateTargetPrice(){
  if(!document.getElementById("target_targetProfit"))return;
  const targetProfit=getValue("target_targetProfit");
  const productCost=getValue("target_productCost");
  const shippingCost=getValue("target_shippingCost");
  const packagingCost=getValue("target_packagingCost");
  const shippingCharged=getValue("target_shippingCharged");
  const listingFee=getValue("target_listingFee");
  const transactionFee=getValue("target_transactionFee")/100;
  const processingFee=getValue("target_processingFee")/100;
  const fixedFee=getValue("target_fixedFee");
  const offsiteFee=getValue("target_offsiteFee")/100;
  const discount=getValue("target_discount")/100;
  const adCost=getValue("target_adCost");
  const feeRate=transactionFee+processingFee+offsiteFee;
  const neededRevenue=(targetProfit+productCost+shippingCost+packagingCost+adCost+listingFee+fixedFee)/(1-feeRate);
  const recommendedPrice=Math.max(0,(neededRevenue-shippingCharged)/(1-discount));
  const finalRevenue=recommendedPrice*(1-discount)+shippingCharged;
  const totalFees=listingFee+fixedFee+(finalRevenue*feeRate);
  const margin=finalRevenue>0?(targetProfit/finalRevenue)*100:0;
  setText("target_recommendedPrice",money(recommendedPrice));
  setText("target_revenue",money(finalRevenue));
  setText("target_fees",money(totalFees));
  setText("target_margin",pct(margin));
}

function calculateBreakEven(){
  if(!document.getElementById("be_productCost"))return;
  const productCost=getValue("be_productCost");
  const shippingCost=getValue("be_shippingCost");
  const packagingCost=getValue("be_packagingCost");
  const shippingCharged=getValue("be_shippingCharged");
  const listingFee=getValue("be_listingFee");
  const fixedFee=getValue("be_fixedFee");
  const feeRate=(getValue("be_transactionFee")+getValue("be_processingFee")+getValue("be_offsiteFee"))/100;
  const adCost=getValue("be_adCost");
  const breakEvenRevenue=(productCost+shippingCost+packagingCost+adCost+listingFee+fixedFee)/(1-feeRate);
  const breakEvenPrice=Math.max(0,breakEvenRevenue-shippingCharged);
  setText("be_price",money(breakEvenPrice));
  setText("be_revenue",money(breakEvenRevenue));
  setText("be_note",breakEvenPrice>0?"This is the estimated minimum item price before profit.":"Shipping charged covers the estimated break-even requirement.");
}

function calculateDiscount(){
  if(!document.getElementById("disc_price"))return;
  const n=basicProfitNumbers("disc_");
  setText("disc_revenue",money(n.revenue));
  setText("disc_profit",money(n.profit));
  setText("disc_margin",pct(n.margin));
  const p=document.getElementById("disc_profit"); if(p)p.className=n.profit>=0?"profit":"loss";
}

function calculateROI(){
  if(!document.getElementById("roi_price"))return;
  const n=basicProfitNumbers("roi_");
  const adSpend=getValue("roi_adCost");
  const roi = adSpend>0 ? (n.profit/adSpend)*100 : 0;
  setText("roi_profit",money(n.profit));
  setText("roi_roi", adSpend>0 ? pct(roi) : "No ad spend");
  setText("roi_margin",pct(n.margin));
}

function calculateBundle(){
  if(!document.getElementById("bundle_price"))return;
  const bundlePrice=getValue("bundle_price");
  const items=getValue("bundle_items");
  const costPerItem=getValue("bundle_costPerItem");
  const shippingCost=getValue("bundle_shippingCost");
  const packagingCost=getValue("bundle_packagingCost");
  const shippingCharged=getValue("bundle_shippingCharged");
  const listingFee=getValue("bundle_listingFee");
  const fixedFee=getValue("bundle_fixedFee");
  const feeRate=(getValue("bundle_transactionFee")+getValue("bundle_processingFee")+getValue("bundle_offsiteFee"))/100;
  const revenue=bundlePrice+shippingCharged;
  const fees=listingFee+fixedFee+(revenue*feeRate);
  const costs=(items*costPerItem)+shippingCost+packagingCost;
  const profit=revenue-fees-costs;
  const margin=revenue>0?(profit/revenue)*100:0;
  const perItemProfit=items>0?profit/items:0;
  setText("bundle_profit",money(profit));
  setText("bundle_margin",pct(margin));
  setText("bundle_perItem",money(perItemProfit));
}

function runAdvisor(){
  if(!document.getElementById("advisor_product"))return;
  const name=getText("advisor_product") || "your product";
  const price=getValue("advisor_price");
  const competitor=getValue("advisor_competitor");
  const targetMargin=getValue("advisor_targetMargin");
  const n=basicProfitNumbers("advisor_");
  let score=70;
  let issues=[];
  let actions=[];
  if(n.profit<=0){score-=45;issues.push("This product appears to lose money or break even.");actions.push("Raise the price, lower costs, or remove the discount before listing.");}
  if(n.margin<15){score-=25;issues.push("The profit margin is very thin.");actions.push("Aim for a higher margin so refunds, shipping changes, and discounts do not erase profit.");}
  else if(n.margin<30){score-=10;issues.push("The margin is workable but may be fragile.");actions.push("Test a slightly higher price or reduce packaging/shipping cost.");}
  if(competitor>0 && price>competitor*1.25){score-=8;issues.push("Your price is much higher than the competitor reference.");actions.push("Make sure your photos, description, materials, and positioning justify the higher price.");}
  if(competitor>0 && price<competitor*.85){score-=10;issues.push("Your price is much lower than the competitor reference.");actions.push("You may be underpricing. Check whether you can raise price closer to the market.");}
  if(targetMargin>0 && n.margin<targetMargin){score-=12;issues.push("Your margin is below your target margin.");actions.push("Use the Target Price Calculator to find a better selling price.");}
  if(n.discount>0.2){score-=8;issues.push("The discount is heavy and may damage profit.");actions.push("Recalculate sale pricing before running promotions.");}
  score=Math.max(5,Math.min(98,score));
  const statusClass=score<45?"advisor-warning":score<72?"advisor-mid":"";
  const headline=score<45?"High risk pricing":score<72?"Needs improvement":"Healthy pricing";
  if(!issues.length){issues.push("The product looks reasonably priced based on the numbers entered.");actions.push("Consider testing this price and reviewing real order data after a few sales.");}
  const suggestedPrice = recommendAdvisorPrice(n, targetMargin);
  setHTML("advisor_result", `
    <div class="advisor-score ${statusClass}">${headline} · Score ${score}/100</div>
    <div class="kpi-grid">
      <div class="kpi"><span>Estimated Profit</span><strong>${money(n.profit)}</strong></div>
      <div class="kpi"><span>Profit Margin</span><strong>${pct(n.margin)}</strong></div>
      <div class="kpi"><span>Suggested Price</span><strong>${money(suggestedPrice)}</strong></div>
    </div>
    <h3>Advisor notes for ${escapeHTML(name)}</h3>
    <ul>${issues.map(x=>`<li>${escapeHTML(x)}</li>`).join("")}</ul>
    <h3>Recommended actions</h3>
    <ul>${actions.map(x=>`<li>${escapeHTML(x)}</li>`).join("")}</ul>
  `);
}
function recommendAdvisorPrice(n,targetMargin){
  const target = targetMargin>0 ? targetMargin/100 : 0.3;
  const feeRate=n.transactionFee+n.processingFee+n.offsiteFee;
  const fixedCosts=n.productCost+n.shippingCost+n.packagingCost+n.adCost+n.listingFee+n.fixedFee;
  const neededRevenue=fixedCosts/(1-feeRate-target);
  if(!isFinite(neededRevenue) || neededRevenue<0) return n.price*1.15;
  return Math.max(0,(neededRevenue-n.shippingCharged)/(1-n.discount));
}
function escapeHTML(str){return String(str).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]));}

function runAllCalculators(){
  calculateBasic();calculateFee();calculateTargetPrice();calculateBreakEven();calculateDiscount();calculateROI();calculateBundle();calculatePro();runAdvisor();
}

function unlockPro(){
  const code=document.getElementById("license")?.value.trim();
  if(code==="DEMO-PRO-2026"){localStorage.setItem("craftprofitcalc_pro","true");checkUnlock();}
  else{alert("Invalid demo license. Use DEMO-PRO-2026 for testing.");}
}
function checkUnlock(){
  const unlocked=localStorage.getItem("craftprofitcalc_pro")==="true";
  document.querySelectorAll(".pro-only").forEach(el=>el.classList.toggle("hidden",!unlocked));
  document.querySelectorAll(".locked-only").forEach(el=>el.classList.toggle("hidden",unlocked));
}
function lockPro(){localStorage.removeItem("craftprofitcalc_pro");checkUnlock();}
function calculatePro(){ calculateTargetPrice(); }
function exportCSV(){
  const rows=[["Metric","Value"],["Recommended Price",document.getElementById("target_recommendedPrice")?.textContent||""],["Total Revenue",document.getElementById("target_revenue")?.textContent||""],["Estimated Fees",document.getElementById("target_fees")?.textContent||""],["Target Margin",document.getElementById("target_margin")?.textContent||""]];
  const csv=rows.map(r=>r.map(v=>`"${v}"`).join(",")).join("\n");
  const blob=new Blob([csv],{type:"text/csv"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="etsy-pricing-result.csv";a.click();
}
function saveProduct(){
  const item={name:document.getElementById("target_productName")?.value||"Untitled product",price:document.getElementById("target_recommendedPrice")?.textContent||"$0.00",date:new Date().toLocaleDateString()};
  const saved=JSON.parse(localStorage.getItem("craft_products")||"[]");saved.push(item);localStorage.setItem("craft_products",JSON.stringify(saved));renderProducts();
}
function renderProducts(){
  const box=document.getElementById("savedProducts"); if(!box)return;
  const saved=JSON.parse(localStorage.getItem("craft_products")||"[]");
  box.innerHTML=saved.length?saved.map(x=>`<div class="result"><span>${escapeHTML(x.name)}<br><small>${x.date}</small></span><strong>${x.price}</strong></div>`).join(""):"<p class='muted'>No saved products yet.</p>";
}
function autoUnlockFromStripeSuccess(){
  const params=new URLSearchParams(window.location.search);
  if(params.get("checkout")==="success" || params.get("pro")==="unlocked" || window.location.pathname.includes("success.html")){
    localStorage.setItem("craftprofitcalc_pro","true");
  }
}
document.addEventListener("input",e=>{if(e.target.matches("input,textarea"))runAllCalculators();});
document.addEventListener("DOMContentLoaded",()=>{autoUnlockFromStripeSuccess();checkUnlock();runAllCalculators();renderProducts();});
