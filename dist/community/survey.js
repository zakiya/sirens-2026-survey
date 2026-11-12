// Community version of the survey, served at /community/. Same format as ../members/survey.js;
// ../app.js renders it. Responses go to the same endpoint, and the backend writes them
// to a separate sheet tab based on `id`.

const SATISFACTION = [
  "Very satisfied",
  "Somewhat satisfied",
  "Neutral",
  "Somewhat unsatisfied",
  "Very unsatisfied",
];

window.SURVEY = {
  id: "sirens-2026-community",
  title: "2026 Sirens Community Survey",
  endpoint: "https://script.google.com/macros/s/AKfycbyQhQmDb9364a2Yl3IMm8REDvrmUoJajR9EOqq08pw6bJLAcj8otvOjlhO7VKABE0g3gQ/exec",
  // See ../members/survey.js. Add ?closed to the URL to preview the closed page.
  closesAt: "2026-11-21T23:59:59-08:00",
  closedMessage: [
    "Thank you to everyone who responded. We'll share the anonymized results soon.",
    'Email <a href="mailto:contact@sandiegosirens.com">contact@sandiegosirens.com</a> with questions or late feedback.',
  ],
  intro: [
    "You were a Sirens member in 2025, and we noticed you did not renew your membership for 2026. We’d like to better understand what influenced that decision.",
    "Your feedback will help us to understand what members value, where we can improve, and what might make membership worthwhile in the future. There’s no expectation that you will rejoin. We appreciate your honest feedback.",
    "Anonymized responses will be published publicly with names and identifying details removed. Complete responses are shared with the Sirens Officer Group.",
  ],
  sections: [
    {
      id: "A",
      title: "About you",
      questions: [
        {
          id: "A2",
          type: "single",
          label: "How many Wave home games did you go to in 2026?",
          options: ["None", "1–5", "6–10", "More than 10"],
        },
        {
          id: "A3",
          type: "single",
          label: "Were you a 2026 season ticket holder?",
          options: ["Yes", "No", "Not sure"],
        },
        {
          id: "A4",
          type: "single",
          label: "Where do you usually sit at Wave home games?",
          // 200 and 300 levels are usually closed for Wave matches, so they aren't listed.
          options: [
            "Supporters section (137–139)",
            "Standard seating (101–123, 133–136, 140–141)",
            "Club (C106–C108, 124–132), Loge, or Field seats",
            "I no longer go to Wave home games",
          ],
          other: true,
        },
      ],
    },
    {
      id: "E",
      title: "Membership",
      questions: [
        {
          id: "E1",
          type: "multi",
          label: "Which factors influenced your decision not to renew your Sirens membership for 2026?",
          options: [
            "I didn’t go to enough Wave games",
            "I didn’t participate enough in Sirens activities",
            "I didn’t feel connected to the Sirens community",
            "I wasn’t sure what my membership included",
            "I didn’t know how or when to renew",
            "I intended to renew but didn’t get around to it",
            "Personal or financial circumstances",
            "Scheduling or time constraints",
            "I moved away from San Diego",
            "My interest in the Wave changed",
            "My experience with the Sirens influenced my decision",
            "Prefer not to say",
          ],
          exclusive: ["Prefer not to say"],
          other: true,
        },
        {
          id: "E2",
          type: "text",
          label: "Was there anything the Sirens could have reasonably done differently that might have influenced your decision to renew?",
        },
        {
          id: "E3",
          type: "single",
          label: "How likely would you be to consider joining the Sirens again in the future?",
          options: [
            "Very likely",
            "Somewhat likely",
            "Not sure",
            "Somewhat unlikely",
            "Very unlikely",
          ],
        },
        {
          id: "D0",
          type: "single",
          label: "How satisfied are you with the Sirens' contribution to the stadium atmosphere and gameday experience?",
          options: SATISFACTION,
          // Only asked of people who went to a game, like the stadium section in the member survey.
          showIf: (a) => a.A2 !== "None",
        },
      ],
    },
    {
      id: "F",
      title: "Final thoughts",
      questions: [
        {
          id: "F1",
          type: "text",
          label: "What else would you like to share about the Sirens or the Wave this year?",
        },
        {
          id: "F2",
          type: "text",
          rows: 2,
          label: "Please share your name and contact info if you’re open to us following up about your responses.",
        },
      ],
    },
  ],
};
