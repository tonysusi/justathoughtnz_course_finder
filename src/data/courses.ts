// Source: course-catalogue.md, "Just a Thought website" section.
// Shared by the frontend and the /api/match function.

export interface Course {
  id: string;
  name: string;
  url: string;
  description: string;
  /** Set on NZSL versions: the id of the course they are a version of. */
  nzslVersionOf?: string;
  prerequisite?: string;
  /** Who the course is for, beyond its symptoms. Added to the JEV question so it doesn't match on symptoms alone. */
  matchCondition?: string;
}

export const COURSES: Course[] = [
  {
    id: "generalised_anxiety",
    name: "Generalised Anxiety",
    url: "https://www.justathought.co.nz/courses/generalised-anxiety",
    description:
      "An online CBT course for people experiencing broad, persistent worry that interferes with relationships, work, daily life or leisure. It teaches skills for reducing worry, anxiety and physical symptoms and supporting lasting progress.",
  },
  {
    id: "depression",
    name: "Depression",
    url: "https://www.justathought.co.nz/courses/depression",
    description:
      "An online CBT course for people experiencing sadness, loss of interest, poor concentration or feelings of worthlessness. It teaches skills to reduce depression symptoms and find a more positive path forward in the short and long term.",
  },
  {
    id: "mixed",
    name: "Mixed Depression and Anxiety",
    url: "https://www.justathought.co.nz/courses/mixed-depression-and-anxiety",
    description:
      "An online CBT course for people experiencing low mood alongside anxiety or nervousness. It combines skills for managing sadness, worry, hopelessness and low self-worth.",
  },
  {
    id: "social_anxiety",
    name: "Social Anxiety",
    url: "https://www.justathought.co.nz/courses/social-anxiety",
    description:
      "An online CBT course for people who worry about what others think in social situations or avoid social experiences. It explains social anxiety and teaches practical skills for tackling it.",
  },
  {
    id: "panic",
    name: "Overcoming Panic",
    url: "https://www.justathought.co.nz/courses/overcoming-panic",
    description:
      "A course for understanding how fear of panic attacks and avoidance can create a difficult cycle. It teaches practical strategies for tackling panic and regaining confidence in everyday life.",
  },
  {
    id: "panic_next_steps",
    name: "Overcoming Panic – Next Steps",
    url: "https://www.justathought.co.nz/courses/overcoming-panic-plus",
    description:
      "A follow-on course for people who have completed Overcoming Panic. It helps troubleshoot roadblocks and setbacks and strengthens skills for managing panic and anxiety.",
    prerequisite: "Overcoming Panic",
    matchCondition: "Only a match if the person says they have already done the Overcoming Panic course.",
  },
  {
    id: "ocd",
    name: "Obsessive Compulsive Disorder",
    url: "https://www.justathought.co.nz/courses/obsessive-compulsive-disorder",
    description:
      "An online CBT course explaining unwanted obsessive thoughts and the repetitive behaviours or mental routines used to relieve them. It teaches practical skills for tackling OCD and responding differently to distressing thoughts.",
  },
  {
    id: "health_anxiety",
    name: "Health Anxiety",
    url: "https://www.justathought.co.nz/courses/health-anxiety",
    description:
      "A course for people whose health worries lead to symptom searching, body checking, frequent reassurance seeking or avoidance. It teaches practical skills for reducing health-related anxiety and its impact on wellbeing.",
  },
  {
    id: "staying_on_track",
    name: "Staying on Track",
    url: "https://www.justathought.co.nz/courses/staying-on-track",
    description:
      "A short wellbeing course introducing practical strategies for coping with stress during difficult or uncertain times. It helps participants support their mental and emotional health and practise skills with their whānau.",
  },
  {
    id: "insomnia",
    name: "Managing Insomnia",
    url: "https://www.justathought.co.nz/courses/managing-insomnia",
    description:
      "A course for people whose difficulty falling or staying asleep is affecting their energy, mood, concentration or daily life. It teaches practical skills for changing unhelpful sleep patterns and reducing worry about sleep.",
  },
  {
    id: "mindfulness",
    name: "Just a Pause – Intro to Mindfulness",
    url: "https://www.justathought.co.nz/courses/mindfulness",
    description:
      "A four-lesson introduction to mindfulness for managing worry, stress and feeling overwhelmed. It teaches ways to become calmer and more grounded by connecting with the present moment.",
  },
  {
    id: "stress",
    name: "Coping with Stress",
    url: "https://www.justathought.co.nz/courses/coping-with-stress",
    description:
      "An online CBT course for people feeling overwhelmed or stuck in stress. It teaches practical skills for understanding stress, changing how they respond and beginning to feel better.",
  },
  {
    id: "thinking_about_change",
    name: "Thinking about Change",
    url: "https://www.justathought.co.nz/courses/thinking-about-change",
    description:
      "An alcohol and drug support course for people concerned about their substance use but unsure whether they want or need to change. It helps participants examine its effects, clarify what matters and consider available options.",
  },
  {
    id: "taking_action",
    name: "Taking Action",
    url: "https://www.justathought.co.nz/courses/taking-action",
    description:
      "An alcohol and drug support course for people ready to change their substance use or sustain changes already made. Practical strategies and guided exercises build skills for navigating change, understanding thoughts and emotions and planning for the future.",
  },
  {
    id: "getting_back_on_track",
    name: "Getting Back on Track",
    url: "https://www.justathought.co.nz/courses/getting-back-on-track",
    description:
      "An alcohol and drug support course for people finding it difficult to maintain previous changes. It teaches practical ways to respond to a lapse or relapse and take positive steps towards lasting change.",
  },
  {
    id: "pregnancy",
    name: "Pregnancy Wellbeing",
    url: "https://www.justathought.co.nz/courses/pregnancy-wellbeing",
    description:
      "A course for people experiencing persistent anxiety, depression or low mood during pregnancy. Developed by clinicians and mothers, it teaches practical skills for supporting mental health and wellbeing while preparing for a growing whānau.",
    matchCondition: "Only a match if the person says they are pregnant.",
  },
  {
    id: "postnatal",
    name: "Postnatal Wellbeing",
    url: "https://www.justathought.co.nz/courses/postnatal-wellbeing",
    description:
      "A course for people experiencing anxiety or depression after childbirth. It teaches practical CBT-based skills for improving wellbeing and supporting recovery while caring for a new baby and growing whānau.",
    matchCondition: "Only a match if the person says they have recently had a baby.",
  },
  {
    id: "staying_on_track_nzsl",
    name: "Staying on Track (NZ Sign Language)",
    url: "https://www.justathought.co.nz/courses/staying-on-track-nzsl",
    description:
      "An NZSL version of the short wellbeing course, introducing practical strategies for coping with stress during difficult or uncertain times. It supports mental and emotional health and helps participants and their whānau stay on track.",
    nzslVersionOf: "staying_on_track",
  },
  {
    id: "mixed_nzsl",
    name: "Mixed Depression & Anxiety (NZ Sign Language)",
    url: "https://www.justathought.co.nz/courses/mixed-nszl",
    description:
      "An NZSL-accessible online CBT course for people experiencing low mood together with anxiety or nervousness. It combines skills for managing sadness, worry, hopelessness and low self-worth.",
    nzslVersionOf: "mixed",
  },
];
