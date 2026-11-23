# Multiple choice: synthetic persona findings (Nov 2026)

**Draft for discussion. This is not user testing.** These are 170 AI-drafted, synthetic personas (10 for each of the 17 courses). The answers were scripted from short profiles and run through the real Multiple choice rules (`run.mjs`). The results show whether the question flow and rules send each kind of situation to the right course. They say nothing about how real people understand the wording, feel about it, or choose answers. The same author wrote the personas and knew the rules, which biases the results. Testing with real people (e.g. Purple Shirt) and clinical review are still needed.

Files: `personas.ts` (the personas and their answers), `results.csv` / `results.json` (what each was offered). Re-run with `node testing/personas/run.mjs`.

## Summary

- **159 of 170 personas (94%) were offered their course.** The other 11 picked answers that lead elsewhere (see 1–3).
- **Course list length:** most got 1–3 courses (161 of 170). Three got 6–7, all from "I'm not sure" on the worry step.
- **Number of screens:** 1 to 6, with 2 the most common (after the step 3 anxiety pages were removed and both risk questions are always asked, 24 Nov 2026).
- **Support boxes behaved as designed** for everyone asked the risk questions (see 4).

| Course | Offered | Listed first |
|---|---|---|
| Generalised Anxiety | 10/10 | 10 |
| Depression | 10/10 | 10 |
| Mixed Depression and Anxiety | 9/10 | 2 |
| Social Anxiety | 10/10 | 9 |
| Overcoming Panic | 10/10 | 10 |
| Overcoming Panic – Next Steps | 8/10 | 8 |
| Obsessive Compulsive Disorder | 9/10 | 9 |
| Health Anxiety | 10/10 | 10 |
| Staying on Track | 9/10 | 6 |
| Managing Insomnia | 10/10 | 7 |
| Just a Pause – Intro to Mindfulness | 9/10 | 4 |
| Coping with Stress | 9/10 | 9 |
| Thinking about Change | 10/10 | 6 |
| Taking Action | 8/10 | 4 |
| Getting Back on Track | 9/10 | 6 |
| Pregnancy Wellbeing | 10/10 | 3 |
| Postnatal Wellbeing | 9/10 | 3 |

## Findings

### 1. The step one choice decides which courses can appear
Each course can only be reached through one step one option. Personas who described their situation through a different door missed their course:
- **Stress versus coping:** CS-07 saw stress as "needing to cope" and got Staying on Track, not Coping with Stress. ST-04 and MF-04 ticked the worry topic for stress and got only Coping with Stress, not Staying on Track or Just a Pause.
- **OCD:** O-10 didn't see their rituals as worry, so OCD was never offered.
- **Postnatal:** PO-09 has an 8-month-old but ticked only low mood, so Postnatal Wellbeing wasn't offered.
- **Mixed:** M-09 is low and anxious but ticked only anxiety, so Mixed wasn't offered.

*For discussion:* add cross-links between related topics, or a hint on step one ("tick all that apply, even if one feels bigger").

### 2. Alcohol and drug stage mapping
- **"I've made changes and want to keep building on them"** leads to Getting Back on Track. TA-04 and TA-09 were sustaining recent changes with no lapse, and Taking Action's description covers people who want to "sustain changes already made". The AOD team should review this mapping.
- **A single lapse:** GB-05 had one lapse after a long break, felt like they were starting over and picked "thinking about making a change". They got Thinking about Change and Taking Action, not Getting Back on Track.

### 3. Overcoming Panic – Next Steps is easy to miss
- **Only after the panic option:** the course is only offered after "I experience sudden feelings of panic" and then "Finished it". PN-06's attacks have eased into worrying about them coming back, so they ticked "I worry a lot", were never asked about the course, and got Generalised Anxiety.
- **Partial completion:** PN-09 did most of the course, picked "Started it but didn't finish", and got Overcoming Panic again.

### 4. Risk questions and support boxes
- **When the questions were asked:** 76 personas were asked. All 18 who gave an answer other than No got the right crisis panel. A Yes showed "You don't have to go through this alone"; "not sure" or "prefer not to say" showed "It's okay not to be sure".
- **After No:** 58 answered No to both questions (the second is now always asked) and got results without the yellow banner, with the teal 1737/111 reminder.
- **Alcohol and drug box:** shown for all 31 personas offered an alcohol and drug course.
- **Never asked:** two personas who would have answered "not sure" weren't asked at all, because only low mood, alcohol and drugs, or a baby under 18 months triggers the questions:
  - GA-10 ticked anxiety only.
  - P-08 is pregnant with panic attacks. **Pregnancy doesn't trigger the questions, but a baby does.**
- *For the clinical lead:* should pregnancy, or anxiety topics, also bring up the risk questions?

### 5. Specific courses are listed after general ones
- **Why:** results follow step one's order (worry, low mood, sleep, coping, pregnancy or baby, alcohol and drugs).
- **Effect:** Pregnancy Wellbeing was listed first for only 3 of 10 personas, Postnatal Wellbeing for 3 of 10 and Mixed for 2 of 10. For example, PR-03 saw Generalised Anxiety before Pregnancy Wellbeing.
- *For discussion:* list life-stage courses and Mixed first when they're offered.

### 6. Rules that always add a course
- **Insomnia always adds Depression.** This happened for all 10 insomnia personas, including people whose only issue is sleep, such as shift work (I-06) or menopause (I-03).
- **Panic and OCD always add Coping with Stress.**
- These come from the clinical rules (`lib/clinicalRules.ts`). The clinical lead should confirm both are intended for Multiple choice.

### 7. Long lists after "I'm not sure"
"I'm not sure" on "What kind of worry or anxiety are you experiencing?" lists all six anxiety courses, or seven with low mood (GA-07, S-10, M-10). That's a lot to choose from on a phone.

### 8. Situations the questions can't capture
- **Under 16:** S-09 (15) gets no youth support box. Multiple choice has no age question, so the box never shows.
- **Pregnant with a young child:** PR-05 is pregnant and has a toddler under 18 months. "Right now…" allows only one answer, so Postnatal Wellbeing can't be offered as well.

### 9. NZSL versions
- **Which links appear:** NZSL links show whenever Mixed or Staying on Track is offered (34 personas).
- **NZSL users:** both NZSL users (M-07, ST-06) got them.
- **Gap:** there's no NZSL question, so NZSL users can't be steered towards the two courses that have an NZSL version.

## Limitations
- **Synthetic answers:** they come from AI-drafted profiles, not from people reading the screens. Real people may read options differently, skip, or tick more or less.
- **Author bias:** the author knew the rules. The "missed" cases were chosen to probe likely gaps, so the 94% match rate is not a real-world estimate.
- **Not covered:** comprehension, emotional response, accessibility, cultural fit, or differences between communities. The personas have no names or ethnicities on purpose.
- **Only Multiple choice:** Free text and Hybrid weren't run.
