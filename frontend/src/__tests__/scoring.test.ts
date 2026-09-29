import { describe, it, expect } from "vitest";
import { MOCK_RUBRIC, MOCK_FINAL_RESULTS } from "../services/mockData";

describe("Judging Engine (Innovation 25, Technical 25, Impact 20, UX 15, Presentation 15)", () => {
  it("should verify rubric criteria weights sum to exactly 1.0 (100%)", () => {
    const totalWeight = MOCK_RUBRIC.criteria.reduce((sum, c) => sum + c.weight, 0);
    expect(totalWeight).toBeCloseTo(1.0, 4);
  });

  it("should verify criteria max scores sum to exactly 100.0 points", () => {
    const totalMax = MOCK_RUBRIC.criteria.reduce((sum, c) => sum + c.maxScore, 0);
    expect(totalMax).toBe(100);
  });

  it("should verify each of the 5 required criteria exists with exact weight and max score", () => {
    const critMap = new Map(MOCK_RUBRIC.criteria.map((c) => [c.name, c]));
    
    // Innovation (25)
    const inno = Array.from(critMap.entries()).find(([name]) => name.includes("Innovation"));
    expect(inno?.[1].weight).toBe(0.25);
    expect(inno?.[1].maxScore).toBe(25);

    // Technical (25)
    const tech = Array.from(critMap.entries()).find(([name]) => name.includes("Technical"));
    expect(tech?.[1].weight).toBe(0.25);
    expect(tech?.[1].maxScore).toBe(25);

    // Impact (20)
    const impact = Array.from(critMap.entries()).find(([name]) => name.includes("Impact"));
    expect(impact?.[1].weight).toBe(0.20);
    expect(impact?.[1].maxScore).toBe(20);

    // UX (15)
    const ux = Array.from(critMap.entries()).find(([name]) => name.includes("UX") || name.includes("User Experience"));
    expect(ux?.[1].weight).toBe(0.15);
    expect(ux?.[1].maxScore).toBe(15);

    // Presentation (15)
    const pres = Array.from(critMap.entries()).find(([name]) => name.includes("Presentation"));
    expect(pres?.[1].weight).toBe(0.15);
    expect(pres?.[1].maxScore).toBe(15);
  });

  it("should correctly compute weighted scores for all 5 criteria out of 100", () => {
    const sampleScores: Record<string, number> = {
      "00000000-0000-4000-8000-000000000051": 24,   // Innovation: 24/25 -> 24.0
      "00000000-0000-4000-8000-000000000052": 23.5, // Technical: 23.5/25 -> 23.5
      "00000000-0000-4000-8000-000000000053": 19,   // Impact: 19/20 -> 19.0
      "00000000-0000-4000-8000-000000000054": 14,   // UX: 14/15 -> 14.0
      "00000000-0000-4000-8000-000000000055": 14.5, // Presentation: 14.5/15 -> 14.5
    };

    let total = 0;
    MOCK_RUBRIC.criteria.forEach((c) => {
      const score = sampleScores[c.id];
      total += (score / c.maxScore) * c.weight * 100;
    });

    expect(total).toBeCloseTo(95.0, 1);
  });

  it("should preserve ranking order in normalized final results", () => {
    const sorted = [...MOCK_FINAL_RESULTS].sort((a, b) => b.finalScore - a.finalScore);
    expect(sorted[0].rank).toBe(1);
    expect(sorted[0].finalScore).toBeGreaterThanOrEqual(sorted[1].finalScore);
  });
});
