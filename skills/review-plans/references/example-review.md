# Reference: Example Review
This document provides a few-shot example of a complete plan review for the `review-plans` skill.

### Input (flawed plan snippet)

```markdown
# Customer Churn Prediction Project

## Goal
Build a model to predict which customers will churn next month.

## Data
We will use the customer_transactions table from the data warehouse.
Features will include total spend, number of logins, and support tickets.
We will normalize all numeric features before splitting.

## Model
We will train a random forest and an XGBoost model.
We will use 80/20 train-test split.
The model with the best accuracy will be deployed.

## Timeline
Week 1: Data extraction and cleaning
Week 2: Model training
Week 3: Deploy to production API
```

### Output (selected findings)

```markdown
# Plan Review: Customer Churn Prediction Project

**Plan type:** Data Science / ML
**Overall risk:** High
**Review date:** 2026-05-08

---

## Summary

The plan has a clear goal and a reasonable timeline, but it contains critical
risks around data leakage, evaluation methodology, and deployment readiness that
must be resolved before execution begins.

---

## Data Strategy

### 🔴 Critical — Data leakage via preprocessing before split

**Evidence:** The plan states: "We will normalize all numeric features before
splitting."

**Risk:** Computing normalization statistics on the full dataset before
splitting leaks information from the test set into the training set. This
artificially inflates model performance and produces an unreliable estimate of
generalization error.

**Recommendation:** Split the data first, then fit the scaler only on the
training set and apply the fitted scaler to validation and test sets. Document
this pipeline as a reusable transform.

**Why:** Any statistic computed on data that will later be used for evaluation
must be derived exclusively from the training split. This is one of the most
common sources of inflated ML metrics in practice.

---

### 🟡 Warning — No explicit temporal bounds for the target

**Evidence:** The target is defined as "customers will churn next month," but
there is no description of how the observation window, prediction horizon, and
churn label are constructed relative to transaction dates.

**Risk:** Without explicit temporal bounds, the team may accidentally include
future information in feature engineering (temporal leakage) or misalign the
prediction horizon with business needs.

**Recommendation:** Define the observation window (e.g., features from T-90 to
T-0), the prediction horizon (e.g., churn between T+1 and T+30), and the exact
logic for assigning the churn label. Include a diagram showing the timeline.

**Why:** Temporal structure is the single most important safeguard against
leakage in business forecasting problems. Explicit definitions also make the
model auditable by stakeholders.

---

## PCS Framework

### 🔴 Critical — No baseline model or reproducibility plan

**Evidence:** The plan jumps directly to random forest and XGBoost with no
mention of a baseline or fixed random seeds.

**Risk:** Without a simple baseline (e.g., predicting the majority class, or a
logistic regression on a few key features), there is no way to know whether the
complex models are worth the added complexity. Without fixed seeds, results are
not reproducible.

**Recommendation:** Start with a trivial baseline. Fix random seeds for every
stochastic step. Document the Python version, dependency versions (pixi.lock or
requirements.txt), and hardware used.

**Why:** Predictability demands that you can reproduce your results and compare
them against a reference. A baseline also forces you to justify every additional
layer of complexity.

---

### 🟡 Warning — No stability or robustness assessment

**Evidence:** There is no plan for cross-validation stability, sensitivity
analysis, or nested validation for hyperparameter tuning.

**Risk:** The chosen model may overfit the specific train-test split or
hyperparameter search may leak information from the test set into model
selection.

**Recommendation:** Use stratified k-fold cross-validation (k=5 or 10) for model
selection. If hyperparameter tuning is performed, use nested cross-validation
(inner loop for tuning, outer loop for unbiased evaluation). Report the variance
of scores across folds.

**Why:** Stability ensures that your model's performance is robust to reasonable
perturbations in the data and not an artifact of a lucky split. Nested
validation is the standard defense against optimization bias.

---

## Testing & Quality

### 🟡 Warning — No testing plan for data pipeline or model inference

**Evidence:** The timeline lists "Data extraction and cleaning" in Week 1 but
never describes tests for data quality, schema validation, or model inference
endpoints.

**Recommendation:** Add data tests (e.g., Great Expectations or pandera checks)
for column types, null rates, and distribution drift. Add an inference test that
verifies the deployed API returns predictions in the expected format and
latency.

**Why:** Data pipelines silently fail more often than model code. Tests at the
data layer catch schema changes, upstream bugs, and drift before they corrupt
model training or production predictions.

---

## Timeline & Risk

### 🔴 Critical — No rollback or abort criteria

**Evidence:** Week 3 is "Deploy to production API" with no mention of staging,
canary deployment, or criteria for delaying launch.

**Risk:** If the model performs poorly in staging, there is no documented
process for deciding whether to proceed, patch, or abort. This creates
organizational pressure to ship a bad model.

**Recommendation:** Define a staging phase with explicit success criteria (e.g.,
AUC ≥ 0.75, latency < 100ms p99). Define a rollback trigger and a post-launch
monitoring plan (prediction distribution tracking, ground-truth feedback loop).

**Why:** Every deployment plan needs an escape hatch. Explicit criteria remove
ambiguity and protect both the team and the business from a failed launch.
```
