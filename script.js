function evaluateEquation(expr, x) {
  return Function("x", "return " + expr)(x);
}

document.getElementById("bisectionForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const equation = document.getElementById("equation").value;
  let a = parseFloat(document.getElementById("a").value);
  let b = parseFloat(document.getElementById("b").value);
  const maxIter = parseInt(document.getElementById("maxIter").value);
  const tol = parseFloat(document.getElementById("tolerance").value);

  let result = "<h2>ผลการคำนวณ</h2>";
  let fa = evaluateEquation(equation, a);
  let fb = evaluateEquation(equation, b);

  if (fa * fb > 0) {
    result += "<p>f(a) และ f(b) ต้องมีเครื่องหมายต่างกัน</p>";
    document.getElementById("result").innerHTML = result;
    return;
  }

  let mid, fmid;

  // เตรียมข้อมูลสำหรับกราฟ
  let labels = [];
  let mids = [];
  let fvals = [];

  for (let i = 1; i <= maxIter; i++) {
    mid = (a + b) / 2;
    fmid = evaluateEquation(equation, mid);

    result += `<p>รอบ ${i}: mid = ${mid.toFixed(6)}, f(mid) = ${fmid.toFixed(6)}</p>`;

    labels.push("รอบ " + i);
    mids.push(mid);
    fvals.push(fmid);

    if (Math.abs(fmid) < tol) {
      result += `<p><b>คำตอบประมาณ = ${mid.toFixed(6)}</b></p>`;
      break;
    }

    if (fa * fmid < 0) {
      b = mid;
      fb = fmid;
    } else {
      a = mid;
      fa = fmid;
    }

    if (i === maxIter) {
      result += `<p><b>ถึงจำนวนรอบสูงสุดแล้ว: คำตอบประมาณ = ${mid.toFixed(6)}</b></p>`;
    }
  }

  document.getElementById("result").innerHTML = result;

  // วาดกราฟ
  const ctx = document.getElementById("bisectionChart").getContext("2d");

  // ลบกราฟเก่า (ถ้ามี)
  if (window.bisectionChart) {
    window.bisectionChart.destroy();
  }

  window.bisectionChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "ค่า mid",
          data: mids,
          borderColor: "blue",
          fill: false,
          yAxisID: 'y',
        },
        {
          label: "ค่า f(mid)",
          data: fvals,
          borderColor: "red",
          fill: false,
          yAxisID: 'y1',
        }
      ]
    },
    options: {
      responsive: true,
      interaction: { mode: "index", intersect: false },
      scales: {
        y: {
          type: 'linear',
          position: 'left',
          title: { display: true, text: 'mid' }
        },
        y1: {
          type: 'linear',
          position: 'right',
          title: { display: true, text: 'f(mid)' },
          grid: { drawOnChartArea: false }
        }
      }
    }
  });
});
