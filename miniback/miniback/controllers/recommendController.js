import User from "../models/User.js";
import Session from "../models/Session.js";

//check krta h ki number infinite toh nhi hh - agar infinite h to 0 return kr dega 
function toSafeNumber(value, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

//text ko normalize kr dega - agar null h toh empty string nhi toh value ko trim aur lower case kr dega
function normalizeString(value) {
  return String(value || "").trim().toLowerCase();
}

//ek user ka interests array banayga usse string m covert krke, trim krke aur null ya undifined value ko empty string se denote krke
function sanitizeInterests(interests) {
  return Array.isArray(interests)
    ? interests.map((item) => String(item || "").trim()).filter(Boolean)
    : [];
}

//Interests ko humne match kia hh - u1 ka agr interest same hai u2 ke toh match ek kadam inc hoga fir matches ka perc return kr denge
function getInterestScore(userInterests, otherInterests) {
  const current = sanitizeInterests(userInterests);
  const other   = sanitizeInterests(otherInterests);

  if (!current.length || !other.length) return 0;

  const currentSet = new Set(current.map(normalizeString));
  const otherSet   = new Set(other.map(normalizeString));
  const union      = new Set([...currentSet, ...otherSet]);

  if (union.size === 0) return 0;

  let matches = 0;
  for (const interest of otherSet) {
    if (currentSet.has(interest)) matches += 1;
  }

  return toSafeNumber(Math.round((matches / union.size) * 100));
}

// cosine ka func hh
function cosine(a, b) {
  if (!a?.length || !b?.length) return 0;

  const limit = Math.min(a.length, b.length);
  if (limit === 0) return 0;

  let dot = 0, magASquared = 0, magBSquared = 0;

  for (let i = 0; i < limit; i++) {
    const av = Number(a[i]);
    const bv = Number(b[i]);
    if (!Number.isFinite(av) || !Number.isFinite(bv)) continue;
    dot          += av * bv;
    magASquared  += av * av;
    magBSquared  += bv * bv;
  }

  const magA = Math.sqrt(magASquared);
  const magB = Math.sqrt(magBSquared);
  if (magA === 0 || magB === 0) return 0;

  return toSafeNumber(dot / (magA * magB));
}

function getBioScore(currentEmbedding, otherEmbedding) {
  return toSafeNumber(Math.round(Math.max(0, cosine(currentEmbedding, otherEmbedding)) * 100));
}

function getGoalScore(currentRequirement, otherRequirement) {
  const current = normalizeString(currentRequirement);
  const other   = normalizeString(otherRequirement);
  if (!current || !other) return 0;
  if (current === other) return 100;
  return 0;
}

export async function getRecommendations(req, res) {
  try {
    const currentUserId = req.user.userId;
    const { sessionId, interests, exclude, requirement } = req.query;

    if (!sessionId) {
      return res.status(400).json({ message: "sessionId is required." });
    }

    const session = await Session.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ message: "Session not found." });
    }

    const currentSessionInterests = interests
      ? interests.split(",").map((item) => item.trim()).filter(Boolean)
      : [];

    const excludeIds = exclude ? exclude.split(",").filter(Boolean) : [];

    const currentUser = await User.findById(currentUserId).select("embedding");

    // Build preference map — only for users who have saved preferences
    const participantPreferenceMap = new Map(
      (session.participantPreferences || []).map((item) => [
        item.userId.toString(),
        {
          requirement: item.requirement || "",
          interests:   sanitizeInterests(item.interests),
        },
      ])
    );

    // FIX: Removed the `!participantPreferenceMap.has(id)` check.
    // Previously, any participant who hadn't saved preferences was silently
    // excluded — meaning two fresh users could never see each other.
    // Now we include ALL session participants (except self and excluded),
    // and fall back to their profile interests if no session preferences exist.
    const filteredParticipants = session.participants.filter((participantId) => {
      const id = participantId.toString();
      if (id === currentUserId)        return false;
      if (excludeIds.includes(id))     return false;
      return true;
    });

    if (filteredParticipants.length === 0) {
      return res.json({ success: true, recommendations: [] });
    }

    const users = await User.find({ _id: { $in: filteredParticipants } })
      .select("name bio interests embedding");

    const scored = users
      .filter((user) => user != null) // safety: skip any null results
      .map((user) => {
        // Use session preferences if available, otherwise fall back to profile
        const sessionPreference = participantPreferenceMap.get(user._id.toString());
        const otherInterests    = sessionPreference?.interests?.length
          ? sessionPreference.interests
          : sanitizeInterests(user.interests);
        const otherRequirement  = sessionPreference?.requirement || "";

        const bioScore      = getBioScore(currentUser?.embedding, user.embedding);
        const interestScore = getInterestScore(currentSessionInterests, otherInterests);
        const goalScore     = getGoalScore(requirement, otherRequirement);

        const finalScore = Math.max(
          0,
          Math.min(
            100,
            Math.round(0.6 * bioScore + 0.3 * interestScore + 0.1 * goalScore)
          )
        );

        return {
          id:         user._id,
          name:       user.name,
          bio:        user.bio || "",
          interests:  otherInterests,
          avatar:     user.name.split(" ").map((part) => part[0]).join("").toUpperCase(),
          matchScore: finalScore,
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);

    res.json({ success: true, recommendations: scored.slice(0, 5) });

  } catch (err) {
    console.error("Recommend error:", err);
    res.status(500).json({ message: "Server error.", error: err.message });
  }
}