document.addEventListener('DOMContentLoaded', () => {
    const calculateBtn = document.getElementById('calculateBtn');
    const functionInput = document.getElementById('functionInput');
    const aInput = document.getElementById('aInput');
    const bInput = document.getElementById('bInput');
    const maxIterationsInput = document.getElementById('maxIterations');
    const toleranceInput = document.getElementById('tolerance');
    const resultTableBody = document.getElementById('resultTableBody');
    const outputSection = document.querySelector('.output-section');
    const finalResultDiv = document.getElementById('final-result');
    const graphSection = document.querySelector('.graph-section');

    let functionChart;

    function evaluateFunction(funcString, x) {
        try {
            const f = new Function('x', 'return ' + funcString);
            return f(x);
        } catch (error) {
            console.error("Invalid function expression:", error);
            return NaN;
        }
    }

    calculateBtn.addEventListener('click', () => {
        const funcString = functionInput.value;
        let a = parseFloat(aInput.value);
        let b = parseFloat(bInput.value);
        const maxIterations = parseInt(maxIterationsInput.value);
        const tolerance = parseFloat(toleranceInput.value);

        resultTableBody.innerHTML = '';
        finalResultDiv.textContent = '';
        outputSection.style.display = 'none';
        graphSection.style.display = 'none';

        if (isNaN(a) || isNaN(b) || isNaN(maxIterations) || isNaN(tolerance)) {
            alert('โปรดป้อนข้อมูลให้ครบถ้วนและเป็นตัวเลขที่ถูกต้อง');
            return;
        }

        const fa = evaluateFunction(funcString, a);
        const fb = evaluateFunction(funcString, b);

        if (fa * fb >= 0) {
            alert('ค่า f(a) และ f(b) มีเครื่องหมายเดียวกัน ไม่สามารถใช้วิธี Bisection ได้');
            return;
        }

        outputSection.style.display = 'block';
        graphSection.style.display = 'block';

        const iterationPoints = [];
        
        let mid;
        let fMid;
        let iteration = 0;
        
        let minX = Math.min(a, b);
        let maxX = Math.max(a, b);
        let minY = Math.min(fa, fb, 0);
        let maxY = Math.max(fa, fb, 0);

        while (iteration < maxIterations) {
            mid = (a + b) / 2;
            fMid = evaluateFunction(funcString, mid);

            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td>${iteration + 1}</td>
                <td>${mid.toFixed(6)}</td>
                <td>${fMid.toFixed(6)}</td>
            `;
            resultTableBody.appendChild(newRow);

            iterationPoints.push({
                x: mid,
                y: fMid,
                iteration: iteration + 1
            });
            
            minY = Math.min(minY, fMid);
            maxY = Math.max(maxY, fMid);

            if (Math.abs(fMid) < tolerance) {
                break;
            }

            if (evaluateFunction(funcString, a) * fMid < 0) {
                b = mid;
            } else {
                a = mid;
            }

            iteration++;
        }
        
        createGraph(funcString, minX, maxX, minY, maxY, iterationPoints);

        if (Math.abs(fMid) < tolerance) {
            finalResultDiv.textContent = `คำตอบโดยประมาณคือ ${mid.toFixed(6)} (หลังจาก ${iteration + 1} รอบ)`;
        } else {
            finalResultDiv.textContent = `ไม่พบคำตอบที่อยู่ในเกณฑ์ความคลาดเคลื่อนภายใน ${maxIterations} รอบ. คำตอบที่ใกล้เคียงที่สุดคือ ${mid.toFixed(6)}`;
        }
    });

    function createGraph(funcString, minX, maxX, minY, maxY, iterationPoints) {
        const ctx = document.getElementById('functionChart').getContext('2d');
        const dataPoints = [];
        const numPoints = 100;
        const step = (maxX - minX) / numPoints;

        for (let i = 0; i <= numPoints; i++) {
            const x = minX + i * step;
            const y = evaluateFunction(funcString, x);
            dataPoints.push({ x: x, y: y });
        }

        if (functionChart) {
            functionChart.destroy();
        }

        functionChart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [
                    {
                        label: `f(x) = ${funcString}`,
                        data: dataPoints,
                        borderColor: 'rgb(75, 192, 192)',
                        tension: 0.1,
                        fill: false,
                        pointRadius: 0
                    },
                    {
                        label: 'จุด Iteration',
                        data: iterationPoints,
                        backgroundColor: 'rgba(255, 99, 132, 0.8)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        pointRadius: 5,
                        pointHoverRadius: 8,
                        showLine: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        title: {
                            display: true,
                            text: 'x'
                        },
                        min: minX,
                        max: maxX
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'f(x)'
                        },
                        min: minY,
                        max: maxY
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const point = context.raw;
                                if (point.iteration) {
                                    return `Iteration: ${point.iteration}, f(x) = ${point.y.toFixed(6)}`;
                                }
                                return context.dataset.label + ': ' + context.formattedValue;
                            }
                        }
                    },
                    zoom: {
                        zoom: {
                            wheel: {
                                enabled: true,
                            },
                            pinch: {
                                enabled: true
                            },
                            mode: 'xy',
                        },
                        pan: {
                            enabled: true,
                            mode: 'xy',
                        }
                    }
                }
            }
        });
    }
});
