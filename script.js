(function () {
    const atmos = document.getElementById("atmos");
    const styleEl = document.createElement("style");
    styleEl.textContent = `@keyframes floatDot{0%,100%{transform:translate(0,0)}25%{transform:translate(10px,-15px)}50%{transform:translate(-5px,20px)}75%{transform:translate(-15px,-10px)}}`;
    document.head.appendChild(styleEl);

    // Create floating dots
    for (let i = 0; i < 45; i++) {
      const d = document.createElement("span");
      const sz = Math.random() * 5 + 1;
      d.style.cssText = `position:absolute;left:${Math.random()*100}%;top:${Math.random()*100}%;width:${sz}px;height:${sz}px;background:#10b981;border-radius:50%;opacity:${Math.random()*0.22+0.05};animation:floatDot ${Math.random()*20+15}s infinite ease-in-out;animation-delay:-${Math.random()*10}s;`;
      atmos.appendChild(d);
    }

    // Intersection Observer for reveal animations
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add("on");
          // Clear transition delay after reveal animation completes to ensure hover is responsive
          setTimeout(() => {
            e.target.style.transitionDelay = '';
          }, 1500);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.08 });

    // Set dynamic, smooth stagger delays for collaborated cards to prevent scroll lag
    document.querySelectorAll(".collab-card").forEach((card, idx) => {
      const delay = (idx % 5) * 0.05;
      card.style.transitionDelay = `${delay}s`;
    });

    document.querySelectorAll(".reveal").forEach(el => obs.observe(el));

    // Helper: parse value string like "84.2K", "6,841", "7.6%" -> raw number
    function parseVal(str) {
      str = (str || '').trim().replace(/,/g, '');
      if (str.endsWith('%')) return parseFloat(str) || 0;
      if (str.toUpperCase().endsWith('K')) return (parseFloat(str) || 0) * 1000;
      if (str.toUpperCase().endsWith('M')) return (parseFloat(str) || 0) * 1000000;
      return parseFloat(str) || 0;
    }

    // Fields that feed the chart (Impressions is display only, not in chart)
    const fields = [
      { inputId: 'val-reach',      legId: 'leg-reach',      chartIdx: 0 },
      { inputId: 'val-stories',    legId: 'leg-stories',    chartIdx: 1 },
      { inputId: 'val-likes',      legId: 'leg-likes',      chartIdx: 2 },
      { inputId: 'val-comments',   legId: 'leg-comments',   chartIdx: 3 },
      { inputId: 'val-engagement', legId: 'leg-engagement', chartIdx: 4 },
    ];

    function initChart() {
      if (typeof Chart === 'undefined') {
        setTimeout(initChart, 100);
        return;
      }

      const canvas = document.getElementById("pieChart");
      if (!canvas) return;

      const initData = fields.map(f => {
        const el = document.getElementById(f.inputId);
        return el ? parseVal(el.value) : 0;
      });

      const pieChart = new Chart(canvas, {
        type: "doughnut",
        data: {
          labels: ["Reach", "Stories", "Likes", "Comments", "Engagement"],
          datasets: [{
            data: initData,
            backgroundColor: ["#10b981", "#a78bfa", "#60a5fa", "#34d399", "#f97316"],
            borderColor: "#111827",
            borderWidth: 3,
            hoverOffset: 8
          }]
        },
        options: {
          responsive: true,
          cutout: "68%",
          animation: { duration: 600 },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: ctx => ` ${ctx.label}: ${ctx.parsed.toLocaleString()}`
              }
            }
          }
        }
      });

      window.syncChart = function () {
        fields.forEach(f => {
          const input = document.getElementById(f.inputId);
          const leg   = document.getElementById(f.legId);
          const val   = input ? input.value : '';
          if (leg) leg.textContent = val;
          pieChart.data.datasets[0].data[f.chartIdx] = parseVal(val);
        });
        pieChart.update();
      };

      syncChart();
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initChart);
    } else {
      initChart();
    }

    // Instagram links use native target="_blank" behaviour.
    // iOS Safari shows a built-in "Open in Instagram" banner automatically.

})();