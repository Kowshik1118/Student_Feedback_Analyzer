from flask import Flask, render_template, request, jsonify
import re

app = Flask(__name__)

positive_words = {
    "good", "great", "excellent", "amazing", "helpful", "interesting",
    "clear", "easy", "best", "love", "liked", "useful", "friendly",
    "perfect", "nice", "awesome", "enjoy", "enjoyed", "satisfied"
}

negative_words = {
    "bad", "poor", "worst", "boring", "difficult", "hard", "confusing",
    "unclear", "slow", "hate", "dislike", "problem", "problems", "issue",
    "issues", "unsatisfied", "improve", "late", "waste"
}

def analyze_feedback(text):
    text = text.strip()
    if not text:
        return {"error": "Please enter student feedback."}

    lower_text = text.lower()
    words = re.findall(r"[a-zA-Z]+", lower_text)

    positive_found = [w for w in words if w in positive_words]
    negative_found = [w for w in words if w in negative_words]

    positive_count = len(positive_found)
    negative_count = len(negative_found)
    sentiment_score = positive_count - negative_count

    if sentiment_score > 0:
        sentiment = "Positive"
    elif sentiment_score < 0:
        sentiment = "Negative"
    else:
        sentiment = "Neutral"

    common_keywords = [
        "teacher", "faculty", "class", "lecture", "subject", "lab",
        "laboratory", "assignment", "exam", "notes", "project", "college",
        "infrastructure", "library", "canteen", "course"
    ]

    keywords = [k for k in common_keywords if k in lower_text]

    suggestions = []

    if "teacher" in lower_text or "faculty" in lower_text:
        suggestions.append("Review faculty-related feedback.")

    if "class" in lower_text or "lecture" in lower_text:
        suggestions.append("Review teaching and classroom experience.")

    if "lab" in lower_text or "laboratory" in lower_text:
        suggestions.append("Check laboratory facilities and practical sessions.")

    if "assignment" in lower_text:
        suggestions.append("Review assignment workload and difficulty.")

    if "infrastructure" in lower_text:
        suggestions.append("Review infrastructure-related comments.")

    if negative_count > positive_count:
        suggestions.append("More negative points were detected. Consider corrective action.")
    elif positive_count > negative_count:
        suggestions.append("Students have given positive feedback. Continue current practices.")
    else:
        suggestions.append("Collect more detailed feedback for better analysis.")

    score = max(0, min(100, 50 + ((positive_count - negative_count) * 10)))

    return {
        "feedback": text,
        "word_count": len(words),
        "positive_count": positive_count,
        "negative_count": negative_count,
        "sentiment": sentiment,
        "sentiment_score": sentiment_score,
        "score": score,
        "keywords": keywords,
        "positive_words": positive_found,
        "negative_words": negative_found,
        "suggestions": suggestions
    }

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.get_json(silent=True) or {}
    return jsonify(analyze_feedback(data.get("feedback", "")))

if __name__ == "__main__":
    app.run(debug=True)
