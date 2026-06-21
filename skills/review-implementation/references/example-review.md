# Reference: Example Review
This document provides a few-shot example of a complete implementation review for the `review-implementation` skill.

### Input — Plan

```markdown
# Customer Churn Prediction — Implementation Plan

## Architecture
- A single Python script `train.py` will train the model.
- A FastAPI app `api.py` will serve predictions with a `/predict` endpoint.
- Models and scalers will be saved to `artifacts/` using `joblib`.

## Data Strategy
- Use an 80/10/10 train/validation/test split with a fixed random seed (42).
- Fit the scaler on the training set only, then transform validation and test.
- Target: churn within 30 days of the observation date.

## Security
- API input will be validated with Pydantic models.
- No secrets in source code; use environment variables.

## Testing
- Unit tests for data preprocessing in `tests/test_preprocessing.py`.
- API endpoint tests in `tests/test_api.py`.
- Minimum 80% test coverage.

## Dependencies
- Dependencies managed with pixi; lock file committed.
- Python 3.11.
```

### Input — Implementation (selected files)

`train.py`:
```python
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
import joblib

df = pd.read_csv("data/customers.csv")

# Preprocess
scaler = StandardScaler()
X = scaler.fit_transform(df[["spend", "logins", "tickets"]])
y = df["churned"]

# Split
X_train, X_temp, y_train, y_temp = train_test_split(
    X, y, test_size=0.2, random_state=42
)
X_val, X_test, y_val, y_test = train_test_split(
    X_temp, y_temp, test_size=0.5, random_state=42
)

# Train
model = RandomForestClassifier()
model.fit(X_train, y_train)

# Save
joblib.dump(model, "artifacts/model.pkl")
joblib.dump(scaler, "artifacts/scaler.pkl")
```

`api.py`:
```python
from fastapi import FastAPI
import joblib

app = FastAPI()
model = joblib.load("artifacts/model.pkl")

@app.post("/predict")
def predict(spend: float, logins: int, tickets: int):
    return {"churn": bool(model.predict([[spend, logins, tickets]])[0])}
```

`tests/test_preprocessing.py`:
```python
def test_placeholder():
    assert True
```

`pyproject.toml`: not present. `pixi.toml`: not present.
`Dockerfile`: present, multi-stage build with Python 3.10.

### Output — Implementation Review (selected findings)

```markdown
# Implementation Review: Customer Churn Prediction — Implementation Plan

**Plan source:** `./PLAN.md`
**Implementation scope:** `./train.py`, `./api.py`, `./tests/`, `./Dockerfile`
**Overall alignment:** Partially aligned
**Review date:** 2026-05-08

---

## Summary

The implementation covers the core training and serving pipeline, but contains
a Critical data-leakage defect, missing tests, a dependency-management gap, and
an undocumented scope addition (Dockerfile). These must be addressed before the
project is considered complete.

---

## Completeness

### 🔴 Critical — Scaler fitted on full dataset before split

**Plan requirement:** "Fit the scaler on the training set only, then transform
validation and test."

**Implementation status:** `train.py` line 10 calls `scaler.fit_transform(df[...])`
on the full DataFrame before `train_test_split` is executed on line 14.

**Assessment:** Divergent

**Recommendation:** Move `train_test_split` before scaling. Fit the scaler on
`X_train` only, then call `scaler.transform()` on `X_val` and `X_test`. Wrap the
scaler in a `sklearn.pipeline.Pipeline` with the model to prevent leakage during
cross-validation.

**Why:** Fitting the scaler on the full dataset leaks test-set distributional
information into the training features. This artificially inflates validation
metrics and produces an unreliable estimate of generalization performance.

---

### 🔴 Critical — Test suite is a placeholder

**Plan requirement:** "Unit tests for data preprocessing in
`tests/test_preprocessing.py`. API endpoint tests in `tests/test_api.py`.
Minimum 80% test coverage."

**Implementation status:** `tests/test_preprocessing.py` contains a single
placeholder test that asserts `True`. No `test_api.py` exists.

**Assessment:** Missing

**Recommendation:** Implement real tests for the preprocessing pipeline
(including split ratios, scaler behavior, and target construction) and for the
API endpoint (valid inputs, invalid inputs, response schema). Add pytest-cov and
enforce the 80% threshold in CI.

**Why:** A placeholder test suite gives false confidence. Without real tests,
refactors and dependency upgrades risk silent breakage in both training and
serving paths.

---

### 🟡 Warning — Missing pixi configuration and lock file

**Plan requirement:** "Dependencies managed with pixi; lock file committed.
Python 3.11."

**Implementation status:** No `pixi.toml` or `pixi.lock` found. A `requirements.txt`
was not found either.

**Assessment:** Missing

**Recommendation:** Initialize pixi (`pixi init`), add the required
dependencies, and commit `pixi.lock`. Specify `python = "3.11.*"` in the
`[dependencies]` table.

**Why:** A missing lock file means the environment is not reproducible. The
next developer or CI runner may install incompatible package versions, leading
to non-deterministic training results or broken serving behavior.

---

## Data Strategy

### 🟡 Warning — No explicit temporal target construction visible

**Plan requirement:** "Target: churn within 30 days of the observation date."

**Implementation status:** `train.py` uses `df["churned"]` directly with no
visible construction logic for the 30-day horizon.

**Assessment:** Partially implemented

**Recommendation:** Add a target-engineering step that defines the observation
date, the prediction horizon, and the exact churn logic. Document this in a
comment or a separate `features.py` module.

**Why:** Without visible target construction, reviewers cannot verify that the
model is learning the right problem. The column may already encode the correct
horizon, but that intent must be explicit and auditable.

---

## Security

### 🟡 Warning — API endpoint lacks input validation

**Plan requirement:** "API input will be validated with Pydantic models."

**Implementation status:** `api.py` uses raw `float` and `int` type hints but no
Pydantic model. Negative spend values or out-of-range logins are accepted
silently.

**Assessment:** Partially implemented

**Recommendation:** Define a Pydantic `BaseModel` with field constraints (e.g.,
`spend: float = Field(..., ge=0)`, `logins: int = Field(..., ge=0)`). Return a
422 response for invalid inputs.

**Why:** Raw type hints do not enforce business-rule constraints. Pydantic
models provide both validation and self-documenting request schemas, which are
critical for API robustness and client integration.

---

## Dependencies & Environment

### 🟡 Warning — Dockerfile uses Python 3.10, plan specifies 3.11

**Plan requirement:** "Python 3.11."

**Implementation status:** `Dockerfile` uses `python:3.10-slim`.

**Assessment:** Divergent

**Recommendation:** Update the base image to `python:3.10-slim` (or
`python:3.11-slim-bookworm`).

**Why:** A Python version mismatch between the plan and the deployment
environment can introduce subtle behavioral differences in standard library
behavior, type hint evaluation, and dependency resolution.

---

## Simplification & Parsimony

### 🟡 Warning — Training script has import-time side effects

**Plan requirement:** "A single Python script `train.py` will train the model."

**Implementation status:** `train.py` performs data loading, splitting, scaling,
model fitting, and artifact writes at module import time.

**Assessment:** Simplification opportunity

**Recommendation:** Keep one `train.py`, but move the stages into small local
functions (`load_data`, `split_data`, `fit_preprocessor`, `train_model`,
`save_artifacts`) and call them from `main()` under
`if __name__ == "__main__":`. Do not create extra modules because the plan chose
a single-script training architecture.

**Why:** Import-time side effects are a Warning because they make tests, reuse,
and operational imports fragile. The recommended structure is still parsimonious
because it avoids new modules, preserves the planned single-script architecture,
and keeps behavior unchanged while making execution explicit.

---

## Efficiency

### 🟢 Note — Model is reloaded on every API request in some deployment patterns

**Plan requirement:** Not specified in plan.

**Implementation status:** `api.py` loads the model at module level, which is
fine for single-process deployments. However, in multi-worker setups (e.g.,
Gunicorn with multiple workers), each worker will load its own copy of the
model into memory.

**Assessment:** Efficiency opportunity

**Recommendation:** If deploying with multiple workers, consider a shared
memory cache or a model-server pattern (e.g., Triton, Ray Serve) to avoid
replicating the model in every process.

**Why:** For large models, per-worker replication multiplies memory usage
linearly. A shared model server keeps memory constant regardless of worker
count.

---

## Beyond Scope

### 🟢 Note — Dockerfile present but not mentioned in plan

**Plan requirement:** Not specified in plan.

**Implementation status:** A `Dockerfile` exists with a multi-stage build.

**Assessment:** Beyond scope

**Recommendation:** Confirm with the team whether containerization was an
implicit requirement or a developer-initiated addition. If intentional, add the
Dockerfile and build instructions to the plan.

**Why:** Beyond-scope work is not inherently bad, but it should be documented
so the team understands the full delivery surface and can maintain it going
forward.
```
