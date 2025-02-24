document.addEventListener("DOMContentLoaded", function () {
    const tipBox = document.getElementById("tip-box");
    const tipButton = document.getElementById("new-tip-btn");

    function fetchTip() {
        fetch("/api/tips")
            .then(response => response.json())
            .then(data => {
                tipBox.innerText = "💡 " + data.tip;
            })
            .catch(error => {
                tipBox.innerText = "⚠️ Error loading tips.";
                console.error("Error fetching tips:", error);
            });
    }

    tipButton.addEventListener("click", fetchTip);

    // Load a tip on page load
    fetchTip();
});
