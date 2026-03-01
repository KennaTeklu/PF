// ==================== COMPLETE JAVASCRIPT – WORKOUT CONTINUITY SYSTEM ULTIMATE EDITION ====================
// This script includes all functionality from previous rounds plus new compendium, status features,
// and the following enhancements:
// - Systemic Fatigue Factor (workouts in last 7 days affect rest days)
// - Tendon Guard (rolling RPE average triggers deload warning)
// - Calves only appear in legs_day (fixed)
// - "Start Today" button on dashboard
// - Mobile-first navigation categories
// - ULTIMATE ACCESSORY SELECTION (mathematically optimized, physician & powerlifter approved)
// - Swipeable workout deck with auto‑loading images
// - Side‑drawer logging
// - Backup reminder (pulsing Settings cog)

// ---------- GLOBAL DATA STRUCTURES ----------
let workoutData = {
    user: {
        name: "",
        birthDate: null,
        gender: "male",
        weight: null,
        height: null,
        experience: "intermediate",
        goal: "balanced",
        created: new Date().toISOString(),
        settings: {
            workoutDays: ["monday", "wednesday", "friday"],
            restTime: 90,
            progressionRate: 0.02,
            theme: "blue",
            darkMode: false
        },
        agingRisks: [],
        menstrual: { lastPeriodStart: null, cycleLength: 28, symptoms: [] },
        streak: 0,
        lastWorkout: null,
        sleepLogs: [],
        weightHistory: []
    },
    workouts: [],          // completed workouts (history)
    exercises: {},          // exercise history and PRs
    goals: [],              // from first file
    injuries: [],            // from first file
    lastExport: new Date().toISOString() // for sync
};

// ---------- MUSCLE DATABASE (40+ groups) ----------
const muscleDatabase = {
    major: [
        { name: "quads", display: "Quadriceps", restDays: 3, category: "lower" },
        { name: "hamstrings", display: "Hamstrings", restDays: 3, category: "lower" },
        { name: "glutes", display: "Glutes", restDays: 2, category: "lower" },
        { name: "chest", display: "Chest", restDays: 2, category: "upper" },
        { name: "back", display: "Back", restDays: 2, category: "upper" },
        { name: "shoulders", display: "Shoulders", restDays: 2, category: "upper" },
        { name: "biceps", display: "Biceps", restDays: 2, category: "arms" },
        { name: "triceps", display: "Triceps", restDays: 2, category: "arms" },
        { name: "calves", display: "Calves", restDays: 2, category: "lower" },
        { name: "core", display: "Core", restDays: 1, category: "core" },
        { name: "forearms", display: "Forearms", restDays: 2, category: "arms" },
        { name: "traps", display: "Traps", restDays: 2, category: "upper" },
        { name: "lats", display: "Latissimus Dorsi", restDays: 2, category: "upper" },
        { name: "rear_delts", display: "Rear Deltoids", restDays: 2, category: "upper" },
        { name: "obliques", display: "Obliques", restDays: 2, category: "core" },
        { name: "hip_flexors", display: "Hip Flexors", restDays: 2, category: "lower" },
        { name: "adductors", display: "Adductors", restDays: 3, category: "lower" },
        { name: "abductors", display: "Abductors", restDays: 2, category: "lower" },
        { name: "erectors", display: "Erector Spinae", restDays: 3, category: "core" },
        { name: "serratus", display: "Serratus Anterior", restDays: 2, category: "upper" }
    ],
    longevity: [
        { name: "neck", display: "Neck", restDays: 3, category: "longevity", agingRisk: "high" },
        { name: "deep_neck", display: "Deep Neck Flexors", restDays: 2, category: "longevity", agingRisk: "high" },
        { name: "levator_scap", display: "Levator Scapulae", restDays: 2, category: "longevity", agingRisk: "medium" },
        { name: "rhomboids", display: "Rhomboids", restDays: 2, category: "longevity", agingRisk: "medium" },
        { name: "teres", display: "Teres Major/Minor", restDays: 3, category: "longevity", agingRisk: "medium" },
        { name: "infraspinatus", display: "Infraspinatus", restDays: 3, category: "longevity", agingRisk: "high" },
        { name: "supraspinatus", display: "Supraspinatus", restDays: 3, category: "longevity", agingRisk: "high" },
        { name: "subscapularis", display: "Subscapularis", restDays: 3, category: "longevity", agingRisk: "high" },
        { name: "brachialis", display: "Brachialis", restDays: 2, category: "longevity", agingRisk: "low" },
        { name: "brachioradialis", display: "Brachioradialis", restDays: 2, category: "longevity", agingRisk: "low" },
        { name: "anconeus", display: "Anconeus", restDays: 2, category: "longevity", agingRisk: "medium" },
        { name: "supinator", display: "Supinator", restDays: 2, category: "longevity", agingRisk: "medium" },
        { name: "pronator", display: "Pronators", restDays: 2, category: "longevity", agingRisk: "medium" },
        { name: "pec_minor", display: "Pectoralis Minor", restDays: 2, category: "longevity", agingRisk: "medium" },
        { name: "coracobrach", display: "Coracobrachialis", restDays: 2, category: "longevity", agingRisk: "low" },
        { name: "popliteus", display: "Popliteus", restDays: 3, category: "longevity", agingRisk: "high" },
        { name: "tibialis", display: "Tibialis Anterior", restDays: 2, category: "longevity", agingRisk: "medium" },
        { name: "soleus", display: "Soleus", restDays: 2, category: "longevity", agingRisk: "medium" },
        { name: "peroneus_tertius", display: "Peroneus Tertius", restDays: 2, category: "longevity", agingRisk: "high" },
        { name: "articularis_genus", display: "Articularis Genus", restDays: 2, category: "longevity", agingRisk: "high" },
        { name: "multifidus", display: "Multifidus", restDays: 2, category: "longevity", agingRisk: "high" },
        { name: "transverse", display: "Transverse Abdominis", restDays: 1, category: "longevity", agingRisk: "high" },
        { name: "quadratus_plantae", display: "Quadratus Plantae", restDays: 2, category: "longevity", agingRisk: "medium" }
    ],
    hands: [
        { name: "hand_lumbricals", display: "Hand Lumbricals", restDays: 1, category: "hands", agingRisk: "high" },
        { name: "hand_interossei", display: "Hand Interossei", restDays: 1, category: "hands", agingRisk: "high" },
        { name: "thenar", display: "Thenar/Hypothenar", restDays: 1, category: "hands", agingRisk: "high" }
    ],
    feet: [
        { name: "foot_intrinsics", display: "Foot Intrinsics", restDays: 1, category: "feet", agingRisk: "high" },
        { name: "foot_interossei", display: "Foot Interossei", restDays: 1, category: "feet", agingRisk: "high" },
        { name: "abductor_hallucis", display: "Abductor Hallucis", restDays: 2, category: "feet", agingRisk: "medium" },
        { name: "flexor_brevis", display: "Flexor Digitorum Brevis", restDays: 2, category: "feet", agingRisk: "medium" }
    ]
};

// ==================== EXERCISE COMPENDIUM DATA ====================
const exerciseCompendium = [
    {
        group: "Quadriceps",
        exercises: [
            { equipment: "Barbell", name: "Back Squat (high‑bar)", setsReps: "3–5×5", progression: "Add 5 lbs", notes: "Change bar position (low‑bar)" },
            { equipment: "Barbell", name: "Front Squat", setsReps: "3–5×5", progression: "Add 5 lbs", notes: "Emphasizes quads more" },
            { equipment: "Machine", name: "Hack Squat", setsReps: "3×8–12", progression: "Add 10 lbs", notes: "Different foot placement (high/low)" },
            { equipment: "Dumbbell", name: "Goblet Squat", setsReps: "3×10–15", progression: "Heavier DB", notes: "Great for beginners; deep squat" },
            { equipment: "Dumbbell", name: "Dumbbell Bulgarian Split Squat", setsReps: "3×8–12 each", progression: "Add 2.5–5 lbs", notes: "Unilateral; core stability" },
            { equipment: "Dumbbell", name: "Dumbbell Lunges (walking)", setsReps: "3×10 each leg", progression: "Add weight", notes: "Forward, reverse, lateral variations" },
            { equipment: "Machine", name: "Leg Press", setsReps: "3×10–15", progression: "Add 10–20 lbs", notes: "Narrow vs wide stance" },
            { equipment: "Machine", name: "Leg Extension", setsReps: "3×12–20", progression: "Add 5–10 lbs", notes: "Single leg for balance" },
            { equipment: "Smith Machine", name: "Smith Machine Squat", setsReps: "3×8–12", progression: "Add 5–10 lbs", notes: "Can place feet forward for quad focus" },
            { equipment: "Kettlebell", name: "Goblet Squat", setsReps: "3×10–15", progression: "Heavier kettlebell", notes: "Hold bell close to chest" },
            { equipment: "Kettlebell", name: "Kettlebell Front Squat (double)", setsReps: "3×8–12", progression: "Increase weight", notes: "Rack position" },
            { equipment: "Cable", name: "Cable Squat (with bar)", setsReps: "3×10–15", progression: "Increase weight", notes: "Constant tension" },
            { equipment: "Cable", name: "Cable Pull‑Through Squat", setsReps: "3×12", progression: "Increase weight", notes: "Glute/quad combo" },
            { equipment: "Bodyweight", name: "Air Squat", setsReps: "3×20+", progression: "Add reps, then weighted vest", notes: "Pistol squats progression" },
            { equipment: "Bodyweight", name: "Jump Squat", setsReps: "3×10", progression: "Increase height", notes: "Explosive power" },
            { equipment: "Bodyweight", name: "Bulgarian Split Squat (bodyweight)", setsReps: "3×12 each", progression: "Add reps", notes: "Unilateral" },
            { equipment: "Specialty", name: "Sissy Squat", setsReps: "3×10–15", progression: "Add weight (plate)", notes: "Advanced quad isolation" },
            { equipment: "Specialty", name: "Belt Squat", setsReps: "3×8–12", progression: "Add weight", notes: "Spine‑friendly" },
            { equipment: "Specialty", name: "Hatfield Squat", setsReps: "3×6–10", progression: "Add weight", notes: "Assisted by hands on rails" },
            { equipment: "Phase/Gender Notes", name: "Women in luteal phase: reduce weight by 20% if fatigued, or switch to higher‑rep bodyweight variations. Men focusing on strength: prioritize barbell squats 5×5; add front squats on accessory days.", setsReps: "", progression: "", notes: "" }
        ]
    },
    {
        group: "Hamstrings",
        exercises: [
            { equipment: "Barbell", name: "Romanian Deadlift (RDL)", setsReps: "3×8–12", progression: "Add 5–10 lbs", notes: "Stiff‑leg deadlift" },
            { equipment: "Barbell", name: "Conventional Deadlift", setsReps: "3–5×5", progression: "Add 5–10 lbs", notes: "Sumo stance" },
            { equipment: "Barbell", name: "Good Morning", setsReps: "3×8–12", progression: "Add 5–10 lbs", notes: "Vary bar placement" },
            { equipment: "Dumbbell", name: "Dumbbell RDL", setsReps: "3×10–15", progression: "Heavier DB", notes: "Single‑leg RDL for balance" },
            { equipment: "Dumbbell", name: "Dumbbell Leg Curl (lying on floor)", setsReps: "3×12", progression: "Add weight", notes: "Unstable but effective" },
            { equipment: "Machine", name: "Lying Leg Curl", setsReps: "3×12–20", progression: "Add 5–10 lbs", notes: "Single leg" },
            { equipment: "Machine", name: "Seated Leg Curl", setsReps: "3×12–20", progression: "Add 5–10 lbs", notes: "Different hip angle" },
            { equipment: "Machine", name: "Glute‑Ham Raise (GHR)", setsReps: "3×6–10", progression: "Add weight (hold plate)", notes: "Advanced" },
            { equipment: "Kettlebell", name: "Kettlebell Swing", setsReps: "3×15–20", progression: "Heavier bell", notes: "Explosive hamstring/glute" },
            { equipment: "Kettlebell", name: "Kettlebell RDL", setsReps: "3×10–15", progression: "Heavier bell", notes: "Unilateral possible" },
            { equipment: "Cable", name: "Cable Pull‑Through", setsReps: "3×15–20", progression: "Increase weight", notes: "Hip hinge focus" },
            { equipment: "Cable", name: "Cable Leg Curl (ankle cuff)", setsReps: "3×12–15", progression: "Increase weight", notes: "Standing or lying" },
            { equipment: "Bodyweight", name: "Nordic Curl (eccentric)", setsReps: "3×5–8", progression: "Add eccentric time", notes: "Partner or anchor" },
            { equipment: "Bodyweight", name: "Glute Bridge (floor)", setsReps: "3×20", progression: "Add reps", notes: "Single‑leg bridge" },
            { equipment: "Specialty", name: "Reverse Hyperextension", setsReps: "3×12–15", progression: "Add weight", notes: "Machine or bench" },
            { equipment: "Specialty", name: "45° Hyperextension", setsReps: "3×12–15", progression: "Add plate", notes: "Focus on hamstrings by rounding back" },
            { equipment: "Phase/Gender Notes", name: "Women: Nordic curls prepare for childbirth (eccentric control). Men: prioritize heavy RDLs and deadlifts.", setsReps: "", progression: "", notes: "" }
        ]
    },
    {
        group: "Glutes",
        exercises: [
            { equipment: "Barbell", name: "Hip Thrust", setsReps: "3×8–12", progression: "Add 10 lbs", notes: "Single‑leg barbell thrust" },
            { equipment: "Barbell", name: "Glute Bridge (barbell)", setsReps: "3×10–15", progression: "Add weight", notes: "Feet elevated" },
            { equipment: "Dumbbell", name: "Dumbbell Glute Bridge", setsReps: "3×15", progression: "Heavier DB", notes: "Single leg" },
            { equipment: "Dumbbell", name: "Dumbbell Frog Pumps", setsReps: "3×20", progression: "Add DB", notes: "Adductor focus" },
            { equipment: "Machine", name: "Glute Kickback Machine", setsReps: "3×12–15", progression: "Add weight", notes: "Vary angle" },
            { equipment: "Machine", name: "Abductor Machine", setsReps: "3×15–20", progression: "Add weight", notes: "Lean forward for glute max" },
            { equipment: "Kettlebell", name: "Kettlebell Swing", setsReps: "3×15–20", progression: "Heavier bell", notes: "Russian vs American" },
            { equipment: "Kettlebell", name: "Kettlebell Goblet Squat", setsReps: "3×12", progression: "Heavier", notes: "Deep squat" },
            { equipment: "Cable", name: "Cable Glute Kickback", setsReps: "3×15 each", progression: "Increase weight", notes: "Ankle cuff; lean on bench" },
            { equipment: "Cable", name: "Cable Hip Abduction", setsReps: "3×15 each", progression: "Increase weight", notes: "Standing" },
            { equipment: "Bodyweight", name: "Donkey Kicks", setsReps: "3×20", progression: "Add ankle weight", notes: "Fire hydrants" },
            { equipment: "Bodyweight", name: "Clamshells", setsReps: "3×20 each", progression: "Add band", notes: "Side‑lying" },
            { equipment: "Bodyweight", name: "Step‑ups", setsReps: "3×12 each", progression: "Add height/reps", notes: "Use bench" },
            { equipment: "Specialty", name: "45° Hip Extension", setsReps: "3×12–15", progression: "Add plate", notes: "Machine" },
            { equipment: "Specialty", name: "B‑Stance RDL", setsReps: "3×10 each", progression: "Heavier DB", notes: "Unilateral stability" },
            { equipment: "Phase/Gender Notes", name: "Women: emphasize during follicular phase for growth; clamshells great during luteal (low impact). Men: hip thrusts for power and size.", setsReps: "", progression: "", notes: "" }
        ]
    },
    {
        group: "Chest",
        exercises: [
            { equipment: "Barbell", name: "Flat Bench Press", setsReps: "3–5×5", progression: "Add 2.5–5 lbs", notes: "Close‑grip for triceps" },
            { equipment: "Barbell", name: "Incline Bench Press", setsReps: "3×8–12", progression: "Add 5 lbs", notes: "Upper chest" },
            { equipment: "Barbell", name: "Decline Bench Press", setsReps: "3×8–12", progression: "Add 5 lbs", notes: "Lower chest" },
            { equipment: "Barbell", name: "Floor Press", setsReps: "3×8–12", progression: "Add 5 lbs", notes: "Triceps/chest, limited ROM" },
            { equipment: "Dumbbell", name: "Flat Dumbbell Press", setsReps: "3×8–12", progression: "Heavier DB", notes: "Neutral grip possible" },
            { equipment: "Dumbbell", name: "Incline Dumbbell Press", setsReps: "3×8–12", progression: "Heavier DB", notes: "Rotate palms in at top" },
            { equipment: "Dumbbell", name: "Dumbbell Fly", setsReps: "3×12–15", progression: "Heavier DB", notes: "Flat, incline, decline" },
            { equipment: "Dumbbell", name: "Pullover", setsReps: "3×12", progression: "Heavier DB", notes: "Chest/lats" },
            { equipment: "Machine", name: "Chest Press Machine", setsReps: "3×10–15", progression: "Add weight", notes: "Seated, incline, decline" },
            { equipment: "Machine", name: "Pec Deck Fly", setsReps: "3×12–15", progression: "Add weight", notes: "Squeeze at front" },
            { equipment: "Machine", name: "Cable Crossover", setsReps: "3×15", progression: "Increase weight", notes: "High, mid, low pulley" },
            { equipment: "Cable", name: "Cable Press (standing)", setsReps: "3×12", progression: "Increase weight", notes: "Unilateral or bilateral" },
            { equipment: "Cable", name: "Cable Fly (low to high)", setsReps: "3×15", progression: "Increase weight", notes: "Upper chest focus" },
            { equipment: "Bodyweight", name: "Push‑up", setsReps: "3×20+", progression: "Add reps → weighted vest", notes: "Wide, narrow, decline, diamond" },
            { equipment: "Bodyweight", name: "Dips (chest variation)", setsReps: "3×10–15", progression: "Add weight (dip belt)", notes: "Lean forward" },
            { equipment: "Bodyweight", name: "Ring Push‑up", setsReps: "3×12", progression: "Increase instability", notes: "Unstable surface" },
            { equipment: "Kettlebell", name: "Kettlebell Floor Press", setsReps: "3×10–15", progression: "Heavier bell", notes: "Single or double" },
            { equipment: "Kettlebell", name: "Kettlebell Fly", setsReps: "3×12", progression: "Heavier bell", notes: "On floor" },
            { equipment: "Specialty", name: "Svend Press", setsReps: "3×12–15", progression: "Heavier plates", notes: "Squeeze plates together" },
            { equipment: "Specialty", name: "Landmine Press", setsReps: "3×10–12", progression: "Add weight", notes: "Single arm, rotational" },
            { equipment: "Phase/Gender Notes", name: "Women: upper chest focus (incline) for shape; push‑ups can be regressed. Men: prioritize flat bench for strength; add flys for detail.", setsReps: "", progression: "", notes: "" }
        ]
    },
    {
        group: "Back (Lats, Rhomboids, Traps, Rear Delts)",
        exercises: [
            { equipment: "Barbell", name: "Bent‑Over Row", setsReps: "3×8–12", progression: "Add 5–10 lbs", notes: "Overhand, underhand" },
            { equipment: "Barbell", name: "Pendlay Row", setsReps: "3×6–10", progression: "Add 5 lbs", notes: "Explosive from floor" },
            { equipment: "Barbell", name: "T‑Bar Row", setsReps: "3×8–12", progression: "Add 10 lbs", notes: "Chest supported" },
            { equipment: "Dumbbell", name: "Single‑Arm Dumbbell Row", setsReps: "3×10–15 each", progression: "Heavier DB", notes: "On bench, crossbody" },
            { equipment: "Dumbbell", name: "Dumbbell Row (two arms)", setsReps: "3×8–12", progression: "Heavier DB", notes: "Inverted grip" },
            { equipment: "Machine", name: "Lat Pulldown", setsReps: "3×10–15", progression: "Add 5–10 lbs", notes: "Wide, narrow, reverse grip" },
            { equipment: "Machine", name: "Seated Cable Row", setsReps: "3×10–15", progression: "Add 5–10 lbs", notes: "V‑bar, straight bar" },
            { equipment: "Machine", name: "Assisted Pull‑up Machine", setsReps: "3×8–12", progression: "Reduce assist", notes: "Builds to unassisted" },
            { equipment: "Cable", name: "Straight‑Arm Pulldown", setsReps: "3×12–15", progression: "Increase weight", notes: "Lat isolation" },
            { equipment: "Cable", name: "Cable Pullover", setsReps: "3×12", progression: "Increase weight", notes: "On bench or standing" },
            { equipment: "Bodyweight", name: "Pull‑ups", setsReps: "3×AMRAP", progression: "Add reps → weighted", notes: "Chin‑ups, wide, commando" },
            { equipment: "Bodyweight", name: "Inverted Row", setsReps: "3×12–15", progression: "Elevate feet", notes: "Under bar or rings" },
            { equipment: "Kettlebell", name: "Kettlebell Row", setsReps: "3×12 each", progression: "Heavier bell", notes: "Renegade rows" },
            { equipment: "Specialty", name: "Meadows Row", setsReps: "3×8–12", progression: "Add weight", notes: "Unique angle with T‑bar" },
            { equipment: "Specialty", name: "Rack Pull", setsReps: "3×5–8", progression: "Add weight", notes: "Heavy partial ROM" },
            { equipment: "Cable", name: "Face Pull", setsReps: "3×15–20", progression: "Increase weight", notes: "External rotation at end" },
            { equipment: "Dumbbell", name: "Bent‑Over Reverse Fly", setsReps: "3×15", progression: "Heavier DB", notes: "Seated or standing" },
            { equipment: "Machine", name: "Reverse Pec Deck", setsReps: "3×15", progression: "Add weight", notes: "Elbows slightly bent" },
            { equipment: "Band", name: "Band Pull‑Apart", setsReps: "3×20", progression: "Thicker band", notes: "Vary grip width" },
            { equipment: "Bodyweight", name: "YTWL (lying on incline)", setsReps: "3×10 each", progression: "Hold longer", notes: "Use light weights" },
            { equipment: "Barbell", name: "Barbell Shrug", setsReps: "3×12–15", progression: "Add 10 lbs", notes: "Behind back" },
            { equipment: "Barbell", name: "Power Shrug (from hang)", setsReps: "3×6–10", progression: "Add weight", notes: "Explosive" },
            { equipment: "Dumbbell", name: "Dumbbell Shrug", setsReps: "3×12–15", progression: "Heavier DB", notes: "Rotating at top" },
            { equipment: "Kettlebell", name: "Kettlebell Shrug", setsReps: "3×15", progression: "Heavier bell", notes: "Two‑handed" },
            { equipment: "Machine", name: "Smith Machine Shrug", setsReps: "3×12", progression: "Add weight", notes: "Controlled" },
            { equipment: "Cable", name: "Cable Shrug", setsReps: "3×15", progression: "Increase weight", notes: "Low pulley" }
        ]
    },
    {
        group: "Shoulders (Deltoids)",
        exercises: [
            { equipment: "Barbell", name: "Overhead Press (strict)", setsReps: "3–5×5", progression: "Add 2.5 lbs", notes: "Seated or standing" },
            { equipment: "Barbell", name: "Push Press", setsReps: "3×6–10", progression: "Add 5 lbs", notes: "Use legs" },
            { equipment: "Dumbbell", name: "Seated Dumbbell Press", setsReps: "3×8–12", progression: "Heavier DB", notes: "Neutral grip" },
            { equipment: "Dumbbell", name: "Arnold Press", setsReps: "3×8–12", progression: "Heavier DB", notes: "Rotational" },
            { equipment: "Machine", name: "Shoulder Press Machine", setsReps: "3×10–15", progression: "Add weight", notes: "Various angles" },
            { equipment: "Cable", name: "Cable Front Raise", setsReps: "3×12–15", progression: "Increase weight", notes: "Single or double" },
            { equipment: "Bodyweight", name: "Pike Push‑up", setsReps: "3×10–15", progression: "Add reps", notes: "Against wall or free" },
            { equipment: "Kettlebell", name: "Kettlebell Press", setsReps: "3×10 each", progression: "Heavier bell", notes: "Single or double" },
            { equipment: "Specialty", name: "Landmine Press", setsReps: "3×10–12", progression: "Add weight", notes: "Single arm, rotational" },
            { equipment: "Dumbbell", name: "Dumbbell Lateral Raise", setsReps: "3×15–20", progression: "Add 2.5 lbs", notes: "Seated, standing, leaning" },
            { equipment: "Cable", name: "Cable Lateral Raise", setsReps: "3×15", progression: "Increase weight", notes: "Low pulley" },
            { equipment: "Machine", name: "Lateral Raise Machine", setsReps: "3×15", progression: "Add weight", notes: "Leaning or upright" },
            { equipment: "Cable", name: "One‑Arm Cable Lateral Raise", setsReps: "3×15 each", progression: "Increase weight", notes: "Handle attached" },
            { equipment: "Bodyweight", name: "Side Lying Raise (no weight)", setsReps: "3×20", progression: "Add reps", notes: "" },
            { equipment: "Band", name: "Banded Lateral Walk", setsReps: "3×20 steps", progression: "Thicker band", notes: "Monster walks" },
            { equipment: "Dumbbell", name: "Bent‑Over Lateral Raise", setsReps: "3×15", progression: "Heavier DB", notes: "Seated or standing" },
            { equipment: "Cable", name: "Cable Face Pull (low pulley)", setsReps: "3×15", progression: "Increase weight", notes: "High pulley for different angle" },
            { equipment: "Machine", name: "Reverse Pec Deck", setsReps: "3×15", progression: "Add weight", notes: "" },
            { equipment: "Band", name: "Band External Rotation", setsReps: "3×15 each", progression: "Thicker band", notes: "Elbow at 90°" }
        ]
    },
    {
        group: "Arms",
        exercises: [
            { equipment: "Barbell", name: "Barbell Curl", setsReps: "3×8–12", progression: "Add 2.5 lbs", notes: "Wide, close grip" },
            { equipment: "Barbell", name: "EZ‑Bar Curl", setsReps: "3×8–12", progression: "Add 2.5 lbs", notes: "Reduces wrist strain" },
            { equipment: "Dumbbell", name: "Dumbbell Curl", setsReps: "3×10–15", progression: "Heavier DB", notes: "Alternating, hammer, cross‑body" },
            { equipment: "Dumbbell", name: "Incline Dumbbell Curl", setsReps: "3×10–12", progression: "Heavier DB", notes: "Stretches biceps" },
            { equipment: "Dumbbell", name: "Concentration Curl", setsReps: "3×12–15", progression: "Heavier DB", notes: "Peak contraction" },
            { equipment: "Machine", name: "Preacher Curl Machine", setsReps: "3×10–15", progression: "Add weight", notes: "Single or dual" },
            { equipment: "Machine", name: "Cable Curl", setsReps: "3×12–15", progression: "Increase weight", notes: "Straight bar, rope, single" },
            { equipment: "Cable", name: "Cable Hammer Curl", setsReps: "3×15", progression: "Increase weight", notes: "Rope attachment" },
            { equipment: "Cable", name: "Cable Curl (low pulley)", setsReps: "3×15", progression: "Increase weight", notes: "Standing" },
            { equipment: "Bodyweight", name: "Chin‑up (underhand)", setsReps: "3×AMRAP", progression: "Add weight", notes: "Biceps focus" },
            { equipment: "Bodyweight", name: "Ring Curl", setsReps: "3×10", progression: "Increase difficulty", notes: "Unstable" },
            { equipment: "Kettlebell", name: "Kettlebell Curl", setsReps: "3×12 each", progression: "Heavier bell", notes: "Hammer style" },
            { equipment: "Barbell", name: "Close‑Grip Bench Press", setsReps: "3×8–12", progression: "Add 5 lbs", notes: "Elbows tucked" },
            { equipment: "Barbell", name: "Skull Crusher (French Press)", setsReps: "3×10–12", progression: "Add 2.5 lbs", notes: "EZ‑bar or straight bar" },
            { equipment: "Dumbbell", name: "Overhead Dumbbell Extension", setsReps: "3×12–15", progression: "Heavier DB", notes: "Single or double" },
            { equipment: "Dumbbell", name: "Triceps Kickback", setsReps: "3×15", progression: "Heavier DB", notes: "Bent over" },
            { equipment: "Dumbbell", name: "Lying Dumbbell Extension", setsReps: "3×12", progression: "Heavier DB", notes: "Cross body" },
            { equipment: "Machine", name: "Triceps Pushdown Machine", setsReps: "3×15", progression: "Add weight", notes: "Seated" },
            { equipment: "Machine", name: "Dip Machine", setsReps: "3×12", progression: "Add weight", notes: "Assisted or weighted" },
            { equipment: "Cable", name: "Cable Pushdown", setsReps: "3×15", progression: "Increase weight", notes: "Rope, V‑bar, straight bar" },
            { equipment: "Cable", name: "Cable Overhead Extension", setsReps: "3×15", progression: "Increase weight", notes: "Using rope" },
            { equipment: "Bodyweight", name: "Dips (triceps focus)", setsReps: "3×10–20", progression: "Add weight", notes: "Upright torso" },
            { equipment: "Bodyweight", name: "Diamond Push‑up", setsReps: "3×15", progression: "Add reps", notes: "Hands together" },
            { equipment: "Kettlebell", name: "Kettlebell Overhead Extension", setsReps: "3×12", progression: "Heavier bell", notes: "Single arm" },
            { equipment: "Barbell", name: "Wrist Curl (palms up)", setsReps: "3×15–20", progression: "Add 2.5 lbs", notes: "Over bench" },
            { equipment: "Barbell", name: "Reverse Wrist Curl (palms down)", setsReps: "3×15–20", progression: "Add 2.5 lbs", notes: "Over bench" },
            { equipment: "Dumbbell", name: "Dumbbell Wrist Curl", setsReps: "3×15", progression: "Heavier DB", notes: "Seated" },
            { equipment: "Dumbbell", name: "Farmer's Walk", setsReps: "3×30–60 sec", progression: "Heavier weights", notes: "Grip endurance" },
            { equipment: "Machine", name: "Plate Pinch", setsReps: "3×max time", progression: "Heavier plates", notes: "Hold two plates together" },
            { equipment: "Cable", name: "Cable Wrist Curl", setsReps: "3×15", progression: "Increase weight", notes: "Using handle" },
            { equipment: "Bodyweight", name: "Dead Hang", setsReps: "3×max time", progression: "Add time", notes: "On pull‑up bar" },
            { equipment: "Bodyweight", name: "Towel Pull‑ups", setsReps: "3×AMRAP", progression: "Add weight", notes: "Extreme grip" },
            { equipment: "Specialty", name: "Captains of Crush Grippers", setsReps: "3×5–10 each hand", progression: "Higher resistance", notes: "Progressive grippers" }
        ]
    },
    {
        group: "Core (Abdominals & Obliques)",
        exercises: [
            { equipment: "Barbell", name: "Barbell Rollout", setsReps: "3×8–12", progression: "Add reps → standing", notes: "On knees or standing" },
            { equipment: "Barbell", name: "Weighted Sit‑up", setsReps: "3×10–15", progression: "Hold plate", notes: "Decline bench" },
            { equipment: "Dumbbell", name: "Dumbbell Side Bend", setsReps: "3×15 each", progression: "Heavier DB", notes: "Obliques" },
            { equipment: "Dumbbell", name: "Russian Twist (with dumbbell)", setsReps: "3×20", progression: "Heavier DB", notes: "Feet elevated" },
            { equipment: "Machine", name: "Cable Crunch", setsReps: "3×15", progression: "Increase weight", notes: "Kneeling" },
            { equipment: "Machine", name: "Ab Machine (seated)", setsReps: "3×15", progression: "Add weight", notes: "Flexion" },
            { equipment: "Cable", name: "Cable Woodchopper", setsReps: "3×12 each", progression: "Increase weight", notes: "Rotational" },
            { equipment: "Cable", name: "Cable Pallof Press", setsReps: "3×10 sec holds", progression: "Increase weight", notes: "Anti‑rotation" },
            { equipment: "Bodyweight", name: "Plank", setsReps: "3×60+ sec", progression: "Add time → weighted vest", notes: "Side plank, extended" },
            { equipment: "Bodyweight", name: "Hanging Leg Raise", setsReps: "3×15", progression: "Add ankle weight", notes: "Knees to elbows" },
            { equipment: "Bodyweight", name: "Bicycle Crunch", setsReps: "3×20 each", progression: "Add reps", notes: "Slow tempo" },
            { equipment: "Bodyweight", name: "L‑Sit", setsReps: "3×max time", progression: "Progress to longer", notes: "On parallettes" },
            { equipment: "Bodyweight", name: "Mountain Climbers", setsReps: "3×30 sec", progression: "Increase speed", notes: "Dynamic" },
            { equipment: "Kettlebell", name: "Kettlebell Windmill", setsReps: "3×8 each", progression: "Heavier bell", notes: "Obliques & shoulders" },
            { equipment: "Kettlebell", name: "Kettlebell Turkish Get‑Up", setsReps: "3×3 each", progression: "Heavier bell", notes: "Full body core" },
            { equipment: "Specialty", name: "Ab Wheel", setsReps: "3×8–12", progression: "Add reps → standing", notes: "Advanced" },
            { equipment: "Specialty", name: "GHD Sit‑up", setsReps: "3×10–15", progression: "Add weight", notes: "Hamstring/abs" },
            { equipment: "Specialty", name: "Dragon Flag", setsReps: "3×5–8", progression: "Progress from tuck", notes: "Advanced" },
            { equipment: "Phase/Gender Notes", name: "Women: avoid heavy weighted side bends if seeking narrow waist; focus on anti‑rotation exercises (Pallof press). Men: hanging leg raises and weighted sit‑ups for strength and aesthetics.", setsReps: "", progression: "", notes: "" }
        ]
    },
    {
        group: "Calves",
        exercises: [
            { equipment: "Barbell", name: "Standing Calf Raise (barbell on back)", setsReps: "4×15–20", progression: "Add 10 lbs", notes: "On block" },
            { equipment: "Barbell", name: "Donkey Calf Raise", setsReps: "4×15–20", progression: "Add weight", notes: "Partner or machine" },
            { equipment: "Dumbbell", name: "Seated Calf Raise (dumbbell on knees)", setsReps: "4×20", progression: "Heavier DB", notes: "One leg at a time" },
            { equipment: "Dumbbell", name: "Single‑Leg Calf Raise (holding DB)", setsReps: "4×15 each", progression: "Heavier DB", notes: "On step" },
            { equipment: "Machine", name: "Standing Calf Raise Machine", setsReps: "4×20", progression: "Add weight", notes: "Vary foot position" },
            { equipment: "Machine", name: "Seated Calf Raise Machine", setsReps: "4×20", progression: "Add weight", notes: "Toes in/out" },
            { equipment: "Bodyweight", name: "Bodyweight Calf Raise", setsReps: "4×25", progression: "Increase reps", notes: "On edge of step" },
            { equipment: "Bodyweight", name: "Jump Rope", setsReps: "3×2 min", progression: "Increase time", notes: "Explosive calves" },
            { equipment: "Specialty", name: "Leg Press Calf Raise", setsReps: "4×20", progression: "Add plates", notes: "On leg press machine" },
            { equipment: "Specialty", name: "Farmer's Walk on Toes", setsReps: "3×30 sec", progression: "Heavier weight", notes: "Core engagement" }
        ]
    },
    {
        group: "Hips & Adductors/Abductors",
        exercises: [
            { equipment: "Machine", name: "Adduction Machine", setsReps: "3×15–20", progression: "Add weight", notes: "Single leg possible" },
            { equipment: "Machine", name: "Abduction Machine", setsReps: "3×15–20", progression: "Add weight", notes: "Lean forward for glute focus" },
            { equipment: "Cable", name: "Cable Hip Adduction", setsReps: "3×15 each", progression: "Increase weight", notes: "Ankle cuff" },
            { equipment: "Cable", name: "Cable Hip Abduction", setsReps: "3×15 each", progression: "Increase weight", notes: "Standing" },
            { equipment: "Bodyweight", name: "Side‑Lying Leg Raise", setsReps: "3×20 each", progression: "Add ankle weight", notes: "Slow tempo" },
            { equipment: "Bodyweight", name: "Clamshell", setsReps: "3×20 each", progression: "Add band", notes: "Band above knees" },
            { equipment: "Bodyweight", name: "Fire Hydrant", setsReps: "3×20 each", progression: "Add ankle weight", notes: "On all fours" },
            { equipment: "Band", name: "Banded Lateral Walk", setsReps: "3×20 steps", progression: "Thicker band", notes: "Monster walk" },
            { equipment: "Band", name: "Banded Glute Bridge (with abductor)", setsReps: "3×15", progression: "Band around knees", notes: "Squeeze out" },
            { equipment: "Kettlebell", name: "Kettlebell Swing", setsReps: "3×20", progression: "Heavier bell", notes: "Hip hinge" },
            { equipment: "Specialty", name: "Copenhagen Plank", setsReps: "3×30 sec each", progression: "Increase time", notes: "Advanced adductor" }
        ]
    },
    {
        group: "Neck",
        exercises: [
            { equipment: "Bodyweight", name: "Neck Isometric (manual)", setsReps: "3×10 sec each direction", progression: "Increase resistance", notes: "Hand provides resistance" },
            { equipment: "Bodyweight", name: "Neck Harness (plate)", setsReps: "3×8–12", progression: "Add 2.5 lbs", notes: "Flexion/extension" },
            { equipment: "Band", name: "Band Neck Flexion", setsReps: "3×15", progression: "Increase band tension", notes: "Attach band to head" },
            { equipment: "Specialty", name: "Wrestler's Bridge", setsReps: "3×8–10", progression: "Progress to full bridge", notes: "Advanced" }
        ]
    },
    {
        group: "Feet & Ankles",
        exercises: [
            { equipment: "Bodyweight", name: "Short Foot", setsReps: "3×10 holds (10 sec)", progression: "Increase hold time", notes: "Seated, standing" },
            { equipment: "Bodyweight", name: "Toe Yoga", setsReps: "3×20 reps", progression: "Increase ROM", notes: "Spread toes" },
            { equipment: "Bodyweight", name: "Towel Curls", setsReps: "3×20", progression: "Increase resistance", notes: "Use heavier towel" },
            { equipment: "Bodyweight", name: "Marble Pickup", setsReps: "3×20", progression: "Smaller objects", notes: "Toe dexterity" },
            { equipment: "Band", name: "Banded Ankle Eversion", setsReps: "3×20", progression: "Thicker band", notes: "Foot against resistance" },
            { equipment: "Band", name: "Banded Ankle Inversion", setsReps: "3×20", progression: "Thicker band", notes: "" },
            { equipment: "Free Weight", name: "Single‑Leg Calf Raise (on step)", setsReps: "4×20", progression: "Add weight", notes: "Also strengthens foot intrinsics" }
        ]
    },
    {
        group: "Hands & Grip",
        exercises: [
            { equipment: "Grippers", name: "Captains of Crush Grippers", setsReps: "3×5–10 each hand", progression: "Higher resistance", notes: "Hold close" },
            { equipment: "Free Weight", name: "Plate Pinch", setsReps: "3×max time", progression: "Heavier plates", notes: "Two or three plates" },
            { equipment: "Free Weight", name: "Farmer's Walk", setsReps: "3×30–60 sec", progression: "Heavier weight", notes: "Thick handles" },
            { equipment: "Band", name: "Finger Extension with Band", setsReps: "3×15", progression: "Thicker band", notes: "Place band around fingers" },
            { equipment: "Band", name: "Finger Adduction (rubber band)", setsReps: "3×20", progression: "Thicker band", notes: "Band around fingers" },
            { equipment: "Bodyweight", name: "Dead Hang", setsReps: "3×max time", progression: "Add weight", notes: "Towel hang" },
            { equipment: "Bodyweight", name: "Rope Climb", setsReps: "3×ascents", progression: "Increase difficulty", notes: "Legless" },
            { equipment: "Specialty", name: "Wrist Roller", setsReps: "3×roll up/down", progression: "Add weight", notes: "Old‑school device" }
        ]
    }
];

// Build ultimateExerciseLibrary from compendium for exercise generation compatibility
const ultimateExerciseLibrary = {};
exerciseCompendium.forEach(group => {
    group.exercises.forEach(ex => {
        if (ex.name && ex.equipment && ex.equipment !== "Phase/Gender Notes") {
            const id = ex.name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
            let muscleId = group.group.toLowerCase().replace(/[^a-z]+/g, '_');
            if (muscleId === 'back_lats_rhomboids_traps_rear_delts') muscleId = 'back';
            if (muscleId === 'shoulders_deltoids') muscleId = 'shoulders';
            if (muscleId === 'arms') muscleId = 'biceps';
            if (muscleId === 'core_abdominals_&_obliques') muscleId = 'core';
            if (muscleId === 'hips_&_adductors_abductors') muscleId = 'adductors';
            ultimateExerciseLibrary[id] = {
                name: ex.name,
                muscles: [muscleId],
                equipment: ex.equipment,
                defaultSets: parseInt(ex.setsReps) || 3,
                defaultReps: ex.setsReps.replace(/^\d+–?\d*×/, '') || '8-12',
                progression: ex.progression,
                instructions: [ex.notes]
            };
        }
    });
});

// ---------- WORKOUT PROGRAM SPLITS ----------
const workoutProgram = {
    splits: [
        { id: "full_body_a", name: "Full Body A (Strength)", focus: ["quads","chest","back","shoulders"], restAfter: 2 },
        { id: "full_body_b", name: "Full Body B (Hypertrophy)", focus: ["hamstrings","back","biceps","glutes"], restAfter: 2 },
        { id: "longevity_day", name: "Longevity & Joint Health", focus: ["neck","forearms","feet_ankles","core"], restAfter: 1 },
        { id: "push_day", name: "Push Day", focus: ["chest","shoulders","triceps"], restAfter: 3 },
        { id: "pull_day", name: "Pull Day", focus: ["back","biceps","forearms"], restAfter: 3 },
        { id: "legs_day", name: "Legs Day", focus: ["quads","hamstrings","glutes","calves"], restAfter: 3 }
    ],
    exercises: {}
};

// ---------- ACHIEVEMENTS ----------
const achievements = [
    { id: 'first_step', name: 'First Step', desc: 'Complete 1 workout', icon: 'fa-baby', check: (d) => d.workouts.length >= 1 },
    { id: 'consistent', name: 'Consistent', desc: '7 day streak', icon: 'fa-fire', check: (d) => calculateStreak() >= 7 },
    { id: 'powerlifter', name: 'Powerlifter', desc: 'Log Bench, Squat, and Deadlift', icon: 'fa-dumbbell', check: (d) => d.exercises['bench_press']?.bestWeight && d.exercises['barbell_squat']?.bestWeight && d.exercises['deadlift']?.bestWeight },
    { id: 'iron_neck', name: 'Iron Neck', desc: 'Log neck training 5 times', icon: 'fa-user-shield', check: (d) => d.workouts.filter(w => w.exercises?.some(e => e.name === 'Neck Isometric')).length >= 5 },
    { id: 'century', name: 'Century Club', desc: '100 total workouts', icon: 'fa-trophy', check: (d) => d.workouts.length >= 100 },
    { id: 'longevity_master', name: 'Longevity Master', desc: 'Longevity score ≥80', icon: 'fa-heart', check: (d) => calculateLongevityScore().score >= 80 }
];

// ---------- FEATURE STATUS DATA ----------
const featureStatusData = [
    { area: "Core App Structure", feature: "Navigation Bar", description: "Fixed top bar with brand, menu items, user avatar, and mobile toggle.", status: "Implemented", notes: "Fully functional" },
    { area: "Core App Structure", feature: "Import Screen", description: "Three options: Import JSON, Start Fresh, Load Sample.", status: "Implemented", notes: "Functions exist; sample data partial" },
    { area: "Core App Structure", feature: "Main App Sections", description: "Dashboard, Workout, History, Progress, Recovery, Settings.", status: "Implemented", notes: "Placeholders need original content" },
    { area: "20 New Sections", feature: "Exercise Library, Personal Records, Body Measurements, etc.", description: "Section divs added with basic structure.", status: "Partial", notes: "Load functions mostly placeholders" },
    { area: "Data Structures", feature: "workoutData", description: "Core user data, workouts, exercises, history, menstrual tracking.", status: "Implemented", notes: "Fully defined" },
    { area: "Data Structures", feature: "muscleDatabase", description: "40+ muscle groups with rest days, aging risk.", status: "Implemented", notes: "Complete" },
    { area: "Data Structures", feature: "workoutProgram", description: "Split definitions (full body, push/pull, longevity).", status: "Implemented", notes: "Complete" },
    { area: "Data Structures", feature: "exerciseCompendium", description: "Hundreds of exercises with equipment, progression, notes.", status: "Implemented", notes: "Fully populated from tables" },
    { area: "Exercise & Workout Features", feature: "Exercise Generation", description: "Random selection from library based on muscle focus.", status: "Implemented", notes: "Uses compendium data" },
    { area: "Exercise & Workout Features", feature: "Workout Generation", description: "Cycles through splits, applies phase multiplier.", status: "Implemented", notes: "Works" },
    { area: "Exercise & Workout Features", feature: "Exercise Search Modal", description: "🔍 icon opens Wikipedia summary + Google fallback.", status: "Implemented", notes: "Uses Wikipedia API" },
    { area: "Exercise & Workout Features", feature: "Performance Logging", description: "Forms to log weight, reps, RPE, notes.", status: "Implemented", notes: "Fully functional" },
    { area: "Tracking & Analytics", feature: "Muscle Recovery", description: "Calculates last trained date, recovery percentage.", status: "Implemented", notes: "Works" },
    { area: "Tracking & Analytics", feature: "Recovery Insights", description: "Shows ready muscles and fatigue level.", status: "Partial", notes: "Basic implementation" },
    { area: "Tracking & Analytics", feature: "Personal Records", description: "Displays best lifts.", status: "Implemented", notes: "Works" },
    { area: "Tracking & Analytics", feature: "Progress Charts", description: "Volume, strength, frequency, RPE charts.", status: "Implemented", notes: "Needs sample data" },
    { area: "Tracking & Analytics", feature: "Workout Calendar", description: "GitHub-style activity grid.", status: "Partial", notes: "Uses real workout dates" },
    { area: "Tracking & Analytics", feature: "Exercise Comparison", description: "Compare two exercises (needs 5+ sessions).", status: "Partial", notes: "Chart not yet implemented" },
    { area: "Tracking & Analytics", feature: "Training Load", description: "Acute:chronic workload ratio.", status: "Partial", notes: "Placeholder" },
    { area: "Health & Wellness", feature: "Menstrual Cycle Tracking", description: "Phase detection and workout intensity multiplier.", status: "Implemented", notes: "Complete" },
    { area: "Health & Wellness", feature: "Period Modal", description: "Log last period date, cycle length, symptoms.", status: "Implemented", notes: "Form exists" },
    { area: "Health & Wellness", feature: "Injury / Pain Logger", description: "Log injuries and get warnings.", status: "Partial", notes: "Storage exists, warnings basic" },
    { area: "Health & Wellness", feature: "Sleep Tracker", description: "Log sleep hours and quality.", status: "Partial", notes: "Storage exists, UI basic" },
    { area: "Health & Wellness", feature: "Body Measurements", description: "Track weight, body fat, etc.", status: "Missing", notes: "Placeholder only" },
    { area: "Longevity Features", feature: "Longevity Score", description: "Composite score from grip, balance, mobility, etc.", status: "Implemented", notes: "Uses muscle data" },
    { area: "Longevity Features", feature: "Longevity Report Modal", description: "Displays score breakdown, aging risks.", status: "Implemented", notes: "Complete" },
    { area: "Longevity Features", feature: "Longevity Workout", description: "Generates workout focused on joint health.", status: "Implemented", notes: "Works" },
    { area: "Goals & Motivation", feature: "Goal Setting", description: "Create and track strength/consistency goals.", status: "Partial", notes: "Basic storage" },
    { area: "Goals & Motivation", feature: "Achievements / Badges", description: "Unlock badges for milestones.", status: "Implemented", notes: "Basic set" },
    { area: "Goals & Motivation", feature: "Social Sharing", description: "Share workout summaries; export JSON.", status: "Partial", notes: "Export works, share placeholder" },
    { area: "Goals & Motivation", feature: "Event / Yearly Goals", description: "2030 projection with focus areas.", status: "Partial", notes: "Static text" },
    { area: "Data Management", feature: "Export / Import", description: "JSON export/import for all data.", status: "Implemented", notes: "Functions exist" },
    { area: "Data Management", feature: "Local Storage", description: "Auto-save to localStorage.", status: "Implemented", notes: "Works" },
    { area: "UI/UX", feature: "Theme System", description: "Blue, green, purple, orange, dark mode with CSS variables.", status: "Implemented", notes: "Complete" },
    { area: "UI/UX", feature: "Responsive Design", description: "Mobile-friendly layouts for all sections.", status: "Implemented", notes: "CSS includes media queries" },
    { area: "UI/UX", feature: "Notifications", description: "Toast-style messages.", status: "Implemented", notes: "Works" },
    { area: "UI/UX", feature: "Loading Overlay", description: "Spinner for async operations.", status: "Implemented", notes: "Works" },
    { area: "New Sections", feature: "Exercise Compendium", description: "Massive table of all exercises by muscle group.", status: "Implemented", notes: "Dynamic from data" },
    { area: "New Sections", feature: "Feature Status", description: "Table showing implementation status of all features.", status: "Implemented", notes: "Dynamic from data" }
];

// ---------- GLOBAL VARIABLES ----------
let currentWorkout = null;
let muscleLastTrained = {};
let charts = {};
let dataChanged = false;          // track any data change for backup reminder
let currentExerciseIndex = 0;     // for logging drawer
let notificationTimeout;
let exerciseInfoCache = {}; // stores { summary, extract, thumbnail } per exercise name
// --- Unsaved changes tracking ---
let workoutDirty = false;
let dirtyExercises = new Set();
// --- Modal Deck variables for vertical paging ---
let modalDeckSlider = null;          // reference to the .deck-slider element
let modalCards = [];                 // array of cards inside the slider
let modalCurrentCardIndex = 0;       // currently visible card index
let isAnimating = false;             // prevents rapid successive swipes
let modalObserver = null;   

// ---------- UTILITY FUNCTIONS ----------
function getAllMuscleGroups() {
    return [
        ...muscleDatabase.major,
        ...muscleDatabase.longevity,
        ...muscleDatabase.hands,
        ...muscleDatabase.feet
    ];
}

function initializeMuscleTracking() {
    getAllMuscleGroups().forEach(muscle => {
        if (!muscleLastTrained[muscle.name]) {
            muscleLastTrained[muscle.name] = null;
        }
    });
}

function saveToLocalStorage() {
    workoutData.lastExport = new Date().toISOString();
    localStorage.setItem('workoutContinuityData', JSON.stringify(workoutData));
    updateBackupReminder();
}

function updateBackupReminder() {
    const settingsIcon = document.getElementById('nav-settings');
    if (dataChanged) {
        settingsIcon.classList.add('critical');
    } else {
        settingsIcon.classList.remove('critical');
    }
}
window.addEventListener('beforeunload', (e) => {
    if (workoutDirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
    }
});

function showNotification(message, type = "success") {
    const notification = document.getElementById('notification');
    const text = document.getElementById('notificationText');
    text.textContent = message;
    const colors = { success: '#10b981', warning: '#f59e0b', error: '#ef4444', info: '#06b6d4' };
    const icons = { success: 'fa-check-circle', warning: 'fa-exclamation-triangle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
    notification.style.borderLeftColor = colors[type] || colors.success;
    notification.querySelector('i').className = `fas ${icons[type] || icons.success}`;
    
    if (notificationTimeout) clearTimeout(notificationTimeout);
    
    notification.classList.add('show');
    notificationTimeout = setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
}

function closeNotification() {
    const notification = document.getElementById('notification');
    notification.classList.remove('show');
    if (notificationTimeout) {
        clearTimeout(notificationTimeout);
        notificationTimeout = null;
    }
}

// ---------- DRAFT FUNCTIONS ----------
function saveDraft() {
    if (!currentWorkout) return;
    const draft = {
        workout: currentWorkout,
        dirtyIndices: Array.from(dirtyExercises),
        timestamp: Date.now()
    };
    sessionStorage.setItem('workoutDraft', JSON.stringify(draft));
}

function clearDraft() {
    sessionStorage.removeItem('workoutDraft');
}

function restoreDraft() {
    const draftJson = sessionStorage.getItem('workoutDraft');
    if (!draftJson) return false;
    try {
        const draft = JSON.parse(draftJson);
        currentWorkout = draft.workout;
        dirtyExercises = new Set(draft.dirtyIndices);
        workoutDirty = dirtyExercises.size > 0;
        updateNavigation();
        return true;
    } catch (e) {
        console.error('Failed to restore draft', e);
        return false;
    }
}

// ---------- CUSTOM UNSAVED MODAL ----------
function showUnsavedModal(onConfirm, onCancel) {
    const modal = document.getElementById('unsavedModal');
    if (!modal) {
        const modalHtml = `
            <div class="modal" id="unsavedModal">
                <div class="modal-content">
                    <h3>Unsaved Changes</h3>
                    <p>You have unsaved changes in your workout. Leave anyway?</p>
                    <div class="btn-group">
                        <button class="btn btn-danger" id="unsavedConfirm">Yes, leave</button>
                        <button class="btn btn-outline" id="unsavedCancel">No, stay</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }
    const modalEl = document.getElementById('unsavedModal');
    const confirmBtn = document.getElementById('unsavedConfirm');
    const cancelBtn = document.getElementById('unsavedCancel');
    
    const closeHandler = () => {
        modalEl.classList.remove('active');
        confirmBtn.removeEventListener('click', confirmHandler);
        cancelBtn.removeEventListener('click', cancelHandler);
    };
    
    const confirmHandler = () => {
        closeHandler();
        if (onConfirm) onConfirm();
    };
    
    const cancelHandler = () => {
        closeHandler();
        if (onCancel) onCancel();
    };
    
    confirmBtn.addEventListener('click', confirmHandler);
    cancelBtn.addEventListener('click', cancelHandler);
    modalEl.classList.add('active');
}

function updateModalCardPosition() {
    if (!modalDeckSlider) return;
    // Move the slider up/down based on the index (negative Y offset)
    const offset = modalCurrentCardIndex * 100;
    modalDeckSlider.style.transform = `translateY(-${offset}%)`;
}
function navigateModalDeck(direction) {
    if (isAnimating) return;
    const newIndex = modalCurrentCardIndex + direction;
    if (newIndex >= 0 && newIndex < modalCards.length) {
        isAnimating = true;
        modalCurrentCardIndex = newIndex;
        updateModalCardPosition();
        setTimeout(() => { isAnimating = false; }, 500); // match CSS transition
    }
}

function setupModalSwipeListener() {
    const deck = document.getElementById('exercise-deck-modal');
    if (!deck) return;

    let startY = 0;

    // Touch start
    deck.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
    }, { passive: true });

    // Touch end – detect swipe up/down
    deck.addEventListener('touchend', (e) => {
        const endY = e.changedTouches[0].clientY;
        const diff = startY - endY; // positive = up (next), negative = down (prev)
        if (Math.abs(diff) > 50) {  // 50px threshold
            navigateModalDeck(diff > 0 ? 1 : -1);
        }
    }, { passive: true });

    // Mouse wheel (desktop)
    deck.addEventListener('wheel', (e) => {
        e.preventDefault(); // stop page scroll
        if (Math.abs(e.deltaY) > 10) {
            navigateModalDeck(e.deltaY > 0 ? 1 : -1);
        }
    }, { passive: false });
}

function showLoading(show) {
    document.getElementById('loading').classList.toggle('active', show);
}

function showModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toLocaleString() || '0';
}

function getMuscleDisplayName(muscleId) {
    const all = getAllMuscleGroups();
    const muscle = all.find(m => m.name === muscleId);
    return muscle ? muscle.display : muscleId;
}

function daysSinceTrained(muscle) {
    if (!muscleLastTrained[muscle]) return Infinity;
    return Math.floor((new Date() - new Date(muscleLastTrained[muscle])) / (1000*60*60*24));
}

// ---------- CYCLE PHASE FUNCTIONS ----------
function getCurrentCyclePhase() {
    if (workoutData.user.gender !== "female" || !workoutData.user.menstrual.lastPeriodStart) return null;
    const last = new Date(workoutData.user.menstrual.lastPeriodStart);
    const today = new Date();
    const daysSince = Math.floor((today - last) / (1000*60*60*24));
    const cycleDay = (daysSince % workoutData.user.menstrual.cycleLength) + 1;
    if (cycleDay <= 5) return "menstrual";
    if (cycleDay <= 13) return "follicular";
    if (cycleDay <= 17) return "ovulatory";
    return "luteal";
}

function getPhaseMultiplier(phase) {
    if (!phase) return 1.0;
    switch(phase) {
        case "menstrual": return 0.6;
        case "follicular": return 1.0;
        case "ovulatory": return 1.05;
        case "luteal": return 0.8;
        default: return 1.0;
    }
}

// ---------- NEW: SYSTEMIC FATIGUE FACTOR ----------
function getSystemicFatigueMultiplier() {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    const recentWorkouts = workoutData.workouts.filter(w => new Date(w.date) > cutoff).length;
    let fatigue = 1.0 + 0.05 * Math.pow(recentWorkouts, 1.5);
    return Math.min(fatigue, 2.0);
}

function getEffectiveRestDays(muscle) {
    const base = muscle.restDays || 2;
    const fatigueMult = getSystemicFatigueMultiplier();
    return Math.round(base * fatigueMult);
}

function getRecoveryStatus(muscle) {
    const last = muscleLastTrained[muscle.name];
    if (!last) return { pct: 0, status: 'Not trained', statusClass: 'status-not-ready', daysText: 'Never' };
    const days = Math.floor((new Date() - new Date(last)) / (1000*60*60*24));
    const needed = getEffectiveRestDays(muscle);
    const pct = Math.min(100, (days / needed) * 100);
    let status, statusClass;
    if (days >= needed) {
        status = 'Ready';
        statusClass = 'status-ready';
    } else if (days >= needed - 1) {
        status = 'Soon';
        statusClass = 'status-close';
    } else {
        status = 'Resting';
        statusClass = 'status-not-ready';
    }
    const daysText = `${days} day${days !== 1 ? 's' : ''} ago`;
    return { pct, status, statusClass, daysText };
}

// ---------- NEW: TENDON GUARD (Rolling RPE Average) ----------
function getRollingRPEAverage() {
    const recentWorkouts = workoutData.workouts.slice(-15);
    if (recentWorkouts.length === 0) return null;
    let totalRPE = 0;
    let count = 0;
    recentWorkouts.forEach(w => {
        if (w.summary?.averageRPE) {
            totalRPE += parseFloat(w.summary.averageRPE);
            count++;
        }
    });
    return count > 0 ? totalRPE / count : null;
}

function getInjuryRiskFactor() {
    const avgRPE = getRollingRPEAverage();
    if (avgRPE === null) return "Analyzing...";
    if (avgRPE > 8.5) return "Deload Recommended (High Tendon Strain)";
    if (avgRPE < 5) return "Intensity Low (Increase Effort)";
    return "Optimal Training Zone";
}

// ---------- EXERCISE GENERATION ----------
function generateExerciseFromLibrary(muscleGroup) {
    if (!ultimateExerciseLibrary) return null;
    const candidates = Object.values(ultimateExerciseLibrary).filter(ex => 
        ex.muscles && ex.muscles.includes(muscleGroup)
    );
    if (candidates.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * candidates.length);
    const base = candidates[randomIndex];
    return {
        id: base.name.toLowerCase().replace(/\s/g, '_'),
        name: base.name,
        muscleGroup: base.muscles,
        prescribed: { sets: base.defaultSets, reps: base.defaultReps, weight: null },
        actual: null,
        progressionNotes: base.progression,
        equipment: base.equipment,
        instructions: base.instructions
    };
}

function generateExercisePrescription(exercise, phaseMultiplier = 1.0) {
    const history = workoutData.exercises[exercise.id];
    let prescribedWeight = null;
    let notes = "";
    
    const avgRPE = getRollingRPEAverage();
    const deloadMultiplier = (avgRPE !== null && avgRPE > 8.5) ? 0.8 : 1.0;
    
    if (history && history.bestWeight) {
        const last = history.bestWeight;
        // Safely access progressionRate
        const prog = workoutData.user.settings?.progressionRate ?? 0.02;
        prescribedWeight = Math.round(last * (1 + prog) * phaseMultiplier * deloadMultiplier);
        notes = `Based on last session: ${last} lbs, adjusted for phase.`;
        if (deloadMultiplier < 1) notes += " Deload active (high RPE trend).";
    } else {
        const baseWeight = workoutData.user.weight || 150;
        let multiplier = 0.3;
        if (exercise.name.toLowerCase().includes("squat") || exercise.name.toLowerCase().includes("deadlift")) multiplier = 0.8;
        else if (exercise.name.toLowerCase().includes("bench")) multiplier = 0.6;
        else if (exercise.name.toLowerCase().includes("curl")) multiplier = 0.2;
        else if (exercise.name.toLowerCase().includes("press")) multiplier = 0.4;
        prescribedWeight = Math.round(baseWeight * multiplier / 5) * 5;
        prescribedWeight = Math.round(prescribedWeight * phaseMultiplier * deloadMultiplier);
        notes = `First time! Try ${prescribedWeight} lbs as starting weight.`;
        if (deloadMultiplier < 1) notes += " Deload active (high RPE trend).";
    }
    exercise.prescribed.weight = prescribedWeight;
    exercise.progressionNotes = notes;
    return exercise;
}

// ---------- WORKOUT GENERATION ----------
/**
 * 
 * Combines:
 * - Sigmoid recovery with local & global physiological factors (CNS, sleep, hormones, gender, age, experience)
 * - Frequency, tendon health, aging risk, novelty, injury penalty
 * - Squared coverage urgency (neglect protection)
 * - Weighted probability selection (softmax draw) for accessory muscles
 * - Exercise variety engine (least used per muscle)
 * - Backup security check & readiness display
 * - Full UI sync and persistent storage
 */
async function generateNextWorkout() {
  // --- DIRTY CHECK ---
  if (workoutDirty) {
    const confirmDiscard = confirm("You have unsaved logs in this workout. Discard them and generate a new session?");
    if (!confirmDiscard) return;
  }

  console.log("🧠 System: Initiating Advanced Physiological Scan...");
  showLoading(true);

  try {
    // Reset dirty flags
    workoutDirty = false;
    dirtyExercises.clear();
    clearDraft();

    // --- SECURITY / BACKUP CHECK ---
    const lastExport = new Date(workoutData.lastExport).getTime() || 0;
    const backupRequired = (Date.now() - lastExport > 7 * 24 * 60 * 60 * 1000); // 7 days

    // --- SPLIT ROTATION ---
    const splits = workoutProgram.splits;
    const lastWorkout = workoutData.workouts[workoutData.workouts.length - 1];
    let split = lastWorkout
      ? splits[(splits.findIndex(s => s.id === lastWorkout.type) + 1) % splits.length]
      : splits[0];

    // --- GLOBAL PHYSIOLOGICAL MULTIPLIERS ---
    const now = new Date();

    // CNS Fatigue (sigmoid)
    const last3 = workoutData.workouts.slice(-3);
    const avgRPE = last3.length
      ? last3.reduce((sum, w) => sum + (parseFloat(w.summary?.averageRPE) || 7), 0) / last3.length
      : 7;
    const cnsFatigue = 1 / (1 + Math.exp(1.5 * (avgRPE - 8.5)));

    // Sleep factor (last 7 days)
    const sleepLogs = workoutData.user.sleepLogs?.slice(-7) || [];
    const avgSleep = sleepLogs.length
      ? sleepLogs.reduce((sum, s) => sum + parseFloat(s.value), 0) / sleepLogs.length
      : 8;
    const sleepFactor = Math.min(1, Math.max(0.7, avgSleep / 8));

    // Hormonal phase factor
    const phase = getCurrentCyclePhase();
    const hormonalFactor = getPhaseMultiplier(phase);

    // Gender factor
    let genderFactor = 1.0;
    if (workoutData.user.gender === 'female') genderFactor = 1.02;
    else if (workoutData.user.gender === 'male') genderFactor = 0.98;

    // Age factor
    let ageFactor = 1.0;
    if (workoutData.user.birthDate) {
      const birthYear = new Date(workoutData.user.birthDate).getFullYear();
      const currentYear = now.getFullYear();
      const age = currentYear - birthYear;
      if (age > 20) ageFactor = Math.max(0.7, 1 - 0.005 * (age - 20));
    }

    // Experience factor
    const exp = workoutData.user.experience || 'intermediate';
    let experienceFactor = 1.0;
    if (exp === 'beginner') experienceFactor = 1.1;
    else if (exp === 'advanced') experienceFactor = 0.9;

    // Combine into a single global readiness scaler
    const globalRecovery = Math.max(0.3, Math.min(1.1,
      cnsFatigue * sleepFactor * hormonalFactor * genderFactor * ageFactor * experienceFactor
    ));

    // --- BUILD MUSCLE POOL PER SPLIT ---
    let allowedCategories = [];
    switch (split.id) {
      case 'full_body_a':
      case 'full_body_b':
        allowedCategories = ['major', 'longevity', 'hands', 'feet'];
        break;
      case 'push_day':
      case 'pull_day':
        allowedCategories = ['major', 'longevity'];
        break;
      case 'legs_day':
        allowedCategories = ['major', 'feet', 'longevity'];
        break;
      case 'longevity_day':
        allowedCategories = ['longevity', 'hands', 'feet'];
        break;
      default:
        allowedCategories = ['major', 'longevity'];
    }

    let pool = [];
    allowedCategories.forEach(cat => {
      if (cat === 'major') pool.push(...muscleDatabase.major);
      if (cat === 'longevity') pool.push(...muscleDatabase.longevity);
      if (cat === 'hands') pool.push(...muscleDatabase.hands);
      if (cat === 'feet') pool.push(...muscleDatabase.feet);
    });

    // Remove muscles that are already in the split's focus, and enforce calves rule
    pool = pool.filter(m => {
      if (split.id !== 'legs_day' && m.name === 'calves') return false;
      return !split.focus.includes(m.name);
    });

    // Fallback if pool becomes empty
    if (pool.length === 0) {
      pool = muscleDatabase.major.filter(m => m.name === 'core' || m.name === 'forearms');
    }

    // --- SCORE EACH MUSCLE ---
    const scores = pool.map(m => {
      const lastTrained = muscleLastTrained[m.name];
      const daysSince = lastTrained ? (now - new Date(lastTrained)) / (1000 * 60 * 60 * 24) : Infinity;
      const effectiveRest = getEffectiveRestDays ? getEffectiveRestDays(m) : (m.restDays || 2);

      const readinessRatio = daysSince / effectiveRest;
      const k = 3;
      const localRecovery = 1 / (1 + Math.exp(-k * (readinessRatio - 1)));

      let adjustedRecovery = localRecovery * globalRecovery;

      const freq = getTrainingFrequency(m.name);
      const freqFactor = Math.exp(-freq / 3);

      let riskFactor = 1.0;
      if (m.agingRisk === 'high' && m.category === 'longevity') {
        riskFactor = Math.min(2, 1 + (daysSince / 14));
      }

      let tendonFactor = 1.0;
      if (['quads', 'hamstrings', 'chest', 'biceps', 'triceps', 'calves'].includes(m.name)) {
        tendonFactor = 0.95;
      }

      const userGoal = workoutData.user.goal || 'balanced';
      let goalFactor = 1.0;
      if (userGoal === 'strength' || userGoal === 'powerlifting') {
        if (m.category === 'major') goalFactor = 1.2;
        if (['quads','hamstrings','glutes','chest','back','shoulders','triceps'].includes(m.name)) {
          goalFactor *= 1.1;
        }
      } else if (userGoal === 'longevity') {
        if (m.category === 'longevity') goalFactor = 1.5;
      } else if (userGoal === 'hypertrophy') {
        if (m.category === 'major') goalFactor = 1.3;
      }

      const injuryFactor = hasRecentInjury(m.name) ? 0.2 : 1.0;

      const noveltyBoost = !lastTrained ? 0.5 : 0.0;

      const targetRest = effectiveRest * 1.5;
      let coverageUrgency = 1.0;
      if (lastTrained) {
        coverageUrgency = Math.min(3, Math.pow(daysSince / targetRest, 2));
      } else {
        coverageUrgency = 3;
      }

      const jitter = (Math.random() * 0.2) - 0.1;

      let score = adjustedRecovery * freqFactor * riskFactor * goalFactor *
                  injuryFactor * tendonFactor * coverageUrgency +
                  noveltyBoost + jitter;

      return { muscle: m, score: Math.max(0, score) };
    });

    scores.sort((a, b) => b.score - a.score);

    // --- WEIGHTED PROBABILITY SELECTION ---
    const accessoryCount = Math.floor(Math.random() * 2) + 2;
    const selectedAccessories = [];

    const candidates = scores.slice(0, 10);
    const candidateIndices = Array.from({ length: candidates.length }, (_, i) => i);

    for (let i = 0; i < accessoryCount && candidateIndices.length > 0; i++) {
      const total = candidateIndices.reduce((sum, idx) => sum + candidates[idx].score, 0);
      let rand = Math.random() * total;
      const chosenIdx = candidateIndices.find(idx => {
        rand -= candidates[idx].score;
        return rand <= 0;
      });
      if (chosenIdx === undefined) break;

      selectedAccessories.push(candidates[chosenIdx].muscle.name);
      candidateIndices.splice(candidateIndices.indexOf(chosenIdx), 1);
    }

    // --- BUILD WORKOUT OBJECT ---
    const phaseMultiplier = getPhaseMultiplier(phase);

    currentWorkout = {
      id: `workout_${Date.now()}`,
      date: now.toISOString(),
      type: split.id,
      name: split.name,
      readiness: Math.round(globalRecovery * 100),
      exercises: [],
      security: { backupRecommended: backupRequired }
    };

    const allMuscles = [...new Set([...split.focus, ...selectedAccessories])];

    allMuscles.forEach(muscleName => {
      const exerciseBase = generateExerciseFromLibrary(muscleName);
      if (exerciseBase) {
        const exercise = generateExercisePrescription(exerciseBase, phaseMultiplier);
        currentWorkout.exercises.push(exercise);
      }
    });
      
    if (document.getElementById('workoutModal')?.classList.contains('active')) {
      renderExerciseDeckInModal();
    }
      
    // --- UI SYNC & NOTIFICATIONS ---
    updateDashboard();

    // Update modal header if modal is open
    updateModalWorkoutHeader();

    if (document.getElementById('workout-section').classList.contains('active')) {
      renderExerciseDeck();
    }

    if (backupRequired) {
      showNotification("🔐 Security: Backup recommended before training.", "warning");
      document.getElementById('nav-settings')?.classList.add('critical');
    } else {
      showNotification(`✅ Generated: ${currentWorkout.name} (${currentWorkout.readiness}% Readiness)`, "success");
    }

    saveToLocalStorage();
  } catch (error) {
    console.error("Error generating workout:", error);
    showNotification("❌ Failed to generate workout. Check console.", "error");
  } finally {
    showLoading(false);
  }
}
// ====================== //
// Required helpers (assumed to exist globally, but shown for completeness)
// ====================== //

/**
 * Counts how many times a muscle was actually trained in the last 30 days.
 */
function getTrainingFrequency(muscleName) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  let count = 0;
  workoutData.workouts.forEach(w => {
    if (new Date(w.date) > cutoff) {
      w.exercises?.forEach(ex => {
        if (ex.actual && !ex.skipped && ex.muscleGroup.includes(muscleName)) count++;
      });
    }
  });
  return count;
}

/**
 * Checks if there's a recent injury note mentioning this muscle (last 14 days).
 */
function hasRecentInjury(muscleName) {
  return workoutData.injuries?.some(inj =>
    inj.note?.toLowerCase().includes(muscleName) &&
    (new Date() - new Date(inj.date)) < 14 * 24 * 60 * 60 * 1000
  ) || false;
}

// ---------- DASHBOARD UPDATE ----------
function calculateStreak() {
    if (workoutData.workouts.length === 0) return 0;
    const sorted = [...workoutData.workouts].sort((a,b) => new Date(b.date) - new Date(a.date));
    let streak = 0;
    const today = new Date();
    let expectedDate = new Date(today);
    const hasToday = sorted.some(w => new Date(w.date).toDateString() === today.toDateString());
    if (hasToday) {
        streak = 1;
        expectedDate.setDate(expectedDate.getDate() - 1);
    }
    for (let i = hasToday ? 1 : 0; i < sorted.length; i++) {
        const workoutDate = new Date(sorted[i].date);
        if (workoutDate.toDateString() === expectedDate.toDateString()) {
            streak++;
            expectedDate.setDate(expectedDate.getDate() - 1);
        } else break;
    }
    return streak;
}

function calculateTotalVolume() {
    return workoutData.workouts.reduce((sum, w) => sum + (w.summary?.totalVolume || 0), 0);
}

function calculateVolumeDays(days) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return workoutData.workouts
        .filter(w => new Date(w.date) > cutoff)
        .reduce((sum, w) => sum + (w.summary?.totalVolume || 0), 0);
}

function updateDashboard() {
    document.getElementById('statWorkouts').innerText = workoutData.workouts.length;
    const streak = calculateStreak();
    document.getElementById('statStreak').innerText = streak;
    document.getElementById('statVolume').innerText = formatNumber(calculateTotalVolume());
    const progress = Math.min(100, Math.floor((workoutData.workouts.length / 20) * 100));
    document.getElementById('statProgress').innerText = progress + '%';

    const last7 = calculateVolumeDays(7);
    const last28 = calculateVolumeDays(28) / 4;
    const acwr = last28 > 0 ? (last7 / last28).toFixed(1) : "1.0";
    document.getElementById('dash-acwr').innerText = acwr;

    const longevityScore = calculateLongevityScore().score;
    document.getElementById('longevityScore').innerText = longevityScore;
    
    const vitalityFill = document.querySelector('.longevity-vitality-card .progress-fill');
    if (vitalityFill) {
        const width = Math.min(longevityScore, 100); // cap at 100%
        vitalityFill.style.width = width + '%';
    }

    document.getElementById('risk-val').innerText = getInjuryRiskFactor();
    
    const riskDot = document.querySelector('.injury-risk-dot');
    const avgRPE = getRollingRPEAverage();
    if (riskDot) {
        if (avgRPE > 8.5) riskDot.style.background = 'var(--danger)';
        else if (avgRPE > 7) riskDot.style.background = 'var(--warning)';
        else riskDot.style.background = 'var(--success)';
    }

    renderActivityCalendar();
    renderDashPRs();
    updateProjection();
    renderBadges();
    updateNavigation();
    updateDashboardChart();

    if (currentWorkout) {
        document.getElementById('dashboardWorkoutInfo').innerHTML = `
            <div class="workout-meta">
                <div class="meta-item"><span class="meta-label">Workout:</span><span class="meta-value">${currentWorkout.name}</span></div>
                <div class="meta-item"><span class="meta-label">Exercises:</span><span class="meta-value">${currentWorkout.exercises.length}</span></div>
            </div>
        `;
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + (workoutProgram.splits.find(s => s.id === currentWorkout.type)?.restAfter || 2));
        document.getElementById('dashboardNextWorkout').innerText = nextDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    } else {
        document.getElementById('dashboardWorkoutInfo').innerHTML = '<p>No workout scheduled. Generate one below.</p>';
        document.getElementById('dashboardNextWorkout').innerText = 'No workout';
    }
    updateLongevityScoreDisplay();
}
function renderActivityCalendar() {
    const cal = document.getElementById('activity-calendar');
    if (!cal) return; // Guard against missing element
    cal.innerHTML = '';
    for (let i = 0; i < 90; i++) {
        const day = new Date();
        day.setDate(day.getDate() - (89 - i));
        const hasWorkout = workoutData.workouts.some(w => new Date(w.date).toDateString() === day.toDateString());
        const div = document.createElement('div');
        div.className = 'cal-day' + (hasWorkout ? ' active-2' : '');
        cal.appendChild(div);
    }
}

function renderDashPRs() {
    const list = document.getElementById('dash-prs-list');
    if (!list) return; // Guard against missing element
    
    const exercises = workoutData.exercises || {};
    const prs = Object.entries(exercises)
        .filter(([_, data]) => data && data.bestWeight)
        .sort((a,b) => b[1].bestWeight - a[1].bestWeight)
        .slice(0, 5);
    
    if (prs.length === 0) {
        list.innerHTML = '<p style="color:#aaa">No records yet.</p>';
    } else {
        list.innerHTML = prs.map(([id, data]) => `
            <div style="display:flex; justify-content:space-between; padding:5px 0; border-bottom:1px solid #eee">
                <span>${id.replace(/_/g,' ')}</span><strong>${data.bestWeight} lbs</strong>
            </div>
        `).join('');
    }
}

function updateProjection() {
    const streak = calculateStreak();
    const workouts = workoutData.workouts.length;
    const forecast = document.getElementById('strength-forecast');
    const note = document.getElementById('forecast-note');
    
    if (!forecast || !note) return; // prevent errors if elements missing
    
    if (workouts < 3) {
        forecast.innerText = "Need more data";
        return;
    }
    const annualGrowth = (streak > 5) ? 0.4 : 0.15;
    const proj = Math.round(100 * Math.pow(1 + annualGrowth, 5));
    forecast.innerText = `+${proj}% Estimated Strength`;
    note.innerText = `Forecasting to 2030 based on your current ${streak}-day consistency trend.`;
}

function renderBadges() {
    const grid = document.getElementById('badge-grid');
    if (!grid) return; // Guard against missing element
    grid.innerHTML = achievements.map(a => `
        <div class="badge-item ${a.check(workoutData) ? 'unlocked' : ''}" title="${a.desc}">
            <i class="fas ${a.icon} badge-icon"></i>
            <div style="font-size:0.65rem; font-weight:700;">${a.name}</div>
        </div>
    `).join('');
}

function updateDashboardChart() {
    const canvas = document.getElementById('dashboardChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (charts.dashboard) charts.dashboard.destroy();
    const lastWorkouts = workoutData.workouts.slice(-6);
    const labels = lastWorkouts.map((_, i) => `W${i+1}`);
    const volumes = lastWorkouts.map(w => w.summary?.totalVolume || 0);
    charts.dashboard = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Volume',
                data: volumes,
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.3,
                fill: true
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
}

// ---------- WORKOUT DECK RENDERING (NEW) ----------
function renderExerciseDeck() {
    const deck = document.getElementById('exercise-deck');
    if (!deck) return;

    deck.innerHTML = ''; // Clear old content

    if (!currentWorkout || !currentWorkout.exercises.length) {
        deck.innerHTML = '<div class="empty-state"><i class="fas fa-dumbbell"></i><h3>No workout scheduled.</h3></div>';
        return;
    }

    // Build cards as direct children of deck
    currentWorkout.exercises.forEach((ex, index) => {
        const card = document.createElement('div');
        card.className = 'exercise-card';
        card.dataset.index = index;
        const safeName = ex.name.replace(/'/g, "\\'");
        const repsInfo = typeof ex.prescribed.reps === 'string' 
            ? ex.prescribed.reps 
            : `${ex.prescribed.reps.min}-${ex.prescribed.reps.max}`;
        const isDone = ex.actual && !ex.skipped;

        // Generate the HTML for the card including the new per‑card drawer
        card.innerHTML = `
            <div class="card-menu">
                <i class="fas fa-ellipsis-v"></i>
                <div class="menu-popup">
                    <div onclick="shareExercise('${safeName}'); event.stopPropagation();">Share</div>
                    <div onclick="showAnatomy('${safeName}'); event.stopPropagation();">Anatomy</div>
                </div>
            </div>
            <div class="card-image" id="img-${index}"></div>
            <div class="exercise-card-content">
                <h3>${ex.name} ${isDone ? '✅' : ''}
                    <span class="info-icon" onclick="showExerciseDetails('${safeName}', ${index}); event.stopPropagation();" title="More info">
                        <i class="fas fa-info-circle"></i>
                    </span>
                </h3>
                <div class="card-prescription">
                    <strong>${ex.prescribed.weight || '?'} lbs</strong> · ${ex.prescribed.sets} × ${repsInfo}
                </div>
                <p class="exercise-description" id="desc-${index}"></p>
                <div class="card-actions">
                    <button class="action-btn web-btn" onclick="googleSearch('${safeName}', 'web'); event.stopPropagation();">
                        <i class="fas fa-search"></i> Web
                    </button>
                    <button class="action-btn images-btn" onclick="googleSearch('${safeName}', 'images'); event.stopPropagation();">
                        <i class="fas fa-image"></i> Images
                    </button>
                    <!-- NEW: Log button to open the per‑card drawer -->
                    <button class="action-btn log-btn" data-index="${index}">
                        <i class="fas fa-pencil-alt"></i> Log
                    </button>
                </div>
            </div>
            <!-- NEW: Per‑card drawer (initially hidden) -->
            <div class="card-drawer" id="drawer-${index}" style="display: none;">
                <div class="drawer-content">
                    <div class="log-prescribed-display">
                        <strong>Prescribed:</strong> ${ex.prescribed.weight || '?'} lbs · ${ex.prescribed.sets} × ${repsInfo}
                    </div>
                    <div class="form-group">
                        <label>Weight used (lbs)</label>
                        <input type="number" class="log-weight" value="${ex.prescribed.weight || ''}">
                    </div>
                    <div class="form-group">
                        <label>Sets completed</label>
                        <select class="log-sets" data-index="${index}">
                            ${Array.from({length: 11}, (_, i) => `<option value="${i}" ${i === ex.prescribed.sets ? 'selected' : ''}>${i}</option>`).join('')}
                        </select>
                    </div>
                    <div class="log-reps-container" id="reps-${index}"></div>
                    <div class="form-group">
                        <label>RPE (1-10)</label>
                        <select class="log-rpe">
                            <option value="">Select RPE</option>
                            ${Array.from({length: 10}, (_, i) => `<option value="${10 - i}">${10 - i}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Notes</label>
                        <textarea class="log-notes" placeholder="How did it feel?"></textarea>
                    </div>
                    <div class="drawer-actions">
                        <button class="btn-save-log" data-index="${index}">SAVE</button>
                        <button class="btn-skip-log" data-index="${index}">SKIP</button>
                        <button class="btn-close-drawer" data-index="${index}">CLOSE</button>
                    </div>
                </div>
            </div>
        `;

        // Menu popup logic
        const menu = card.querySelector('.card-menu');
        const popup = menu.querySelector('.menu-popup');
        menu.addEventListener('click', (e) => {
            e.stopPropagation();
            popup.classList.toggle('show');
        });

        // Attach event listeners for the per‑card drawer
        const logBtn = card.querySelector('.log-btn');
        const drawer = card.querySelector('.card-drawer');
        const setsSelect = card.querySelector('.log-sets');
        const repsContainer = card.querySelector(`#reps-${index}`);

        // Function to render rep inputs based on sets
        const renderRepInputs = () => {
            const sets = parseInt(setsSelect.value);
            if (isNaN(sets) || sets < 0) {
                repsContainer.innerHTML = '';
                return;
            }
            let html = '';
            for (let i = 0; i < sets; i++) {
                html += `
                    <div class="stepper-group">
                        <label>Set ${i + 1} reps</label>
                        <div class="stepper-control">
                            <button class="step-btn" data-index="${index}" data-set="${i}" data-delta="-1">−</button>
                            <input type="number" class="rep-input" id="rep-${index}-${i}" value="8" min="0" step="1">
                            <button class="step-btn" data-index="${index}" data-set="${i}" data-delta="1">+</button>
                        </div>
                    </div>
                `;
            }
            repsContainer.innerHTML = html;
        };

        // Initial render of rep inputs
        renderRepInputs();

        // Update rep inputs when sets change
        setsSelect.addEventListener('change', renderRepInputs);

        // Toggle drawer on log button click
        logBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            // Close any other open drawer
            document.querySelectorAll('.card-drawer[style*="display: block"]').forEach(d => d.style.display = 'none');
            // Open this drawer
            drawer.style.display = 'block';
        });

        // Close button inside drawer
        card.querySelector('.btn-close-drawer').addEventListener('click', (e) => {
            e.stopPropagation();
            drawer.style.display = 'none';
        });

        // Save and Skip buttons – now calling the correct global functions
        card.querySelector('.btn-save-log').addEventListener('click', (e) => {
            e.stopPropagation();
            saveLog(index);
        });

        card.querySelector('.btn-skip-log').addEventListener('click', (e) => {
            e.stopPropagation();
            skipLog(index);
        });

        // Stepper buttons (delegation because they are dynamically added)
        repsContainer.addEventListener('click', (e) => {
            const stepBtn = e.target.closest('.step-btn');
            if (!stepBtn) return;
            const delta = parseInt(stepBtn.dataset.delta);
            const setIdx = stepBtn.dataset.set;
            const input = document.getElementById(`rep-${index}-${setIdx}`);
            if (input) {
                const newVal = (parseFloat(input.value) || 0) + delta;
                input.value = Math.max(0, newVal);
                input.dispatchEvent(new Event('input')); // mark dirty if needed
            }
        });

        deck.appendChild(card);
        fetchExerciseImage(ex.name, `img-${index}`);
    });

    // Append summary card
    addSummaryCard();

    // No global click delegation needed anymore – each card handles its own drawer
}
async function fetchExerciseImage(exName, imgId) {
    const container = document.getElementById(imgId);
    if (!container) return;

    try {
        // Step 1: Find relevant file on Wikipedia/Commons
        const search = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(exName + " exercise")}&format=json&origin=*`).then(r => r.json());
        if (!search.query.search.length) return;

        const title = search.query.search[0].title;
        const pageData = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`).then(r => r.json());
        
        if (!pageData.originalimage) throw new Error("No image");

        // Step 2: Extract Filename for Metadata Lookup
        const fileName = pageData.originalimage.source.split('/').pop().replace('File:', '');
        const metaUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${fileName}&prop=imageinfo&iiprop=extmetadata|url&format=json&origin=*`;
        const metaRes = await fetch(metaUrl).then(r => r.json());
        const pages = metaRes.query.pages;
        const meta = pages[Object.keys(pages)[0]].imageinfo[0].extmetadata;

        // Step 3: Parse Metadata (Author, License, Links)
        const author = meta.Artist ? meta.Artist.value : "Wikimedia Contributor";
        const license = meta.LicenseShortName ? meta.LicenseShortName.value : "CC BY-SA";
        const licenseUrl = meta.LicenseUrl ? meta.LicenseUrl.value : "https://creativecommons.org/licenses/by-sa/4.0/";
        const fileUrl = `https://commons.wikimedia.org/wiki/File:${fileName}`;

        // Step 4: Inject HTML with Tooltip Attribution
        container.innerHTML = `
            <img src="${pageData.originalimage.source}" alt="${exName}">
            <div class="attribution-anchor">
                <i class="fas fa-copyright"></i>
                <div class="attribution-tooltip">
                    <a href="${fileUrl}" target="_blank">"${fileName}"</a> by 
                    <span>${author}</span> via 
                    <a href="https://commons.wikimedia.org" target="_blank">Wikimedia Commons</a>, 
                    <a href="${licenseUrl}" target="_blank">${license}</a>
                </div>
            </div>
        `;

    } catch (err) {
        container.innerHTML = '<div class="placeholder"><i class="fas fa-dumbbell"></i></div>';
    }
}

// Helper to keep the main function clean
function updateExerciseUI(name, data, imgContainer, descContainer, highResFn) {
    exerciseInfoCache[name] = data; // Save to global cache

    // Set Image
    const img = new Image();
    img.onload = () => { imgContainer.innerHTML = ''; imgContainer.appendChild(img); };
    img.src = highResFn(data.thumbnail.source);

    // Set Text (Advanced truncated description)
    if (descContainer && data.extract) {
        const words = data.extract.split(' ');
        descContainer.innerHTML = words.length > 30 ? words.slice(0, 30).join(' ') + '...' : data.extract;
    }
}

function showExerciseDetails(exName, index) {
    const cache = exerciseInfoCache[exName];
    const extract = cache?.extract || 'No description available.';
    const pageUrl = cache?.summary?.content_urls?.desktop?.page || '';
    
    // Use the existing exerciseSearchModal, but repurpose it
    const modal = document.getElementById('exerciseSearchModal');
    const title = document.getElementById('exerciseSearchTitle');
    const body = document.getElementById('exerciseSearchBody');
    
    title.textContent = exName;
    
    // Build content similar to old search modal
    let html = `
        <div class="summary-content">
            <p>${extract}</p>
            ${pageUrl ? `<p><a href="${pageUrl}" target="_blank">📖 Read full article on Wikipedia</a></p>` : ''}
        </div>
        <div class="feedback-bar" style="margin-top:20px; border-top:1px solid var(--gray-200); padding-top:15px; display:flex; gap:10px; justify-content:space-between;">
            <button class="like-btn" onclick="closeModal('exerciseSearchModal')"><span>👍</span> Helpful</button>
            <div class="dislike-group" style="display:flex; gap:10px;">
                <button class="search-fallback-btn google" onclick="googleSearch('${exName.replace(/'/g, "\\'")}', 'web')"><span>🔍</span> Web</button>
                <button class="search-fallback-btn images" onclick="googleSearch('${exName.replace(/'/g, "\\'")}', 'images')"><span>📷</span> Images</button>
            </div>
        </div>
    `;
    
    body.innerHTML = html;
    modal.classList.add('active');
}

function addSummaryCard() {
    const deck = document.getElementById('exercise-deck');
    if (!deck) return;
    
    if (!currentWorkout || !currentWorkout.exercises) return;
    
    const completedCount = currentWorkout.exercises.filter(ex => ex.actual && !ex.skipped).length;
    const skippedCount = currentWorkout.exercises.filter(ex => ex.skipped).length;
    const total = currentWorkout.exercises.length;
    const progress = total > 0 ? Math.round((completedCount / total) * 100) : 0;
    
    const summaryDiv = document.createElement('div');
    summaryDiv.className = 'summary-card';
    summaryDiv.innerHTML = `
        <h3>Workout Summary</h3>
        <div class="summary-stats">
            <p>✅ Completed: ${completedCount}</p>
            <p>⏭️ Skipped: ${skippedCount}</p>
            <p>📊 Progress: ${progress}%</p>
        </div>
        <div class="btn-group">
            <button class="btn btn-success" onclick="completeWorkout()">Complete Workout</button>
            <button class="btn btn-outline" onclick="generateNextWorkout()">Generate New</button>
        </div>
    `;
    deck.appendChild(summaryDiv);
}

function openWorkoutModal() {
    // Ensure the workout data is ready
    if (!currentWorkout) {
        generateNextWorkout();
    }
    // Render the deck inside the modal
    renderExerciseDeckInModal();
    // Update the modal header with current workout info
    updateModalWorkoutHeader();
    // Show the modal
    document.getElementById('workoutModal').classList.add('active');
    // Optionally hide the regular workout section if it's visible
    document.getElementById('workout-section').classList.remove('active');
}

function closeWorkoutModal() {
    document.getElementById('workoutModal').classList.remove('active');
    // Return to dashboard (or previous section)
    showSection('dashboard');
}

function updateModalWorkoutHeader() {
    if (!currentWorkout) return;
    const modal = document.getElementById('workoutModal');
    if (!modal || !modal.classList.contains('active')) return; // only update if modal is open

    document.getElementById('modalWorkoutType').innerText = currentWorkout.name;

    // Optionally update focus, time, intensity from the split or workout
    const split = workoutProgram.splits.find(s => s.id === currentWorkout.type);
    if (split) {
        document.getElementById('modalWorkoutFocus').innerText = split.focus.join(', ');
    } else {
        document.getElementById('modalWorkoutFocus').innerText = 'General';
    }
    // Placeholder values – adjust as needed
    document.getElementById('modalWorkoutTime').innerText = '60 min';
    document.getElementById('modalWorkoutIntensity').innerText = 'Moderate';
}

function setupModalIntersectionObserver() {
    // Disconnect previous observer if any
    if (modalObserver) modalObserver.disconnect();

    modalObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const card = entry.target;
                const index = card.dataset.index;
                if (index !== undefined) {
                    modalCurrentCardIndex = parseInt(index);
                    const ex = currentWorkout?.exercises[modalCurrentCardIndex];
                    if (ex) {
                        document.getElementById('modalWorkoutType').innerText = ex.name;
                    }
                }
            }
        });
    }, { threshold: 0.6 });

    // Observe all cards and the summary card
    const deck = document.getElementById('exercise-deck-modal');
    if (!deck) return;
    deck.querySelectorAll('.exercise-card, .summary-card').forEach(card => {
        modalObserver.observe(card);
    });
}

function navigateModalDeck(direction) {
    const deck = document.getElementById('exercise-deck-modal');
    const cards = deck.querySelectorAll('.exercise-card, .summary-card');
    if (cards.length === 0) return;

    const newIndex = Math.max(0, Math.min(cards.length - 1, modalCurrentCardIndex + direction));
    cards[newIndex].scrollIntoView({ behavior: 'smooth', block: 'start' });
    // Index will be updated by the Intersection Observer
}

function nextModalCard() {
    navigateModalDeck(1);
}

function prevModalCard() {
    navigateModalDeck(-1);
}

function renderExerciseDeckInModal() {
    const deck = document.getElementById('exercise-deck-modal');
    if (!deck) return;

    // Clear old content
    deck.innerHTML = '';

    if (!currentWorkout || !currentWorkout.exercises.length) {
        deck.innerHTML = '<div class="empty-state"><i class="fas fa-dumbbell"></i><h3>No workout scheduled.</h3></div>';
        return;
    }

    // Create the slider container
    const slider = document.createElement('div');
    slider.className = 'deck-slider';
    deck.appendChild(slider);

    // Build exercise cards
    currentWorkout.exercises.forEach((ex, index) => {
        const card = document.createElement('div');
        card.className = 'exercise-card';
        card.dataset.index = index;

        const safeName = ex.name.replace(/'/g, "\\'");
        const repsInfo = typeof ex.prescribed.reps === 'string'
            ? ex.prescribed.reps
            : `${ex.prescribed.reps.min}-${ex.prescribed.reps.max}`;
        const isDone = ex.actual && !ex.skipped;

        card.innerHTML = `
            <div class="card-menu">
                <i class="fas fa-ellipsis-v"></i>
                <div class="menu-popup">
                    <div onclick="shareExercise('${safeName}'); event.stopPropagation();">Share</div>
                    <div onclick="showAnatomy('${safeName}'); event.stopPropagation();">Anatomy</div>
                </div>
            </div>
            <div class="card-image" id="modal-img-${index}"></div>
            <div class="exercise-card-content">
                <h3>${ex.name} ${isDone ? '✅' : ''}
                    <span class="info-icon" onclick="showExerciseDetails('${safeName}', ${index}); event.stopPropagation();" title="More info">
                        <i class="fas fa-info-circle"></i>
                    </span>
                </h3>
                <div class="card-prescription">
                    <strong>${ex.prescribed.weight || '?'} lbs</strong> · ${ex.prescribed.sets} × ${repsInfo}
                </div>
                <p class="exercise-description" id="modal-desc-${index}"></p>
                <div class="card-actions">
                    <button class="action-btn web-btn" onclick="googleSearch('${safeName}', 'web'); event.stopPropagation();">
                        <i class="fas fa-search"></i> Web
                    </button>
                    <button class="action-btn images-btn" onclick="googleSearch('${safeName}', 'images'); event.stopPropagation();">
                        <i class="fas fa-image"></i> Images
                    </button>
                </div>
            </div>
        `;

        // Menu popup logic
        const menu = card.querySelector('.card-menu');
        const popup = menu.querySelector('.menu-popup');
        menu.addEventListener('click', (e) => {
            e.stopPropagation();
            popup.classList.toggle('show');
        });

        slider.appendChild(card);
        fetchExerciseImage(ex.name, `modal-img-${index}`);
    });

    // Add summary card (must be inside the slider)
    addModalSummaryCard(slider);   // <-- now receives the slider, not the deck

    // Event delegation for card clicks (opens log drawer)
    slider.addEventListener('click', (e) => {
        const card = e.target.closest('.exercise-card');
        if (card && !e.target.closest('.card-menu') && !e.target.closest('.info-icon') && !e.target.closest('.action-btn')) {
            const index = card.dataset.index;
            openLogDrawer(index);
        }
    });

    // Store references for paging logic
    modalDeckSlider = slider;
    modalCards = Array.from(slider.children);
    modalCurrentCardIndex = 0;

    // Ensure the slider starts at the first card
    updateModalCardPosition();        // <-- function that sets transform: translateY(0%)

    // Optional: keep header sync (modify observer to watch slider children)
    setupModalIntersectionObserver();
}

function navigateModalDeck(direction) {
    const deck = document.getElementById('exercise-deck-modal');
    const cards = deck.querySelectorAll('.exercise-card, .summary-card');
    if (cards.length === 0) return;

    // Find current index based on scroll position (optional, but nice for keyboard)
    // For simplicity, we'll use the stored modalCurrentCardIndex
    const newIndex = Math.max(0, Math.min(cards.length - 1, modalCurrentCardIndex + direction));
    cards[newIndex].scrollIntoView({ behavior: 'smooth', block: 'start' });
    // The Intersection Observer will update modalCurrentCardIndex and header
}

function nextModalCard() {
    navigateModalDeck(1);
}

function prevModalCard() {
    navigateModalDeck(-1);
}

function addModalSummaryCard(deck) {
    if (!currentWorkout || !currentWorkout.exercises) return;
    
    const completedCount = currentWorkout.exercises.filter(ex => ex.actual && !ex.skipped).length;
    const skippedCount = currentWorkout.exercises.filter(ex => ex.skipped).length;
    const total = currentWorkout.exercises.length;
    const progress = total > 0 ? Math.round((completedCount / total) * 100) : 0;
    
    const summaryDiv = document.createElement('div');
    summaryDiv.className = 'summary-card';
    summaryDiv.innerHTML = `
        <h3>Workout Summary</h3>
        <div class="summary-stats">
            <p>✅ Completed: ${completedCount}</p>
            <p>⏭️ Skipped: ${skippedCount}</p>
            <p>📊 Progress: ${progress}%</p>
        </div>
        <div class="btn-group">
            <button class="btn btn-success" onclick="completeWorkout()">Complete Workout</button>
            <button class="btn btn-outline" onclick="generateNextWorkout()">Generate New</button>
        </div>
    `;
    deck.appendChild(summaryDiv);
}

// ---------- LOGGING DRAWER ----------
function openLogDrawer(index) {
    console.warn('openLogDrawer is deprecated. The logging UI has moved to per‑card drawers.');
    // No operation – the old global drawer has been removed.
}

function closeLogDrawer() {
    console.warn('closeLogDrawer is deprecated. The global drawer has been removed.');
    // No operation – the old global drawer no longer exists.
}

function renderRepInputs(index) {
    console.warn('renderRepInputs is deprecated. Rep inputs are now handled inside each card.');
    // No operation – the old rep input rendering is no longer used.
}

function saveLog(index) {
    const card = document.querySelector(`.exercise-card[data-index="${index}"]`);
    if (!card) {
        console.error('Card not found for index', index);
        return;
    }
    const exercise = currentWorkout.exercises[index];
    if (!exercise) return;

    // Get form elements within this card's drawer
    const weightInput = card.querySelector('.log-weight');
    const setsSelect = card.querySelector('.log-sets');
    const rpeSelect = card.querySelector('.log-rpe');
    const notesTextarea = card.querySelector('.log-notes');
    const repsContainer = card.querySelector('.log-reps-container');

    if (!weightInput || !setsSelect || !rpeSelect || !notesTextarea || !repsContainer) {
        alert("Log form is not fully loaded. Please try again.");
        return;
    }

    const weight = parseFloat(weightInput.value);
    const sets = parseInt(setsSelect.value);
    const rpe = parseInt(rpeSelect.value);
    const notes = notesTextarea.value;
    const reps = [];

    // Collect rep inputs from the repsContainer
    const repInputs = repsContainer.querySelectorAll('.rep-input');
    for (let i = 0; i < repInputs.length; i++) {
        const val = parseInt(repInputs[i].value);
        if (!isNaN(val) && val > 0) reps.push(val);
    }

    // Validate
    if (isNaN(weight) || weight <= 0 || sets === 0) {
        alert("Please enter a valid weight and at least one set.");
        return;
    }

    exercise.actual = {
        weight, sets, reps, rpe, notes,
        completed: new Date().toISOString()
    };

    updateExerciseHistory(exercise);
    dataChanged = true;

    // Remove this index from dirty set if it was there
    dirtyExercises.delete(index);
    if (dirtyExercises.size === 0) {
        workoutDirty = false;
        clearDraft();
    } else {
        saveDraft();
    }

    updateNavigation();

    // Close the drawer
    const drawer = card.querySelector('.card-drawer');
    if (drawer) drawer.style.display = 'none';

    // Re‑render the deck to update checkmark
    renderExerciseDeck();

    // Optionally scroll to next card
    const nextIndex = index + 1;
    if (nextIndex < currentWorkout.exercises.length) {
        const deck = document.getElementById('exercise-deck');
        if (deck && deck.children[nextIndex]) {
            deck.children[nextIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
    refreshSummaryCard();
}

function skipLog(index) {
    const card = document.querySelector(`.exercise-card[data-index="${index}"]`);
    if (!card) {
        console.error('Card not found for index', index);
        return;
    }
    const exercise = currentWorkout.exercises[index];
    if (!exercise) return;

    // Get notes from the drawer if available
    const notesTextarea = card.querySelector('.log-notes');
    const notes = notesTextarea ? notesTextarea.value : "Skipped";

    exercise.skipped = true;
    exercise.actual = { skipped: true, notes };

    if (!workoutData.exercises[exercise.id]) {
        workoutData.exercises[exercise.id] = { history: [] };
    }
    workoutData.exercises[exercise.id].history.push({
        date: new Date().toISOString(),
        skipped: true,
        notes
    });
    dataChanged = true;

    // Clear dirty for this exercise
    dirtyExercises.delete(index);
    if (dirtyExercises.size === 0) {
        workoutDirty = false;
        clearDraft();
    } else {
        saveDraft();
    }
    updateNavigation();
    saveToLocalStorage();

    // Close the drawer
    const drawer = card.querySelector('.card-drawer');
    if (drawer) drawer.style.display = 'none';

    // Re‑render the deck to update checkmark
    renderExerciseDeck();

    // Scroll to next card
    const nextIndex = index + 1;
    if (nextIndex < currentWorkout.exercises.length) {
        const deck = document.getElementById('exercise-deck');
        if (deck && deck.children[nextIndex]) {
            deck.children[nextIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    } else {
        const deck = document.getElementById('exercise-deck');
        if (deck && deck.lastChild) {
            deck.lastChild.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
    refreshSummaryCard();
}

function updateExerciseHistory(exercise) {
    if (!workoutData.exercises[exercise.id]) {
        workoutData.exercises[exercise.id] = { history: [] };
    }
    const avgReps = exercise.actual.reps.reduce((a,b)=>a+b,0)/exercise.actual.reps.length || 0;
    const volume = exercise.actual.weight * exercise.actual.sets * avgReps;
    const historyEntry = {
        date: new Date().toISOString(),
        weight: exercise.actual.weight,
        sets: exercise.actual.sets,
        reps: exercise.actual.reps,
        rpe: exercise.actual.rpe,
        volume: volume
    };
    workoutData.exercises[exercise.id].history.push(historyEntry);
    const currentBest = workoutData.exercises[exercise.id].bestWeight || 0;
    if (exercise.actual.weight > currentBest) {
        workoutData.exercises[exercise.id].bestWeight = exercise.actual.weight;
        workoutData.exercises[exercise.id].bestReps = Math.max(...exercise.actual.reps);
        workoutData.exercises[exercise.id].lastTrained = new Date().toISOString();
    }
    exercise.muscleGroup.forEach(muscle => {
        muscleLastTrained[muscle] = new Date().toISOString();
    });
    saveToLocalStorage();
    updateDashboard();
}

function calculateWorkoutVolume(workout) {
    return workout.exercises.reduce((total, ex) => {
        if (ex.actual && !ex.skipped) {
            const avgReps = ex.actual.reps.reduce((a,b)=>a+b,0)/ex.actual.reps.length || 0;
            return total + ex.actual.weight * ex.actual.sets * avgReps;
        }
        return total;
    }, 0);
}

function calculateAverageRPE(workout) {
    const rpes = workout.exercises.filter(ex => ex.actual?.rpe).map(ex => ex.actual.rpe);
    if (rpes.length === 0) return null;
    return (rpes.reduce((a,b)=>a+b,0) / rpes.length).toFixed(1);
}

function completeWorkout() {
    if (!currentWorkout) { alert("No workout to complete"); return; }
    const unlogged = currentWorkout.exercises.filter(ex => !ex.actual && !ex.skipped);
    if (unlogged.length > 0 && !confirm(`You have ${unlogged.length} unlogged exercises. Complete anyway?`)) return;
    
    // Add to history
    workoutData.workouts.push(currentWorkout);
    currentWorkout.summary = {
        totalVolume: calculateWorkoutVolume(currentWorkout),
        averageRPE: calculateAverageRPE(currentWorkout),
        completedExercises: currentWorkout.exercises.filter(ex => ex.actual && !ex.skipped).length
    };
    saveToLocalStorage();
    
    // Clear dirty state
    dirtyExercises.clear();
    workoutDirty = false;
    clearDraft();
    updateNavigation();
    
    // Generate next workout for future use
    generateNextWorkout();
    showNotification(`Workout completed! 🎉`);
    celebrate();
    
    // Close modal and return to dashboard
    closeWorkoutModal();
}

function celebrate() {
    const overlay = document.createElement('div');
    overlay.className = 'celebration-overlay';
    document.body.appendChild(overlay);
    
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.animationDelay = Math.random() * 2 + 's';
        confetti.style.background = `hsl(${Math.random() * 360}, 100%, 50%)`;
        overlay.appendChild(confetti);
    }
    
    setTimeout(() => {
        overlay.remove();
    }, 5000);
}

function refreshSummaryCard() {
    const deck = document.getElementById('exercise-deck');
    if (deck && deck.lastChild && deck.lastChild.classList.contains('summary-card')) {
        deck.removeChild(deck.lastChild);
    }
    addSummaryCard();
}

function shareExercise(name) {
    if (navigator.share) {
        navigator.share({ title: 'Exercise', text: name });
    } else {
        navigator.clipboard.writeText(name);
        showNotification('Exercise name copied!');
    }
}

function showAnatomy(name) {
    showSection('library');
}

// ---------- HISTORY SECTION ----------
function updateWorkoutHistory() {
    const tbody = document.querySelector('#workoutHistoryTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    const recent = [...workoutData.workouts].reverse().slice(0,20);
    if (recent.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No workouts yet.</td></tr>';
        return;
    }
    recent.forEach(w => {
        const date = new Date(w.date).toLocaleDateString();
        const exNames = w.exercises?.slice(0,3).map(e => e.name.split(' ').slice(-1)[0]).join(', ') || '';
        const volume = w.summary?.totalVolume ? formatNumber(Math.round(w.summary.totalVolume)) : 'N/A';
        const rpe = w.summary?.averageRPE || 'N/A';
        tbody.innerHTML += `<tr><td>${date}</td><td>${w.name}</td><td>${exNames}${w.exercises?.length>3?'...':''}</td><td>${volume}</td><td>${rpe}</td><td>-</td></tr>`;
    });
}

function filterHistory(type) {
    showNotification(`Filtering ${type} (not fully implemented)`);
}

function exportHistoryCSV() {
    let csv = "Date,Workout,Exercises,Volume,RPE\n";
    workoutData.workouts.forEach(w => {
        const date = new Date(w.date).toLocaleDateString();
        const ex = w.exercises?.map(e => e.name).join('; ') || '';
        const vol = w.summary?.totalVolume || '';
        const rpe = w.summary?.averageRPE || '';
        csv += `"${date}","${w.name}","${ex}","${vol}","${rpe}"\n`;
    });
    const blob = new Blob([csv], {type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification("History exported!");
}

// ---------- PROGRESS CHARTS ----------
function updateProgressCharts() {
    updateVolumeChart();
    updateStrengthChart();
    updateFrequencyChart();
    updateRPEChart();
}

function updateVolumeChart() {
    const ctx = document.getElementById('volumeChart')?.getContext('2d');
    if (!ctx) return;
    if (charts.volume) charts.volume.destroy();
    const last = workoutData.workouts.slice(-8);
    const volumes = last.map(w => w.summary?.totalVolume || 0);
    charts.volume = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: last.map((_,i)=>`W${i+1}`),
            datasets: [{
                label: 'Volume',
                data: volumes,
                backgroundColor: 'rgba(54,162,235,0.5)',
                borderColor: 'rgb(54,162,235)'
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

function updateStrengthChart() {
    const ctx = document.getElementById('strengthChart')?.getContext('2d');
    if (!ctx) return;
    if (charts.strength) charts.strength.destroy();
    const top = Object.entries(workoutData.exercises)
        .filter(([_,d]) => d.bestWeight)
        .sort((a,b) => b[1].bestWeight - a[1].bestWeight)
        .slice(0,5);
    const labels = top.map(([id,_]) => id.replace(/_/g,' '));
    const weights = top.map(([_,d]) => d.bestWeight);
    charts.strength = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Best Weight',
                data: weights,
                borderColor: 'rgb(255,99,132)',
                backgroundColor: 'rgba(255,99,132,0.1)',
                tension: 0.3
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

function updateFrequencyChart() {
    const ctx = document.getElementById('frequencyChart')?.getContext('2d');
    if (!ctx) return;
    if (charts.frequency) charts.frequency.destroy();
    const weeks = [0,0,0,0];
    const today = new Date();
    for (let i=0; i<4; i++) {
        const start = new Date(today); start.setDate(today.getDate() - (i*7) - 6);
        const end = new Date(today); end.setDate(today.getDate() - (i*7));
        weeks[i] = workoutData.workouts.filter(w => {
            const d = new Date(w.date);
            return d >= start && d <= end;
        }).length;
    }
    charts.frequency = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['3 weeks ago','2 weeks ago','Last week','This week'],
            datasets: [{
                label: 'Workouts',
                data: weeks.reverse(),
                backgroundColor: 'rgba(75,192,192,0.5)'
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

function updateRPEChart() {
    const ctx = document.getElementById('rpeChart')?.getContext('2d');
    if (!ctx) return;
    if (charts.rpe) charts.rpe.destroy();
    const rpeCounts = Array(10).fill(0);
    workoutData.workouts.forEach(w => {
        w.exercises?.forEach(e => {
            if (e.actual?.rpe) rpeCounts[e.actual.rpe-1]++;
        });
    });
    charts.rpe = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Array.from({length:10}, (_,i)=>`${i+1}`),
            datasets: [{
                data: rpeCounts,
                backgroundColor: ['#ff6384','#ff9f40','#ffcd56','#4bc0c0','#36a2eb','#9966ff','#c9cbcf','#ff6384','#ff9f40','#ffcd56']
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

// ---------- RECOVERY SECTION ----------
function updateRecoverySection() {
    calculateMuscleLastTrained();
    updateCategoryRecovery('majorMuscleRecovery', muscleDatabase.major);
    updateCategoryRecovery('longevityMuscleRecovery', muscleDatabase.longevity);
    updateCategoryRecovery('handMuscleRecovery', muscleDatabase.hands);
    updateCategoryRecovery('footMuscleRecovery', muscleDatabase.feet);
    updateRecoveryRecommendations();
}

function calculateMuscleLastTrained() {
    initializeMuscleTracking();
    workoutData.workouts.forEach(workout => {
        workout.exercises?.forEach(ex => {
            if (ex.actual && !ex.skipped) {
                (ex.muscleGroup || []).forEach(muscle => {
                    if (!muscleLastTrained[muscle] || new Date(workout.date) > new Date(muscleLastTrained[muscle])) {
                        muscleLastTrained[muscle] = workout.date;
                    }
                });
            }
        });
    });
}

function updateCategoryRecovery(containerId, muscles) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    const isMobile = window.innerWidth <= 768;
    muscles.forEach(muscle => {
        const el = isMobile ? createMobileRecoveryElement(muscle) : createRecoveryElement(muscle);
        container.appendChild(el);
    });
}

function createRecoveryElement(muscle) {
    const status = getRecoveryStatus(muscle);
    const el = document.createElement('div');
    el.className = 'recovery-item recovery-item-desktop';
    const risk = muscle.agingRisk ? `<span class="badge badge-${muscle.agingRisk==='high'?'danger':muscle.agingRisk==='medium'?'warning':'success'}" style="margin-left:5px;">${muscle.agingRisk.toUpperCase()}</span>` : '';
    el.innerHTML = `
        <span style="min-width:150px;">${muscle.display}${risk}</span>
        <span style="min-width:100px;">${status.daysText}</span>
        <div class="recovery-bar"><div class="recovery-fill ${status.statusClass.replace('status-','recovery-')}" style="width:${status.pct}%"></div></div>
        <span style="min-width:80px; text-align:right; color:var(--${status.statusClass.split('-')[1]})">${status.status}</span>
    `;
    return el;
}

function createMobileRecoveryElement(muscle) {
    const status = getRecoveryStatus(muscle);
    const el = document.createElement('div');
    el.className = 'recovery-item-mobile';
    const risk = muscle.agingRisk ? `<span class="badge badge-${muscle.agingRisk==='high'?'danger':muscle.agingRisk==='medium'?'warning':'success'}" style="margin-left:5px;">${muscle.agingRisk.toUpperCase()}</span>` : '';
    el.innerHTML = `
        <div class="recovery-item-mobile-content">
            <div class="recovery-item-header">
                <span class="recovery-item-muscle">${muscle.display}${risk}</span>
                <span class="recovery-item-status ${status.statusClass}">${status.status}</span>
            </div>
            <div class="recovery-item-details"><span>${status.daysText}</span><span>${getEffectiveRestDays(muscle)} day rest</span></div>
            <div class="recovery-item-bar-container">
                <div class="recovery-item-bar-label"><span>Recovery</span><span>${Math.round(status.pct)}%</span></div>
                <div class="recovery-bar"><div class="recovery-fill ${status.statusClass.replace('status-','recovery-')}" style="width:${status.pct}%"></div></div>
            </div>
        </div>
    `;
    return el;
}

function updateRecoveryRecommendations() {
    const container = document.getElementById('recoveryRecommendations');
    if (!container) return;
    const ready = [];
    const neglected = [];
    getAllMuscleGroups().forEach(m => {
        const last = muscleLastTrained[m.name];
        if (!last && (m.category==='longevity'||m.category==='hands'||m.category==='feet')) neglected.push(m);
        else if (last) {
            const needed = getEffectiveRestDays(m);
            const days = Math.floor((new Date() - new Date(last)) / (1000*60*60*24));
            if (days >= needed) ready.push(m);
        }
    });
    let html = '';
    if (ready.length) html += `<p><strong>${ready.length} muscle groups ready to train.</strong></p>`;
    if (neglected.length) html += `<div style="margin-top:15px; padding:12px; background:rgba(245,158,11,0.1); border-left:4px solid var(--warning);">
        <i class="fas fa-exclamation-triangle"></i> <strong>Longevity Alert:</strong> ${neglected.length} joint health muscles never trained. Consider a longevity workout.
        <button class="btn btn-warning" style="margin-top:10px;" onclick="generateLongevityWorkout()">Generate Longevity Workout</button>
    </div>`;
    container.innerHTML = html || '<p>All systems go. Great job!</p>';
}

// ---------- LONGEVITY FUNCTIONS ----------
function calculateLongevityScore() {
    const scores = {
        gripStrength: calculateGripStrengthScore(),
        balance: calculateBalanceScore(),
        jointMobility: calculateJointMobilityScore(),
        posture: calculatePostureScore(),
        muscleBalance: calculateMuscleBalanceScore(),
        consistency: calculateConsistencyScore()
    };
    const weights = { gripStrength:0.15, balance:0.15, jointMobility:0.25, posture:0.20, muscleBalance:0.15, consistency:0.10 };
    let total = 0, totalW = 0;
    Object.keys(scores).forEach(k => { 
        total += scores[k] * (weights[k] || 0.1); 
        totalW += (weights[k] || 0.1); 
    });
    // Remove the *100 – scores are already percentages (0-100), so weighted average is the final score.
    const final = Math.round(total / totalW);
    return { score: final, breakdown: scores, risks: assessAgingRisks(scores), recommendations: generateLongevityRecommendations(scores) };
}

function calculateGripStrengthScore() {
    const gripIds = ["deadlift", "farmer_walk"];
    let max = 0;
    gripIds.forEach(id => { if (workoutData.exercises[id]?.bestWeight) max = Math.max(max, workoutData.exercises[id].bestWeight); });
    if (max === 0) return 50;
    const ratio = max / (workoutData.user.weight || 150);
    if (ratio >= 1.5) return 100;
    if (ratio >= 1.2) return 80;
    if (ratio >= 1.0) return 60;
    if (ratio >= 0.8) return 40;
    return 20;
}

function calculateBalanceScore() {
    const balanceMuscles = ["tibialis", "peroneus_tertius"];
    let trained = false;
    balanceMuscles.forEach(m => { if (muscleLastTrained[m] && daysSinceTrained(m) < 14) trained = true; });
    return trained ? 90 : 30;
}

function calculateJointMobilityScore() {
    const longevityMuscles = muscleDatabase.longevity;
    let count = 0;
    longevityMuscles.forEach(m => { if (muscleLastTrained[m.name] && daysSinceTrained(m.name) < 30) count++; });
    return Math.min(100, (count / longevityMuscles.length) * 100 * 0.8);
}

function calculatePostureScore() {
    const postureMuscles = ["neck", "deep_neck", "rhomboids", "rear_delts", "traps"];
    let count = 0;
    postureMuscles.forEach(m => { if (muscleLastTrained[m] && daysSinceTrained(m) < 14) count++; });
    return (count / postureMuscles.length) * 100;
}

function calculateMuscleBalanceScore() {
    const push = ["chest", "triceps", "shoulders"];
    const pull = ["back", "biceps", "rear_delts"];
    let pushTrained = push.some(m => muscleLastTrained[m] && daysSinceTrained(m) < 7);
    let pullTrained = pull.some(m => muscleLastTrained[m] && daysSinceTrained(m) < 7);
    if (pushTrained && pullTrained) return 100;
    if (pushTrained || pullTrained) return 50;
    return 20;
}

function calculateConsistencyScore() {
    const streak = calculateStreak();
    if (streak >= 30) return 100;
    if (streak >= 14) return 80;
    if (streak >= 7) return 60;
    if (streak >= 3) return 40;
    return 20;
}

function assessAgingRisks(scores) {
    const risks = [];
    if (scores.posture < 50) risks.push({ factor:"Neck/Posture Weakness", severity:"High", impact:"Forward head posture", recommendation:"Add neck strengthening" });
    if (scores.gripStrength < 40) risks.push({ factor:"Low Grip Strength", severity:"Medium", impact:"Reduced independence", recommendation:"Add grip training" });
    if (scores.balance < 40) risks.push({ factor:"Poor Balance", severity:"High", impact:"Increased fall risk", recommendation:"Add balance exercises" });
    return risks;
}

function generateLongevityRecommendations(scores) {
    const recs = [];
    if (scores.posture < 70) recs.push("Focus on posture correction exercises 3x/week");
    if (scores.balance < 60) recs.push("Incorporate daily balance training");
    if (scores.jointMobility < 50) recs.push("Add joint-specific mobility work to every workout");
    return recs;
}

function updateLongevityScoreDisplay() {
    const score = calculateLongevityScore().score;
    const el = document.getElementById('longevityScore');
    if (el) el.innerText = score;
}
function generateLongevityWorkout() {
    const split = workoutProgram.splits.find(s => s.id === "longevity_day");
    currentWorkout = {
        id: `workout_${Date.now()}`,
        date: new Date().toISOString(),
        type: "longevity_day",
        name: "Longevity & Joint Health",
        exercises: []
    };
    split.focus.forEach(mg => {
        const ex = generateExerciseFromLibrary(mg);
        if (ex) currentWorkout.exercises.push(generateExercisePrescription(ex, 1.0));
    });
    renderExerciseDeck();
    showSection('workout');
    showNotification("Longevity workout generated!");
}

// ---------- EXERCISE LIBRARY (with images) ----------
function loadExerciseLibrary() {
    const container = document.getElementById('exercise-library-container');
    if (!container) return;
    
    let html = '';
    const exercises = Object.entries(ultimateExerciseLibrary);
    
    const countEl = document.getElementById('library-count');
    if (countEl) countEl.innerText = exercises.length;

    exercises.forEach(([id, ex]) => {
        const pr = workoutData.exercises[id]?.bestWeight;
        html += `
            <div class="library-exercise-card" onclick="showExerciseSearch('${ex.name.replace(/'/g,"\\'")}')">
                <div class="library-card-image" id="lib-img-${id}"></div>
                <div class="library-card-info">
                    <div class="library-muscle-tags">
                        ${ex.muscles.map(m => `<span class="library-muscle-tag">${getMuscleDisplayName(m)}</span>`).join('')}
                    </div>
                    <h3>${ex.name}</h3>
                    ${pr ? `<div class="pr-badge" style="background:var(--warning); color:white; padding:4px 10px; border-radius:12px; font-size:0.75rem; font-weight:800; display:inline-block; margin-top:8px;">PR: ${pr} lbs</div>` : ''}
                </div>
            </div>
        `;
        fetchExerciseImage(ex.name, `lib-img-${id}`); 
    });
    container.innerHTML = html;
    
    exercises.forEach(([id, ex]) => {
    });
}

function filterLibrary() {
    const input = document.getElementById('librarySearchInput').value.toLowerCase();
    const cards = document.querySelectorAll('.library-exercise-card');
    
    cards.forEach(card => {
        const name = card.querySelector('h3').innerText.toLowerCase();
        const muscles = card.querySelector('.library-muscle-tags').innerText.toLowerCase();
        
        if (name.includes(input) || muscles.includes(input)) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });
}

// ---------- PERSONAL RECORDS ----------
function loadPersonalRecords() {
    const container = document.querySelector('#pr-section .pr-grid');
    if (!container) return;
    let html = '';
    Object.entries(workoutData.exercises).forEach(([id, data]) => {
        if (data.bestWeight) {
            const exName = id.replace(/_/g,' ');
            const date = data.lastTrained ? new Date(data.lastTrained).toLocaleDateString() : '';
            html += `
                <div class="pr-card">
                    <div class="pr-value">${data.bestWeight} lbs</div>
                    <div>${exName}</div>
                    <div class="pr-date">${data.bestReps || ''} reps ${date ? '• '+date : ''}</div>
                </div>
            `;
        }
    });
    container.innerHTML = html || '<p>No personal records yet.</p>';
}

// ---------- GOALS ----------
function loadGoals() {
    const container = document.querySelector('#goals-section .goals-container');
    if (!container) return;
    let html = '';
    workoutData.goals.forEach((goal, i) => {
        html += `
            <div class="goal-item">
                <h3>${goal.type}: ${goal.target}</h3>
                <div class="goal-progress"><div class="goal-progress-fill" style="width:${goal.progress || 0}%"></div></div>
                <p>Deadline: ${goal.deadline || 'N/A'}</p>
            </div>
        `;
    });
    html += `<button class="btn" onclick="showModal('goalModal')">Set New Goal</button>`;
    container.innerHTML = html || '<p>No goals set.</p><button class="btn" onclick="showModal(\'goalModal\')">Set New Goal</button>';
}

function addGoal() {
    const type = document.getElementById('goal-type')?.value;
    const target = document.getElementById('goal-target')?.value;
    const date = document.getElementById('goal-date')?.value;
    if (!type || !target) { alert("Please fill in goal type and target"); return; }
    workoutData.goals.push({ type, target, deadline: date, progress: 0 });
    dataChanged = true;
    saveToLocalStorage();
    showNotification("Goal added!");
    closeModal('goalModal');
    loadGoals();
}

// ---------- PROGRAMS ----------
function loadPrograms() {
    const container = document.querySelector('#programs-section .programs-container');
    if (!container) return;
    const programs = [
        { name: "StrongLifts 5x5", description: "Simple strength program", workouts: 3 },
        { name: "Push/Pull/Legs", description: "6-day split", workouts: 6 },
        { name: "Longevity Plan", description: "Focus on joint health", workouts: 4 }
    ];
    let html = '';
    programs.forEach(p => {
        html += `<div class="program-card" onclick="selectProgram('${p.name}')"><h3>${p.name}</h3><p>${p.description}</p><p><small>${p.workouts} days/week</small></p></div>`;
    });
    container.innerHTML = html;
}

function selectProgram(name) {
    showNotification(`Selected program: ${name} (placeholder – would load program workouts)`);
}

// ---------- ACHIEVEMENTS ----------
function loadAchievements() {
    const container = document.querySelector('#achievements-section .badges-container');
    if (!container) return;
    let html = '';
    achievements.forEach(a => {
        html += `
            <div class="badge-item ${a.check(workoutData) ? 'unlocked' : ''}">
                <i class="fas ${a.icon}"></i>
                <p>${a.name}</p>
            </div>
        `;
    });
    container.innerHTML = html;
}

// ---------- RECOVERY INSIGHTS ----------
function loadRecoveryInsights() {
    const container = document.querySelector('#recovery-insights-section .insights-container');
    if (!container) return;
    const ready = getReadyMuscles().slice(0,3).join(', ') || 'none';
    container.innerHTML = `
        <div class="insight-card"><h3>Muscle Readiness</h3><p>Ready: ${ready}</p></div>
        <div class="insight-card"><h3>Fatigue Trend</h3><p>Moderate</p></div>
    `;
}

function getReadyMuscles() {
    const ready = [];
    getAllMuscleGroups().forEach(m => {
        const last = muscleLastTrained[m.name];
        if (last) {
            const needed = getEffectiveRestDays(m);
            const days = Math.floor((new Date() - new Date(last)) / (1000*60*60*24));
            if (days >= needed) ready.push(m.display);
        }
    });
    return ready;
}

// ---------- WARM-UP ----------
function loadWarmupRoutines() {
    const container = document.querySelector('#warmup-section .routines-container');
    if (!container) return;
    container.innerHTML = `
        <div class="routine-card"><h3>Warm-up</h3><ul class="routine-list"><li>Jumping jacks (2 min)</li><li>Arm circles</li><li>Leg swings</li><li>Dynamic stretches</li></ul></div>
        <div class="routine-card"><h3>Cool-down</h3><ul class="routine-list"><li>Quad stretch</li><li>Hamstring stretch</li><li>Chest stretch</li><li>Deep breathing</li></ul></div>
    `;
}

// ---------- INJURY ----------
function loadInjuryLog() {
    const container = document.querySelector('#injury-section .injury-container');
    if (!container) return;
    let html = `<button class="btn" onclick="showModal('injuryLogModal')">Log Injury/Pain</button>`;
    if (workoutData.injuries && workoutData.injuries.length > 0) {
        const last = workoutData.injuries[workoutData.injuries.length-1];
        html += `<div class="injury-warning"><strong>Last logged:</strong> ${last.note} (${new Date(last.date).toLocaleDateString()})</div>`;
    } else {
        html += `<div class="injury-warning"><strong>Active niggles:</strong> None logged.</div>`;
    }
    container.innerHTML = html;
}

// ---------- SLEEP ----------
function loadSleepTracker() {
    const container = document.querySelector('#sleep-section .sleep-container');
    if (!container) return;
    const logs = workoutData.user.sleepLogs || [];
    const avg = logs.length ? (logs.reduce((s, l) => s + parseFloat(l.value), 0) / logs.length).toFixed(1) : 'N/A';
    const last = logs.length ? logs[logs.length-1].value : 'N/A';
    container.innerHTML = `
        <button class="btn" onclick="showModal('sleepLogModal')">Log Sleep</button>
        <div class="sleep-stats">
            <div class="sleep-stat-card"><strong>Avg Sleep</strong><br>${avg} h</div>
            <div class="sleep-stat-card"><strong>Last Night</strong><br>${last} h</div>
            <div class="sleep-stat-card"><strong>Quality</strong><br>Good</div>
        </div>
    `;
}

// ---------- TRAINING LOAD ----------
function loadTrainingLoad() {
    const container = document.querySelector('#load-section .load-container');
    if (!container) return;
    const acwr = document.getElementById('dash-acwr').innerText;
    container.innerHTML = `
        <div class="acwr-chart"><canvas id="acwrChart"></canvas></div>
        <div class="load-status">Acute:Chronic Workload Ratio: ${acwr} (Optimal range 0.8-1.3)</div>
    `;
    const ctx = document.getElementById('acwrChart')?.getContext('2d');
    if (ctx) {
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Week 1','Week 2','Week 3','Week 4'],
                datasets: [{
                    label: 'ACWR',
                    data: [0.9, 1.0, 1.1, parseFloat(acwr)],
                    borderColor: 'rgb(54,162,235)'
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }
}

// ---------- SUMMARIES ----------
function loadSummaries() {
    const container = document.querySelector('#summaries-section .summaries-container');
    if (!container) return;
    container.innerHTML = `
        <div class="summary-card"><span>Monthly Summary - ${new Date().toLocaleString('default',{month:'long',year:'numeric'})}</span><button class="btn" onclick="generateMonthlyPDF()">Download PDF</button></div>
        <div class="summary-card"><span>Yearly Summary - ${new Date().getFullYear()}</span><button class="btn" onclick="generateYearlyPDF()">Download PDF</button></div>
    `;
}
function generateMonthlyPDF() { showNotification("PDF generation placeholder – would create monthly report"); }
function generateYearlyPDF() { showNotification("PDF generation placeholder – would create yearly report"); }

// ---------- SOCIAL ----------
function loadSocialShare() {
    const container = document.querySelector('#social-section .share-container');
    if (!container) return;
    container.innerHTML = `
        <div class="share-buttons">
            <button class="share-btn twitter" onclick="shareWorkout('twitter')"><i class="fab fa-twitter"></i> Twitter</button>
            <button class="share-btn facebook" onclick="shareWorkout('facebook')"><i class="fab fa-facebook"></i> Facebook</button>
            <button class="share-btn copy" onclick="copyWorkoutSummary()"><i class="fas fa-copy"></i> Copy</button>
        </div>
        <button class="btn" onclick="exportWorkoutData()">📥 Export JSON (full backup)</button>
    `;
}
function shareWorkout(platform) {
    const text = `I've completed ${workoutData.workouts.length} workouts with a ${calculateStreak()} day streak!`;
    if (platform === 'twitter') {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
    } else if (platform === 'facebook') {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(text)}`, '_blank');
    } else {
        showNotification("Sharing placeholder");
    }
}
function copyWorkoutSummary() {
    const summary = `Workouts: ${workoutData.workouts.length}, Streak: ${calculateStreak()}, Total Volume: ${formatNumber(calculateTotalVolume())}`;
    navigator.clipboard?.writeText(summary).then(() => showNotification("Copied!"));
}

// ---------- COMPARISON ----------
function loadExerciseComparison() {
    const container = document.querySelector('#comparison-section .comparison-container');
    if (!container) return;
    const exercises = Object.entries(workoutData.exercises).filter(([_,d]) => d.history?.length >= 5).map(([id]) => id);
    if (exercises.length < 2) {
        container.innerHTML = '<p class="comparison-note">Not enough data (need at least 5 sessions per exercise).</p>';
        return;
    }
    container.innerHTML = `
        <div class="comparison-selectors">
            <select id="compareEx1">${exercises.map(id => `<option value="${id}">${id.replace(/_/g,' ')}</option>`).join('')}</select>
            <select id="compareEx2">${exercises.map(id => `<option value="${id}">${id.replace(/_/g,' ')}</option>`).join('')}</select>
            <button class="btn" onclick="updateComparison()">Compare</button>
        </div>
        <div class="comparison-chart"><canvas id="comparisonChart"></canvas></div>
    `;
}
function updateComparison() {
    const ex1 = document.getElementById('compareEx1')?.value;
    const ex2 = document.getElementById('compareEx2')?.value;
    if (!ex1 || !ex2) return;
    const data1 = workoutData.exercises[ex1]?.history || [];
    const data2 = workoutData.exercises[ex2]?.history || [];
    const ctx = document.getElementById('comparisonChart')?.getContext('2d');
    if (!ctx) return;
    if (charts.comparison) charts.comparison.destroy();
    const dates1 = data1.map(d => new Date(d.date).toLocaleDateString());
    const weights1 = data1.map(d => d.weight);
    const dates2 = data2.map(d => new Date(d.date).toLocaleDateString());
    const weights2 = data2.map(d => d.weight);
    charts.comparison = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [...new Set([...dates1, ...dates2])],
            datasets: [
                { label: ex1.replace(/_/g,' '), data: weights1, borderColor: 'blue', fill: false },
                { label: ex2.replace(/_/g,' '), data: weights2, borderColor: 'red', fill: false }
            ]
        },
        options: { responsive: true }
    });
    showNotification("Comparison updated");
}

// ---------- CALENDAR ----------
function loadWorkoutCalendar() {
    const container = document.querySelector('#calendar-section .calendar-container');
    if (!container) return;
    const daysInMonth = 30;
    let html = '<div class="calendar-grid">';
    for (let i=1; i<=daysInMonth; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (daysInMonth - i));
        const has = workoutData.workouts.some(w => new Date(w.date).toDateString() === date.toDateString());
        html += `<div class="calendar-day ${has?'workout':''}">${i}</div>`;
    }
    html += '</div>';
    container.innerHTML = html;
}

// ---------- EVENT / PROJECTIONS ----------
function loadEventGoals() {
    const container = document.querySelector('#event-section .event-container');
    if (!container) return;
    const score = calculateLongevityScore().score;
    const streak = calculateStreak();
    const growth = streak > 5 ? 42 : 15;
    container.innerHTML = `
        <div class="projection-box">
            <h3>2030 Projection</h3>
            <div class="projection-details">
                <div class="projection-stat"><span class="value">+${growth}%</span><br>Strength</div>
                <div class="projection-stat"><span class="value">${score}</span><br>Longevity</div>
            </div>
            <p>If you keep up the pace, you'll be ${growth}% stronger by 2030.</p>
        </div>
        <div class="focus-areas"><h4>Recommendations</h4><ul><li>Sleep: aim for 7-8h</li><li>Hydration: drink 3L</li><li>Neck strengthening 2x/week</li></ul></div>
    `;
}

// ---------- HEALTH LOGS ----------
function logSleep() {
    const hrs = document.getElementById('sleep-hours').value;
    if (!hrs) { alert("Please enter hours"); return; }
    if (!workoutData.user.sleepLogs) workoutData.user.sleepLogs = [];
    workoutData.user.sleepLogs.push({ date: new Date().toISOString(), value: hrs });
    dataChanged = true;
    saveToLocalStorage();
    showNotification("Sleep logged!");
    document.getElementById('sleep-hours').value = '';
}

function logWeight() {
    const w = document.getElementById('body-weight').value;
    if (!w) { alert("Please enter weight"); return; }
    if (!workoutData.user.weightHistory) workoutData.user.weightHistory = [];
    workoutData.user.weightHistory.push({ date: new Date().toISOString(), value: w });
    dataChanged = true;
    saveToLocalStorage();
    showNotification("Weight updated!");
    document.getElementById('body-weight').value = '';
}

function logInjury() {
    const pain = document.getElementById('injury-pain').value;
    const note = document.getElementById('injury-note').value;
    if (!note) { alert("Please enter a note"); return; }
    workoutData.injuries.push({ date: new Date().toISOString(), level: pain, note });
    dataChanged = true;
    saveToLocalStorage();
    showNotification("Health status updated.");
    document.getElementById('injury-note').value = '';
}

// ---------- SETTINGS ----------
function loadSettingsForm() {
    document.getElementById('settingsName').value = workoutData.user.name || '';
    document.getElementById('settingsBirthDate').value = workoutData.user.birthDate || '';
    document.getElementById('settingsGender').value = workoutData.user.gender || 'male';
    document.getElementById('settingsWeight').value = workoutData.user.weight || '';
    document.getElementById('settingsHeight').value = workoutData.user.height || '';
    document.getElementById('settingsExperience').value = workoutData.user.experience || 'intermediate';
    document.getElementById('settingsGoal').value = workoutData.user.goal || 'balanced';
    document.getElementById('settingsRestTime').value = workoutData.user.settings?.restTime || 90;
    document.getElementById('settingsProgression').value = (workoutData.user.settings?.progressionRate || 0.02) * 100;
    document.querySelectorAll('.workout-day').forEach(cb => {
        cb.checked = workoutData.user.settings?.workoutDays?.includes(cb.value) || false;
    });
}

function saveSettings() {
    workoutData.user.name = document.getElementById('settingsName').value;
    workoutData.user.birthDate = document.getElementById('settingsBirthDate').value;
    workoutData.user.gender = document.getElementById('settingsGender').value;
    workoutData.user.weight = parseFloat(document.getElementById('settingsWeight').value) || null;
    workoutData.user.height = parseFloat(document.getElementById('settingsHeight').value) || null;
    workoutData.user.experience = document.getElementById('settingsExperience').value;
    workoutData.user.goal = document.getElementById('settingsGoal').value;
    workoutData.user.settings = {
        workoutDays: Array.from(document.querySelectorAll('.workout-day:checked')).map(cb => cb.value),
        restTime: parseInt(document.getElementById('settingsRestTime').value) || 90,
        progressionRate: (parseFloat(document.getElementById('settingsProgression').value) || 2) / 100,
        theme: localStorage.getItem('workoutTheme') || 'blue',
        darkMode: localStorage.getItem('workoutDarkMode') === 'true'
    };
    dataChanged = true;
    saveToLocalStorage();
    updateNavigation();
    showNotification("Settings saved!");
    if (workoutData.user.gender === 'female') addPeriodButton();
}

function resetAllData() {
    if (confirm("Are you sure you want to reset ALL data? This cannot be undone!")) {
        localStorage.removeItem('workoutContinuityData');
        localStorage.removeItem('workoutTheme');
        localStorage.removeItem('workoutDarkMode');
        location.reload();
    }
}

// ---------- THEME FUNCTIONS ----------
function loadThemeSettings() {
    const savedTheme = localStorage.getItem('workoutTheme') || 'blue';
    const savedDarkMode = localStorage.getItem('workoutDarkMode') === 'true';
    setTheme(savedTheme);
    if (savedDarkMode) {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.getElementById('darkModeToggle').checked = true;
    }
}

function setTheme(themeName) {
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('workoutTheme', themeName);
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.classList.contains(`theme-${themeName}`)) btn.classList.add('active');
    });
    if (charts.dashboard) updateDashboardChart();
}

function toggleDarkMode() {
    const isDark = document.getElementById('darkModeToggle').checked;
    if (isDark) document.documentElement.setAttribute('data-theme', 'dark');
    else {
        const current = localStorage.getItem('workoutTheme') || 'blue';
        document.documentElement.setAttribute('data-theme', current);
    }
    localStorage.setItem('workoutDarkMode', isDark);
}

// ---------- IMPORT / EXPORT ----------
function importWorkoutData() { showModal('importModal'); }
function importExerciseData() { showModal('importExerciseModal'); }

function startNewProgram() {
    const emptyData = {
        user: { name:"", birthDate:"", gender:"male", weight:0, height:0, experience:"intermediate", goal:"balanced", created: new Date().toISOString(), settings:{workoutDays:[], restTime:60, progressionRate:0.02, theme:"blue", darkMode:false}, agingRisks:[], menstrual:{lastPeriodStart:null, cycleLength:28, symptoms:[]}, sleepLogs:[], weightHistory:[] },
        workouts: [], exercises: {}, goals: [], injuries: []
    };
    loadData(emptyData);
    showMainApp();
    showSection('settings');
    showNotification("Welcome! Set up your profile.");
}

function loadSampleData() {
    showLoading(true);
    const sample = {
        user: { name:"Alex", birthDate:"1990-01-01", gender:"male", weight:185, height:70, experience:"intermediate", goal:"balanced", created: new Date().toISOString(), settings:{workoutDays:["monday","wednesday","friday"], restTime:90, progressionRate:0.02, theme:"blue", darkMode:false}, agingRisks:[], menstrual:{lastPeriodStart:null, cycleLength:28, symptoms:[]}, sleepLogs:[{date:new Date().toISOString(), value:7.5}], weightHistory:[{date:new Date().toISOString(), value:185}] },
        workouts: [
            { id:"w1", date: new Date(Date.now()-7*86400000).toISOString(), type:"full_body_a", name:"Full Body A", exercises:[], summary:{totalVolume:8000, averageRPE:7, completedExercises:2} }
        ],
        exercises: {},
        goals: [{type:"Strength", target:"Squat 300", deadline:"2025-12-31", progress:75}],
        injuries: []
    };
    setTimeout(() => {
        loadData(sample);
        showMainApp();
        showLoading(false);
        showNotification("Sample data loaded!");
    }, 500);
}

function processImport() {
    const file = document.getElementById('workoutFile').files[0];
    const json = document.getElementById('workoutJson').value;
    showLoading(true);
    if (file) {
        const reader = new FileReader();
        reader.onload = e => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.lastExport && workoutData.lastExport && new Date(data.lastExport) > new Date(workoutData.lastExport)) {
                    if (confirm("Imported data is newer than current data. Replace?")) {
                        loadData(data);
                    }
                } else {
                    loadData(data);
                }
                showMainApp();
                updateDashboard();
                updateNavigation();
                showLoading(false);
                closeModal('importModal');
                showNotification("Data imported!");
            } catch(err) { 
                showLoading(false); 
                alert("Error parsing JSON"); 
            }
        };
        reader.readAsText(file);
    } else if (json) {
        try {
            const data = JSON.parse(json);
            if (data.lastExport && workoutData.lastExport && new Date(data.lastExport) > new Date(workoutData.lastExport)) {
                if (confirm("Imported data is newer than current data. Replace?")) {
                    loadData(data);
                }
            } else {
                loadData(data);
            }
            showMainApp();
            updateDashboard();
            updateNavigation();
            showLoading(false);
            closeModal('importModal');
            showNotification("Data imported!");
        } catch(err) { 
            showLoading(false); 
            alert("Error parsing JSON"); 
        }
    } else { 
        showLoading(false); 
        alert("Please upload a file or paste JSON"); 
    }
}

function processExerciseImport() {
    const file = document.getElementById('exerciseFile').files[0];
    const json = document.getElementById('exerciseJson').value;
    showLoading(true);
    if (file) {
        const reader = new FileReader();
        reader.onload = e => {
            try { Object.assign(workoutProgram.exercises, JSON.parse(e.target.result)); showNotification("Exercises imported!"); closeModal('importExerciseModal'); } catch(err) { alert("Error"); }
            showLoading(false);
        };
        reader.readAsText(file);
    } else if (json) {
        try { Object.assign(workoutProgram.exercises, JSON.parse(json)); showNotification("Exercises imported!"); closeModal('importExerciseModal'); } catch(err) { alert("Error"); }
        showLoading(false);
    } else { showLoading(false); alert("No data"); }
}

function importExerciseLibrary(data) {
    Object.assign(workoutProgram.exercises, data);
    saveToLocalStorage();
}

function exportExerciseData() {
    const dataStr = JSON.stringify(workoutProgram.exercises, null, 2);
    const uri = 'data:application/json;charset=utf-8,'+encodeURIComponent(dataStr);
    const link = document.createElement('a');
    link.href = uri;
    link.download = `exercise-library-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    showNotification("Exercise library exported!");
}

function exportWorkoutData() {
    const dataStr = JSON.stringify(workoutData, null, 2);
    const uri = 'data:application/json;charset=utf-8,'+encodeURIComponent(dataStr);
    const link = document.createElement('a');
    link.href = uri;
    link.download = `workout-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    dataChanged = false;
    updateBackupReminder();
    showNotification("Data exported!");
}

function loadData(data) {
    // Deep merge user object to preserve nested properties (settings, menstrual, etc.)
    const mergeDeep = (target, source) => {
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                if (!target[key]) target[key] = {};
                mergeDeep(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        }
        return target;
    };
    workoutData.user = mergeDeep(workoutData.user, data.user);
    workoutData.workouts = data.workouts || [];
    workoutData.exercises = data.exercises || {};
    workoutData.goals = data.goals || [];
    workoutData.injuries = data.injuries || [];
    workoutData.lastExport = data.lastExport || new Date().toISOString();
    if (data.user?.sleepLogs) workoutData.user.sleepLogs = data.user.sleepLogs;
    if (data.user?.weightHistory) workoutData.user.weightHistory = data.user.weightHistory;
    calculateMuscleLastTrained();
    saveToLocalStorage();
    // Clear any in‑progress workout to avoid stale references
    currentWorkout = null;
    if (workoutData.workouts.length === 0) generateNextWorkout();
}
// ---------- LOAD COMPENDIUM ----------
function loadCompendium() {
    const container = document.getElementById('compendium-container');
    if (!container) return;
    let html = '';
    exerciseCompendium.forEach(group => {
        html += `<h3 style="margin:30px 0 15px 0; color:var(--primary);">${group.group}</h3>`;
        html += '<table class="compendium-table">';
        html += '<thead><tr><th>Equipment</th><th>Exercise</th><th>Sets x Reps</th><th>Progressive Overload</th><th>Notes</th></tr></thead><tbody>';
        group.exercises.forEach(ex => {
            if (ex.equipment === "Phase/Gender Notes") {
                html += `<tr style="background:var(--gray-100);"><td colspan="5"><strong>${ex.name}</strong></td></tr>`;
            } else {
                html += `<tr><td>${ex.equipment}</td><td>${ex.name}</td><td>${ex.setsReps}</td><td>${ex.progression}</td><td>${ex.notes}</td></tr>`;
            }
        });
        html += '</tbody></table>';
    });
    container.innerHTML = html;
}

// ---------- LOAD FEATURE STATUS ----------
function loadFeatureStatus() {
    const container = document.getElementById('status-table-container');
    if (!container) return;
    let html = '<table class="status-table"><thead><tr><th>Area</th><th>Feature</th><th>Description</th><th>Status</th><th>Notes</th></tr></thead><tbody>';
    featureStatusData.forEach(item => {
        let statusClass = 'status-badge-missing';
        if (item.status === 'Implemented') statusClass = 'status-badge-implemented';
        else if (item.status === 'Partial') statusClass = 'status-badge-partial';
        html += `<tr>
            <td>${item.area}</td>
            <td><strong>${item.feature}</strong></td>
            <td>${item.description}</td>
            <td><span class="status-badge ${statusClass}">${item.status}</span></td>
            <td>${item.notes}</td>
        </tr>`;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
}

// ---------- NAVIGATION ----------
function showMainApp() {
    document.getElementById('importScreen').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    updateDashboard();
    updateLongevityScoreDisplay();
}

function showSection(sectionId) {
    // If we are currently in workout section and trying to leave, check dirty
    const currentActive = document.querySelector('.section.active');
    if (currentActive && currentActive.id === 'workout-section' && sectionId !== 'workout' && workoutDirty) {
        showUnsavedModal(
            () => {
                // Proceed with navigation
                performSectionChange(sectionId);
            },
            () => {
                // Stay, do nothing
            }
        );
        return;
    }
    // Special handling for workout section: open modal instead
    if (sectionId === 'workout') {
        openWorkoutModal();
    } else {
        performSectionChange(sectionId);
    }
}
function performSectionChange(sectionId) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    const sec = document.getElementById(sectionId + '-section');
    if (sec) sec.classList.add('active');
    else { console.warn("Section not found:", sectionId); return; }

    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const navItem = Array.from(document.querySelectorAll('.nav-item')).find(n => n.innerText.toLowerCase().includes(sectionId.replace('-',' ')));
    if (navItem) navItem.classList.add('active');

    if (window.innerWidth <= 1100) document.getElementById('navMenu').classList.remove('active');

    switch(sectionId) {
        case 'dashboard': updateDashboard(); break;
        case 'workout': renderExerciseDeck(); break;
        case 'history': updateWorkoutHistory(); break;
        case 'progress': updateProgressCharts(); break;
        case 'recovery': updateRecoverySection(); break;
        case 'exercise-library': loadExerciseLibrary(); break;
        case 'pr': loadPersonalRecords(); break;
        case 'goals': loadGoals(); break;
        case 'programs': loadPrograms(); break;
        case 'achievements': loadAchievements(); break;
        case 'recovery-insights': loadRecoveryInsights(); break;
        case 'warmup': loadWarmupRoutines(); break;
        case 'injury': loadInjuryLog(); break;
        case 'sleep': loadSleepTracker(); break;
        case 'load': loadTrainingLoad(); break;
        case 'summaries': loadSummaries(); break;
        case 'social': loadSocialShare(); break;
        case 'comparison': loadExerciseComparison(); break;
        case 'calendar': loadWorkoutCalendar(); break;
        case 'event': loadEventGoals(); break;
        case 'compendium': loadCompendium(); break;
        case 'status': loadFeatureStatus(); break;
        case 'settings': loadSettingsForm(); break;
    }
}

function toggleMobileMenu() {
    document.getElementById('navMenu').classList.toggle('active');
}

function updateNavigation() {
    const name = workoutData.user.name || 'User';
    document.getElementById('navUserName').innerText = name;
    document.getElementById('navUserAvatar').innerText = name.charAt(0).toUpperCase();
    const streak = calculateStreak();
    const exp = workoutData.user.experience || 'beginner';
    document.getElementById('navUserStats').innerText = `${exp.charAt(0).toUpperCase()+exp.slice(1)} • ${streak} Day Streak`;
    document.getElementById('welcomeName').innerText = `Welcome back, ${name}!`;
    document.getElementById('welcomeAvatar').innerText = name.charAt(0).toUpperCase();
    document.getElementById('welcomeLevel').innerText = exp.charAt(0).toUpperCase()+exp.slice(1);
    
    const lastExport = new Date(workoutData.lastExport || workoutData.user.created);
    const daysSinceExport = Math.floor((new Date() - lastExport) / (1000*60*60*24));
    const backupBtn = document.querySelector('[onclick="exportWorkoutData()"]');
    if (backupBtn && daysSinceExport > 7) {
        backupBtn.style.backgroundColor = 'var(--danger)';
        backupBtn.style.color = 'white';
        backupBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Export (Backup Old)';
    }
        // --- Unsaved indicator on Workout nav link ---
    const workoutNavItem = Array.from(document.querySelectorAll('.nav-item')).find(n => n.innerText.toLowerCase().includes('workout'));
    if (workoutNavItem) {
        if (workoutDirty) {
            workoutNavItem.classList.add('unsaved');
        } else {
            workoutNavItem.classList.remove('unsaved');
        }
    }
}

// ---------- EXERCISE SEARCH ----------
function googleSearch(query, type = 'web') {
    const encoded = encodeURIComponent(query + ' how to do');
    const url = type === 'images' 
        ? `https://www.google.com/search?q=${encoded}&tbm=isch`
        : `https://www.google.com/search?q=${encoded}`;
    window.open(url, '_blank');
}

function showExerciseSearch(query) {
    const modal = document.getElementById('exerciseSearchModal');
    const title = document.getElementById('exerciseSearchTitle');
    const body = document.getElementById('exerciseSearchBody');
    modal.classList.add('active');
    title.textContent = `Searching: ${query}`;
    body.innerHTML = '<div class="loading">🔎 Searching Wikipedia...</div>';

    fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query + ' exercise')}&format=json&origin=*`)
        .then(res => res.json())
        .then(searchData => {
            if (!searchData.query?.search?.length) {
                body.innerHTML = `
                    <div class="error">❌ No Wikipedia article found.</div>
                    <div class="search-fallback-buttons">
                        <button class="search-fallback-btn google" onclick="googleSearch('${query.replace(/'/g, "\\'")}', 'web')">🔍 Google Search</button>
                        <button class="search-fallback-btn images" onclick="googleSearch('${query.replace(/'/g, "\\'")}', 'images')">📷 Google Images</button>
                    </div>
                `;
                return;
            }
            const title = searchData.query.search[0].title;
            return fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`)
                .then(res => res.json())
                .then(summaryData => {
                    const extract = summaryData.extract || 'No summary available.';
                    const thumbnail = summaryData.thumbnail ? summaryData.thumbnail.source : null;
                    const pageUrl = summaryData.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`;
                    const suggestion = (title.toLowerCase() !== query.toLowerCase()) ? `<div class="search-suggestion">Showing: <strong>${title}</strong></div>` : '';
                    body.innerHTML = `
                        ${suggestion}
                        <div class="summary-content">
                            ${thumbnail ? `<img src="${thumbnail}" alt="${title}">` : ''}
                            <p>${extract}</p>
                            <p><a href="${pageUrl}" target="_blank">📖 Read full article on Wikipedia</a></p>
                        </div>
                        <div class="feedback-bar" style="margin-top:20px; border-top:1px solid var(--gray-200); padding-top:15px; display:flex; gap:10px; justify-content:space-between;">
                            <button class="like-btn" onclick="closeModal('exerciseSearchModal')"><span>👍</span> Helpful</button>
                            <div class="dislike-group" style="display:flex; gap:10px;">
                                <button class="dislike-btn" onclick="googleSearch('${query.replace(/'/g, "\\'")}', 'web')"><span>🔍</span> Web</button>
                                <button class="dislike-btn" onclick="googleSearch('${query.replace(/'/g, "\\'")}', 'images')"><span>📷</span> Images</button>
                            </div>
                        </div>
                    `;
                });
        })
        .catch(() => {
            body.innerHTML = `
                <div class="error">⚠️ Error fetching data.</div>
                <div class="search-fallback-buttons">
                    <button class="search-fallback-btn google" onclick="googleSearch('${query.replace(/'/g, "\\'")}', 'web')">🔍 Google Search</button>
                    <button class="search-fallback-btn images" onclick="googleSearch('${query.replace(/'/g, "\\'")}', 'images')">📷 Google Images</button>
                </div>
            `;
        });
}

// ---------- PERIOD TRACKING ----------
function savePeriodData() {
    const lastDate = document.getElementById('lastPeriodDate').value;
    const cycleLen = document.getElementById('cycleLength').value;
    const symptoms = document.getElementById('periodSymptoms').value;
    if (lastDate) {
        workoutData.user.menstrual.lastPeriodStart = lastDate;
        workoutData.user.menstrual.cycleLength = parseInt(cycleLen) || 28;
        workoutData.user.menstrual.symptoms.push({ date: new Date().toISOString(), notes: symptoms });
        dataChanged = true;
        saveToLocalStorage();
        closeModal('periodModal');
        showNotification('Period data saved.');
    } else alert('Please enter a date.');
}

function addPeriodButton() {
    if (workoutData.user.gender === 'female') {
        // Could add a button somewhere if needed
    }
}


document.addEventListener('DOMContentLoaded', function() {
    const saved = localStorage.getItem('workoutContinuityData');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            Object.assign(workoutData, parsed);
            showMainApp();
        } catch(e) { console.error(e); }
    }
    const today = new Date();
    const eighteenYearsAgo = new Date(today.getFullYear() - 25, today.getMonth(), today.getDate());
    document.getElementById('settingsBirthDate').value = eighteenYearsAgo.toISOString().split('T')[0];
    loadThemeSettings();
    initializeMuscleTracking();
    if (workoutData.workouts.length > 0) calculateMuscleLastTrained();

    // --- Check for draft ---
    // --- Check for draft ---
    if (restoreDraft()) {
        // Ask user if they want to restore
        showUnsavedModal(
            () => {
                // User wants to restore
                showSection('workout');
            },
            () => {
                // User discards draft
                clearDraft();
                dirtyExercises.clear();
                workoutDirty = false;
                updateNavigation();
                if (!currentWorkout && workoutData.workouts.length === 0) {
                    generateNextWorkout().catch(err => console.error(err));
                }
            }
        );
    } else {
        if (!currentWorkout && workoutData.workouts.length === 0) generateNextWorkout();
    }

    updateNavigation();
    addPeriodButton();
    window.addEventListener('resize', () => {
        const deck = document.getElementById('exercise-deck');
        if (deck) deck.style.overflowX = 'auto'; // forces reflow if needed
    });
});
// Keyboard navigation for the workout modal (arrow up/down)
document.addEventListener('keydown', (e) => {
    const modal = document.getElementById('workoutModal');
    if (!modal || !modal.classList.contains('active')) return;

    if (e.key === 'ArrowDown') {
        e.preventDefault();
        nextModalCard();
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        prevModalCard();
    }
});
    // Set up swipe listeners
    setupModalSwipeListener();
