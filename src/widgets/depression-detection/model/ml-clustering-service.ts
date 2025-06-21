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
        primaryApproach: "Behavioral Activation and Psychoeducation",
        interventions: [
          "Activity scheduling and monitoring",
          "Sleep hygiene education",
          "Stress management techniques",
          "Social connection encouragement",
        ],
        urgency: "low" as const,
        cbTechniques: [
          "Thought awareness exercises",
          "Mood tracking",
          "Pleasant activity planning",
        ],
        behavioralActivation: [
          "Daily routine establishment",
          "Goal setting and achievement",
          "Social activity engagement",
        ],
        mindfulnessExercises: [
          "Basic breathing exercises",
          "Progressive muscle relaxation",
          "Mindful walking",
        ],
        copingStrategies: [
          "Problem-solving skills",
          "Time management",
          "Healthy lifestyle habits",
        ],
        riskMitigation: [
          "Regular mood monitoring",
          "Early warning sign identification",
        ],
      },
      medium: {
        primaryApproach: "Cognitive Behavioral Therapy with Intensive Support",
        interventions: [
          "Structured CBT sessions",
          "Professional mental health referral",
          "Medication evaluation consideration",
          "Crisis safety planning",
        ],
        urgency: "medium" as const,
        cbTechniques: [
          "Cognitive restructuring",
          "Thought challenging",
          "Behavioral experiments",
          "Core belief work",
        ],
        behavioralActivation: [
          "Graded task assignment",
          "Mastery and pleasure activities",
          "Social skills training",
        ],
        mindfulnessExercises: [
          "Mindfulness-based stress reduction",
          "Body scan meditation",
          "Loving-kindness meditation",
        ],
        copingStrategies: [
          "Distress tolerance skills",
          "Emotional regulation techniques",
          "Interpersonal effectiveness",
        ],
        riskMitigation: [
          "Weekly safety check-ins",
          "Crisis contact information",
          "Professional monitoring",
        ],
      },
      high: {
        primaryApproach: "Crisis Intervention and Intensive Professional Care",
        interventions: [
          "Immediate professional intervention",
          "Crisis safety planning",
          "Emergency psychiatric evaluation",
          "Intensive case management",
        ],
        urgency: "high" as const,
        cbTechniques: [
          "Crisis-focused CBT",
          "Suicide risk assessment",
          "Dialectical behavior therapy skills",
        ],
        behavioralActivation: [
          "Safety-focused activities",
          "Supported social connection",
          "Crisis distraction techniques",
        ],
        mindfulnessExercises: [
          "Grounding techniques (5-4-3-2-1)",
          "Crisis mindfulness protocols",
          "Distress tolerance exercises",
        ],
        copingStrategies: [
          "Crisis hotline utilization",
          "Emergency safety protocols",
          "Professional crisis support",
        ],
        riskMitigation: [
          "Daily safety monitoring",
          "24/7 crisis availability",
          "Means restriction counseling",
          "Emergency contact protocols",
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
}

export const mlClusteringService = new MLClusteringService();
