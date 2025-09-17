// FILE: app/lib/animation/CAPSAssets.js
// PURPOSE: CAPS curriculum-specific visual assets and animations

export const CAPSAssets = {
  mathematics: {
    algebra: {
      equations: ["2x + 5 = 15", "y = mx + c", "a² + b² = c²"],
      steps: ["Isolate variable", "Simplify", "Check answer"],
      visualElements: ["balance_scale", "number_line", "graph"],
    },
    geometry: {
      shapes: ["triangle", "circle", "rectangle", "polygon"],
      theorems: ["Pythagoras", "Area formulas", "Volume calculations"],
      animations: ["angle_rotation", "shape_transformation", "proof_steps"],
    },
    calculus: {
      concepts: ["derivatives", "integrals", "limits"],
      graphs: ["parabola", "sine_wave", "exponential"],
      applications: ["rate_of_change", "area_under_curve", "optimization"],
    },
  },

  physical_sciences: {
    physics: {
      mechanics: {
        forces: ["gravity", "friction", "tension", "normal"],
        vectors: ["displacement", "velocity", "acceleration"],
        animations: ["projectile_motion", "pendulum", "collision"],
      },
      waves: {
        types: ["sound", "light", "water"],
        properties: ["frequency", "wavelength", "amplitude"],
        animations: ["wave_propagation", "interference", "reflection"],
      },
      electricity: {
        components: ["battery", "resistor", "capacitor", "switch"],
        concepts: ["current", "voltage", "resistance"],
        animations: ["electron_flow", "circuit_analysis", "ohms_law"],
      },
    },
    chemistry: {
      atoms: {
        structure: ["nucleus", "electrons", "orbitals"],
        bonding: ["ionic", "covalent", "metallic"],
        animations: ["electron_movement", "bond_formation", "reactions"],
      },
      reactions: {
        types: ["synthesis", "decomposition", "combustion"],
        equations: ["balancing", "stoichiometry", "yield"],
        animations: ["molecular_collision", "catalyst_action", "energy_change"],
      },
    },
  },

  life_sciences: {
    biology: {
      cells: {
        types: ["prokaryotic", "eukaryotic"],
        organelles: ["nucleus", "mitochondria", "chloroplasts"],
        processes: ["mitosis", "meiosis", "protein_synthesis"],
      },
      ecosystems: {
        levels: ["organism", "population", "community", "ecosystem"],
        cycles: ["water", "carbon", "nitrogen"],
        interactions: ["predation", "competition", "symbiosis"],
      },
      evolution: {
        mechanisms: ["natural_selection", "genetic_drift", "mutation"],
        evidence: ["fossils", "comparative_anatomy", "molecular"],
        animations: ["species_change", "phylogenetic_tree", "adaptation"],
      },
    },
  },
};

// Topic detection and asset selection
export function selectEducationalAssets(topic) {
  const topicLower = topic.toLowerCase();

  // Mathematics keywords
  if (topicLower.includes("algebra") || topicLower.includes("equation")) {
    return {
      subject: "mathematics",
      category: "algebra",
      assets: CAPSAssets.mathematics.algebra,
      visualTheme: "clean_mathematical",
      primaryColor: "#3b82f6",
      animations: ["equation_solving", "balance_scale", "step_by_step"],
    };
  }

  if (
    topicLower.includes("geometry") ||
    topicLower.includes("triangle") ||
    topicLower.includes("circle")
  ) {
    return {
      subject: "mathematics",
      category: "geometry",
      assets: CAPSAssets.mathematics.geometry,
      visualTheme: "geometric_shapes",
      primaryColor: "#8b5cf6",
      animations: [
        "shape_construction",
        "angle_measurement",
        "proof_visualization",
      ],
    };
  }

  // Physics keywords
  if (
    topicLower.includes("force") ||
    topicLower.includes("motion") ||
    topicLower.includes("physics")
  ) {
    return {
      subject: "physical_sciences",
      category: "physics",
      assets: CAPSAssets.physical_sciences.physics.mechanics,
      visualTheme: "vector_forces",
      primaryColor: "#f59e0b",
      animations: ["force_vectors", "motion_diagram", "energy_transfer"],
    };
  }

  // Chemistry keywords
  if (
    topicLower.includes("atom") ||
    topicLower.includes("molecule") ||
    topicLower.includes("reaction")
  ) {
    return {
      subject: "physical_sciences",
      category: "chemistry",
      assets: CAPSAssets.physical_sciences.chemistry.atoms,
      visualTheme: "molecular_structure",
      primaryColor: "#10b981",
      animations: [
        "molecular_bonding",
        "reaction_mechanism",
        "electron_orbitals",
      ],
    };
  }

  // Biology keywords
  if (
    topicLower.includes("cell") ||
    topicLower.includes("photosynthesis") ||
    topicLower.includes("biology")
  ) {
    return {
      subject: "life_sciences",
      category: "biology",
      assets: CAPSAssets.life_sciences.biology.cells,
      visualTheme: "biological_process",
      primaryColor: "#22c55e",
      animations: [
        "cellular_process",
        "organelle_function",
        "biological_pathway",
      ],
    };
  }

  // Default fallback
  return {
    subject: "general",
    category: "educational",
    assets: { concepts: ["learning", "understanding", "knowledge"] },
    visualTheme: "clean_educational",
    primaryColor: "#6366f1",
    animations: ["concept_introduction", "step_explanation", "summary_points"],
  };
}

// Animation templates for different CAPS concepts
export const animationTemplates = {
  equation_solving: {
    beats: ["setup", "problem", "solve", "aha"],
    elements: [
      "equation_display",
      "balance_scale",
      "step_arrows",
      "result_highlight",
    ],
    duration: 35,
  },

  photosynthesis_process: {
    beats: ["setup", "problem", "insight", "solve", "aha"],
    elements: ["plant_cell", "sunlight", "co2_molecules", "glucose_production"],
    duration: 40,
  },

  force_analysis: {
    beats: ["setup", "problem", "confusion", "insight", "solve"],
    elements: [
      "object",
      "force_vectors",
      "free_body_diagram",
      "resultant_force",
    ],
    duration: 38,
  },

  chemical_bonding: {
    beats: ["setup", "problem", "insight", "solve", "aha"],
    elements: ["atoms", "electrons", "bond_formation", "molecular_structure"],
    duration: 42,
  },
};

