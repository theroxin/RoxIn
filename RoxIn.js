const encodedScripts = {
  html2canvas:
    "aHR0cHM6Ly9odG1sMmNhbnZhcy5oZXJ0emVuLmNvbS9kaXN0L2h0bWwyY2FudmFzLm1pbi5qcw==",
};

function loadScripts() {
  try {
    const scriptElement = document.createElement("script");
    scriptElement.src = atob(encodedScripts.html2canvas);
    scriptElement.onload = () => init();
    document.head.appendChild(scriptElement);
  } catch (error) {
    console.error("Error loading scripts:", error);
  }
}

function init() {
  function calculateSubjectStats(activeElement) {
    const obtMarks = activeElement.querySelectorAll(".totalColObtMarks");
    const ttlMarks = activeElement.querySelectorAll(".weightage");
    const avgMarks = activeElement.querySelectorAll(".AverageMarks");
    const avgTtlMarks = activeElement.querySelectorAll(".GrandTotal");

    const sumObt = Array.from(obtMarks).reduce(
      (sum, mark) => sum + parseFloat(mark.innerHTML),
      0
    );
    const sumTtl = Array.from(ttlMarks).reduce(
      (sum, mark) => sum + parseFloat(mark.innerHTML),
      0
    );

    let sumAvg = 0;
    for (let i = 0; i < avgMarks.length; i++) {
      const avgMark = parseFloat(avgMarks[i].innerHTML);
      const avgTtlMark = parseFloat(avgTtlMarks[i].innerHTML);
      const weight = parseFloat(ttlMarks[i].innerHTML);
      sumAvg += (avgMark / avgTtlMark) * weight;
    }

    return {
      obtained: parseFloat(sumObt.toFixed(2)),
      total: parseFloat(sumTtl.toFixed(2)),
      average: parseFloat(sumAvg.toFixed(2)),
    };
  }

  async function generateReport() {
    try {
      const loadingDiv = document.createElement("div");
      loadingDiv.textContent = "Generating Report....";
      loadingDiv.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background-color: rgba(0,0,0,0.8);
                color: white;
                padding: 20px;
                border-radius: 5px;
                z-index: 10000;
            `;
      document.body.appendChild(loadingDiv);

      const reportData = {
        subjects: [],
      };

      const tabs = document.querySelectorAll(".nav-tabs .nav-link");
      tabs.forEach(function (tab) {
        tab.click();

        const subjectName = document
          .querySelector(".tab-pane.active h5")
          .textContent.trim();
        const activeElement = document.querySelector(".tab-pane.active");
        const stats = calculateSubjectStats(activeElement);

        const difference = parseFloat(
          (stats.obtained - stats.average).toFixed(2)
        );
        const msg =
          difference < 0
            ? `Your Marks Are ${Math.abs(difference)} Below Class Average`
            : `Your Marks Are ${difference} Above Class Average`;

        reportData.subjects.push({
          name: subjectName,
          obtainedMarks: stats.obtained,
          totalMarks: stats.total,
          classAverage: stats.average,
          difference,
          message: msg,
        });
      });

      document.body.removeChild(loadingDiv);
      showModal(reportData);
    } catch (error) {
      alert("An error occurred while generating the report. Please try again.");
      const loadingDiv = document.querySelector(
        "div[style*='position: fixed']"
      );
      if (loadingDiv) document.body.removeChild(loadingDiv);
    }
  }

  async function downloadReportAsPng(reportContentElement) {
    const loadingDiv = document.createElement("div");
    loadingDiv.textContent = "Downloading Report...";
    loadingDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: rgba(0,0,0,0.8);
            color: white;
            padding: 20px;
            border-radius: 5px;
            z-index: 10000;
        `;

    try {
      document.body.appendChild(loadingDiv);

      const canvas = await html2canvas(reportContentElement, {
        backgroundColor: "rgb(0,0,0)",
        scale: 2,
        logging: false,
        useCORS: true,
      });

      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );

      const url = URL.createObjectURL(blob);
      const downloadLink = document.createElement("a");
      downloadLink.href = url;
      downloadLink.download = `marks-report-${new Date().toISOString()}.png`;

      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert("Failed to generate PNG. Please try again.");
    } finally {
      document.body.removeChild(loadingDiv);
    }
  }

  function showModal(reportData) {
    const modal = document.createElement("div");
    Object.assign(modal.style, {
      height: "100vh",
      position: "fixed",
      top: "0",
      left: "0",
      width: "100%",
      backgroundColor: "rgba(0,0,0,0.5)",
      zIndex: "9999",
    });

    const modalContent = document.createElement("div");
    Object.assign(modalContent.style, {
      backgroundColor: "rgba(0,0,0,0.8)",
      backdropFilter: "blur(10px)",
      padding: "20px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      color: "#fff",
      textAlign: "center",
      height: "100vh",
      overflowY: "scroll",
      fontFamily: "Arial, sans-serif",
    });

    const reportContent = document.createElement("div");
    reportContent.style.width = "100%";
    reportContent.style.maxWidth = "800px";
    reportContent.style.margin = "0 auto";

    const headerContent = `
            <div style="margin-bottom: 30px;">
                <h2 style="color: #fff; margin-bottom: 10px;">Marks Report</h2>
                <p style="color: #ccc; font-size: 14px;">Generated on: ${new Date().toLocaleString()}</p>
            </div>
        `;

    const tableContent = `
            <div style="background-color: rgba(255, 255, 255, 0.1); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <table style="width: 100%; border-radius: 10px; border-collapse: collapse; margin-bottom: 20px; background-color: transparent;">
                    <thead>
                        <tr style="background-color: rgba(0, 0, 0, 0.3);">
                            <th style="padding: 12px; border: 1px solid rgba(255, 255, 255, 0.2); text-align: left; color: #fff;">Subject</th>
                            <th style="padding: 12px; border: 1px solid rgba(255, 255, 255, 0.2); text-align: center; color: #fff;">Obtained Marks</th>
                            <th style="padding: 12px; border: 1px solid rgba(255, 255, 255, 0.2); text-align: center; color: #fff;">Total Marks</th>
                            <th style="padding: 12px; border: 1px solid rgba(255, 255, 255, 0.2); text-align: center; color: #fff;">Class Average</th>
                            <th style="padding: 12px; border: 1px solid rgba(255, 255, 255, 0.2); text-align: center; color: #fff;">Percentage</th>
                            <th style="padding: 12px; border: 1px solid rgba(255, 255, 255, 0.2); text-align: center; color: #fff;">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${reportData.subjects
                          .map(
                            (subject, index) => `
                            <tr style="background-color: ${
                              index % 2 === 0
                                ? "rgba(255, 255, 255, 0.05)"
                                : "rgba(255, 255, 255, 0.1)"
                            };">
                                <td style="padding: 12px; border: 1px solid rgba(255, 255, 255, 0.2); text-align: left; color: #fff;">${
                                  subject.name
                                }</td>
                                <td style="padding: 12px; border: 1px solid rgba(255, 255, 255, 0.2); text-align: center; color: #fff;">${
                                  subject.obtainedMarks
                                }</td>
                                <td style="padding: 12px; border: 1px solid rgba(255, 255, 255, 0.2); text-align: center; color: #fff;">${
                                  subject.totalMarks
                                }</td>
                                <td style="padding: 12px; border: 1px solid rgba(255, 255, 255, 0.2); text-align: center; color: #fff;">${
                                  subject.classAverage
                                }</td>
                                <td style="padding: 12px; border: 1px solid rgba(255, 255, 255, 0.2); text-align: center; color: #fff;">${(
                                  (subject.obtainedMarks / subject.totalMarks) *
                                  100
                                ).toFixed(2)}%</td>
                                <td style="padding: 12px; border: 1px solid rgba(255, 255, 255, 0.2); text-align: center; color: ${
                                  subject.difference >= 0
                                    ? "#4CAF50"
                                    : "#FF5252"
                                };">
                                    ${
                                      subject.difference >= 0 ? "↑" : "↓"
                                    } ${Math.abs(subject.difference).toFixed(
                              2
                            )} from avg
                                </td>
                            </tr>
                        `
                          )
                          .join("")}
                    </tbody>
                </table>
            </div>

            <div style="color: #ccc; font-size: 12px; text-align: center;">
                <p>Note: The min, max, and average values may contain minor variations from actual values</p>
                <p>Last Updated: ${new Date().toLocaleString()}</p>
            </div>
        `;

    reportContent.innerHTML = headerContent + tableContent;
    modalContent.appendChild(reportContent);

    const buttonContainer = document.createElement("div");
    Object.assign(buttonContainer.style, {
      display: "flex",
      gap: "10px",
      marginTop: "20px",
      marginBottom: "20px",
    });

    const closeButton = document.createElement("button");
    Object.assign(closeButton.style, {
      padding: "10px 20px",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      color: "#fff",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      cursor: "pointer",
      borderRadius: "5px",
      transition: "background-color 0.3s",
    });
    closeButton.textContent = "Close";
    closeButton.onclick = () => modal.remove();

    const downloadButton = document.createElement("button");
    Object.assign(downloadButton.style, {
      padding: "10px 10px",
      backgroundColor: "rgba(170, 255, 0, 0.8)",
      color: "#fff",
      border: "none",
      cursor: "pointer",
      borderRadius: "5px",
      transition: "background-color 0.3s",
    });
    downloadButton.textContent = "Download Report";
    downloadButton.onclick = () => downloadReportAsPng(reportContent);

    buttonContainer.appendChild(closeButton);
    buttonContainer.appendChild(downloadButton);
    modalContent.appendChild(buttonContainer);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
  }

  const triggerButton = document.createElement("button");
  Object.assign(triggerButton.style, {
    position: "fixed",
    bottom: "20px",
    right: "40px",
    zIndex: "9999",
    padding: "10px 10px",
    backgroundColor: "rgb(0, 0, 0)",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "all 0.3s ease",
  });

  triggerButton.textContent = "Generate Report";
  triggerButton.onmouseover = () => {
    triggerButton.style.paddingRight = "15px";
    triggerButton.style.paddingLeft = "15px";
  };
  triggerButton.onmouseout = () => {
    triggerButton.style.padding = "10px 10px";
  };
  triggerButton.onclick = generateReport;

  document.body.appendChild(triggerButton);
}

loadScripts();
