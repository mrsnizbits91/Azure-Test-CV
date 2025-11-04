window.addEventListener("DOMContentLoaded", (event) => {
  // Get the last known count from localStorage (default to 0 if not found)
  let lastCount = localStorage.getItem("visitCount") || "Loading...";
  document.getElementById("counter").innerText = lastCount;

  // Fetch the latest count from the Azure Function
  getVisitCount();
});

const functionApi = "count-mario-resume-plus-one-e0byhvawgng4f2ek.centralus-01.azurewebsites.net/api/plus-one?code=6KBN5DJxaAgVRt_NRPXz_FoUbdtMd91-qzVPKXD1sz2fAzFunBiFTA==";

const getVisitCount = () => {
  fetch(functionApi)
    .then((response) => response.text()) // Fetch response as plain text
    .then((data) => {
      console.log("Raw response from API:", data);
      const countMatch = data.match(/\d+/);
      const count = countMatch ? parseInt(countMatch[0], 10) : 0;
      console.log("Extracted count:", count);

      // Update the HTML element
      document.getElementById("counter").innerText = count;

      // Store the latest count in localStorage
      localStorage.setItem("visitCount", count);
    })
    .catch((error) => {
      console.error("Error occurred:", error);
    });
};
