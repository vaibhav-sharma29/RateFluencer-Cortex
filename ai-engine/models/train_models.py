import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, accuracy_score
import xgboost as xgb
import lightgbm as lgb
import joblib
import os

os.makedirs("models/saved", exist_ok=True)

np.random.seed(42)
N = 2000


def generate_influencer_data(n):
    followers = np.random.randint(1000, 5000000, n)
    engagement_rate = np.random.uniform(0.5, 15.0, n)
    share_rate = np.random.uniform(0.1, 5.0, n)
    save_rate = np.random.uniform(0.2, 8.0, n)
    posting_freq = np.random.uniform(0.5, 14.0, n)
    growth_rate = np.random.uniform(-2.0, 25.0, n)
    comment_quality = np.random.uniform(0.1, 1.0, n)
    audience_quality = np.random.uniform(0.2, 1.0, n)
    consistency = np.random.uniform(0.1, 1.0, n)

    score = (
        engagement_rate * 4.0 +
        share_rate * 3.0 +
        save_rate * 2.5 +
        audience_quality * 20.0 +
        consistency * 15.0 +
        growth_rate * 1.5 +
        comment_quality * 10.0 +
        np.log1p(followers) * 1.2
    )
    score = (score - score.min()) / (score.max() - score.min()) * 100

    return pd.DataFrame({
        "engagement_rate": engagement_rate,
        "share_rate": share_rate,
        "save_rate": save_rate,
        "posting_freq": posting_freq,
        "growth_rate": growth_rate,
        "comment_quality": comment_quality,
        "audience_quality": audience_quality,
        "consistency": consistency,
        "log_followers": np.log1p(followers),
        "score": score
    })


df_inf = generate_influencer_data(N)
X_inf = df_inf.drop("score", axis=1)
y_inf = df_inf["score"]
X_train, X_test, y_train, y_test = train_test_split(X_inf, y_inf, test_size=0.2, random_state=42)

print("Training Influencer Score Model...")
inf_model = xgb.XGBRegressor(n_estimators=200, max_depth=6, learning_rate=0.05, random_state=42, verbosity=0)
inf_model.fit(X_train, y_train)
mae = mean_absolute_error(y_test, inf_model.predict(X_test))
print(f"Influencer Score MAE: {mae:.2f}")

scaler_inf = MinMaxScaler()
scaler_inf.fit(X_inf)
joblib.dump(inf_model, "models/saved/influencer_score_model.pkl")
joblib.dump(scaler_inf, "models/saved/influencer_score_scaler.pkl")
joblib.dump(list(X_inf.columns), "models/saved/influencer_score_features.pkl")


def generate_authenticity_data(n):
    follower_engagement_ratio = np.random.uniform(0.001, 0.15, n)
    comment_like_ratio = np.random.uniform(0.01, 0.3, n)
    follower_growth_spike = np.random.uniform(0.0, 1.0, n)
    bot_pattern_score = np.random.uniform(0.0, 1.0, n)
    engagement_consistency = np.random.uniform(0.0, 1.0, n)
    sudden_follower_jump = np.random.uniform(0.0, 1.0, n)

    fake_prob = (
        (1 - follower_engagement_ratio * 10) * 0.3 +
        follower_growth_spike * 0.3 +
        bot_pattern_score * 0.3 +
        sudden_follower_jump * 0.1
    )
    is_fake = (fake_prob > 0.5).astype(int)

    authenticity_score = np.clip(
        (follower_engagement_ratio * 300 +
         comment_like_ratio * 100 +
         engagement_consistency * 40 +
         (1 - bot_pattern_score) * 30 +
         (1 - sudden_follower_jump) * 20 +
         (1 - follower_growth_spike) * 10),
        0, 100
    )

    return pd.DataFrame({
        "follower_engagement_ratio": follower_engagement_ratio,
        "comment_like_ratio": comment_like_ratio,
        "follower_growth_spike": follower_growth_spike,
        "bot_pattern_score": bot_pattern_score,
        "engagement_consistency": engagement_consistency,
        "sudden_follower_jump": sudden_follower_jump,
        "is_fake": is_fake,
        "authenticity_score": authenticity_score
    })


df_auth = generate_authenticity_data(N)
X_auth = df_auth[["follower_engagement_ratio", "comment_like_ratio", "follower_growth_spike",
                   "bot_pattern_score", "engagement_consistency", "sudden_follower_jump"]]
y_auth_cls = df_auth["is_fake"]
y_auth_score = df_auth["authenticity_score"]
X_train_a, X_test_a, y_train_a, y_test_a = train_test_split(X_auth, y_auth_cls, test_size=0.2, random_state=42)

print("Training Fake Follower Detector...")
auth_model = lgb.LGBMClassifier(n_estimators=200, max_depth=6, learning_rate=0.05, random_state=42, verbose=-1)
auth_model.fit(X_train_a, y_train_a)
acc = accuracy_score(y_test_a, auth_model.predict(X_test_a))
print(f"Fake Detector Accuracy: {acc:.2%}")

auth_score_model = xgb.XGBRegressor(n_estimators=150, max_depth=5, random_state=42, verbosity=0)
auth_score_model.fit(X_auth, y_auth_score)

joblib.dump(auth_model, "models/saved/fake_detector_model.pkl")
joblib.dump(auth_score_model, "models/saved/authenticity_score_model.pkl")
joblib.dump(list(X_auth.columns), "models/saved/authenticity_features.pkl")


def generate_growth_data(n):
    current_followers = np.random.randint(1000, 2000000, n)
    avg_engagement = np.random.uniform(0.5, 12.0, n)
    posting_freq = np.random.uniform(0.5, 14.0, n)
    content_quality = np.random.uniform(0.2, 1.0, n)
    niche_growth_rate = np.random.uniform(0.5, 5.0, n)
    audience_retention = np.random.uniform(0.3, 0.95, n)
    collab_frequency = np.random.uniform(0.0, 1.0, n)

    growth_score = np.clip(
        avg_engagement * 3.5 +
        posting_freq * 2.0 +
        content_quality * 25.0 +
        niche_growth_rate * 8.0 +
        audience_retention * 20.0 +
        collab_frequency * 10.0 +
        np.log1p(current_followers) * 0.5,
        0, 100
    )
    growth_score = (growth_score - growth_score.min()) / (growth_score.max() - growth_score.min()) * 100

    return pd.DataFrame({
        "log_followers": np.log1p(current_followers),
        "avg_engagement": avg_engagement,
        "posting_freq": posting_freq,
        "content_quality": content_quality,
        "niche_growth_rate": niche_growth_rate,
        "audience_retention": audience_retention,
        "collab_frequency": collab_frequency,
        "growth_score": growth_score
    })


df_growth = generate_growth_data(N)
X_growth = df_growth.drop("growth_score", axis=1)
y_growth = df_growth["growth_score"]

print("Training Growth Prediction Model...")
growth_model = RandomForestRegressor(n_estimators=200, max_depth=8, random_state=42, n_jobs=-1)
growth_model.fit(X_growth, y_growth)
print(f"Growth Model trained on {N} samples")

joblib.dump(growth_model, "models/saved/growth_model.pkl")
joblib.dump(list(X_growth.columns), "models/saved/growth_features.pkl")


def generate_virality_data(n):
    hook_strength = np.random.uniform(0.1, 1.0, n)
    trend_alignment = np.random.uniform(0.0, 1.0, n)
    hashtag_quality = np.random.uniform(0.1, 1.0, n)
    caption_length = np.random.uniform(0.1, 1.0, n)
    posting_time_score = np.random.uniform(0.2, 1.0, n)
    visual_quality = np.random.uniform(0.2, 1.0, n)
    cta_strength = np.random.uniform(0.1, 1.0, n)
    niche_popularity = np.random.uniform(0.2, 1.0, n)

    virality_score = np.clip(
        hook_strength * 25.0 +
        trend_alignment * 20.0 +
        hashtag_quality * 10.0 +
        posting_time_score * 10.0 +
        visual_quality * 15.0 +
        cta_strength * 10.0 +
        niche_popularity * 8.0 +
        caption_length * 2.0,
        0, 100
    )
    virality_score = (virality_score - virality_score.min()) / (virality_score.max() - virality_score.min()) * 100

    return pd.DataFrame({
        "hook_strength": hook_strength,
        "trend_alignment": trend_alignment,
        "hashtag_quality": hashtag_quality,
        "caption_length": caption_length,
        "posting_time_score": posting_time_score,
        "visual_quality": visual_quality,
        "cta_strength": cta_strength,
        "niche_popularity": niche_popularity,
        "virality_score": virality_score
    })


df_vir = generate_virality_data(N)
X_vir = df_vir.drop("virality_score", axis=1)
y_vir = df_vir["virality_score"]

print("Training Virality Prediction Model...")
vir_model = xgb.XGBRegressor(n_estimators=200, max_depth=6, learning_rate=0.05, random_state=42, verbosity=0)
vir_model.fit(X_vir, y_vir)
print(f"Virality Model trained on {N} samples")

joblib.dump(vir_model, "models/saved/virality_model.pkl")
joblib.dump(list(X_vir.columns), "models/saved/virality_features.pkl")

print("All models saved to models/saved/")
