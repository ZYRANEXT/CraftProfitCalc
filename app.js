
function money(num){ return "$" + Number(num || 0).toFixed(2); }
function pct(num){ return Number(num || 0).toFixed(1) + "%"; }
function getValue(id){ return parseFloat(document.getElementById(id)?.value) || 0; }
function setText(id, text){ const el = document.getElementById(id); if(el) el.textContent = text; }

function switchTool(id){
  document.querySelectorAll(".tool-tab").forEach(btn => btn.classList.remove("active"));
  document.querySelectorAll(".tool-panel").forEach(panel => panel.classList.remove("active"));

  const btn = document.querySelector('[data-tool="' + id + '"]');
  const panel = document.getElementById(id);

  if(btn) btn.classList.add("active");
  if(panel) panel.classList.add("active");

  calculateAllFree();
}

function calcNumbers(prefix){
  const price = getValue(prefix + "price");
  const shippingCharged = getValue(prefix + "shippingCharged");
  const productCost = getValue(prefix + "productCost");
  const shippingCost = getValue(prefix + "shippingCost");
  const packagingCost = getValue(prefix + "packagingCost");
  const listingFee = getValue(prefix + "listingFee");
  const transactionFee = getValue(prefix + "transactionFee") / 100;
  const processingFee = getValue(prefix + "processingFee") / 100;
  const fixedFee = getValue(prefix + "fixedFee");
  const offsiteFee = getValue(prefix + "offsiteFee") / 100;
  const adCost = getValue(prefix + "adCost");

  const revenue = price + shippingCharged;
  const fees = listingFee + fixedFee + revenue * (transactionFee + processingFee + offsiteFee);
  const costs = productCost + shippingCost + packagingCost + adCost;
  const profit = revenue - fees - costs;
  const margin = revenue > 0 ? profit / revenue * 100 : 0;

  return { price, shippingCharged, productCost, shippingCost, packagingCost, listingFee, fixedFee, adCost, revenue, fees, costs, profit, margin };
}

function calculateBasic(){
  const n = calcNumbers("");
  setText("revenue", money(n.revenue));
  setText("fees", money(n.fees));
  setText("costs", money(n.costs));
  setText("profit", money(n.profit));
  setText("margin", pct(n.margin));
  const p = document.getElementById("profit");
  if(p) p.className = n.profit >= 0 ? "profit" : "loss";
}

function calculateFee(){
  const n = calcNumbers("fee_");
  setText("fee_totalRevenue", money(n.revenue));
  setText("fee_totalFees", money(n.fees));
  setText("fee_feeRate", n.revenue > 0 ? pct(n.fees / n.revenue * 100) : "0%");
}

function calculateBreakEven(){
  const prefix = "be_";
  const productCost = getValue(prefix + "productCost");
  const shippingCost = getValue(prefix + "shippingCost");
  const packagingCost = getValue(prefix + "packagingCost");
  const shippingCharged = getValue(prefix + "shippingCharged");
  const listingFee = getValue(prefix + "listingFee");
  const fixedFee = getValue(prefix + "fixedFee");
  const adCost = getValue(prefix + "adCost");
  const feeRate = (getValue(prefix + "transactionFee") + getValue(prefix + "processingFee") + getValue(prefix + "offsiteFee")) / 100;

  const breakEvenRevenue = (productCost + shippingCost + packagingCost + adCost + listingFee + fixedFee) / Math.max(0.01, 1 - feeRate);
  const breakEvenPrice = Math.max(0, breakEvenRevenue - shippingCharged);

  setText("be_price", money(breakEvenPrice));
  setText("be_revenue", money(breakEvenRevenue));
  setText("be_note", "This is the estimated minimum item price before profit.");
}

function runAdvisor(){
  const box = document.getElementById("advisor_result");
  if(!box) return;

  const n = calcNumbers("advisor_");
  let score = 75;
  if(n.profit <= 0) score -= 45;
  if(n.margin < 15) score -= 25;
  else if(n.margin < 30) score -= 10;

  score = Math.max(5, Math.min(98, score));

  const cls = score < 45 ? "advisor-warning" : score < 72 ? "advisor-mid" : "";
  box.innerHTML = `
    <div class="advisor-score ${cls}">Pricing score · ${score}/100</div>
    <div class="kpi-grid">
      <div class="kpi"><span>Estimated profit</span><strong>${money(n.profit)}</strong></div>
      <div class="kpi"><span>Profit margin</span><strong>${pct(n.margin)}</strong></div>
      <div class="kpi"><span>Full advisor</span><strong>Pro</strong></div>
    </div>
    <div class="pro-lock-card">
      <h3>Unlock the full AI Pricing Advisor</h3>
      <p>Upgrade to see recommended price, margin analysis, and optimization suggestions.</p>
      <a class="button pulse-glow" href="https://buy.stripe.com/cNi8wQ9Q3dDy4FadjN7Vm05" target="_blank">Get Pro Lifetime - $29</a>
    </div>
  `;
}

function calculateAllFree(){
  calculateBasic();
  calculateFee();
  calculateBreakEven();
  runAdvisor();
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("input").forEach(input => {
    input.addEventListener("input", calculateAllFree);
  });
  calculateAllFree();
});
