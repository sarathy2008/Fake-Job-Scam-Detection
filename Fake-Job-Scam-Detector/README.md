[text](backend)# ScamShield – Fake Job & Internship Scam Detection System
### Machine Learning + NLP | Flask + HTML/CSS/JS

> **AI-powered tool that analyzes job postings and flags employment fraud in real-time.**

---

## Project Structure
```
Fake-Job-Scam-Detector/
├── frontend/
│   ├── index.html        # Responsive dashboard UI
│   ├── style.css         # Dark premium design system
│   └── script.js         # API calls + result rendering
├── backend/
│   ├── app.py            # Flask REST API
│   ├── train.py          # ML training pipeline
│   ├── model.pkl         # Saved best model (after training)
│   ├── vectorizer.pkl    # Saved TF-IDF vectorizer (after training)
│   └── metrics.json      # Model comparison metrics (after training)
├── dataset/
│   └── jobs.csv          # EMSCAD dataset (download separately)
├── requirements.txt
└── README.md
```

---

## Quick Start

### Step 1 – Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 2 – Get the Dataset
Download from Kaggle:
https://www.kaggle.com/datasets/shivamb/real-or-fake-fake-jobposting-prediction

Rename the file to `jobs.csv` and place it in:
```
dataset/jobs.csv
```

### Step 3 – Train the ML Model
```bash
python backend/train.py
```
This trains Logistic Regression, Random Forest, and XGBoost,
then saves the best model as `backend/model.pkl`.

### Step 4 – Start Flask Backend
```bash
python backend/app.py
```
API runs on: http://127.0.0.1:5000

### Step 5 – Open Frontend
Open `frontend/index.html` in your browser
(double-click or use VS Code Live Server).

---

## API Endpoints

### POST /predict
**Request:**
```json
{
  "job_title":   "Software Engineer",
  "company":     "XYZ Corp",
  "description": "We are hiring...",
  "salary":      "50000/month",
  "location":    "Remote",
  "experience":  "1-3",
  "job_url":     "https://example.com/job"
}
```

**Response:**
```json
{
  "prediction":        "fake",
  "fraud_probability": 0.87,
  "confidence":        0.87,
  "risk_level":        "Very High",
  "warnings":          ["Description is very short", "..."],
  "risk_factors":      [{"label": "ML Model Score", "score": 0.87}],
  "recommendation":    "Do NOT apply...",
  "model_used":        "XGBClassifier"
}
```

### GET /metrics
Returns trained model comparison metrics (accuracy, precision, recall, F1, ROC-AUC).

### GET /health
Returns `{"status": "ok", "model_loaded": true}`.

---

## ML Pipeline

| Step | Detail |
|------|--------|
| Dataset | EMSCAD – 17,880 job postings, ~4.8% fraudulent |
| Preprocessing | Lowercase → remove URLs/HTML → remove punctuation → remove stopwords |
| Vectorization | TF-IDF (unigrams + bigrams, 15,000 features, sublinear TF) |
| Models | Logistic Regression, Random Forest (200 trees), XGBoost (300 estimators) |
| Selection | Best ROC-AUC on 20% held-out test set |
| Extra Checks | Rule-based heuristics (fee mentions, short descriptions, suspicious URLs, etc.) |

---

## Tech Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Python 3.10+, Flask, Flask-CORS
- **ML**: Scikit-learn, XGBoost, Joblib
- **NLP**: TF-IDF Vectorization, custom stopword removal

---

## Disclaimer
This tool is built for **academic/educational purposes** as an ML project demonstration.
Always verify job postings through official company channels.
