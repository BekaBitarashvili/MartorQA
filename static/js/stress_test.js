let chartInstance = null;

document.getElementById("startBtn").addEventListener("click", async () => {
    const url = document.getElementById("url").value.trim();
    const users = parseInt(document.getElementById("users").value);
    const duration = parseInt(document.getElementById("duration").value);
    const statusEl = document.getElementById("status");

    if (!url) {
        alert("Please enter a valid URL.");
        return;
    }

    statusEl.textContent = "Running stress test... ⏳";

    await fetch("/run_stress_test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, users, duration })
    });

    const interval = setInterval(async () => {
        const res = await fetch("/get_results");
        const data = await res.json();

        updateChart(data.results);

        if (!data.running) {
            clearInterval(interval);
            statusEl.textContent = "✅ Test completed!";
        }
    }, 1000);
});

document.getElementById("downloadBtn").addEventListener("click", () => {
    window.location.href = "/download_report";
});

function updateChart(results) {
    const times = results
        .filter(r => r.time)
        .map((r, i) => ({ x: i + 1, y: r.time }));

    const ctx = document.getElementById("chart").getContext("2d");

    if (chartInstance) chartInstance.destroy();

    chartInstance = new Chart(ctx, {
        type: "line",
        data: {
            datasets: [{
                label: "Response Time (seconds)",
                data: times,
                borderColor: "#ff6b35",
                tension: 0.2,
                borderWidth: 2
            }]
        },
        options: {
            scales: {
                x: { title: { display: true, text: "Requests" } },
                y: { title: { display: true, text: "Time (s)" } }
            },
            animation: false,
            plugins: { legend: { display: true } }
        }
    });
}
