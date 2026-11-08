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
    "We invite you to fill out this year's community survey. Your feedback helps us plan next season and advocate for supporters with Wave FC.",
    "Anonymized responses will be published publicly with names and identifying details removed. Complete responses are shared with the Sirens Officer Group.",
    'Email <a href="mailto:contact@sandiegosirens.com">contact@sandiegosirens.com</a> with questions or concerns.',
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
          type: "single",
          required: true,
          label: "How likely are you to rejoin the Sirens in 2027?",
          options: [
            "Very likely",
            "Somewhat likely",
            "Not sure",
            "Somewhat unlikely",
            "Very unlikely",
          ],
        },
        {
          id: "E2",
          type: "text",
          required: true,
          label: "What factors will go into your decision whether to rejoin?",
        },
      ],
    },
    {
      id: "D",
      title: "Sirens activities",
      questions: [
        {
          id: "D0",
          type: "single",
          label: "How satisfied are you with the Sirens' contribution to the stadium atmosphere?",
          options: SATISFACTION,
          // Only asked of people who went to a game, like the stadium section in the member survey.
          showIf: (a) => a.A2 !== "None",
        },
        {
          id: "D1",
          type: "grid",
          label: "How do you feel about the following?",
          items: [
            "Sirens watch parties",
            "Tailgates",
            "Drums and chants",
            "Discord",
            "Newsletter",
          ],
          options: [...SATISFACTION, "Doesn't apply to me"],
        },
        {
          id: "D6",
          type: "text",
          label: "What else would you like to share about your experience with Sirens activities this year?",
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
      ],
    },
  ],
};
