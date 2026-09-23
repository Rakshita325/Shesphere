/**
 * timeAwareService.js
 *
 * Converts user's dailyFreeTime choice ('15 minutes', '30 minutes', '45 minutes', '1 hour')
 * into available seconds and calculates interpretable time compatibility scores against Video.duration.
 */

/**
 * Parse dailyFreeTime string into target seconds.
 * Legacy strings are handled for backwards compatibility.
 * 
 * @param {string} dailyFreeTimeStr 
 * @returns {number} Available seconds (default: 1800 = 30 minutes)
 */
const parseFreeTimeToSeconds = (dailyFreeTimeStr) => {
  if (!dailyFreeTimeStr) return 1800; // Default 30 mins

  const str = dailyFreeTimeStr.toString().toLowerCase().trim();

  if (str.includes('15')) return 900;       // 15 minutes
  if (str.includes('30')) return 1800;      // 30 minutes
  if (str.includes('45')) return 2700;      // 45 minutes
  if (str.includes('1 hour') || str.includes('1h')) return 3600; // 1 hour

  // Legacy fallback mappings
  if (str.includes('under_1')) return 900;
  if (str.includes('1_to_2')) return 1800;
  if (str.includes('2_to_4')) return 2700;
  if (str.includes('over_4')) return 3600;

  return 1800;
};

/**
 * Calculates interpretable time-compatibility score [0.0 - 1.0]
 * 
 * Rule:
 * - If video.duration <= userAvailableSeconds: Strong compatibility (Score = 1.0)
 * - If video.duration > userAvailableSeconds: Penalize based on overtime ratio
 * 
 * @param {number} videoDurationSeconds - Video duration in seconds
 * @param {string|number} dailyFreeTime - User's free time selection or target seconds
 * @returns {number} Score between 0.0 and 1.0
 */
const calculateTimeCompatibilityScore = (videoDurationSeconds, dailyFreeTime) => {
  const userAvailableSeconds = typeof dailyFreeTime === 'number'
    ? dailyFreeTime
    : parseFreeTimeToSeconds(dailyFreeTime);

  const duration = Number(videoDurationSeconds) || 0;

  if (duration <= 0) return 0.5; // Neutral score if duration is unknown

  if (duration <= userAvailableSeconds) {
    // Fits within available time -> High compatibility [0.70 - 1.00]
    // Videos that fill the user's available time block score higher
    const fillRatio = duration / userAvailableSeconds;
    const score = 0.70 + (0.30 * fillRatio);
    return Math.round(score * 100) / 100;
  } else {
    // Exceeds available time -> Strong penalty based on overtime ratio
    const overtimeRatio = (duration - userAvailableSeconds) / userAvailableSeconds;
    const score = Math.max(0, 0.70 - (1.2 * overtimeRatio));
    return Math.round(score * 100) / 100;
  }
};

module.exports = {
  parseFreeTimeToSeconds,
  calculateTimeCompatibilityScore
};
