import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { judgingService } from "../../services/judgingService";
import { MOCK_RUBRIC } from "../../services/mockData";
import { Rubric, RubricCriterion } from "../../types";
import { Modal } from "../../components/common/Modal";
import {
  Sliders,
  PlusCircle,
  Edit2,
  CheckCircle,
  AlertTriangle,
  Scale,
  Sparkles,
} from "lucide-react";

export const RubricManagement: React.FC = () => {
  const { activeEventId } = useAuth();
  const { success, error } = useToast();

  const [rubric, setRubric] = useState<Rubric>(MOCK_RUBRIC);
  const [criterionModal, setCriterionModal] = useState(false);
  const [editingCritId, setEditingCritId] = useState<string | null>(null);

  // Form State
  const [critName, setCritName] = useState("");
  const [critDesc, setCritDesc] = useState("");
  const [critWeight, setCritWeight] = useState(0.3);
  const [critMaxScore, setCritMaxScore] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadRubric = async () => {
      try {
        const res = await judgingService.getRubric(activeEventId);
        if (res.rubric) {
          setRubric(res.rubric);
        }
      } catch {}
    };
    loadRubric();
  }, [activeEventId]);

  const totalWeight = rubric.criteria.reduce((sum, c) => sum + c.weight, 0);
  const isBalanced = Math.abs(totalWeight - 1.0) < 0.001;

  const handleSaveCriterion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!critName.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingCritId) {
        const res = await judgingService.updateCriterion(activeEventId, rubric.id, editingCritId, {
          name: critName,
          description: critDesc,
          weight: Number(critWeight),
          maxScore: Number(critMaxScore),
        });
        setRubric((prev) => ({
          ...prev,
          criteria: prev.criteria.map((c) => (c.id === editingCritId ? res.criterion : c)),
        }));
      } else {
        const res = await judgingService.addCriterion(activeEventId, rubric.id, {
          name: critName,
          description: critDesc,
          weight: Number(critWeight),
          maxScore: Number(critMaxScore),
        });
        setRubric((prev) => ({
          ...prev,
          criteria: [...prev.criteria, res.criterion],
        }));
      }
      success("Criterion saved successfully!");
      setCriterionModal(false);
    } catch {
      if (editingCritId) {
        setRubric((prev) => ({
          ...prev,
          criteria: prev.criteria.map((c) =>
            c.id === editingCritId
              ? {
                  ...c,
                  name: critName,
                  description: critDesc,
                  weight: Number(critWeight),
                  maxScore: Number(critMaxScore),
                }
              : c
          ),
        }));
      } else {
        const newCrit: RubricCriterion = {
          id: `crit-${Date.now()}`,
          rubricId: rubric.id,
          name: critName,
          description: critDesc,
          weight: Number(critWeight),
          maxScore: Number(critMaxScore),
        };
        setRubric((prev) => ({
          ...prev,
          criteria: [...prev.criteria, newCrit],
        }));
      }
      success("Criterion saved!");
      setCriterionModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div className="page-title">
          <h1>
            <Sliders size={28} color="var(--primary)" /> Evaluation Rubric & Criteria
          </h1>
          <p>Define evaluation criteria, scoring scales, and mathematical weighting factors for judges</p>
        </div>

        <div className="page-actions">
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingCritId(null);
              setCritName("");
              setCritDesc("");
              setCritWeight(0.25);
              setCritMaxScore(10);
              setCriterionModal(true);
            }}
          >
            <PlusCircle size={16} /> Add Criterion
          </button>
        </div>
      </div>

      {/* Rubric Info & Weight Balance Tracker */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <div className="card-header">
          <div>
            <span className="badge badge-primary" style={{ marginBottom: "0.4rem" }}>Active Rubric</span>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 700 }}>{rubric.name}</h2>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Score Range</span>
            <div style={{ fontSize: "1.1rem", fontWeight: 700 }}>
              {rubric.minScore} to {rubric.maxScore} pts
            </div>
          </div>
        </div>

        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: "1.5rem" }}>
          {rubric.description}
        </p>

        {/* Weight Balance Meter */}
        <div
          style={{
            background: "var(--bg-input)",
            border: `1px solid ${isBalanced ? "rgba(16, 185, 129, 0.3)" : "rgba(245, 158, 11, 0.3)"}`,
            borderRadius: "var(--radius-md)",
            padding: "1rem 1.25rem",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 600 }}>
              {isBalanced ? (
                <CheckCircle size={18} color="var(--accent-emerald)" />
              ) : (
                <AlertTriangle size={18} color="var(--accent-amber)" />
              )}
              <span>Total Weight Allocation: {Math.round(totalWeight * 100)}%</span>
            </div>
            <span
              className={`badge ${isBalanced ? "badge-success" : "badge-warning"}`}
            >
              {isBalanced ? "Balanced (100%)" : `${Math.round(totalWeight * 100)}% / 100%`}
            </span>
          </div>

          <div
            style={{
              height: "8px",
              background: "var(--bg-card)",
              borderRadius: "var(--radius-full)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${Math.min(totalWeight * 100, 100)}%`,
                background: isBalanced ? "var(--accent-emerald)" : "var(--accent-amber)",
                borderRadius: "var(--radius-full)",
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>
      </div>

      {/* Criteria Cards */}
      <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1rem" }}>
        Weighted Evaluation Criteria ({rubric.criteria.length})
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {rubric.criteria.map((c) => (
          <div key={c.id} className="card" style={{ padding: "1.25rem 1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>
                    {c.name}
                  </h3>
                  <span className="badge badge-primary">
                    Weight: {Math.round(c.weight * 100)}%
                  </span>
                  <span className="badge badge-neutral">
                    Max: {c.maxScore} pts
                  </span>
                </div>
                <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                  {c.description}
                </p>
              </div>

              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setEditingCritId(c.id);
                  setCritName(c.name);
                  setCritDesc(c.description || "");
                  setCritWeight(c.weight);
                  setCritMaxScore(c.maxScore);
                  setCriterionModal(true);
                }}
              >
                <Edit2 size={14} /> Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Criterion Modal */}
      <Modal
        isOpen={criterionModal}
        onClose={() => setCriterionModal(false)}
        title={editingCritId ? "Edit Evaluation Criterion" : "Add Evaluation Criterion"}
      >
        <form onSubmit={handleSaveCriterion}>
          <div className="form-group">
            <label className="form-label" htmlFor="crit-name">
              Criterion Name <span className="required">*</span>
            </label>
            <input
              id="crit-name"
              type="text"
              className="form-input"
              placeholder="e.g. Technical Depth & Architecture"
              value={critName}
              onChange={(e) => setCritName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="crit-desc">
              Description & Scoring Guide
            </label>
            <textarea
              id="crit-desc"
              className="form-textarea"
              placeholder="Explain what judges should look for when scoring this criterion..."
              value={critDesc}
              onChange={(e) => setCritDesc(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="crit-weight">
                Weight Factor (0.0 to 1.0) <span className="required">*</span>
              </label>
              <input
                id="crit-weight"
                type="number"
                step={0.05}
                min={0.05}
                max={1.0}
                className="form-input"
                value={critWeight}
                onChange={(e) => setCritWeight(Number(e.target.value))}
                required
              />
              <span className="form-hint">{Math.round(critWeight * 100)}% of final score</span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="crit-max">
                Max Score (points) <span className="required">*</span>
              </label>
              <input
                id="crit-max"
                type="number"
                min={1}
                max={100}
                className="form-input"
                value={critMaxScore}
                onChange={(e) => setCritMaxScore(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setCriterionModal(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Criterion"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
