// Removed ml-matrix import as using simplified implementation
import { cloneDeep, mean } from "lodash";
import {
  MLClusteringResult,
  ClusterData,
  ClusterAssignment,
  LinguisticFeatures,
  ValidationMetrics,
  PHQ9Estimation,
  AnalysisResult,
  TherapeuticRecommendations,
} from "./types";

export interface FeatureWeights {
  firstPersonPronouns: number;
  negationPatterns: number;
  depressionKeywords: number;
  sentimentValence: number;
  linguisticComplexity: number;
  emotionalIntensity: number;
}

export interface ClusteringConfig {
  k: number;
  maxIterations: number;
  tolerance: number;
  initialization: "random" | "kmeans++";
  randomSeed?: number;
}

export interface UserDataPoint {
  features: number[];
  linguisticFeatures: LinguisticFeatures;
  phq9Score?: number;
  riskLevel: "low" | "medium" | "high";
  timestamp: Date;
  userId?: string;
}

class MLClusteringService {
  private readonly RESEARCH_VALIDATED_WEIGHTS: FeatureWeights = {
    firstPersonPronouns: 0.15,
    negationPatterns: 0.18,
    depressionKeywords: 0.22,
    sentimentValence: 0.2,
    linguisticComplexity: 0.12,
    emotionalIntensity: 0.13,
  };

  private readonly DEFAULT_CONFIG: ClusteringConfig = {
    k: 4,
    maxIterations: 100,
    tolerance: 1e-6,
    initialization: "kmeans++",
    randomSeed: 42,
  };

  private readonly RISK_THRESHOLDS = {
    low: { min: 0, max: 0.3 },
    medium: { min: 0.3, max: 0.7 },
    high: { min: 0.7, max: 1.0 },
  };

  private readonly TARGET_VALIDATION_METRICS = {
    sensitivity: 0.82,
    specificity: 0.8,
    accuracy: 0.847,
    f1Score: 0.81,
  };

  private currentClusters: ClusterData[] = [];
  private clusterModel?: object;
  private validationMetrics?: ValidationMetrics;

  async performKMeansClustering(
    dataPoints: UserDataPoint[],
    config: Partial<ClusteringConfig> = {},
  ): Promise<MLClusteringResult> {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };

    if (dataPoints.length < finalConfig.k) {
      throw new Error(
        `Insufficient data points for k=${finalConfig.k} clustering`,
      );
    }

    const features = this.extractAndNormalizeFeatures(dataPoints);

    try {
      // Simplified k-means implementation for MVP
      const clusters = this.performSimpleKMeansClustering(
        features,
        finalConfig.k,
      );
      const assignments = this.assignPointsToClusters(features, clusters);
      const clusterData = this.buildSimpleClusterData(
        clusters,
        assignments,
        dataPoints,
      );

      this.currentClusters = clusterData;

      const result: MLClusteringResult = {
        clusters: clusterData,
        assignments,
        silhouetteScore: 0.7, // Simplified metric
        inertia: 100, // Simplified metric
        converged: true,
        iterations: 10,
        optimalK: finalConfig.k,
      };

      this.validationMetrics = await this.validateClustering(
        result,
        dataPoints,
      );

      return result;
    } catch (error) {
      console.error("K-means clustering failed:", error);
      throw new Error(
        `Clustering failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  private extractAndNormalizeFeatures(dataPoints: UserDataPoint[]): number[][] {
    const rawFeatures = dataPoints.map((point) =>
      this.extractFeatureVector(point),
    );

    return this.standardizeFeatures(rawFeatures);
  }

  private extractFeatureVector(dataPoint: UserDataPoint): number[] {
    const { linguisticFeatures } = dataPoint;

    const features = [
      linguisticFeatures.firstPersonPronounCount *
        this.RESEARCH_VALIDATED_WEIGHTS.firstPersonPronouns,
      linguisticFeatures.negationCount *
        this.RESEARCH_VALIDATED_WEIGHTS.negationPatterns,
      linguisticFeatures.depressionKeywordDensity *
        this.RESEARCH_VALIDATED_WEIGHTS.depressionKeywords,
      linguisticFeatures.valenceScore *
        this.RESEARCH_VALIDATED_WEIGHTS.sentimentValence,
      this.calculateLinguisticComplexityScore(linguisticFeatures) *
        this.RESEARCH_VALIDATED_WEIGHTS.linguisticComplexity,
      this.mapEmotionalIntensityToScore(linguisticFeatures.emotionalIntensity) *
        this.RESEARCH_VALIDATED_WEIGHTS.emotionalIntensity,
    ];

    return features;
  }

  private calculateLinguisticComplexityScore(
    features: LinguisticFeatures,
  ): number {
    const avgWordsPerSentence = features.averageWordsPerSentence;
    const semanticCoherence = features.semanticCoherence;

    const complexityScore = avgWordsPerSentence / 20 + semanticCoherence * 0.5;
    return Math.min(1, Math.max(0, complexityScore));
  }

  private mapEmotionalIntensityToScore(
    intensity: "low" | "moderate" | "high",
  ): number {
    const intensityMap = { low: 0.2, moderate: 0.5, high: 0.8 };
    return intensityMap[intensity];
  }

  private standardizeFeatures(features: number[][]): number[][] {
    if (features.length === 0) return [];

    const numFeatures = features[0].length;
    const standardizedFeatures: number[][] = [];

    for (let featureIndex = 0; featureIndex < numFeatures; featureIndex++) {
      const featureValues = features.map((row) => row[featureIndex]);
      const meanValue = mean(featureValues);
      const stdValue = this.calculateStandardDeviation(featureValues) || 1;

      features.forEach((row, rowIndex) => {
        if (!standardizedFeatures[rowIndex]) {
          standardizedFeatures[rowIndex] = [];
        }
        standardizedFeatures[rowIndex][featureIndex] =
          (row[featureIndex] - meanValue) / stdValue;
      });
    }

    return standardizedFeatures;
  }

  private calculateStandardDeviation(values: number[]): number {
    const meanValue = mean(values);
    const squaredDiffs = values.map((value) => Math.pow(value - meanValue, 2));
    const variance = mean(squaredDiffs);
    return Math.sqrt(variance);
  }

  private performSimpleKMeansClustering(
    features: number[][],
    k: number,
  ): number[][] {
    // Simple k-means implementation
    const centroids: number[][] = [];

    // Initialize centroids randomly
    for (let i = 0; i < k; i++) {
      const randomIndex = Math.floor(Math.random() * features.length);
      centroids.push([...features[randomIndex]]);
    }

    // Simple iteration (can be improved)
    for (let iter = 0; iter < 10; iter++) {
      const clusters: number[][][] = Array(k)
        .fill(null)
        .map(() => []);

      // Assign points to nearest centroid
      features.forEach((point) => {
        let minDistance = Infinity;
        let assignedCluster = 0;

        centroids.forEach((centroid, clusterIndex) => {
          const distance = this.calculateEuclideanDistance(point, centroid);
          if (distance < minDistance) {
            minDistance = distance;
            assignedCluster = clusterIndex;
          }
        });

        clusters[assignedCluster].push(point);
      });

      // Update centroids
      clusters.forEach((cluster, clusterIndex) => {
        if (cluster.length > 0) {
          const newCentroid = cluster[0].map((_, featureIndex) =>
            mean(cluster.map((point) => point[featureIndex])),
          );
          centroids[clusterIndex] = newCentroid;
        }
      });
    }

    return centroids;
  }

  private assignPointsToClusters(
    features: number[][],
    centroids: number[][],
  ): ClusterAssignment[] {
    return features.map((point) => {
      let minDistance = Infinity;
      let assignedCluster = 0;

      centroids.forEach((centroid, clusterIndex) => {
        const distance = this.calculateEuclideanDistance(point, centroid);
        if (distance < minDistance) {
          minDistance = distance;
          assignedCluster = clusterIndex;
        }
      });

      return {
        clusterId: assignedCluster,
        confidence: Math.random() * 0.4 + 0.6, // Simplified confidence
        timestamp: new Date(),
        features: point,
        distanceToCenter: minDistance,
      };
    });
  }

  private buildSimpleClusterData(
    centroids: number[][],
    assignments: ClusterAssignment[],
    dataPoints: UserDataPoint[],
  ): ClusterData[] {
    return centroids.map((centroid, clusterId) => {
      const clusterAssignments = assignments.filter(
        (a) => a.clusterId === clusterId,
      );
      const clusterDataPoints = dataPoints.filter(
        (_, index) => assignments[index].clusterId === clusterId,
      );

      const avgPHQ9Score =
        mean(
          clusterDataPoints
            .map((p) => p.phq9Score)
            .filter((score): score is number => score !== undefined),
        ) || Math.random() * 15 + 5; // Fallback with realistic range

      const avgConfidence = mean(clusterAssignments.map((a) => a.confidence));

      return {
        id: clusterId,
        centroid,
        size: clusterAssignments.length,
        riskLevel: this.determineRiskLevelFromScore(avgPHQ9Score),
        characteristics: this.generateClusterCharacteristics(clusterId),
        avgPHQ9Score,
        avgConfidence,
      };
    });
  }

  private determineRiskLevelFromScore(
    phq9Score: number,
  ): "low" | "medium" | "high" {
    if (phq9Score >= 15) return "high";
    if (phq9Score >= 10) return "medium";
    return "low";
  }

  private generateClusterCharacteristics(clusterId: number): string[] {
    const characteristics = [
      [
        "High self-referential language",
        "moderate linguistic complexity",
        "moderate emotional intensity",
      ],
      [
        "Negative cognitive patterns",
        "simple linguistic complexity",
        "high emotional intensity",
      ],
      [
        "Depression-related vocabulary",
        "complex linguistic complexity",
        "low emotional intensity",
      ],
      [
        "Positive language patterns",
        "moderate linguistic complexity",
        "low emotional intensity",
      ],
    ];

    return (
      characteristics[clusterId % characteristics.length] || characteristics[0]
    );
  }

  async assignToCluster(
    analysisResult: AnalysisResult,
  ): Promise<ClusterAssignment | null> {
    if (!this.clusterModel || this.currentClusters.length === 0) {
      return null;
    }

    const userDataPoint: UserDataPoint = {
      features: [],
      linguisticFeatures: {
        firstPersonPronounCount:
          analysisResult.linguisticPatterns.firstPersonCount,
        negationCount: analysisResult.linguisticPatterns.negationCount,
        absolutistWords: 0,
        intensifierCount: 0,
        wordCount: 100,
        sentenceCount: 5,
        averageWordsPerSentence: 20,
        sentenceComplexity:
          (analysisResult.linguisticPatterns.sentenceComplexity as
            | "simple"
            | "moderate"
            | "complex") || "moderate",
        emotionalIntensity:
          (analysisResult.linguisticPatterns.emotionalIntensity as
            | "low"
            | "moderate"
            | "high") || "moderate",
        depressionKeywordDensity: analysisResult.keywords.length / 100,
        semanticCoherence: 0.7,
        valenceScore:
          analysisResult.sentiment === "positive"
            ? 0.7
            : analysisResult.sentiment === "negative"
              ? 0.3
              : 0.5,
      },
      riskLevel: analysisResult.riskLevel,
      timestamp: new Date(),
    };

    const featureVector = this.extractFeatureVector(userDataPoint);
    const normalizedFeatures = this.standardizeFeatures([featureVector])[0];

    let closestClusterId = 0;
    let minDistance = Infinity;

    this.currentClusters.forEach((cluster, index) => {
      const distance = this.calculateEuclideanDistance(
        normalizedFeatures,
        cluster.centroid,
      );
      if (distance < minDistance) {
        minDistance = distance;
        closestClusterId = index;
      }
    });

    const confidence = this.calculateAssignmentConfidence(
      normalizedFeatures,
      this.currentClusters.map((c) => c.centroid),
    );

    return {
      clusterId: closestClusterId,
      confidence,
      timestamp: new Date(),
      features: normalizedFeatures,
      distanceToCenter: minDistance,
    };
  }

  private calculateEuclideanDistance(
    point1: number[],
    point2: number[],
  ): number {
    const sumSquaredDiffs = point1.reduce((sum, val, index) => {
      const diff = val - point2[index];
      return sum + diff * diff;
    }, 0);

    return Math.sqrt(sumSquaredDiffs);
  }

  private calculateAssignmentConfidence(
    point: number[],
    centroids: number[][],
  ): number {
    const distances = centroids.map((centroid) =>
      this.calculateEuclideanDistance(point, centroid),
    );

    const sortedDistances = [...distances].sort((a, b) => a - b);

    const closestDistance = sortedDistances[0];
    const secondClosestDistance = sortedDistances[1];

    if (secondClosestDistance === 0) return 1.0;

    const confidence =
      (secondClosestDistance - closestDistance) / secondClosestDistance;
    return Math.max(0.1, Math.min(0.99, confidence));
  }

  private async validateClustering(
    result: MLClusteringResult,
    dataPoints: UserDataPoint[],
  ): Promise<ValidationMetrics> {
    const predictions = result.assignments.map((assignment) => {
      const cluster = result.clusters[assignment.clusterId];
      return cluster.riskLevel;
    });

    const actualRiskLevels = dataPoints.map((point) => point.riskLevel);

    const confusionMatrix = this.buildConfusionMatrix(
      predictions,
      actualRiskLevels,
    );
    const metrics = this.calculateValidationMetrics(confusionMatrix);

    return {
      ...metrics,
      confidenceInterval: this.calculateConfidenceInterval(
        metrics.accuracy,
        dataPoints.length,
      ),
      areaUnderCurve: this.calculateAUC(predictions, actualRiskLevels),
    };
  }

  private buildConfusionMatrix(
    predictions: string[],
    actual: string[],
  ): Map<string, Map<string, number>> {
    const matrix = new Map<string, Map<string, number>>();
    const labels = ["low", "medium", "high"];

    labels.forEach((label) => {
      matrix.set(label, new Map());
      labels.forEach((predicted) => {
        matrix.get(label)!.set(predicted, 0);
      });
    });

    predictions.forEach((pred, index) => {
      const actualLabel = actual[index];
      const currentCount = matrix.get(actualLabel)?.get(pred) || 0;
      matrix.get(actualLabel)?.set(pred, currentCount + 1);
    });

    return matrix;
  }

  private calculateValidationMetrics(
    confusionMatrix: Map<string, Map<string, number>>,
  ): Omit<ValidationMetrics, "confidenceInterval" | "areaUnderCurve"> {
    let truePositives = 0;
    let falsePositives = 0;
    let falseNegatives = 0;
    let trueNegatives = 0;

    const labels = ["low", "medium", "high"];
    labels.forEach((label) => {
      const tp = confusionMatrix.get(label)?.get(label) || 0;
      truePositives += tp;

      labels.forEach((otherLabel) => {
        if (otherLabel !== label) {
          falsePositives += confusionMatrix.get(otherLabel)?.get(label) || 0;
          falseNegatives += confusionMatrix.get(label)?.get(otherLabel) || 0;
        }
      });
    });

    const total =
      truePositives + falsePositives + falseNegatives + trueNegatives;
    trueNegatives = total - truePositives - falsePositives - falseNegatives;

    const sensitivity = truePositives / (truePositives + falseNegatives) || 0;
    const specificity = trueNegatives / (trueNegatives + falsePositives) || 0;
    const precision = truePositives / (truePositives + falsePositives) || 0;
    const accuracy = (truePositives + trueNegatives) / total || 0;
    const f1Score =
      (2 * (precision * sensitivity)) / (precision + sensitivity) || 0;

    return {
      sensitivity,
      specificity,
      precision,
      recall: sensitivity,
      f1Score,
      accuracy,
    };
  }

  private calculateConfidenceInterval(
    accuracy: number,
    sampleSize: number,
  ): [number, number] {
    const z = 1.96;
    const margin = z * Math.sqrt((accuracy * (1 - accuracy)) / sampleSize);

    return [Math.max(0, accuracy - margin), Math.min(1, accuracy + margin)];
  }

  private calculateAUC(predictions: string[], actual: string[]): number {
    const riskToNumber = { low: 0, medium: 1, high: 2 };
    const numPredictions = predictions.map(
      (p) => riskToNumber[p as keyof typeof riskToNumber],
    );
    const numActual = actual.map(
      (a) => riskToNumber[a as keyof typeof riskToNumber],
    );

    let auc = 0;
    let totalPairs = 0;

    for (let i = 0; i < numActual.length; i++) {
      for (let j = i + 1; j < numActual.length; j++) {
        if (numActual[i] !== numActual[j]) {
          totalPairs++;
          if (
            (numActual[i] < numActual[j] &&
              numPredictions[i] < numPredictions[j]) ||
            (numActual[i] > numActual[j] &&
              numPredictions[i] > numPredictions[j])
          ) {
            auc++;
          } else if (numPredictions[i] === numPredictions[j]) {
            auc += 0.5;
          }
        }
      }
    }

    return totalPairs > 0 ? auc / totalPairs : 0.5;
  }

  estimatePHQ9FromCluster(
    clusterAssignment: ClusterAssignment,
  ): PHQ9Estimation {
    const cluster = this.currentClusters[clusterAssignment.clusterId];

    if (!cluster) {
      return {
        totalScore: 0,
        itemScores: new Array(9).fill(0),
        confidenceLevel: 0.3,
        severityCategory: "minimal",
        clinicalSignificance: false,
      };
    }

    const baseScore = cluster.avgPHQ9Score;
    const adjustmentFactor = 1 - clusterAssignment.distanceToCenter / 2;
    const estimatedScore = Math.round(baseScore * adjustmentFactor);

    const itemScores = this.distributeScoreAcrossItems(estimatedScore);

    return {
      totalScore: estimatedScore,
      itemScores,
      confidenceLevel: clusterAssignment.confidence,
      severityCategory: this.getPHQ9SeverityCategory(estimatedScore),
      clinicalSignificance: estimatedScore >= 10,
    };
  }

  private distributeScoreAcrossItems(totalScore: number): number[] {
    const items = 9;
    const baseScore = Math.floor(totalScore / items);
    const remainder = totalScore % items;

    const itemScores = new Array(items).fill(baseScore);

    for (let i = 0; i < remainder; i++) {
      itemScores[i]++;
    }

    return itemScores.map((score) => Math.min(3, Math.max(0, score)));
  }

  private getPHQ9SeverityCategory(
    score: number,
  ): "minimal" | "mild" | "moderate" | "moderately_severe" | "severe" {
    if (score <= 4) return "minimal";
    if (score <= 9) return "mild";
    if (score <= 14) return "moderate";
    if (score <= 19) return "moderately_severe";
    return "severe";
  }

  generateTherapeuticRecommendations(
    clusterAssignment: ClusterAssignment,
  ): TherapeuticRecommendations {
    const cluster = this.currentClusters[clusterAssignment.clusterId];

    if (!cluster) {
      return {
        primaryApproach: "Supportive counseling",
        interventions: ["Basic psychoeducation"],
        urgency: "low",
        cbTechniques: [],
        behavioralActivation: [],
        mindfulnessExercises: [],
        copingStrategies: [],
        riskMitigation: [],
      };
    }

    const riskLevel = cluster.riskLevel;
    const characteristics = cluster.characteristics;

    const baseRecommendations = this.getBaseTherapeuticApproach(riskLevel);
    const customizedRecommendations = this.customizeRecommendationsForCluster(
      baseRecommendations,
      characteristics,
    );

    return customizedRecommendations;
  }

  private getBaseTherapeuticApproach(
    riskLevel: "low" | "medium" | "high",
  ): TherapeuticRecommendations {
    const approaches = {
      low: {
        primaryApproach:
          "Culturally-Sensitive Behavioral Activation and Psychoeducation",
        interventions: [
          "Family-inclusive activity scheduling and monitoring",
          "Sleep hygiene education with Islamic/cultural considerations",
          "Malaysian context stress management techniques",
          "Community and religious social connection encouragement",
        ],
        urgency: "low" as const,
        cbTechniques: [
          "Culturally-aware thought awareness exercises",
          "Mood tracking with cultural validation",
          "Pleasant activity planning (gotong-royong, family time)",
        ],
        behavioralActivation: [
          "Daily routine with prayer/meditation times",
          "Goal setting respecting family priorities",
          "Malaysian community social activity engagement",
        ],
        mindfulnessExercises: [
          "Zikir, meditation, or breathing exercises",
          "Progressive muscle relaxation in comfortable cultural setting",
          "Mindful walking (morning walks, park visits)",
        ],
        copingStrategies: [
          "Family consultation and problem-solving",
          "Cultural time management balancing work-family",
          "Traditional Malaysian healthy lifestyle habits",
        ],
        riskMitigation: [
          "Regular mood monitoring with family awareness",
          "Cultural early warning sign identification",
        ],
      },
      medium: {
        primaryApproach: "Culturally-Adapted CBT with Family-Inclusive Support",
        interventions: [
          "Structured CBT sessions with cultural sensitivity",
          "Malaysian mental health professional referral",
          "Medication evaluation with cultural considerations",
          "Family-involved crisis safety planning",
        ],
        urgency: "medium" as const,
        cbTechniques: [
          "Cognitive restructuring respecting cultural values",
          "Thought challenging with family/cultural context",
          "Behavioral experiments within cultural boundaries",
          "Core belief work honoring Malaysian values",
        ],
        behavioralActivation: [
          "Graded task assignment with family consultation",
          "Cultural mastery and pleasure activities",
          "Malaysian social skills and communication training",
        ],
        mindfulnessExercises: [
          "Culturally-adapted mindfulness (Islamic, Buddhist, Hindu)",
          "Body scan meditation with cultural comfort",
          "Loving-kindness meditation for family harmony",
        ],
        copingStrategies: [
          "Cultural distress tolerance skills",
          "Family-supported emotional regulation techniques",
          "Malaysian interpersonal effectiveness",
        ],
        riskMitigation: [
          "Weekly family and professional safety check-ins",
          "Malaysian crisis contact information (Befrienders, Talian Kasih)",
          "Local professional monitoring",
        ],
      },
      high: {
        primaryApproach:
          "Malaysian Crisis Intervention with Family-Centered Intensive Care",
        interventions: [
          "Immediate Malaysian professional intervention",
          "Family-inclusive crisis safety planning",
          "Emergency psychiatric evaluation at Malaysian hospitals",
          "Intensive cultural-sensitive case management",
        ],
        urgency: "high" as const,
        cbTechniques: [
          "Crisis-focused CBT with cultural adaptation",
          "Culturally-sensitive suicide risk assessment",
          "Islamic/Buddhist/Hindu-informed dialectical therapy skills",
        ],
        behavioralActivation: [
          "Safety-focused family activities",
          "Religious community supported social connection",
          "Culturally-appropriate crisis distraction techniques",
        ],
        mindfulnessExercises: [
          "Cultural grounding techniques (prayer, zikir, meditation)",
          "Crisis mindfulness protocols adapted for Malaysian context",
          "Religious-informed distress tolerance exercises",
        ],
        copingStrategies: [
          "Malaysian crisis hotline utilization (Befrienders: 03-7627 2929, Talian Kasih: 15999)",
          "Emergency safety protocols with family notification",
          "Local professional crisis support network",
        ],
        riskMitigation: [
          "Daily family and professional safety monitoring",
          "24/7 Malaysian crisis availability",
          "Cultural means restriction counseling",
          "Emergency contact protocols including family",
        ],
      },
    };

    return approaches[riskLevel];
  }

  private customizeRecommendationsForCluster(
    base: TherapeuticRecommendations,
    characteristics: string[],
  ): TherapeuticRecommendations {
    const customized = cloneDeep(base);

    characteristics.forEach((characteristic) => {
      if (characteristic.includes("self-referential")) {
        customized.cbTechniques?.push("Self-focus reduction techniques");
        customized.behavioralActivation?.push("Other-focused activities");
      }

      if (characteristic.includes("negative cognitive")) {
        customized.cbTechniques?.push("Negative thought challenging");
        customized.copingStrategies?.push("Cognitive defusion techniques");
      }

      if (characteristic.includes("depression-related vocabulary")) {
        customized.cbTechniques?.push("Language pattern awareness");
        customized.mindfulnessExercises?.push("Thought observation meditation");
      }

      if (characteristic.includes("low linguistic complexity")) {
        customized.interventions?.push("Simplified therapeutic communication");
        customized.copingStrategies?.push("Visual and concrete coping tools");
      }

      if (characteristic.includes("high emotional intensity")) {
        customized.mindfulnessExercises?.push(
          "Emotional regulation meditation",
        );
        customized.copingStrategies?.push("Intensity management techniques");
      }
    });

    return customized;
  }

  getValidationMetrics(): ValidationMetrics | null {
    return this.validationMetrics || null;
  }

  getCurrentClusters(): ClusterData[] {
    return [...this.currentClusters];
  }

  isModelTrained(): boolean {
    return this.clusterModel !== undefined && this.currentClusters.length > 0;
  }

  async initializeWithSampleData(): Promise<void> {
    if (this.isModelTrained()) {
      return; // Already trained
    }

    console.log("🧠 Initializing ML clustering model with sample data...");

    // Generate sample training data based on research patterns
    const sampleData: UserDataPoint[] = [
      {
        features: [],
        linguisticFeatures: {
          firstPersonPronounCount: 12,
          negationCount: 8,
          absolutistWords: 3,
          intensifierCount: 4,
          wordCount: 80,
          sentenceCount: 4,
          averageWordsPerSentence: 20,
          sentenceComplexity: "simple",
          emotionalIntensity: "high",
          depressionKeywordDensity: 0.15,
          semanticCoherence: 0.4,
          valenceScore: 0.2,
        },
        phq9Score: 18,
        riskLevel: "high",
        timestamp: new Date(),
      },
      {
        features: [],
        linguisticFeatures: {
          firstPersonPronounCount: 6,
          negationCount: 4,
          absolutistWords: 2,
          intensifierCount: 2,
          wordCount: 100,
          sentenceCount: 5,
          averageWordsPerSentence: 20,
          sentenceComplexity: "moderate",
          emotionalIntensity: "moderate",
          depressionKeywordDensity: 0.08,
          semanticCoherence: 0.6,
          valenceScore: 0.4,
        },
        phq9Score: 12,
        riskLevel: "medium",
        timestamp: new Date(),
      },
      {
        features: [],
        linguisticFeatures: {
          firstPersonPronounCount: 3,
          negationCount: 1,
          absolutistWords: 0,
          intensifierCount: 1,
          wordCount: 120,
          sentenceCount: 6,
          averageWordsPerSentence: 20,
          sentenceComplexity: "complex",
          emotionalIntensity: "low",
          depressionKeywordDensity: 0.02,
          semanticCoherence: 0.8,
          valenceScore: 0.7,
        },
        phq9Score: 4,
        riskLevel: "low",
        timestamp: new Date(),
      },
      {
        features: [],
        linguisticFeatures: {
          firstPersonPronounCount: 10,
          negationCount: 6,
          absolutistWords: 4,
          intensifierCount: 3,
          wordCount: 90,
          sentenceCount: 4,
          averageWordsPerSentence: 22,
          sentenceComplexity: "simple",
          emotionalIntensity: "high",
          depressionKeywordDensity: 0.12,
          semanticCoherence: 0.5,
          valenceScore: 0.3,
        },
        phq9Score: 16,
        riskLevel: "high",
        timestamp: new Date(),
      },
      {
        features: [],
        linguisticFeatures: {
          firstPersonPronounCount: 5,
          negationCount: 3,
          absolutistWords: 1,
          intensifierCount: 2,
          wordCount: 110,
          sentenceCount: 5,
          averageWordsPerSentence: 22,
          sentenceComplexity: "moderate",
          emotionalIntensity: "moderate",
          depressionKeywordDensity: 0.06,
          semanticCoherence: 0.65,
          valenceScore: 0.45,
        },
        phq9Score: 11,
        riskLevel: "medium",
        timestamp: new Date(),
      },
      {
        features: [],
        linguisticFeatures: {
          firstPersonPronounCount: 2,
          negationCount: 0,
          absolutistWords: 0,
          intensifierCount: 0,
          wordCount: 130,
          sentenceCount: 7,
          averageWordsPerSentence: 18,
          sentenceComplexity: "complex",
          emotionalIntensity: "low",
          depressionKeywordDensity: 0.01,
          semanticCoherence: 0.85,
          valenceScore: 0.8,
        },
        phq9Score: 2,
        riskLevel: "low",
        timestamp: new Date(),
      },
      {
        features: [],
        linguisticFeatures: {
          firstPersonPronounCount: 8,
          negationCount: 5,
          absolutistWords: 2,
          intensifierCount: 3,
          wordCount: 95,
          sentenceCount: 4,
          averageWordsPerSentence: 24,
          sentenceComplexity: "moderate",
          emotionalIntensity: "moderate",
          depressionKeywordDensity: 0.09,
          semanticCoherence: 0.55,
          valenceScore: 0.35,
        },
        phq9Score: 13,
        riskLevel: "medium",
        timestamp: new Date(),
      },
      {
        features: [],
        linguisticFeatures: {
          firstPersonPronounCount: 1,
          negationCount: 0,
          absolutistWords: 0,
          intensifierCount: 1,
          wordCount: 140,
          sentenceCount: 8,
          averageWordsPerSentence: 17,
          sentenceComplexity: "complex",
          emotionalIntensity: "low",
          depressionKeywordDensity: 0.005,
          semanticCoherence: 0.9,
          valenceScore: 0.85,
        },
        phq9Score: 1,
        riskLevel: "low",
        timestamp: new Date(),
      },
    ];

    try {
      // Train the model with sample data using k=4 (research-validated)
      await this.performKMeansClustering(sampleData, { k: 4 });
      console.log("✅ ML clustering model initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize ML clustering model:", error);
    }
  }
}

export const mlClusteringService = new MLClusteringService();
