// ==================== COMPLETE JAVASCRIPT – WORKOUT CONTINUITY SYSTEM ULTIMATE EDITION ====================
// This script includes all functionality from previous rounds plus new compendium, status features,
// and the following enhancements:
// - Systemic Fatigue Factor (workouts in last 7 days affect rest days)
// - Tendon Guard (rolling RPE average triggers deload warning)
// - Calves only appear in legs_day (fixed)
// - "Start Today" button on dashboard
// - Mobile-first navigation categories

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
// This replaces the previous placeholder ultimateExerciseLibrary.
// Organized by muscle group as per the provided tables.

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
            // Lats
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
            // Rhomboids & Rear Delts
            { equipment: "Cable", name: "Face Pull", setsReps: "3×15–20", progression: "Increase weight", notes: "External rotation at end" },
            { equipment: "Dumbbell", name: "Bent‑Over Reverse Fly", setsReps: "3×15", progression: "Heavier DB", notes: "Seated or standing" },
            { equipment: "Machine", name: "Reverse Pec Deck", setsReps: "3×15", progression: "Add weight", notes: "Elbows slightly bent" },
            { equipment: "Band", name: "Band Pull‑Apart", setsReps: "3×20", progression: "Thicker band", notes: "Vary grip width" },
            { equipment: "Bodyweight", name: "YTWL (lying on incline)", setsReps: "3×10 each", progression: "Hold longer", notes: "Use light weights" },
            // Traps
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
            // Anterior Delts
            { equipment: "Barbell", name: "Overhead Press (strict)", setsReps: "3–5×5", progression: "Add 2.5 lbs", notes: "Seated or standing" },
            { equipment: "Barbell", name: "Push Press", setsReps: "3×6–10", progression: "Add 5 lbs", notes: "Use legs" },
            { equipment: "Dumbbell", name: "Seated Dumbbell Press", setsReps: "3×8–12", progression: "Heavier DB", notes: "Neutral grip" },
            { equipment: "Dumbbell", name: "Arnold Press", setsReps: "3×8–12", progression: "Heavier DB", notes: "Rotational" },
            { equipment: "Machine", name: "Shoulder Press Machine", setsReps: "3×10–15", progression: "Add weight", notes: "Various angles" },
            { equipment: "Cable", name: "Cable Front Raise", setsReps: "3×12–15", progression: "Increase weight", notes: "Single or double" },
            { equipment: "Bodyweight", name: "Pike Push‑up", setsReps: "3×10–15", progression: "Add reps", notes: "Against wall or free" },
            { equipment: "Kettlebell", name: "Kettlebell Press", setsReps: "3×10 each", progression: "Heavier bell", notes: "Single or double" },
            { equipment: "Specialty", name: "Landmine Press", setsReps: "3×10–12", progression: "Add weight", notes: "Single arm, rotational" },
            // Lateral Delts
            { equipment: "Dumbbell", name: "Dumbbell Lateral Raise", setsReps: "3×15–20", progression: "Add 2.5 lbs", notes: "Seated, standing, leaning" },
            { equipment: "Cable", name: "Cable Lateral Raise", setsReps: "3×15", progression: "Increase weight", notes: "Low pulley" },
            { equipment: "Machine", name: "Lateral Raise Machine", setsReps: "3×15", progression: "Add weight", notes: "Leaning or upright" },
            { equipment: "Cable", name: "One‑Arm Cable Lateral Raise", setsReps: "3×15 each", progression: "Increase weight", notes: "Handle attached" },
            { equipment: "Bodyweight", name: "Side Lying Raise (no weight)", setsReps: "3×20", progression: "Add reps", notes: "" },
            { equipment: "Band", name: "Banded Lateral Walk", setsReps: "3×20 steps", progression: "Thicker band", notes: "Monster walks" },
            // Posterior Delts (see also Rhomboids)
            { equipment: "Dumbbell", name: "Bent‑Over Lateral Raise", setsReps: "3×15", progression: "Heavier DB", notes: "Seated or standing" },
            { equipment: "Cable", name: "Cable Face Pull (low pulley)", setsReps: "3×15", progression: "Increase weight", notes: "High pulley for different angle" },
            { equipment: "Machine", name: "Reverse Pec Deck", setsReps: "3×15", progression: "Add weight", notes: "" },
            { equipment: "Band", name: "Band External Rotation", setsReps: "3×15 each", progression: "Thicker band", notes: "Elbow at 90°" }
        ]
    },
    {
        group: "Arms",
        exercises: [
            // Biceps
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
            // Triceps
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
            // Forearms
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
            // map muscles roughly – we'll need to assign appropriate muscle groups
            // For simplicity, assign to the group name converted to muscle ID
            let muscleId = group.group.toLowerCase().replace(/[^a-z]+/g, '_');
            if (muscleId === 'back_lats_rhomboids_traps_rear_delts') muscleId = 'back'; // simplify
            if (muscleId === 'shoulders_deltoids') muscleId = 'shoulders';
            if (muscleId === 'arms') muscleId = 'biceps'; // rough
            if (muscleId === 'core_abdominals_&_obliques') muscleId = 'core';
            if (muscleId === 'hips_&_adductors_abductors') muscleId = 'adductors';

            ultimateExerciseLibrary[id] = {
                name: ex.name,
                muscles: [muscleId],
                equipment: ex.equipment,
                defaultSets: parseInt(ex.setsReps) || 3,
                defaultReps: ex.setsReps.replace(/^\d+–?\d*×/, '') || '8-12',
                progression: ex.progression,
                instructions: [ex.notes] // use notes as instruction
            };
        }
    });
});

// ---------- WORKOUT PROGRAM SPLITS ----------
// Note: "calves" is only in legs_day focus
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
let notificationTimeout;

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
}

function showNotification(message, type = "success") {
    const notification = document.getElementById('notification');
    const text = document.getElementById('notificationText');
    text.textContent = message;
    const colors = { success: '#10b981', warning: '#f59e0b', error: '#ef4444', info: '#06b6d4' };
    const icons = { success: 'fa-check-circle', warning: 'fa-exclamation-triangle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
    notification.style.borderLeftColor = colors[type] || colors.success;
    notification.querySelector('i').className = `fas ${icons[type] || icons.success}`;
    
    // Clear any existing timeout to prevent overlapping
    if (notificationTimeout) clearTimeout(notificationTimeout);
    
    notification.classList.add('show');
    notificationTimeout = setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
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
    // Count workouts in last 7 days
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    const recentWorkouts = workoutData.workouts.filter(w => new Date(w.date) > cutoff).length;
    // Quadratic penalty: more workouts = longer recovery needed
    // Base 1.0, then increase by 0.05 * (workouts^1.5)
    let fatigue = 1.0 + 0.05 * Math.pow(recentWorkouts, 1.5);
    return Math.min(fatigue, 2.0); // cap at 2x rest days
}

function getEffectiveRestDays(muscle) {
    const base = muscle.restDays || 2;
    const fatigueMult = getSystemicFatigueMultiplier();
    return Math.round(base * fatigueMult);
}

// Override daysSinceTrained to use effective rest days for status
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
    // Find exercises that target this muscle group (rough mapping)
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
    
    // Apply deload if rolling RPE > 8.5
    const avgRPE = getRollingRPEAverage();
    const deloadMultiplier = (avgRPE !== null && avgRPE > 8.5) ? 0.8 : 1.0;
    
    if (history && history.bestWeight) {
        const last = history.bestWeight;
        const prog = workoutData.user.settings.progressionRate || 0.02;
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
function generateNextWorkout() {
    const splits = workoutProgram.splits;
    const lastWorkout = workoutData.workouts[workoutData.workouts.length - 1];
    let split;
    if (lastWorkout) {
        const lastIndex = splits.findIndex(s => s.id === lastWorkout.type);
        if (lastIndex !== -1) {
            const nextIndex = (lastIndex + 1) % splits.length;
            split = splits[nextIndex];
        } else split = splits[0];
    } else split = splits[0];

    const phase = getCurrentCyclePhase();
    const mult = getPhaseMultiplier(phase);

    currentWorkout = {
        id: `workout_${Date.now()}`,
        date: new Date().toISOString(),
        type: split.id,
        name: split.name,
        exercises: []
    };

    // Removed "calves" from default additions – they only appear in legs_day focus now
    const allMuscles = [...split.focus, "core", "forearms"]; // calves removed
    [...new Set(allMuscles)].forEach(mg => {
        const ex = generateExerciseFromLibrary(mg);
        if (ex) currentWorkout.exercises.push(generateExercisePrescription(ex, mult));
    });

    updateTodaysWorkout();
    updateDashboard();
    showNotification(`Workout generated: ${currentWorkout.name}`);
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
    // Update stats
    document.getElementById('statWorkouts').innerText = workoutData.workouts.length;
    const streak = calculateStreak();
    document.getElementById('statStreak').innerText = streak;
    document.getElementById('statVolume').innerText = formatNumber(calculateTotalVolume());
    const progress = Math.min(100, Math.floor((workoutData.workouts.length / 20) * 100));
    document.getElementById('statProgress').innerText = progress + '%';

    // ACWR
    const last7 = calculateVolumeDays(7);
    const last28 = calculateVolumeDays(28) / 4;
    const acwr = last28 > 0 ? (last7 / last28).toFixed(1) : "1.0";
    document.getElementById('dash-acwr').innerText = acwr;

    // Longevity score
    document.getElementById('longevityScore').innerText = calculateLongevityScore().score;

    // Tendon Guard / Injury Risk
    document.getElementById('risk-val').innerText = getInjuryRiskFactor();

    // Calendar, PRs, projection, badges
    renderActivityCalendar();
    renderDashPRs();
    updateProjection();
    renderBadges();

    // Update navigation
    updateNavigation();

    // Dashboard chart
    updateDashboardChart();

    // Next workout info
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

    // Update longevity score display
    updateLongevityScoreDisplay();
}

function renderActivityCalendar() {
    const cal = document.getElementById('activity-calendar');
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
    const prs = Object.entries(workoutData.exercises)
        .filter(([_, data]) => data.bestWeight)
        .sort((a,b) => b[1].bestWeight - a[1].bestWeight)
        .slice(0, 5);
    list.innerHTML = prs.map(([id, data]) => `
        <div style="display:flex; justify-content:space-between; padding:5px 0; border-bottom:1px solid #eee">
            <span>${id.replace(/_/g,' ')}</span><strong>${data.bestWeight} lbs</strong>
        </div>
    `).join('') || '<p style="color:#aaa">No records yet.</p>';
}

function updateProjection() {
    const streak = calculateStreak();
    const workouts = workoutData.workouts.length;
    const forecast = document.getElementById('strength-forecast');
    const note = document.getElementById('forecast-note');
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
    grid.innerHTML = achievements.map(a => `
        <div class="badge-item ${a.check(workoutData) ? 'unlocked' : ''}" title="${a.desc}">
            <i class="fas ${a.icon} badge-icon"></i>
            <div style="font-size:0.65rem; font-weight:700;">${a.name}</div>
        </div>
    `).join('');
}

function updateDashboardChart() {
    const ctx = document.getElementById('dashboardChart').getContext('2d');
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
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } }
        }
    });
}

// ---------- WORKOUT SECTION ----------
function updateTodaysWorkout() {
    const container = document.getElementById('exerciseList');
    container.innerHTML = '';
    if (!currentWorkout || !currentWorkout.exercises) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-dumbbell"></i><h3>No workout scheduled</h3><p>Generate a workout first.</p></div>';
        return;
    }
    currentWorkout.exercises.forEach((exercise, index) => {
        container.appendChild(createExerciseElement(exercise, index));
    });
    document.getElementById('workoutType').innerText = currentWorkout.name;
    const split = workoutProgram.splits.find(s => s.id === currentWorkout.type);
    document.getElementById('workoutFocus').innerText = split ? split.focus.join(', ') : 'Strength';
    document.getElementById('workoutTime').innerText = '60 min';
    document.getElementById('workoutIntensity').innerText = 'Moderate';
}

function createExerciseElement(exercise, index) {
    const div = document.createElement('div');
    div.className = 'exercise-item';
    div.id = `exercise_${index}`;
    const muscles = exercise.muscleGroup.map(m => `<span class="muscle-tag">${getMuscleDisplayName(m)}</span>`).join('');
    const repsInfo = typeof exercise.prescribed.reps === 'string' ? exercise.prescribed.reps : `${exercise.prescribed.reps.min}-${exercise.prescribed.reps.max}`;
    const instructions = exercise.instructions || ["No instructions available."];
    const instructionsList = instructions.map(i => `<li>${i}</li>`).join('');
    const safeName = exercise.name.replace(/'/g, "\\'");

    div.innerHTML = `
        <div class="exercise-header" onclick="togglePerformanceLogging(${index})">
            <div>
                <div class="exercise-title">
                    <i class="fas fa-dumbbell"></i> ${exercise.name}
                    <span class="search-icon" onclick="event.stopPropagation(); showExerciseSearch('${safeName}');" title="Search Wikipedia/Google" style="cursor:pointer; margin-left:8px; color:var(--info);">
                        <i class="fas fa-search"></i>
                    </span>
                </div>
                <div class="exercise-muscles">${muscles}</div>
            </div>
            <div><i class="fas fa-chevron-down"></i></div>
        </div>
        <div class="exercise-controls">
            <button class="exercise-btn show-instructions-btn" onclick="toggleInstructions(${index})">
                <i class="fas fa-info-circle"></i> Show Instructions
            </button>
        </div>
        <div class="exercise-instructions" id="instructions_${index}">
            <div class="instructions-title"><i class="fas fa-graduation-cap"></i> How to Perform</div>
            <div class="instructions-content"><ul>${instructionsList}</ul></div>
        </div>
        <div class="exercise-prescription">
            <div class="prescription-title"><i class="fas fa-bullseye"></i> Today's Prescription</div>
            <div style="display:flex; justify-content:space-between; flex-wrap:wrap;">
                <div>
                    <div style="font-size:1.5rem; font-weight:800; color:var(--accent);">${exercise.prescribed.weight || '?'} lbs</div>
                    <div>${exercise.prescribed.sets} sets × ${repsInfo}</div>
                </div>
                <div style="font-size:0.9rem; color:var(--gray-600); max-width:200px; margin-top:10px;">${exercise.progressionNotes}</div>
            </div>
            <div class="sets-reps-grid" id="setsGrid_${index}"></div>
        </div>
        <div class="performance-logging" id="performance_${index}">
            <h4 style="margin-bottom:15px;"><i class="fas fa-edit"></i> Log Performance</h4>
            <div class="performance-form" id="performanceForm_${index}"></div>
            <div class="btn-group">
                <button class="btn btn-success" onclick="saveExercisePerformance(${index})"><i class="fas fa-save"></i> Save</button>
                <button class="btn" onclick="skipExercise(${index})"><i class="fas fa-forward"></i> Skip</button>
            </div>
        </div>
    `;
    setTimeout(() => {
        updateSetsGrid(index, exercise);
        createPerformanceForm(index, exercise);
    }, 10);
    return div;
}

function toggleInstructions(index) {
    const inst = document.getElementById(`instructions_${index}`);
    inst.classList.toggle('active');
}

function togglePerformanceLogging(index) {
    const logging = document.getElementById(`performance_${index}`);
    logging.classList.toggle('active');
}

function updateSetsGrid(index, exercise) {
    const grid = document.getElementById(`setsGrid_${index}`);
    if (!grid) return;
    grid.innerHTML = '';
    for (let i = 0; i < exercise.prescribed.sets; i++) {
        grid.innerHTML += `
            <div class="set-item">
                <div class="set-number">Set ${i+1}</div>
                <div style="margin-top:5px;">${exercise.prescribed.reps} reps</div>
            </div>
        `;
    }
}

function createPerformanceForm(index, exercise) {
    const form = document.getElementById(`performanceForm_${index}`);
    if (!form) return;
    let html = `
        <div class="form-group">
            <label>Weight Used (lbs)</label>
            <input type="number" id="weight_${index}" value="${exercise.prescribed.weight || ''}">
        </div>
        <div class="form-group">
            <label>Sets Completed</label>
            <select id="sets_${index}">
                ${Array.from({length: exercise.prescribed.sets+1}, (_, i) => `<option value="${i}" ${i===exercise.prescribed.sets?'selected':''}>${i}</option>`).join('')}
            </select>
        </div>
    `;
    for (let i = 0; i < exercise.prescribed.sets; i++) {
        html += `
            <div class="form-group" id="repsGroup_${index}_${i}">
                <label>Set ${i+1} Reps</label>
                <input type="number" id="reps_${index}_${i}" placeholder="Actual reps">
            </div>
        `;
    }
    html += `
        <div class="form-group">
            <label>RPE (1-10)</label>
            <select id="rpe_${index}">
                <option value="">Select RPE</option>
                ${Array.from({length:10}, (_, i) => `<option value="${10-i}">${10-i} - ${getRpeDescription(10-i)}</option>`).join('')}
            </select>
        </div>
        <div class="form-group">
            <label>Notes</label>
            <textarea id="notes_${index}" placeholder="How did it feel?"></textarea>
        </div>
    `;
    form.innerHTML = html;
}

function getRpeDescription(rpe) {
    const desc = {10:"Max effort",9:"Very hard",8:"Hard",7:"Moderately hard",6:"Moderate",5:"Somewhat easy",4:"Easy",3:"Very easy",2:"Easy",1:"Very easy"};
    return desc[rpe] || "";
}

function saveExercisePerformance(index) {
    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(50);
    
    const exercise = currentWorkout.exercises[index];
    const weight = parseFloat(document.getElementById(`weight_${index}`).value);
    const sets = parseInt(document.getElementById(`sets_${index}`).value);
    const rpe = parseInt(document.getElementById(`rpe_${index}`).value);
    const notes = document.getElementById(`notes_${index}`).value;
    const reps = [];
    for (let i = 0; i < sets; i++) {
        const repInput = document.getElementById(`reps_${index}_${i}`);
        if (repInput && repInput.value) reps.push(parseInt(repInput.value));
    }
    if (!weight || sets === 0) {
        alert("Please enter weight and at least one set");
        return;
    }
    exercise.actual = {
        weight, sets, reps, rpe, notes,
        completed: new Date().toISOString()
    };
    updateExerciseHistory(exercise);
    togglePerformanceLogging(index);
    showNotification(`${exercise.name} saved!`);
}

function skipExercise(index) {
    const exercise = currentWorkout.exercises[index];
    exercise.skipped = true;
    exercise.actual = { skipped: true, notes: document.getElementById(`notes_${index}`)?.value || "Skipped" };
    togglePerformanceLogging(index);
    showNotification(`${exercise.name} skipped`);
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

function completeWorkout() {
    if (!currentWorkout) { alert("No workout to complete"); return; }
    const unlogged = currentWorkout.exercises.filter(ex => !ex.actual && !ex.skipped);
    if (unlogged.length > 0 && !confirm(`You have ${unlogged.length} unlogged exercises. Complete anyway?`)) return;
    workoutData.workouts.push(currentWorkout);
    currentWorkout.summary = {
        totalVolume: calculateWorkoutVolume(currentWorkout),
        averageRPE: calculateAverageRPE(currentWorkout),
        completedExercises: currentWorkout.exercises.filter(ex => ex.actual && !ex.skipped).length
    };
    saveToLocalStorage();
    generateNextWorkout();
    showNotification(`Workout completed!`);
    showSection('dashboard');
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

// ---------- RECOVERY SECTION (updated with systemic fatigue) ----------
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
    Object.keys(scores).forEach(k => { total += scores[k] * (weights[k]||0.1); totalW += (weights[k]||0.1); });
    const final = Math.round((total / totalW) * 100);
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
    document.getElementById('longevityScore').innerText = score;
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
    updateTodaysWorkout();
    showSection('workout');
    showNotification("Longevity workout generated!");
}

// ---------- EXERCISE LIBRARY ----------
function loadExerciseLibrary() {
    const container = document.querySelector('#exercise-library-section .exercise-library-container');
    if (!container) return;
    let html = '';
    Object.entries(ultimateExerciseLibrary).forEach(([id, ex]) => {
        const pr = workoutData.exercises[id]?.bestWeight;
        html += `
            <div class="exercise-card" onclick="showExerciseSearch('${ex.name.replace(/'/g,"\\'")}')">
                <h3>${ex.name}</h3>
                <div class="muscle-tags">${ex.muscles.map(m => `<span class="muscle-tag">${getMuscleDisplayName(m)}</span>`).join('')}</div>
                <p><small>${ex.equipment}</small></p>
                ${pr ? `<span class="pr-badge">PR: ${pr} lbs</span>` : ''}
            </div>
        `;
    });
    container.innerHTML = html;
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
    const growth = streak > 5 ? 42 : 15; // placeholder
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
    saveToLocalStorage();
    showNotification("Sleep logged!");
    document.getElementById('sleep-hours').value = '';
}

function logWeight() {
    const w = document.getElementById('body-weight').value;
    if (!w) { alert("Please enter weight"); return; }
    if (!workoutData.user.weightHistory) workoutData.user.weightHistory = [];
    workoutData.user.weightHistory.push({ date: new Date().toISOString(), value: w });
    saveToLocalStorage();
    showNotification("Weight updated!");
    document.getElementById('body-weight').value = '';
}

function logInjury() {
    const pain = document.getElementById('injury-pain').value;
    const note = document.getElementById('injury-note').value;
    if (!note) { alert("Please enter a note"); return; }
    workoutData.injuries.push({ date: new Date().toISOString(), level: pain, note });
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
                // Timestamp conflict resolution
                if (data.lastExport && workoutData.lastExport && new Date(data.lastExport) > new Date(workoutData.lastExport)) {
                    if (confirm("Imported data is newer than current data. Replace?")) {
                        loadData(data);
                    }
                } else {
                    loadData(data);
                }
                showMainApp();
                showLoading(false);
                closeModal('importModal');
                showNotification("Data imported!");
            } catch(err) { showLoading(false); alert("Error parsing JSON"); }
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
            showLoading(false);
            closeModal('importModal');
            showNotification("Data imported!");
        } catch(err) { showLoading(false); alert("Error parsing JSON"); }
    } else { showLoading(false); alert("Please upload a file or paste JSON"); }
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
    showNotification("Data exported!");
}

function loadData(data) {
    workoutData.user = { ...workoutData.user, ...data.user };
    workoutData.workouts = data.workouts || [];
    workoutData.exercises = data.exercises || {};
    workoutData.goals = data.goals || [];
    workoutData.injuries = data.injuries || [];
    workoutData.lastExport = data.lastExport || new Date().toISOString();
    if (data.user?.sleepLogs) workoutData.user.sleepLogs = data.user.sleepLogs;
    if (data.user?.weightHistory) workoutData.user.weightHistory = data.user.weightHistory;
    calculateMuscleLastTrained();
    saveToLocalStorage();
    if (!currentWorkout && workoutData.workouts.length === 0) generateNextWorkout();
}

// ---------- NEW: LOAD COMPENDIUM ----------
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

// ---------- NEW: LOAD FEATURE STATUS ----------
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
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    const sec = document.getElementById(sectionId + '-section');
    if (sec) sec.classList.add('active');
    else { console.warn("Section not found:", sectionId); return; }

    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const navItem = Array.from(document.querySelectorAll('.nav-item')).find(n => n.innerText.toLowerCase().includes(sectionId.replace('-',' ')));
    if (navItem) navItem.classList.add('active');

    if (window.innerWidth <= 1100) document.getElementById('navMenu').classList.remove('active');

    // Load section-specific data
    switch(sectionId) {
        case 'dashboard': updateDashboard(); break;
        case 'workout': updateTodaysWorkout(); break;
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
        // health section uses simple HTML, no load needed
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
    document.getElementById('welcomeStreak').innerText = streak;
    document.getElementById('welcomeLevel').innerText = exp.charAt(0).toUpperCase()+exp.slice(1);
    
    // Backup reminder (red if lastExport > 7 days)
    const lastExport = new Date(workoutData.lastExport || workoutData.user.created);
    const daysSinceExport = Math.floor((new Date() - lastExport) / (1000*60*60*24));
    const backupBtn = document.querySelector('[onclick="exportWorkoutData()"]');
    if (backupBtn && daysSinceExport > 7) {
        backupBtn.style.backgroundColor = 'var(--danger)';
        backupBtn.style.color = 'white';
        backupBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Export (Backup Old)';
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

// ---------- INITIALIZATION ----------
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
    if (!currentWorkout && workoutData.workouts.length === 0) generateNextWorkout();
    updateNavigation();
    addPeriodButton();
});

// Auto-add close buttons to all modals
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.modal').forEach(modal => {
        const modalContent = modal.querySelector('.modal-content');
        if (!modalContent) return;
        if (!modalContent.querySelector('.modal-close')) {
            const closeBtn = document.createElement('span');
            closeBtn.className = 'modal-close';
            closeBtn.innerHTML = '&times;';
            closeBtn.setAttribute('onclick', `closeModal('${modal.id}')`);
            modalContent.insertBefore(closeBtn, modalContent.firstChild);
        }
        modal.addEventListener('click', function(e) {
            if (e.target === this) this.classList.remove('active');
        });
    });
});
