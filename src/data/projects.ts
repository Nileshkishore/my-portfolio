// src/data/projects.ts

export type Project = {
  title: string;
  category: string;
  description: string;
  color: string;
};

export const projects: Project[] = [
  {
    title: "AI OCR Pipeline",
    category: "Computer Vision",
    description: "YOLO + TrOCR based OCR pipeline with scalable ML inference architecture for high-throughput document digitisation.",
    color: "from-fuchsia-500 to-purple-600",
  },
  {
    title: "MLOps Deployment System",
    category: "MLOps / Infrastructure",
    description: "Enterprise MLflow + Azure ML deployment workflows with CI/CD automation — champion/challenger model promotion at scale.",
    color: "from-cyan-500 to-blue-600",
  },
  {
    title: "Databricks ETL Platform",
    category: "Data Engineering",
    description: "High-performance distributed ETL orchestration on Databricks Unity Catalog with Apache Spark and Delta Lake monitoring.",
    color: "from-emerald-500 to-teal-600",
  },
  {
    title: "Fraud Detection Engine",
    category: "Machine Learning",
    description: "Real-time anomaly detection using PySpark and XGBoost for transaction monitoring — sub-100ms ML inference at scale.",
    color: "from-rose-500 to-red-600",
  },
  {
    title: "NLP Doc Classifier",
    category: "NLP / LLM",
    description: "Transformer-based document classification and named entity recognition API using fine-tuned LLM embeddings.",
    color: "from-violet-500 to-purple-600",
  },
  {
    title: "Streaming Analytics",
    category: "Data Engineering",
    description: "Kafka and Spark Structured Streaming pipeline for high-throughput log analytics and real-time ML feature computation.",
    color: "from-amber-500 to-orange-600",
  },
  {
    title: "Predictive Maintenance",
    category: "Backend / ML",
    description: "FastAPI serving layer for IoT sensor ML models — predictive maintenance with automated retraining pipelines.",
    color: "from-blue-500 to-indigo-600",
  },
];