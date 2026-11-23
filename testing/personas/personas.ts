// SYNTHETIC personas for scenario testing of the Multiple choice option (Nov 2026). AI-drafted, not real people and
// not user research: they check whether the question flow and rules send each kind of situation to the right course.
// No names or ethnicities, so no persona stands in for a real person or community.
//
// Each persona has the course they should be offered (`course`), a one-line profile, and the answers they'd most
// likely pick from the screen wording, written from the profile (not worked back from the rules). `risk` is how they'd
// answer the risk questions if asked: [hurting yourself, ending your life]. Most say No; about 2 in 10 don't.
//
// Option ids (src/multiple-choice/questions.ts):
//   concerns: worry, low_mood, sleep, coping, perinatal, aod
//   worry_detail: worry, panic, social, health, stress, ocd, not_sure
//   low_mood_detail: sad, interest, mixed, drained, not_sure | coping_detail: cope, calmer, present, skills, not_sure
//   life_stage: pregnant, baby | panic_done: yes, started, no | aod_stage: unsure, thinking, ready, relapse, building
//   risk answers: no, yes, unsure, prefer_not

export type Answers = Record<string, string | string[]>;

export interface Persona {
  id: string;
  /** The course this persona should be offered. */
  course: string;
  age: string;
  profile: string;
  answers: Answers;
  /** How they'd answer the risk questions if asked: [hurting yourself, ending your life]. */
  risk: string[];
}

const p = (id: string, course: string, age: string, profile: string, answers: Answers, risk = ["no"]): Persona => ({
  id,
  course,
  age,
  profile,
  answers,
  risk,
});

export const PERSONAS: Persona[] = [
  // Generalised Anxiety
  p("GA-01", "generalised_anxiety", "30s", "Worries constantly about work, family and money.", {
    concerns: ["worry"], worry_detail: ["worry"],
  }),
  p("GA-02", "generalised_anxiety", "40s", "On edge most days and can't switch off at night, so sleep is poor.", {
    concerns: ["worry", "sleep"], worry_detail: ["worry"],
  }),
  p("GA-03", "generalised_anxiety", "20s", "University student who worries about everything and feels pressure from exams.", {
    concerns: ["worry"], worry_detail: ["worry", "stress"],
  }),
  p("GA-04", "generalised_anxiety", "50s", "Persistent worry; their worrying thoughts race and feel hard to stop.", {
    concerns: ["worry"], worry_detail: ["worry", "ocd"],
  }),
  p("GA-05", "generalised_anxiety", "60s", "Recently retired, worries about adult children and feels a bit flat.", {
    concerns: ["worry", "low_mood"], worry_detail: ["worry"], low_mood_detail: ["mixed"],
  }),
  p("GA-06", "generalised_anxiety", "16–17", "Secondary school student, tense about school, friends and the future.", {
    concerns: ["worry"], worry_detail: ["worry", "social"],
  }),
  p("GA-07", "generalised_anxiety", "30s", "Parent who worries all the time but can't say what kind of worry it is.", {
    concerns: ["worry"], worry_detail: ["not_sure"],
  }),
  p("GA-08", "generalised_anxiety", "40s", "Worry wears them down and leaves them feeling low.", {
    concerns: ["worry", "low_mood"], worry_detail: ["worry"], low_mood_detail: ["mixed"],
  }, ["unsure", "no"]),
  p("GA-09", "generalised_anxiety", "20s", "Always tense and wants to feel calmer.", {
    concerns: ["worry", "coping"], worry_detail: ["worry"], coping_detail: ["calmer"],
  }),
  p("GA-10", "generalised_anxiety", "70s", "Worries about health, money and family, and feels on edge.", {
    concerns: ["worry"], worry_detail: ["worry"],
  }, ["unsure", "no"]),

  // Depression
  p("D-01", "depression", "30s", "Has felt sad and flat for several months.", {
    concerns: ["low_mood"], low_mood_detail: ["sad"],
  }),
  p("D-02", "depression", "40s", "Has stopped enjoying hobbies and seeing friends.", {
    concerns: ["low_mood"], low_mood_detail: ["interest"],
  }),
  p("D-03", "depression", "20s", "Sad, lost interest in things, sleeping badly.", {
    concerns: ["low_mood", "sleep"], low_mood_detail: ["sad", "interest"],
  }, ["yes", "yes"]),
  p("D-04", "depression", "50s", "Emotionally drained and not themselves since losing their job.", {
    concerns: ["low_mood"], low_mood_detail: ["drained"],
  }),
  p("D-05", "depression", "60s", "Feeling sad since their partner died last year.", {
    concerns: ["low_mood"], low_mood_detail: ["sad"],
  }, ["prefer_not", "no"]),
  p("D-06", "depression", "18–19", "Feels flat and unmotivated but isn't sure how to describe it.", {
    concerns: ["low_mood"], low_mood_detail: ["not_sure"],
  }),
  p("D-07", "depression", "30s", "Shift worker who feels drained and can't sleep well.", {
    concerns: ["low_mood", "sleep"], low_mood_detail: ["drained"],
  }),
  p("D-08", "depression", "40s", "Feeling low and wants to cope better day to day.", {
    concerns: ["low_mood", "coping"], low_mood_detail: ["sad"], coping_detail: ["cope"],
  }),
  p("D-09", "depression", "70s", "Lonely since moving into a smaller home and has lost interest in things.", {
    concerns: ["low_mood"], low_mood_detail: ["interest", "drained"],
  }),
  p("D-10", "depression", "20s", "Feeling low and drinking more to cope.", {
    concerns: ["low_mood", "aod"], low_mood_detail: ["sad"], aod_stage: "thinking",
  }, ["unsure", "unsure"]),

  // Mixed Depression and Anxiety
  p("M-01", "mixed", "30s", "Low and anxious most days.", {
    concerns: ["worry", "low_mood"], worry_detail: ["worry"], low_mood_detail: ["mixed"],
  }),
  p("M-02", "mixed", "40s", "Feels low as well as worried.", {
    concerns: ["low_mood"], low_mood_detail: ["mixed"],
  }),
  p("M-03", "mixed", "20s", "Feels down and nervous around people.", {
    concerns: ["worry", "low_mood"], worry_detail: ["social"], low_mood_detail: ["sad"],
  }),
  p("M-04", "mixed", "50s", "Low, worried and exhausted.", {
    concerns: ["low_mood"], low_mood_detail: ["mixed", "drained"],
  }, ["yes", "no"]),
  p("M-05", "mixed", "30s", "Everyday things feel like too much and they feel drained.", {
    concerns: ["worry", "low_mood"], worry_detail: ["stress"], low_mood_detail: ["drained"],
  }),
  p("M-06", "mixed", "60s", "Worried about their health and feeling sad.", {
    concerns: ["worry", "low_mood"], worry_detail: ["health"],
    low_mood_detail: ["sad"],
  }),
  p("M-07", "mixed", "20s", "Deaf NZSL user who feels low and on edge.", {
    concerns: ["worry", "low_mood"], worry_detail: ["worry"], low_mood_detail: ["mixed"],
  }),
  p("M-08", "mixed", "40s", "Knows they're struggling but not sure how to put it.", {
    concerns: ["low_mood"], low_mood_detail: ["not_sure"],
  }, ["unsure", "no"]),
  p("M-09", "mixed", "30s", "Anxious most days and also flat, but sees anxiety as the main problem, so only ticks that.", {
    concerns: ["worry"], worry_detail: ["worry"],
  }),
  p("M-10", "mixed", "50s", "Low and anxious but can't say what kind of anxiety.", {
    concerns: ["worry", "low_mood"], worry_detail: ["not_sure"], low_mood_detail: ["mixed"],
  }),

  // Social Anxiety
  p("S-01", "social_anxiety", "20s", "Dreads speaking up in meetings.", {
    concerns: ["worry"], worry_detail: ["social"],
  }),
  p("S-02", "social_anxiety", "16–17", "Avoids class presentations and worries what classmates think.", {
    concerns: ["worry"], worry_detail: ["social"],
  }),
  p("S-03", "social_anxiety", "30s", "Avoids parties and gatherings.", {
    concerns: ["worry"], worry_detail: ["social"],
  }),
  p("S-04", "social_anxiety", "40s", "Worries what others think of them and feels low about it.", {
    concerns: ["worry", "low_mood"], worry_detail: ["social"], low_mood_detail: ["sad"],
  }),
  p("S-05", "social_anxiety", "20s", "Gets panicky in social situations.", {
    concerns: ["worry"], worry_detail: ["social", "panic"],
    panic_done: "no",
  }),
  p("S-06", "social_anxiety", "30s", "New to town and too anxious to meet people.", {
    concerns: ["worry"], worry_detail: ["social"],
  }),
  p("S-07", "social_anxiety", "50s", "Fears being judged and replays conversations at night.", {
    concerns: ["worry"], worry_detail: ["social", "worry"],
  }),
  p("S-08", "social_anxiety", "20s", "Goes over social events in their mind for days afterwards.", {
    concerns: ["worry"], worry_detail: ["social", "ocd"],
  }),
  p("S-09", "social_anxiety", "15", "Under 16; nervous at school and with friends.", {
    concerns: ["worry"], worry_detail: ["social"],
  }),
  p("S-10", "social_anxiety", "30s", "Anxious, but unsure what kind of anxiety it is.", {
    concerns: ["worry"], worry_detail: ["not_sure"],
  }),

  // Overcoming Panic
  p("P-01", "panic", "20s", "Started having panic attacks recently.", {
    concerns: ["worry"], worry_detail: ["panic"], panic_done: "no",
  }),
  p("P-02", "panic", "30s", "Afraid of another attack, so avoids the supermarket.", {
    concerns: ["worry"], worry_detail: ["panic"], panic_done: "no",
  }),
  p("P-03", "panic", "40s", "Heart races during attacks; went to ED thinking it was a heart attack.", {
    concerns: ["worry"], worry_detail: ["panic", "health"],
    panic_done: "no",
  }),
  p("P-04", "panic", "50s", "Started Overcoming Panic but didn't finish it.", {
    concerns: ["worry"], worry_detail: ["panic"], panic_done: "started",
  }),
  p("P-05", "panic", "20s", "Sudden fear and feels low and worried.", {
    concerns: ["worry", "low_mood"], worry_detail: ["panic"], panic_done: "no",
    low_mood_detail: ["mixed"],
  }),
  p("P-06", "panic", "30s", "Panic attacks under work pressure.", {
    concerns: ["worry"], worry_detail: ["panic", "stress"],
    panic_done: "no",
  }),
  p("P-07", "panic", "60s", "Has had a few frightening episodes and isn't sure they're panic.", {
    concerns: ["worry"], worry_detail: ["panic"], panic_done: "no",
  }),
  p("P-08", "panic", "20s", "Pregnant and having panic attacks.", {
    concerns: ["worry", "perinatal"], worry_detail: ["panic"], life_stage: "pregnant",
    panic_done: "no",
  }, ["unsure", "no"]),
  p("P-09", "panic", "40s", "Struggles to breathe during attacks and fears the next one.", {
    concerns: ["worry"], worry_detail: ["panic"], panic_done: "no",
  }),
  p("P-10", "panic", "30s", "Panic attacks in crowded social places.", {
    concerns: ["worry"], worry_detail: ["panic", "social"],
    panic_done: "no",
  }),

  // Overcoming Panic – Next Steps
  p("PN-01", "panic_next_steps", "30s", "Finished Overcoming Panic; has had setbacks since.", {
    concerns: ["worry"], worry_detail: ["panic"], panic_done: "yes",
  }),
  p("PN-02", "panic_next_steps", "40s", "Finished the course; attacks have come back.", {
    concerns: ["worry"], worry_detail: ["panic"], panic_done: "yes",
  }),
  p("PN-03", "panic_next_steps", "20s", "Finished the course; now worries more generally too.", {
    concerns: ["worry"], worry_detail: ["panic", "worry"],
    panic_done: "yes",
  }),
  p("PN-04", "panic_next_steps", "50s", "Finished the course some time ago and isn't sure what's going on now.", {
    concerns: ["worry"], worry_detail: ["panic"], panic_done: "yes",
  }),
  p("PN-05", "panic_next_steps", "30s", "Finished the course; fears another attack and feels drained.", {
    concerns: ["worry", "low_mood"], worry_detail: ["panic"], panic_done: "yes",
    low_mood_detail: ["drained"],
  }),
  p("PN-06", "panic_next_steps", "20s", "Finished the course; attacks have eased but they now worry about them coming back, so they tick 'I worry a lot' rather than panic.", {
    concerns: ["worry"], worry_detail: ["worry"],
  }),
  p("PN-07", "panic_next_steps", "40s", "Finished the course; racing heart has returned.", {
    concerns: ["worry"], worry_detail: ["panic"], panic_done: "yes",
  }),
  p("PN-08", "panic_next_steps", "60s", "Finished the course; stress is setting off attacks again.", {
    concerns: ["worry"], worry_detail: ["panic", "stress"],
    panic_done: "yes",
  }),
  p("PN-09", "panic_next_steps", "30s", "Did most of the course but skipped the last lesson, so picks 'Started it but didn't finish'.", {
    concerns: ["worry"], worry_detail: ["panic"], panic_done: "started",
  }),
  p("PN-10", "panic_next_steps", "20s", "Finished the course; attacks are back and they feel very low.", {
    concerns: ["worry", "low_mood"], worry_detail: ["panic"], panic_done: "yes",
    low_mood_detail: ["sad"],
  }, ["yes", "yes"]),

  // Obsessive Compulsive Disorder
  p("O-01", "ocd", "30s", "Checks locks and appliances many times before leaving home.", {
    concerns: ["worry"], worry_detail: ["ocd"],
  }),
  p("O-02", "ocd", "20s", "Has upsetting images that pop into their head.", {
    concerns: ["worry"], worry_detail: ["ocd"],
  }),
  p("O-03", "ocd", "40s", "Washes hands repeatedly and fears contamination.", {
    concerns: ["worry"], worry_detail: ["ocd"],
  }),
  p("O-04", "ocd", "50s", "Goes over things in their mind and can't switch off.", {
    concerns: ["worry"], worry_detail: ["ocd", "worry"],
  }),
  p("O-05", "ocd", "20s", "Frightened by unwanted thoughts about harming someone they love.", {
    concerns: ["worry"], worry_detail: ["ocd"],
  }),
  p("O-06", "ocd", "30s", "New parent with frightening intrusive thoughts about the baby.", {
    concerns: ["worry", "perinatal"], worry_detail: ["ocd"], life_stage: "baby",
  }, ["unsure", "no"]),
  p("O-07", "ocd", "16–17", "Has to repeat routines until they feel 'just right'.", {
    concerns: ["worry"], worry_detail: ["ocd"],
  }),
  p("O-08", "ocd", "40s", "Checking rituals leave them drained.", {
    concerns: ["worry", "low_mood"], worry_detail: ["ocd"], low_mood_detail: ["drained"],
  }),
  p("O-09", "ocd", "60s", "Needs things arranged a certain way or feels very uneasy.", {
    concerns: ["worry"], worry_detail: ["ocd"],
  }),
  p("O-10", "ocd", "30s", "Doesn't think of the rituals as worry, so ticks only 'I'd like to cope better' and wants to feel calmer.", {
    concerns: ["coping"], coping_detail: ["calmer"],
  }),

  // Health Anxiety
  p("H-01", "health_anxiety", "40s", "Searches symptoms online for hours.", {
    concerns: ["worry"], worry_detail: ["health"],
  }),
  p("H-02", "health_anxiety", "30s", "Checks their body for lumps every day.", {
    concerns: ["worry"], worry_detail: ["health"],
  }),
  p("H-03", "health_anxiety", "50s", "Since a health scare, believes something is wrong.", {
    concerns: ["worry"], worry_detail: ["health"],
  }),
  p("H-04", "health_anxiety", "20s", "Seeks reassurance and gets a racing heart when worried about illness.", {
    concerns: ["worry"], worry_detail: ["health", "panic"],
    panic_done: "no",
  }),
  p("H-05", "health_anxiety", "60s", "Worries about their health and many other things.", {
    concerns: ["worry"], worry_detail: ["health", "worry"],
  }),
  p("H-06", "health_anxiety", "30s", "Pregnant and constantly worried about their own health.", {
    concerns: ["worry", "perinatal"], worry_detail: ["health"],
    life_stage: "pregnant",
  }),
  p("H-07", "health_anxiety", "40s", "Health worries, but not sure which description fits.", {
    concerns: ["worry"], worry_detail: ["health"],
  }),
  p("H-08", "health_anxiety", "70s", "Checks pulse and blood pressure many times a day.", {
    concerns: ["worry"], worry_detail: ["health"],
  }),
  p("H-09", "health_anxiety", "30s", "Needs reassurance and checks repeatedly.", {
    concerns: ["worry"], worry_detail: ["health", "ocd"],
  }),
  p("H-10", "health_anxiety", "20s", "Health worries and feels low.", {
    concerns: ["worry", "low_mood"], worry_detail: ["health"],
    low_mood_detail: ["mixed"],
  }),

  // Staying on Track
  p("ST-01", "staying_on_track", "30s", "Going through a tough time and wants general coping skills.", {
    concerns: ["coping"], coping_detail: ["cope"],
  }),
  p("ST-02", "staying_on_track", "40s", "Community worker wanting everyday wellbeing skills.", {
    concerns: ["coping"], coping_detail: ["skills"],
  }),
  p("ST-03", "staying_on_track", "50s", "Made redundant and wants to cope and build skills.", {
    concerns: ["coping"], coping_detail: ["cope", "skills"],
  }),
  p("ST-04", "staying_on_track", "20s", "Uncertain times and feeling stressed, so ticks the worry topic.", {
    concerns: ["worry"], worry_detail: ["stress"],
  }),
  p("ST-05", "staying_on_track", "60s", "Family going through a hard time; wants to cope better.", {
    concerns: ["coping"], coping_detail: ["cope"],
  }),
  p("ST-06", "staying_on_track", "30s", "Deaf NZSL user wanting everyday coping skills.", {
    concerns: ["coping"], coping_detail: ["skills"],
  }),
  p("ST-07", "staying_on_track", "40s", "Wants to feel better but isn't sure what would help.", {
    concerns: ["coping"], coping_detail: ["not_sure"],
  }),
  p("ST-08", "staying_on_track", "20s", "Wants to feel calmer and build skills.", {
    concerns: ["coping"], coping_detail: ["calmer", "skills"],
  }),
  p("ST-09", "staying_on_track", "30s", "After a flood damaged their home, coping with uncertainty and poor sleep.", {
    concerns: ["coping", "sleep"], coping_detail: ["cope"],
  }),
  p("ST-10", "staying_on_track", "50s", "Wants to cope better and feels drained.", {
    concerns: ["coping", "low_mood"], coping_detail: ["cope"], low_mood_detail: ["drained"],
  }),

  // Managing Insomnia
  p("I-01", "insomnia", "40s", "Takes hours to fall asleep.", { concerns: ["sleep"] }),
  p("I-02", "insomnia", "30s", "Wakes at 3am and can't get back to sleep.", { concerns: ["sleep"] }),
  p("I-03", "insomnia", "50s", "Broken sleep during menopause.", { concerns: ["sleep"] }),
  p("I-04", "insomnia", "20s", "Can't switch off at night.", {
    concerns: ["sleep", "worry"], worry_detail: ["worry"],
  }),
  p("I-05", "insomnia", "60s", "Poor sleep and feels drained.", {
    concerns: ["sleep", "low_mood"], low_mood_detail: ["drained"],
  }),
  p("I-06", "insomnia", "30s", "Rotating shifts have wrecked their sleep.", { concerns: ["sleep"] }),
  p("I-07", "insomnia", "40s", "Stress keeps them awake.", {
    concerns: ["sleep", "worry"], worry_detail: ["stress"],
  }),
  p("I-08", "insomnia", "30s", "Parent of a 10-month-old who still can't sleep even when the baby does.", {
    concerns: ["sleep", "perinatal"], life_stage: "baby",
  }),
  p("I-09", "insomnia", "70s", "Wakes early every morning feeling unrested.", { concerns: ["sleep"] }),
  p("I-10", "insomnia", "20s", "Can't sleep and wants to feel calmer.", {
    concerns: ["sleep", "coping"], coping_detail: ["calmer"],
  }),

  // Just a Pause – Intro to Mindfulness
  p("MF-01", "mindfulness", "30s", "Wants to be more present with their kids.", {
    concerns: ["coping"], coping_detail: ["present"],
  }),
  p("MF-02", "mindfulness", "40s", "Wants to feel calmer.", { concerns: ["coping"], coping_detail: ["calmer"] }),
  p("MF-03", "mindfulness", "20s", "Wants to be calmer and more present.", {
    concerns: ["coping"], coping_detail: ["present", "calmer"],
  }),
  p("MF-04", "mindfulness", "50s", "Busy and stressed, wants calm, so ticks the worry topic.", {
    concerns: ["worry"], worry_detail: ["stress"],
  }),
  p("MF-05", "mindfulness", "60s", "Retired and wants to enjoy the moment.", {
    concerns: ["coping"], coping_detail: ["present"],
  }),
  p("MF-06", "mindfulness", "30s", "Wants everyday skills and to be more present.", {
    concerns: ["coping"], coping_detail: ["skills", "present"],
  }),
  p("MF-07", "mindfulness", "20s", "Curious about feeling better, not sure how.", {
    concerns: ["coping"], coping_detail: ["not_sure"],
  }),
  p("MF-08", "mindfulness", "40s", "On edge and wants to feel calmer.", {
    concerns: ["coping", "worry"], coping_detail: ["calmer"], worry_detail: ["worry"],
  }),
  p("MF-09", "mindfulness", "30s", "Can't sleep and wants to feel calmer.", {
    concerns: ["coping", "sleep"], coping_detail: ["calmer"],
  }),
  p("MF-10", "mindfulness", "50s", "Wants to slow down and notice the moment.", {
    concerns: ["coping"], coping_detail: ["present"],
  }),

  // Coping with Stress
  p("CS-01", "stress", "30s", "Overwhelmed at work.", {
    concerns: ["worry"], worry_detail: ["stress"],
  }),
  p("CS-02", "stress", "40s", "Caring for a parent and everything feels like too much.", {
    concerns: ["worry"], worry_detail: ["stress"],
  }),
  p("CS-03", "stress", "20s", "Student struggling to manage stress.", {
    concerns: ["worry"], worry_detail: ["stress"],
  }),
  p("CS-04", "stress", "50s", "Wants to feel calmer and less overwhelmed.", {
    concerns: ["coping"], coping_detail: ["calmer"],
  }),
  p("CS-05", "stress", "30s", "Stressed and not sleeping.", {
    concerns: ["worry", "sleep"], worry_detail: ["stress"],
  }),
  p("CS-06", "stress", "40s", "Overwhelmed and drained.", {
    concerns: ["worry", "low_mood"], worry_detail: ["stress"],
    low_mood_detail: ["drained"],
  }, ["yes", "no"]),
  p("CS-07", "stress", "60s", "Stressed, but thinks of it as needing to cope, so ticks only coping.", {
    concerns: ["coping"], coping_detail: ["cope"],
  }),
  p("CS-08", "stress", "20s", "Stressed and can't switch off.", {
    concerns: ["worry"], worry_detail: ["stress", "worry"],
  }),
  p("CS-09", "stress", "30s", "Stressed but not sure which description fits.", {
    concerns: ["worry"], worry_detail: ["stress"],
  }),
  p("CS-10", "stress", "40s", "Parent of a 5-month-old who feels everything is too much.", {
    concerns: ["worry", "perinatal"], worry_detail: ["stress"], life_stage: "baby",
  }),

  // Thinking about Change
  p("TC-01", "thinking_about_change", "30s", "Partner commented on their drinking; not sure it's a problem.", {
    concerns: ["aod"], aod_stage: "unsure",
  }),
  p("TC-02", "thinking_about_change", "40s", "Drinks most nights and is thinking about it.", {
    concerns: ["aod"], aod_stage: "thinking",
  }),
  p("TC-03", "thinking_about_change", "20s", "Uses cannabis daily; unsure if it's an issue.", {
    concerns: ["aod"], aod_stage: "unsure",
  }),
  p("TC-04", "thinking_about_change", "50s", "Drinking more and feeling sad.", {
    concerns: ["aod", "low_mood"], aod_stage: "thinking", low_mood_detail: ["sad"],
  }, ["unsure", "no"]),
  p("TC-05", "thinking_about_change", "20s", "Weekend binge drinking; not sure they need to change.", {
    concerns: ["aod"], aod_stage: "unsure",
  }),
  p("TC-06", "thinking_about_change", "60s", "Drinking has crept up since retiring.", {
    concerns: ["aod"], aod_stage: "thinking",
  }),
  p("TC-07", "thinking_about_change", "30s", "Uses alcohol to get to sleep.", {
    concerns: ["aod", "sleep"], aod_stage: "unsure",
  }),
  p("TC-08", "thinking_about_change", "40s", "Struggles with stress and drinks to unwind.", {
    concerns: ["aod", "worry"], worry_detail: ["stress"], aod_stage: "thinking",
  }),
  p("TC-09", "thinking_about_change", "20s", "Thinking about their drug use.", {
    concerns: ["aod"], aod_stage: "thinking",
  }, ["prefer_not", "prefer_not"]),
  p("TC-10", "thinking_about_change", "30s", "Pregnant and unsure about their drinking.", {
    concerns: ["aod", "perinatal"], life_stage: "pregnant", aod_stage: "unsure",
  }),

  // Taking Action
  p("TA-01", "taking_action", "30s", "Ready to cut back on drinking.", { concerns: ["aod"], aod_stage: "ready" }),
  p("TA-02", "taking_action", "40s", "Stopped drinking two weeks ago.", { concerns: ["aod"], aod_stage: "ready" }),
  p("TA-03", "taking_action", "20s", "Thinking about cutting down on vaping cannabis.", {
    concerns: ["aod"], aod_stage: "thinking",
  }),
  p("TA-04", "taking_action", "50s", "Three months alcohol-free and wants to keep it going.", {
    concerns: ["aod"], aod_stage: "building",
  }),
  p("TA-05", "taking_action", "30s", "Ready to change; feels drained.", {
    concerns: ["aod", "low_mood"], aod_stage: "ready", low_mood_detail: ["drained"],
  }),
  p("TA-06", "taking_action", "60s", "Has started cutting back.", { concerns: ["aod"], aod_stage: "ready" }),
  p("TA-07", "taking_action", "20s", "Drinks to cope socially and is ready to change.", {
    concerns: ["aod", "worry"], worry_detail: ["social"], aod_stage: "ready",
  }),
  p("TA-08", "taking_action", "40s", "Ready to stop using.", { concerns: ["aod"], aod_stage: "ready" }, ["yes", "no"]),
  p("TA-09", "taking_action", "30s", "Six weeks without drugs and wants to keep building on it.", {
    concerns: ["aod"], aod_stage: "building",
  }),
  p("TA-10", "taking_action", "50s", "Ready to change and wants everyday skills.", {
    concerns: ["aod", "coping"], aod_stage: "ready", coping_detail: ["skills"],
  }),

  // Getting Back on Track
  p("GB-01", "getting_back_on_track", "30s", "Started drinking again after six months off.", {
    concerns: ["aod"], aod_stage: "relapse",
  }),
  p("GB-02", "getting_back_on_track", "40s", "Slipping back into old habits.", { concerns: ["aod"], aod_stage: "relapse" }),
  p("GB-03", "getting_back_on_track", "50s", "Relapsed and feels very low.", {
    concerns: ["aod", "low_mood"], aod_stage: "relapse", low_mood_detail: ["sad"],
  }, ["yes", "yes"]),
  p("GB-04", "getting_back_on_track", "20s", "Finding it hard to stay off drugs.", { concerns: ["aod"], aod_stage: "relapse" }),
  p("GB-05", "getting_back_on_track", "30s", "One big night after four months sober; feels like starting over, so picks 'thinking about making a change'.", {
    concerns: ["aod"], aod_stage: "thinking",
  }),
  p("GB-06", "getting_back_on_track", "60s", "Back to drinking after a family loss.", { concerns: ["aod"], aod_stage: "relapse" }),
  p("GB-07", "getting_back_on_track", "40s", "Work pressure led them back to using.", {
    concerns: ["aod", "worry"], worry_detail: ["stress"], aod_stage: "relapse",
  }),
  p("GB-08", "getting_back_on_track", "30s", "Has made changes and wants to keep building on them.", {
    concerns: ["aod"], aod_stage: "building",
  }),
  p("GB-09", "getting_back_on_track", "20s", "Struggling to keep changes going.", {
    concerns: ["aod"], aod_stage: "relapse",
  }, ["unsure", "prefer_not"]),
  p("GB-10", "getting_back_on_track", "50s", "Lapsed and isn't sleeping well.", {
    concerns: ["aod", "sleep"], aod_stage: "relapse",
  }),

  // Pregnancy Wellbeing
  p("PR-01", "pregnancy", "30s", "Anxious during pregnancy.", { concerns: ["perinatal"], life_stage: "pregnant" }),
  p("PR-02", "pregnancy", "20s", "Feeling low during pregnancy.", {
    concerns: ["perinatal", "low_mood"], life_stage: "pregnant", low_mood_detail: ["sad"],
  }),
  p("PR-03", "pregnancy", "30s", "Worried about the birth and much else.", {
    concerns: ["perinatal", "worry"], life_stage: "pregnant", worry_detail: ["worry"],
  }),
  p("PR-04", "pregnancy", "40s", "Pregnant after IVF and worried something is wrong.", {
    concerns: ["perinatal", "worry"], life_stage: "pregnant", worry_detail: ["health"],
  }),
  p("PR-05", "pregnancy", "20s", "Pregnant with a toddler under 18 months; can only choose one of 'pregnant' or 'baby', so picks pregnant.", {
    concerns: ["perinatal"], life_stage: "pregnant",
  }),
  p("PR-06", "pregnancy", "30s", "Surrogate carrying a pregnancy and feeling anxious.", {
    concerns: ["perinatal"], life_stage: "pregnant",
  }),
  p("PR-07", "pregnancy", "30s", "Pregnant and can't sleep.", { concerns: ["perinatal", "sleep"], life_stage: "pregnant" }),
  p("PR-08", "pregnancy", "20s", "Pregnant, drained and struggling.", {
    concerns: ["perinatal", "low_mood"], life_stage: "pregnant", low_mood_detail: ["drained"],
  }, ["yes", "no"]),
  p("PR-09", "pregnancy", "30s", "Pregnant and just doesn't feel themselves.", {
    concerns: ["perinatal", "low_mood"], life_stage: "pregnant", low_mood_detail: ["not_sure"],
  }),
  p("PR-10", "pregnancy", "40s", "Pregnant and under pressure at work.", {
    concerns: ["perinatal", "worry"], life_stage: "pregnant", worry_detail: ["stress"],
  }),

  // Postnatal Wellbeing
  p("PO-01", "postnatal", "30s", "Anxious since their baby was born three months ago.", {
    concerns: ["perinatal", "worry"], life_stage: "baby", worry_detail: ["worry"],
  }),
  p("PO-02", "postnatal", "20s", "Low and drained with a 6-month-old.", {
    concerns: ["perinatal", "low_mood"], life_stage: "baby", low_mood_detail: ["sad", "drained"],
  }),
  p("PO-03", "postnatal", "30s", "Father of a 9-month-old who feels overwhelmed.", {
    concerns: ["perinatal"], life_stage: "baby",
  }),
  p("PO-04", "postnatal", "40s", "Exhausted parent of a 1-year-old.", {
    concerns: ["perinatal", "sleep"], life_stage: "baby",
  }),
  p("PO-05", "postnatal", "20s", "Newborn at home and struggling a lot.", {
    concerns: ["perinatal"], life_stage: "baby",
  }, ["yes", "yes"]),
  p("PO-06", "postnatal", "30s", "Adoptive parent of a 4-month-old.", { concerns: ["perinatal"], life_stage: "baby" }),
  p("PO-07", "postnatal", "30s", "Has lost interest in things since having their baby 17 months ago.", {
    concerns: ["perinatal", "low_mood"], life_stage: "baby", low_mood_detail: ["interest"],
  }),
  p("PO-08", "postnatal", "20s", "Intrusive worries about their 2-month-old.", {
    concerns: ["perinatal", "worry"], life_stage: "baby", worry_detail: ["worry", "ocd"],
  }, ["unsure", "no"]),
  p("PO-09", "postnatal", "30s", "Drained with an 8-month-old, but sees it as low mood only, so doesn't tick the baby option.", {
    concerns: ["low_mood"], low_mood_detail: ["drained"],
  }),
  p("PO-10", "postnatal", "40s", "Everything feels like too much with a 5-month-old.", {
    concerns: ["perinatal", "worry"], life_stage: "baby", worry_detail: ["stress"],
  }, ["prefer_not", "no"]),
];
