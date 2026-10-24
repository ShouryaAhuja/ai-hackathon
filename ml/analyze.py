#!/usr/bin/env python3
"""
ml/analyze.py — AirTouch Empirical Evaluation Analysis Script (T3.2)

Reads recorded trials CSV (e.g. trials.csv) from the AirTouch Test Mode
and produces quantitative evaluation artifacts into docs/:
  1. docs/per_class.csv        — Per-gesture precision, recall, F1, and support
  2. docs/confusion_matrix.png — True vs predicted matrix with annotated counts
  3. docs/condition_table.csv  — Accuracy, neutral rate, error rate by condition
  4. docs/threshold_curve.png  — Accuracy vs abstention (neutral) rate across thresholds (0.5–0.9)

Explicitly handles the NEUTRAL class (safe rejection / low-confidence abstention).
Prints a formatted evaluation summary to the console.
"""

from __future__ import annotations

import argparse
import os
import sys
from typing import Dict, List, Tuple

# Lazy-import visualization and data science libraries with friendly fallback
try:
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    import numpy as np
    import pandas as pd
except ImportError as err:
    if "--help" not in sys.argv and "-h" not in sys.argv:
        print(f"[ERROR] Missing required Python package: {err.name}")
        print("Please install requirements using: pip install -r ml/requirements.txt")
        sys.exit(1)

# Canonical gestures defined in PRD §6 and config.ts
CANONICAL_GESTURES = [
    "Open_Palm",
    "Pointing_Up",
    "Victory",
    "Thumb_Up",
    "Thumb_Down",
    "ILoveYou",
    "Closed_Fist",
    "None",
]

PREDICTED_CLASSES = [
    "Open_Palm",
    "Pointing_Up",
    "Victory",
    "Thumb_Up",
    "Thumb_Down",
    "ILoveYou",
    "Closed_Fist",
    "NEUTRAL",
]

DEFAULT_OPERATING_THRESHOLD = 0.70


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Analyze AirTouch trials.csv and output metrics to docs/"
    )
    parser.add_argument(
        "csv_paths",
        nargs="*",
        default=["trials.csv"],
        help="One or more paths to trials CSV files (default: trials.csv)",
    )
    parser.add_argument(
        "--output-dir",
        default="docs",
        help="Output directory for CSVs and PNGs (default: docs)",
    )
    parser.add_argument(
        "--mock",
        action="store_true",
        help="Generate synthetic trials if input files do not exist (for pipeline testing)",
    )
    return parser.parse_args()


def generate_mock_trials() -> pd.DataFrame:
    """Generate synthetic realistic trials for testing when no CSV is present."""
    np.random.seed(42)
    conditions = ["C1_baseline", "C2_dim", "C3_backlit", "C4_cluttered"]
    records = []

    for condition in conditions:
        for gesture in CANONICAL_GESTURES:
            # 5 trials per gesture per condition (35 trials per condition = 140 total)
            for trial_idx in range(5):
                is_none = gesture == "None"
                # Realistic degradation across conditions
                if condition == "C1_baseline":
                    prob_correct = 0.95 if not is_none else 0.90
                    prob_neutral = 0.05 if not is_none else 0.10
                elif condition == "C2_dim":
                    prob_correct = 0.85 if not is_none else 0.85
                    prob_neutral = 0.12 if not is_none else 0.15
                elif condition == "C3_backlit":
                    prob_correct = 0.75 if not is_none else 0.70
                    prob_neutral = 0.20 if not is_none else 0.25
                else:  # C4 cluttered
                    prob_correct = 0.80 if not is_none else 0.75
                    prob_neutral = 0.15 if not is_none else 0.20

                dice = np.random.rand()
                if is_none:
                    if dice < prob_correct:
                        pred = "NEUTRAL"
                        raw_label = "None"
                        raw_score = float(np.random.uniform(0.1, 0.45))
                    else:
                        pred = np.random.choice(["Open_Palm", "Pointing_Up"])
                        raw_label = pred
                        raw_score = float(np.random.uniform(0.72, 0.82))
                else:
                    if dice < prob_correct:
                        pred = gesture
                        raw_label = gesture
                        raw_score = float(np.random.uniform(0.78, 0.98))
                    elif dice < prob_correct + prob_neutral:
                        pred = "NEUTRAL"
                        raw_label = gesture
                        raw_score = float(np.random.uniform(0.45, 0.68))
                    else:
                        # Misclassification
                        other = [g for g in CANONICAL_GESTURES if g != gesture and g != "None"]
                        pred = np.random.choice(other)
                        raw_label = pred
                        raw_score = float(np.random.uniform(0.71, 0.85))

                # Compute verdict
                if is_none:
                    verdict = "correct" if pred == "NEUTRAL" else "incorrect"
                    triggers_fired = 0 if pred == "NEUTRAL" else 1
                else:
                    if pred == gesture:
                        verdict = "correct"
                        triggers_fired = 1
                    elif pred == "NEUTRAL":
                        verdict = "neutral"
                        triggers_fired = 0
                    else:
                        verdict = "incorrect"
                        triggers_fired = 1

                records.append({
                    "timestamp": f"2026-10-24T18:{np.random.randint(10,59)}:{np.random.randint(10,59)}Z",
                    "session_id": f"mock-session-{condition}",
                    "condition": condition,
                    "true_gesture": gesture,
                    "predicted": pred,
                    "raw_label": raw_label,
                    "raw_score": round(raw_score, 4),
                    "latency_ms": round(float(np.random.uniform(18.0, 32.0)), 1),
                    "triggers_fired": triggers_fired,
                    "verdict": verdict,
                })

    return pd.DataFrame(records)


def load_trials_data(csv_paths: List[str], allow_mock: bool = False) -> pd.DataFrame:
    """Load, validate, and concatenate one or more trials CSV datasets, dropping duplicates."""
    if not csv_paths:
        csv_paths = ["trials.csv"]

    existing_files = [p for p in csv_paths if os.path.exists(p)]

    if not existing_files:
        if allow_mock:
            print(f"[INFO] None of '{csv_paths}' found. Generating mock evaluation trials (--mock).")
            return generate_mock_trials()
        print(f"[ERROR] None of the specified trials files exist: {csv_paths}")
        print("  Run Test Mode in the AirTouch Kiosk UI (press key 'T' on Home) to record trials,")
        print("  or pass '--mock' to test the evaluation pipeline with synthetic data.")
        sys.exit(1)

    dfs = []
    total_raw_rows = 0
    for file_path in existing_files:
        try:
            curr_df = pd.read_csv(file_path)
            total_raw_rows += len(curr_df)
            dfs.append(curr_df)
            print(f"[INFO] Loaded {len(curr_df)} rows from '{file_path}'.")
        except Exception as e:
            print(f"[WARNING] Could not read '{file_path}': {e}")

    if not dfs:
        print("[ERROR] No valid CSV files could be loaded.")
        sys.exit(1)

    combined_df = pd.concat(dfs, ignore_index=True)

    required_cols = {"condition", "true_gesture", "predicted", "raw_score"}
    missing = required_cols - set(combined_df.columns)
    if missing:
        print(f"[ERROR] Missing required columns in datasets: {missing}")
        sys.exit(1)

    # Drop exact duplicate rows (PRE-COLLECTION-FIX Task D)
    initial_count = len(combined_df)
    combined_df = combined_df.drop_duplicates()
    dropped_count = initial_count - len(combined_df)
    if dropped_count > 0:
        print(f"[INFO] Dropped {dropped_count} exact duplicate rows ({initial_count} -> {len(combined_df)} unique trials).")

    if len(combined_df) == 0:
        print("[ERROR] Combined datasets contain zero trials.")
        sys.exit(1)

    # Standardize column types
    combined_df["condition"] = combined_df["condition"].astype(str)
    combined_df["true_gesture"] = combined_df["true_gesture"].astype(str)
    combined_df["predicted"] = combined_df["predicted"].astype(str)
    combined_df["raw_score"] = pd.to_numeric(combined_df["raw_score"], errors="coerce").fillna(0.0)

    if "raw_label" not in combined_df.columns:
        combined_df["raw_label"] = combined_df["predicted"]
    if "latency_ms" not in combined_df.columns:
        combined_df["latency_ms"] = 25.0
    else:
        combined_df["latency_ms"] = pd.to_numeric(combined_df["latency_ms"], errors="coerce").fillna(25.0)

    if "triggers_fired" not in combined_df.columns:
        combined_df["triggers_fired"] = 0
    else:
        combined_df["triggers_fired"] = pd.to_numeric(combined_df["triggers_fired"], errors="coerce").fillna(0).astype(int)

    return combined_df


def compute_per_class_metrics(df: pd.DataFrame) -> pd.DataFrame:
    """
    Computes precision, recall, F1-score, and support for each gesture class.
    Handles NEUTRAL class explicitly.
    """
    classes = [g for g in CANONICAL_GESTURES if g in df["true_gesture"].values]
    if not classes:
        classes = sorted(df["true_gesture"].unique())

    metrics_list = []

    for c in classes:
        # True Positive: true == c and predicted == c
        # (For None/no-gesture, predicting NEUTRAL is true positive rejection)
        if c == "None":
            tp = int(((df["true_gesture"] == c) & (df["predicted"] == "NEUTRAL")).sum())
            fp = int(((df["true_gesture"] != c) & (df["predicted"] == "NEUTRAL")).sum())
            fn = int(((df["true_gesture"] == c) & (df["predicted"] != "NEUTRAL")).sum())
            support = int((df["true_gesture"] == c).sum())
        else:
            tp = int(((df["true_gesture"] == c) & (df["predicted"] == c)).sum())
            fp = int(((df["true_gesture"] != c) & (df["predicted"] == c)).sum())
            fn = int(((df["true_gesture"] == c) & (df["predicted"] != c)).sum())
            support = int((df["true_gesture"] == c).sum())

        precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        f1 = (2 * precision * recall / (precision + recall)) if (precision + recall) > 0 else 0.0

        # Also calculate abstention (neutral) count for this gesture
        neutral_count = int(((df["true_gesture"] == c) & (df["predicted"] == "NEUTRAL")).sum()) if c != "None" else 0
        neutral_rate = neutral_count / support if support > 0 else 0.0

        metrics_list.append({
            "gesture": c,
            "precision": round(precision, 4),
            "recall": round(recall, 4),
            "f1_score": round(f1, 4),
            "support": support,
            "abstentions": neutral_count,
            "abstention_rate": round(neutral_rate, 4),
        })

    result_df = pd.DataFrame(metrics_list)

    # Compute macro and weighted averages
    if len(result_df) > 0:
        macro_p = result_df["precision"].mean()
        macro_r = result_df["recall"].mean()
        macro_f1 = result_df["f1_score"].mean()
        total_support = result_df["support"].sum()

        weighted_p = (result_df["precision"] * result_df["support"]).sum() / total_support if total_support > 0 else 0.0
        weighted_r = (result_df["recall"] * result_df["support"]).sum() / total_support if total_support > 0 else 0.0
        weighted_f1 = (result_df["f1_score"] * result_df["support"]).sum() / total_support if total_support > 0 else 0.0

        summary_rows = [
            {
                "gesture": "MACRO_AVG",
                "precision": round(macro_p, 4),
                "recall": round(macro_r, 4),
                "f1_score": round(macro_f1, 4),
                "support": total_support,
                "abstentions": result_df["abstentions"].sum(),
                "abstention_rate": round(result_df["abstentions"].sum() / total_support, 4) if total_support > 0 else 0.0,
            },
            {
                "gesture": "WEIGHTED_AVG",
                "precision": round(weighted_p, 4),
                "recall": round(weighted_r, 4),
                "f1_score": round(weighted_f1, 4),
                "support": total_support,
                "abstentions": result_df["abstentions"].sum(),
                "abstention_rate": round(result_df["abstentions"].sum() / total_support, 4) if total_support > 0 else 0.0,
            },
        ]
        result_df = pd.concat([result_df, pd.DataFrame(summary_rows)], ignore_index=True)

    return result_df


def plot_confusion_matrix(df: pd.DataFrame, output_path: str) -> None:
    """
    Renders an annotated confusion matrix plot:
    Rows = True Gestures (including None)
    Cols = Predicted Gestures (including NEUTRAL)
    """
    true_labels = [g for g in CANONICAL_GESTURES if g in df["true_gesture"].values]
    if not true_labels:
        true_labels = sorted(df["true_gesture"].unique())

    pred_labels = [p for p in PREDICTED_CLASSES if p in df["predicted"].values or p == "NEUTRAL"]
    for p in df["predicted"].unique():
        if p not in pred_labels:
            pred_labels.append(p)

    # Compute contingency table
    matrix = np.zeros((len(true_labels), len(pred_labels)), dtype=int)
    for i, t in enumerate(true_labels):
        for j, p in enumerate(pred_labels):
            matrix[i, j] = int(((df["true_gesture"] == t) & (df["predicted"] == p)).sum())

    total_trials = len(df)
    # Compute accuracy: matches on true gesture, plus None predicting NEUTRAL
    correct_count = 0
    for i, t in enumerate(true_labels):
        for j, p in enumerate(pred_labels):
            if (t == p) or (t == "None" and p == "NEUTRAL"):
                correct_count += matrix[i, j]
    overall_acc = (correct_count / total_trials * 100) if total_trials > 0 else 0.0

    fig, ax = plt.subplots(figsize=(10, 8), dpi=300)
    fig.patch.set_facecolor("#0b0f19")
    ax.set_facecolor("#0b0f19")

    # Plot heatmap
    cmap = plt.cm.Blues
    im = ax.imshow(matrix, interpolation="nearest", cmap=cmap)

    # Add colorbar
    cbar = ax.figure.colorbar(im, ax=ax, fraction=0.046, pad=0.04)
    cbar.ax.yaxis.set_tick_params(color="#94a3b8")
    plt.setp(plt.getp(cbar.ax.axes, "yticklabels"), color="#cbd5e1", fontsize=10)
    cbar.set_label("Trial Count", color="#cbd5e1", fontsize=11, labelpad=8)

    # Axes ticks and labels
    ax.set_xticks(np.arange(len(pred_labels)))
    ax.set_yticks(np.arange(len(true_labels)))
    ax.set_xticklabels(pred_labels, rotation=40, ha="right", color="#e2e8f0", fontsize=11)
    ax.set_yticklabels(true_labels, color="#e2e8f0", fontsize=11)

    ax.set_xlabel("Predicted Gesture (after 0.70 threshold)", color="#5eead4", fontsize=13, fontweight="bold", labelpad=10)
    ax.set_ylabel("Ground-Truth Gesture (User Intention)", color="#5eead4", fontsize=13, fontweight="bold", labelpad=10)

    title = "AirTouch Kiosk — Empirical Confusion Matrix\n"
    subtitle = f"Total Trials: {total_trials} · Overall System Accuracy: {overall_acc:.1f}% · Threshold: {DEFAULT_OPERATING_THRESHOLD}"
    ax.set_title(title + subtitle, color="#ffffff", fontsize=14, fontweight="bold", pad=16)

    # Annotate counts inside cells
    thresh = matrix.max() / 2.0 if matrix.max() > 0 else 1.0
    for i in range(len(true_labels)):
        for j in range(len(pred_labels)):
            val = matrix[i, j]
            # Highlight correct cells vs errors
            is_correct = (true_labels[i] == pred_labels[j]) or (true_labels[i] == "None" and pred_labels[j] == "NEUTRAL")
            color = "#ffffff" if val > thresh else ("#93c5fd" if val > 0 else "#475569")
            weight = "bold" if is_correct and val > 0 else "normal"
            ax.text(
                j,
                i,
                f"{val}",
                ha="center",
                va="center",
                color=color,
                fontsize=12,
                fontweight=weight,
            )

    # Spines styling
    for spine in ax.spines.values():
        spine.set_color("#334155")
        spine.set_linewidth(1.2)

    plt.tight_layout()
    plt.savefig(output_path, facecolor=fig.get_facecolor(), edgecolor="none")
    plt.close(fig)


def compute_condition_table(df: pd.DataFrame) -> pd.DataFrame:
    """
    Calculates accuracy, neutral rate, error rate, and mean latency per condition.
    """
    conditions = sorted(df["condition"].unique())
    rows = []

    for c in conditions:
        cdf = df[df["condition"] == c]
        total = len(cdf)

        # Correct: true == pred OR (true == None and pred == NEUTRAL)
        correct_mask = (cdf["true_gesture"] == cdf["predicted"]) | (
            (cdf["true_gesture"] == "None") & (cdf["predicted"] == "NEUTRAL")
        )
        neutral_mask = (cdf["true_gesture"] != "None") & (cdf["predicted"] == "NEUTRAL")
        incorrect_mask = ~correct_mask & ~neutral_mask

        correct = int(correct_mask.sum())
        neutral = int(neutral_mask.sum())
        incorrect = int(incorrect_mask.sum())
        mean_lat = float(cdf["latency_ms"].mean()) if "latency_ms" in cdf.columns else 25.0

        # False triggers: actions emitted when true gesture is None/Other
        false_trig_mask = cdf["true_gesture"].isin(["None", "Other", "no_gesture"])
        if "triggers_fired" in cdf.columns:
            false_trig_count = int(cdf[false_trig_mask]["triggers_fired"].sum())
        else:
            false_trig_count = int((false_trig_mask & (cdf["predicted"] != "NEUTRAL")).sum())

        rows.append({
            "condition": c,
            "total_trials": total,
            "correct": correct,
            "neutral": neutral,
            "incorrect": incorrect,
            "false_triggers": false_trig_count,
            "accuracy": round(correct / total, 4) if total > 0 else 0.0,
            "neutral_rate": round(neutral / total, 4) if total > 0 else 0.0,
            "error_rate": round(incorrect / total, 4) if total > 0 else 0.0,
            "mean_latency_ms": round(mean_lat, 1),
        })

    # Summary row across ALL conditions
    total_all = len(df)
    corr_all = sum(r["correct"] for r in rows)
    neut_all = sum(r["neutral"] for r in rows)
    err_all = sum(r["incorrect"] for r in rows)
    false_all = sum(r["false_triggers"] for r in rows)
    lat_all = float(df["latency_ms"].mean()) if "latency_ms" in df.columns else 25.0

    rows.append({
        "condition": "ALL_CONDITIONS",
        "total_trials": total_all,
        "correct": corr_all,
        "neutral": neut_all,
        "incorrect": err_all,
        "false_triggers": false_all,
        "accuracy": round(corr_all / total_all, 4) if total_all > 0 else 0.0,
        "neutral_rate": round(neut_all / total_all, 4) if total_all > 0 else 0.0,
        "error_rate": round(err_all / total_all, 4) if total_all > 0 else 0.0,
        "mean_latency_ms": round(lat_all, 1),
    })

    return pd.DataFrame(rows)


def plot_threshold_curve(df: pd.DataFrame, output_path: str) -> None:
    """
    Generates the accuracy vs abstention (neutral) rate curve across thresholds 0.50 – 0.90.
    Demonstrates the trade-off: higher threshold -> higher precision, lower false triggers,
    higher abstention.
    """
    thresholds = np.linspace(0.50, 0.90, 21)
    acc_list = []
    neutral_list = []
    error_list = []

    total_trials = len(df)

    for th in thresholds:
        correct_cnt = 0
        neutral_cnt = 0
        error_cnt = 0

        for _, row in df.iterrows():
            true_g = row["true_gesture"]
            raw_lbl = str(row["raw_label"])
            score = float(row["raw_score"])

            # Re-threshold dynamically
            if raw_lbl in ("None", "") or score < th:
                pred = "NEUTRAL"
            else:
                pred = raw_lbl

            # Evaluate at this threshold
            if true_g in ("None", "Other"):
                if pred in ("NEUTRAL", "None"):
                    correct_cnt += 1
                else:
                    error_cnt += 1
            else:
                if pred == true_g:
                    correct_cnt += 1
                elif pred == "NEUTRAL":
                    neutral_cnt += 1
                else:
                    error_cnt += 1

        acc_list.append(correct_cnt / total_trials if total_trials > 0 else 0.0)
        neutral_list.append(neutral_cnt / total_trials if total_trials > 0 else 0.0)
        error_list.append(error_cnt / total_trials if total_trials > 0 else 0.0)

    fig, ax = plt.subplots(figsize=(9, 6), dpi=300)
    fig.patch.set_facecolor("#0b0f19")
    ax.set_facecolor("#0f172a")

    ax.plot(
        thresholds,
        acc_list,
        label="Accuracy (Correct Rate)",
        color="#14b8a6",
        linewidth=2.8,
        marker="o",
        markersize=6,
    )
    ax.plot(
        thresholds,
        neutral_list,
        label="Abstention Rate (Neutral State)",
        color="#f59e0b",
        linewidth=2.5,
        marker="s",
        markersize=6,
    )
    ax.plot(
        thresholds,
        error_list,
        label="False Trigger / Error Rate",
        color="#f43f5e",
        linewidth=2.2,
        marker="^",
        markersize=6,
        linestyle="--",
    )

    # Highlight default threshold (0.70)
    ax.axvline(
        x=DEFAULT_OPERATING_THRESHOLD,
        color="#38bdf8",
        linestyle=":",
        linewidth=2,
        label=f"Selected Operating Threshold ({DEFAULT_OPERATING_THRESHOLD})",
    )

    ax.set_xlim(0.48, 0.92)
    ax.set_ylim(-0.02, 1.05)
    ax.set_xlabel("Confidence Score Threshold", color="#cbd5e1", fontsize=12, fontweight="bold", labelpad=8)
    ax.set_ylabel("Proportion of Trials (0.0 – 1.0)", color="#cbd5e1", fontsize=12, fontweight="bold", labelpad=8)
    ax.set_title("AirTouch Threshold Sensitivity Curve\nAccuracy vs Abstention vs False-Trigger Rate", color="#ffffff", fontsize=14, fontweight="bold", pad=12)

    ax.grid(True, linestyle="--", alpha=0.25, color="#64748b")
    ax.tick_params(colors="#94a3b8", labelsize=10)

    legend = ax.legend(loc="center right", facecolor="#1e293b", edgecolor="#334155", fontsize=10)
    for text in legend.get_texts():
        text.set_color("#f1f5f9")

    for spine in ax.spines.values():
        spine.set_color("#334155")

    plt.tight_layout()
    plt.savefig(output_path, facecolor=fig.get_facecolor(), edgecolor="none")
    plt.close(fig)


def print_console_summary(
    total: int,
    cond_df: pd.DataFrame,
    per_class_df: pd.DataFrame,
    output_files: List[str],
) -> None:
    """Prints a clear, formatted summary to standard output."""
    all_row = cond_df[cond_df["condition"] == "ALL_CONDITIONS"].iloc[0]

    print("\n" + "=" * 70)
    print("  AIRTOUCH KIOSK (Q15) -- EMPIRICAL EVALUATION SUMMARY (T3.2)")
    print("=" * 70)
    print(f"  Total Trials Evaluated : {total}")
    print(f"  Overall Accuracy       : {all_row['accuracy'] * 100:.2f}%")
    print(f"  Neutral / Abstain Rate : {all_row['neutral_rate'] * 100:.2f}%")
    print(f"  Error / Misclassified  : {all_row['error_rate'] * 100:.2f}%")
    print(f"  Total False Triggers   : {all_row['false_triggers']}")
    print(f"  Mean Frame Latency     : {all_row['mean_latency_ms']:.1f} ms")
    print("-" * 70)
    print("  PER-CONDITION PERFORMANCE:")
    for _, r in cond_df.iterrows():
        c_name = r["condition"].ljust(18)
        print(
            f"   - {c_name} | Acc: {r['accuracy']*100:5.1f}% | Neutral: {r['neutral_rate']*100:5.1f}% | False Trig: {r['false_triggers']:2d} | N={r['total_trials']}"
        )
    print("-" * 70)
    print("  PER-GESTURE F1 SCORES:")
    for _, r in per_class_df.iterrows():
        if r["gesture"] in ("MACRO_AVG", "WEIGHTED_AVG"):
            continue
        g_name = r["gesture"].ljust(15)
        print(
            f"   - {g_name} | Prec: {r['precision']:0.3f} | Recall: {r['recall']:0.3f} | F1: {r['f1_score']:0.3f} | Support: {r['support']}"
        )
    print("=" * 70)
    print("  GENERATED ARTIFACTS:")
    for f in output_files:
        print(f"   [OK] {f}")
    print("=" * 70 + "\n")


def main() -> None:
    args = parse_args()
    os.makedirs(args.output_dir, exist_ok=True)

    # 1. Load trials
    df = load_trials_data(args.csv_paths, allow_mock=args.mock)

    # 2. Compute per-class metrics
    per_class_df = compute_per_class_metrics(df)
    per_class_csv = os.path.join(args.output_dir, "per_class.csv")
    per_class_df.to_csv(per_class_csv, index=False)

    # 3. Generate confusion matrix
    cm_png = os.path.join(args.output_dir, "confusion_matrix.png")
    plot_confusion_matrix(df, cm_png)

    # 4. Compute condition table
    cond_df = compute_condition_table(df)
    cond_csv = os.path.join(args.output_dir, "condition_table.csv")
    cond_df.to_csv(cond_csv, index=False)

    # 5. Plot threshold curve
    curve_png = os.path.join(args.output_dir, "threshold_curve.png")
    plot_threshold_curve(df, curve_png)

    # 6. Print console summary
    output_files = [per_class_csv, cm_png, cond_csv, curve_png]
    print_console_summary(len(df), cond_df, per_class_df, output_files)


if __name__ == "__main__":
    main()
