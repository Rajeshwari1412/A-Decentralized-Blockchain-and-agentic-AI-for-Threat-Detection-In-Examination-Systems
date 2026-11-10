import os
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple
from sklearn.ensemble import IsolationForest
import joblib
import logging
from app.ml.feature_extractor import FeatureExtractor
from app.core.config import settings

logger = logging.getLogger(__name__)

MODEL_DIR = os.path.join(os.path.dirname(__file__), "artifacts")
MODEL_PATH = os.path.join(MODEL_DIR, "isolation_forest.joblib")

class IsolationForestDetector:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(IsolationForestDetector, cls).__new__(cls)
            cls._instance.model = None
            cls._instance.baseline_means = {}
            cls._instance.baseline_stds = {}
            cls._instance._load_or_train()
        return cls._instance

    def _load_or_train(self):
        if os.path.exists(MODEL_PATH):
            try:
                saved = joblib.load(MODEL_PATH)
                self.model = saved["model"]
                self.baseline_means = saved.get("baseline_means", {})
                self.baseline_stds = saved.get("baseline_stds", {})
                logger.info("Loaded pre-trained Isolation Forest model successfully.")
                return
            except Exception as e:
                logger.warning(f"Failed to load saved model: {e}. Re-training baseline...")
        
        self.train_baseline()

    def train_baseline(self, num_samples: int = 5000):
        """
        Trains Isolation Forest on synthetic normal exam activity baseline.
        """
        np.random.seed(42)
        os.makedirs(MODEL_DIR, exist_ok=True)

        # Normal operational distribution:
        # Typical hours: 9-18 (mean 13, std 2.5)
        hours = np.clip(np.random.normal(13.5, 2.5, num_samples), 8, 19)
        is_after_hours = np.zeros(num_samples)
        
        # Low novelty for normal baseline
        ip_novelty = np.random.choice([0.0, 1.0], size=num_samples, p=[0.97, 0.03])
        device_novelty = np.random.choice([0.0, 1.0], size=num_samples, p=[0.98, 0.02])
        
        # Velocity in 5 min (mean 2, max ~6)
        event_velocity_5m = np.clip(np.random.poisson(2, num_samples), 0, 8)
        failed_login_burst = np.random.choice([0.0, 1.0, 2.0], size=num_samples, p=[0.96, 0.035, 0.005])
        
        # QP access velocity
        qp_access_velocity_1h = np.random.choice([0.0, 1.0, 2.0], size=num_samples, p=[0.85, 0.12, 0.03])
        download_volume_ratio = np.clip(np.random.normal(1.0, 0.3, num_samples), 0.5, 2.0)
        
        # Privilege weight (mostly routine operations: LOGIN, QP_VIEW)
        privilege_weight = np.random.choice([1.0, 2.0, 3.0, 5.0], size=num_samples, p=[0.70, 0.15, 0.12, 0.03])
        session_duration_ratio = np.clip(np.random.normal(1.0, 0.2, num_samples), 0.6, 1.8)

        data = np.column_stack([
            hours,
            is_after_hours,
            ip_novelty,
            device_novelty,
            event_velocity_5m,
            failed_login_burst,
            qp_access_velocity_1h,
            download_volume_ratio,
            privilege_weight,
            session_duration_ratio
        ])

        self.model = IsolationForest(
            n_estimators=150,
            contamination=settings.ISOLATION_FOREST_CONTAMINATION,
            max_samples=256,
            random_state=42,
            n_jobs=-1
        )
        self.model.fit(data)

        # Calculate feature baseline statistics for explainability
        feature_names = FeatureExtractor.FEATURE_NAMES
        for i, name in enumerate(feature_names):
            self.baseline_means[name] = float(np.mean(data[:, i]))
            self.baseline_stds[name] = max(float(np.std(data[:, i])), 0.001)

        joblib.dump({
            "model": self.model,
            "baseline_means": self.baseline_means,
            "baseline_stds": self.baseline_stds
        }, MODEL_PATH)

        logger.info(f"Trained & saved Isolation Forest baseline on {num_samples} samples.")

    def predict_anomaly(self, feature_dict: Dict[str, float]) -> Tuple[bool, float, float, Dict[str, float]]:
        """
        Runs inference on feature vector.
        Returns:
            is_anomaly (bool)
            raw_score (float, raw decision function where lower = more anomalous)
            normalized_score (float, 0 to 100 where 100 is most anomalous)
            feature_contributions (dict of explainable factor attribution percentages)
        """
        vector = FeatureExtractor.to_feature_vector(feature_dict)
        data_point = np.array([vector])

        # raw score: lower means more anomalous (typically in range -0.5 to +0.5)
        raw_decision = float(self.model.decision_function(data_point)[0])
        prediction = self.model.predict(data_point)[0] # -1 = anomaly, 1 = normal
        is_anomaly = bool(prediction == -1)

        # Normalize decision function to 0-100 risk scale
        # Normal baseline decision is around +0.15 to +0.25 (-> risk 10-25)
        # Extreme anomalies drop to -0.25 to -0.40 (-> risk 80-100)
        normalized_score = float(np.clip((0.20 - raw_decision) / 0.50 * 100.0, 0.0, 100.0))

        # Calculate explainable feature contributions (SHAP-like deviation from baseline)
        feature_names = FeatureExtractor.FEATURE_NAMES
        deviations = {}
        total_deviation = 0.0

        for name in feature_names:
            val = feature_dict.get(name, 0.0)
            mean = self.baseline_means.get(name, 0.0)
            std = self.baseline_stds.get(name, 1.0)
            
            # Z-score deviation
            z = max(0.0, (val - mean) / std)
            
            # Apply domain weight for explainability
            if name in ["privilege_weight", "download_volume_ratio", "qp_access_velocity_1h"]:
                z *= 1.8
            elif name in ["is_after_hours", "device_novelty", "ip_novelty"]:
                z *= 1.4

            deviations[name] = z
            total_deviation += z

        feature_contributions = {}
        if total_deviation > 0:
            for name, dev in deviations.items():
                pct = round((dev / total_deviation) * 100.0, 1)
                if pct >= 5.0: # Keep significant contributors
                    feature_contributions[name] = pct
        else:
            feature_contributions["routine_activity"] = 100.0

        return is_anomaly, raw_decision, round(normalized_score, 2), feature_contributions

detector = IsolationForestDetector()
