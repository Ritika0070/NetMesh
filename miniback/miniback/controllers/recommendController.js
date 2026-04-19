import User from "../models/User.js";
import Session from "../models/Session.js";

function getMatchPercent(userInterests, otherInterests) {
  if (!userInterests.length || !otherInterests.length) return 0;
  const set = new Set(userInterests);
  const matches = otherInterests.filter(i => set.has(i)).length;
  const total = new Set([...userInterests, ...otherInterests]).size;
  return Math.round((matches / total) * 100);
}

function cosine(a, b) {
  if (!a?.length || !b?.length) return 0;
  const dot = a.reduce((sum, v, i) => sum + v * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, v) => sum + v * v, 0));
  const magB = Math.sqrt(b.reduce((sum, v) => sum + v * v, 0));
  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}

const REQUIREMENT_INTERESTS = {
  "Networking":        [],
  "Job Opportunities": ["Startups", "Fintech", "Marketing"],
  "Collaboration":     ["AI", "Design", "Robotics", "Web3"],
  "Mentorship":        ["Education", "AI", "Startups"],
  "Investment":        ["Startups", "Fintech", "Web3"],
  "Co-founder Hunt":   ["Startups", "AI", "Design", "Robotics"],
};

function getRequirementBoost(requirement, otherInterests) {
  if (!requirement) return 0;
  const related = REQUIREMENT_INTERESTS[requirement] || [];
  if (related.length === 0) return 0;
  const matches = otherInterests.filter(i => related.includes(i)).length;
  return Math.round((matches / related.length) * 20);
}

export async function getRecommendations(req, res) {
  try {
    const currentUserId = req.user.userId;
    const { sessionId, interests, exclude, requirement } = req.query;

    if (!sessionId)
      return res.status(400).json({ message: "sessionId is required." });

    const session = await Session.findOne({ sessionId });
    if (!session)
      return res.status(404).json({ message: "Session not found." });

    const userInterests = interests
      ? interests.split(",").map(i => i.trim())
      : [];

    const excludeIds = exclude ? exclude.split(",") : [];

    const currentUser = await User.findById(currentUserId).select("embedding");

    const filteredParticipants = session.participants.filter(pid => {
      if (pid.toString() === currentUserId) return false;
      if (excludeIds.includes(pid.toString())) return false;
      return true;
    });

    if (filteredParticipants.length === 0)
      return res.json({ success: true, recommendations: [] });

    const users = await User.find({ _id: { $in: filteredParticipants } })
      .select("name bio interests embedding");

    const scored = users.map(user => {
      const interestScore    = getMatchPercent(userInterests, user.interests);
      const semanticScore    = Math.round(
        Math.max(0, cosine(currentUser.embedding, user.embedding)) * 100
      );
      const requirementBoost = getRequirementBoost(requirement, user.interests);

      const hasEmbeddings =
        currentUser.embedding?.length > 0 && user.embedding?.length > 0;

      const baseScore = hasEmbeddings
        ? Math.round(semanticScore * 0.6 + interestScore * 0.4)
        : interestScore;

      const finalScore = Math.min(100, baseScore + requirementBoost);

      return {
        id:         user._id,
        name:       user.name,
        bio:        user.bio,
        interests:  user.interests,
        avatar:     user.name.split(" ").map(n => n[0]).join("").toUpperCase(),
        matchScore: finalScore,
      };
    }).sort((a, b) => b.matchScore - a.matchScore);

    res.json({ success: true, recommendations: scored.slice(0, 5) });
  } catch (err) {
    console.error("Recommend error:", err);
    res.status(500).json({ message: "Server error.", error: err.message });
  }
}