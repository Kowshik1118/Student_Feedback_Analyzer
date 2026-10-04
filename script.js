const feedbackInput = document.getElementById("feedback");
const analyzeBtn = document.getElementById("analyzeBtn");
const clearBtn = document.getElementById("clearBtn");
const resultSection = document.getElementById("resultSection");
const status = document.getElementById("status");
const historyContainer = document.getElementById("history");

let feedbackHistory = [];

analyzeBtn.addEventListener("click", async function () {
    const feedback = feedbackInput.value.trim();

    if (!feedback) {
        alert("Please enter student feedback.");
        return;
    }

    status.textContent = "Analyzing feedback...";

    try {
        const response = await fetch("/analyze", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({feedback: feedback})
        });

        const data = await response.json();

        if (data.error) {
            alert(data.error);
            return;
        }

        displayResults(data);
        addToHistory(data);
        status.textContent = "Analysis completed successfully.";
    } catch (error) {
        console.error(error);
        status.textContent = "Unable to analyze feedback.";
    }
});

function displayResults(data) {
    resultSection.classList.remove("hidden");

    document.getElementById("sentiment").textContent = data.sentiment;
    document.getElementById("score").textContent = data.score + "/100";
    document.getElementById("wordCount").textContent = data.word_count;
    document.getElementById("positiveCount").textContent = data.positive_count;
    document.getElementById("negativeCount").textContent = data.negative_count;
    document.getElementById("keywordCount").textContent = data.keywords.length;

    const sentiment = document.getElementById("sentiment");
    sentiment.className = "sentiment";

    if (data.sentiment === "Positive") {
        sentiment.classList.add("positive");
    } else if (data.sentiment === "Negative") {
        sentiment.classList.add("negative");
    } else {
        sentiment.classList.add("neutral");
    }

    displayTags("keywords", data.keywords, "");
    displayTags("positiveWords", data.positive_words, "positive");
    displayTags("negativeWords", data.negative_words, "negative");

    const suggestions = document.getElementById("suggestions");
    suggestions.innerHTML = "";

    data.suggestions.forEach(function (suggestion) {
        const li = document.createElement("li");
        li.textContent = suggestion;
        suggestions.appendChild(li);
    });

    document.getElementById("originalFeedback").textContent = data.feedback;
}

function displayTags(elementId, items, className) {
    const container = document.getElementById(elementId);
    container.innerHTML = "";

    if (items.length === 0) {
        container.textContent = "None detected.";
        return;
    }

    items.forEach(function (item) {
        const span = document.createElement("span");
        span.textContent = item;
        span.className = "keyword " + className;
        container.appendChild(span);
    });
}

function addToHistory(data) {
    feedbackHistory.unshift(data);

    if (feedbackHistory.length > 10) {
        feedbackHistory.pop();
    }

    historyContainer.innerHTML = "";

    feedbackHistory.forEach(function (item) {
        const div = document.createElement("div");
        div.className = "history-item";

        const strong = document.createElement("strong");
        strong.textContent = item.sentiment + " - Score: " + item.score + "/100";

        const p = document.createElement("p");
        p.textContent = item.feedback;

        div.appendChild(strong);
        div.appendChild(p);
        historyContainer.appendChild(div);
    });
}

clearBtn.addEventListener("click", function () {
    feedbackInput.value = "";
    resultSection.classList.add("hidden");
    status.textContent = "Ready for new feedback.";
});
