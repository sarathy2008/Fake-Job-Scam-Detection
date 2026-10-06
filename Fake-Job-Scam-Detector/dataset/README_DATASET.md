# Dataset Instructions

## Required File
Place your dataset CSV here as:
```
dataset/jobs.csv
```

## Where to Download
**EMSCAD – Employment Scam Aegean Dataset**

URL: https://www.kaggle.com/datasets/shivamb/real-or-fake-fake-jobposting-prediction

Steps:
1. Go to the Kaggle page above
2. Click **Download**
3. Extract the ZIP file
4. Rename the CSV to `jobs.csv`
5. Place it in this `dataset/` folder

## Dataset Details
| Property    | Value          |
|-------------|----------------|
| Rows        | 17,880         |
| Fake jobs   | ~866 (~4.8%)   |
| Genuine     | ~17,014        |
| Key columns | title, description, requirements, benefits, fraudulent |

## Column Used for Label
The training script looks for a column named `fraudulent` (0 = genuine, 1 = fake).
