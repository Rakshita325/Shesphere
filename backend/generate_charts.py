import matplotlib.pyplot as plt
import numpy as np
import os

output_dir = r"C:\Users\HP\.gemini\antigravity-ide\brain\695edd5d-aa49-4d21-a777-e70ee7d1898f"
os.makedirs(output_dir, exist_ok=True)

# Set style
plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['font.size'] = 11

# -------------------------------------------------------------
# Graph 1: K-Means Cluster Distribution (Bar Chart)
# -------------------------------------------------------------
fig, ax = plt.subplots(figsize=(7, 4.5))
clusters = ['Cluster 0\n(Digital Skills)', 'Cluster 1\n(Gardening)', 'Cluster 2\n(Sewing/Fashion)', 'Cluster 3\n(Cooking/Fashion)']
counts = [1, 1, 3, 2]
colors = ['#4A90E2', '#50E3C2', '#F5A623', '#E91E63']

bars = ax.bar(clusters, counts, color=colors, width=0.5, edgecolor='black', linewidth=0.8)
ax.set_ylabel('Number of Users', fontsize=12, fontweight='bold')
ax.set_title('K-Means User Cluster Distribution (K=4)', fontsize=14, fontweight='bold', pad=15)
ax.set_ylim(0, 4)
ax.grid(axis='y', linestyle='--', alpha=0.7)

for bar in bars:
    height = bar.get_height()
    ax.annotate(f'{int(height)} User' + ('s' if height > 1 else ''),
                xy=(bar.get_x() + bar.get_width() / 2, height),
                xytext=(0, 4),  # 4 points vertical offset
                textcoords="offset points",
                ha='center', va='bottom', fontsize=11, fontweight='bold')

plt.tight_layout()
fig1_path = os.path.join(output_dir, "kmeans_cluster_distribution.png")
plt.savefig(fig1_path, dpi=300)
plt.close()
print("Saved:", fig1_path)

# -------------------------------------------------------------
# Graph 2: Comparison of Recommendation Methods
# -------------------------------------------------------------
fig, ax = plt.subplots(figsize=(8, 5))
methods = ['Content-Based\n(Category Match)', 'Content-Based\n(Interaction-Based)', 'Collaborative\nFiltering', 'Hybrid\nRecommendation']
precision_at_5 = [0.857, 0.171, 0.057, 0.171]
recall_at_5 = [0.225, 0.762, 0.333, 0.762]

x = np.arange(len(methods))
width = 0.35

rects1 = ax.bar(x - width/2, precision_at_5, width, label='Precision@5', color='#2B6CB0', edgecolor='black', linewidth=0.8)
rects2 = ax.bar(x + width/2, recall_at_5, width, label='Recall@5', color='#4299E1', edgecolor='black', linewidth=0.8)

ax.set_ylabel('Metric Value (0.0 - 1.0)', fontsize=12, fontweight='bold')
ax.set_title('Evaluation Metrics Comparison Across Recommendation Methods', fontsize=13, fontweight='bold', pad=15)
ax.set_xticks(x)
ax.set_xticklabels(methods, fontsize=10)
ax.set_ylim(0, 1.0)
ax.legend(frameon=True, facecolor='white', framealpha=0.9)
ax.grid(axis='y', linestyle='--', alpha=0.7)

def autolabel(rects):
    for rect in rects:
        height = rect.get_height()
        ax.annotate(f'{height:.3f}',
                    xy=(rect.get_x() + rect.get_width() / 2, height),
                    xytext=(0, 3),
                    textcoords="offset points",
                    ha='center', va='bottom', fontsize=9, fontweight='bold')

autolabel(rects1)
autolabel(rects2)

plt.tight_layout()
fig2_path = os.path.join(output_dir, "recommendation_methods_comparison.png")
plt.savefig(fig2_path, dpi=300)
plt.close()
print("Saved:", fig2_path)

# -------------------------------------------------------------
# Graph 3: Time Compatibility Graph
# -------------------------------------------------------------
fig, ax = plt.subplots(figsize=(7.5, 4.5))
categories = ['Fits Time Window\n(Score ≥ 0.70)', 'Exceeds Time Window\n(Score < 0.70)']
percentages = [97.14, 2.86]
counts_time = [136, 4]
colors_time = ['#38A169', '#E53E3E']

bars = ax.bar(categories, percentages, color=colors_time, width=0.45, edgecolor='black', linewidth=0.8)
ax.set_ylabel('Percentage of Recommendations (%)', fontsize=12, fontweight='bold')
ax.set_title('Time-Aware Recommendation Compatibility Rate (Total N=140)', fontsize=13, fontweight='bold', pad=15)
ax.set_ylim(0, 115)
ax.grid(axis='y', linestyle='--', alpha=0.7)

for i, bar in enumerate(bars):
    height = bar.get_height()
    ax.annotate(f'{height:.2f}%\n({counts_time[i]} / 140)',
                xy=(bar.get_x() + bar.get_width() / 2, height),
                xytext=(0, 4),
                textcoords="offset points",
                ha='center', va='bottom', fontsize=11, fontweight='bold')

plt.tight_layout()
fig3_path = os.path.join(output_dir, "time_compatibility_graph.png")
plt.savefig(fig3_path, dpi=300)
plt.close()
print("Saved:", fig3_path)

# -------------------------------------------------------------
# Graph 4: Recommendation Score Breakdown per Video Component
# -------------------------------------------------------------
fig, ax = plt.subplots(figsize=(8.5, 5))
sample_videos = [
  'Belt Blouse Cutting\n(Collab Pick)',
  '6 Indian Recipes\n(Category Pick)',
  'Punjabi Chicken Curry\n(Category Pick)',
  'Vegetable Upma\n(Category Pick)',
  'Lemon Rice Recipe\n(Category Pick)'
]

cb_scores = [0.00, 1.00, 1.00, 1.00, 1.00]
cf_scores = [1.00, 0.00, 0.00, 0.00, 0.00]
time_scores = [0.90, 0.85, 0.78, 0.76, 0.75]
hybrid_final = [0.68, 0.93, 0.89, 0.88, 0.88]

x = np.arange(len(sample_videos))
w = 0.2

ax.bar(x - 1.5*w, cb_scores, w, label='Content Score (S_CB)', color='#3182CE')
ax.bar(x - 0.5*w, cf_scores, w, label='Collaborative Score (S_CF)', color='#DD6B20')
ax.bar(x + 0.5*w, time_scores, w, label='Time Score (S_Time)', color='#38A169')
ax.bar(x + 1.5*w, hybrid_final, w, label='Final Hybrid Score', color='#805AD5')

ax.set_ylabel('Score Value (0.0 - 1.0)', fontsize=12, fontweight='bold')
ax.set_title('Recommendation Score Breakdown for Top Recommended Candidates (User: Ananya Bhat)', fontsize=12, fontweight='bold', pad=15)
ax.set_xticks(x)
ax.set_xticklabels(sample_videos, fontsize=9)
ax.set_ylim(0, 1.15)
ax.legend(frameon=True, facecolor='white', loc='upper right')
ax.grid(axis='y', linestyle='--', alpha=0.7)

plt.tight_layout()
fig4_path = os.path.join(output_dir, "score_comparison_graph.png")
plt.savefig(fig4_path, dpi=300)
plt.close()
print("Saved:", fig4_path)

# -------------------------------------------------------------
# Graph 5: Functional Verification & System Constraints Chart
# -------------------------------------------------------------
fig, ax = plt.subplots(figsize=(7.5, 4.5))
features = ['Completed Content\nExclusion', 'Time Window\nAdaptation', 'K-Means User\nClustering', 'CF Fallback to\nContent-Based']
status = [100, 100, 100, 100] # 100% verified functional behavior

bars = ax.bar(features, status, color='#319795', width=0.45, edgecolor='black', linewidth=0.8)
ax.set_ylabel('Verification Rate (%)', fontsize=12, fontweight='bold')
ax.set_title('Empirical Functional Verification of System Rules', fontsize=13, fontweight='bold', pad=15)
ax.set_ylim(0, 120)
ax.grid(axis='y', linestyle='--', alpha=0.7)

for bar in bars:
    height = bar.get_height()
    ax.annotate('100%\nVerified',
                xy=(bar.get_x() + bar.get_width() / 2, height),
                xytext=(0, 4),
                textcoords="offset points",
                ha='center', va='bottom', fontsize=10, fontweight='bold', color='#2C7A7B')

plt.tight_layout()
fig5_path = os.path.join(output_dir, "functional_verification_graph.png")
plt.savefig(fig5_path, dpi=300)
plt.close()
print("Saved:", fig5_path)
