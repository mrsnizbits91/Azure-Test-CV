window.addEventListener("DOMContentLoaded", async () => {
  const counterEl = document.getElementById("counter");

  // Load cached count (optional)
  counterEl.textContent = localStorage.getItem("visitCount") || "Loading...";

  // Your Azure Function endpoint
  const functionApi = "https://count-mario-resume-plus-one-e0byhwawgnq4f2ek.centralus-01.azurewebsites.net/api/plus-one";



  try {
    // Call your Azure Function
    const response = await fetch(functionApi);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    // Parse JSON response
    const data = await response.json();

    // Extract and display count
    const count = data.count ?? 0;
    counterEl.textContent = count;

    // Cache it locally
    localStorage.setItem("visitCount", count);

    console.log("✅ Visitor count:", count);
  } catch (error) {
    console.error("❌ Error fetching visitor count:", error);
    counterEl.textContent = "Error 😢";
  }
});
