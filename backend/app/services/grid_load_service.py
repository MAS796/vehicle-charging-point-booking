from __future__ import annotations

from datetime import datetime
from pathlib import Path
from typing import Iterable

import numpy as np

MODEL_PATH = Path("backend/app/services/grid_model.pkl")

try:
    import joblib
    from sklearn.ensemble import RandomForestRegressor

    SKLEARN_OK = True
except Exception:
    SKLEARN_OK = False


class GridLoadPredictor:
    def __init__(self) -> None:
        self.model = RandomForestRegressor(n_estimators=120, random_state=42) if SKLEARN_OK else None
        self.trained = False

    def train(self, rows: Iterable[dict]) -> dict:
        data = list(rows)
        if not data:
            return {"trained": False, "detail": "No training rows"}
        if not SKLEARN_OK:
            return {"trained": False, "detail": "scikit-learn not available"}

        X = np.array(
            [[r["hour"], r["day_of_week"], r.get("temperature", 30.0)] for r in data],
            dtype=float,
        )
        y = np.array([r["station_load"] for r in data], dtype=float)

        self.model.fit(X, y)
        self.trained = True
        MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
        joblib.dump(self.model, MODEL_PATH)
        return {"trained": True, "rows": len(data), "model_path": str(MODEL_PATH)}

    def _ensure_model(self) -> bool:
        if not SKLEARN_OK:
            return False
        if self.trained:
            return True
        if MODEL_PATH.exists():
            self.model = joblib.load(MODEL_PATH)
            self.trained = True
            return True
        return False

    def predict(self, hour: int, day_of_week: int, temperature: float) -> float:
        if self._ensure_model():
            pred = float(self.model.predict(np.array([[hour, day_of_week, temperature]], dtype=float))[0])
            return max(0.0, min(100.0, pred))

        # Fallback heuristic if model not trained yet
        baseline = 35.0 + (10.0 if 7 <= hour <= 9 or 17 <= hour <= 20 else 0.0)
        weekend_adj = -5.0 if day_of_week >= 5 else 5.0
        temp_adj = (temperature - 28.0) * 0.6
        pred = baseline + weekend_adj + temp_adj
        return max(0.0, min(100.0, pred))

    @staticmethod
    def distribute_load(stations: list[dict], top_n: int = 3) -> list[dict]:
        ranked = sorted(stations, key=lambda s: (float(s.get("current_load", 1000.0)), -float(s.get("available_slots", 0))))
        return ranked[: max(1, top_n)]


predictor = GridLoadPredictor()


def default_training_rows() -> list[dict]:
    now = datetime.utcnow()
    rows: list[dict] = []
    for i in range(120):
        hour = (now.hour + i) % 24
        day = (now.weekday() + (i // 24)) % 7
        temp = 22.0 + (i % 12) * 1.5
        load = 25 + (30 if 7 <= hour <= 10 else 0) + (35 if 17 <= hour <= 21 else 0) + (5 if day < 5 else -5)
        rows.append(
            {
                "hour": hour,
                "day_of_week": day,
                "temperature": temp,
                "station_load": float(max(5, min(98, load))),
            }
        )
    return rows

