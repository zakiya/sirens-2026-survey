// Survey definition. Edit questions here; app.js renders whatever is in this list.
//
// Question types:
//   single   – radio buttons
//   multi    – checkboxes (select all that apply)
//   text     – free-text textarea
//   grid     – one single-choice row per item, shared answer scale
//
// `showIf(answers)` on a section or question hides it until it returns true.
// `gate` hides every other question until the gate question has an allowed answer,
// and shows `message` instead when it has any other answer.
// Hidden questions are left out of the submitted response.

const SATISFACTION = [
  "Very satisfied",
  "Somewhat satisfied",
  "Neutral",
  "Somewhat unsatisfied",
  "Very unsatisfied",
];

window.SURVEY = {
  title: "2026 Sirens Member Survey",
  // Google Apps Script web app URL (see backend/README.md). Leave empty to skip sending:
  // responses are then shown as JSON for copying or download instead.
  endpoint: "https://script.google.com/macros/s/AKfycbyQhQmDb9364a2Yl3IMm8REDvrmUoJajR9EOqq08pw6bJLAcj8otvOjlhO7VKABE0g3gQ/exec",
  // When the survey stops accepting responses. Use a full date-time with the Pacific
  // offset, e.g. "2026-12-15T23:59:59-08:00" (-08:00 in winter, -07:00 in summer).
  // Leave empty to keep the survey open. Add ?closed to the URL to preview the closed page.
  closesAt: "2026-11-21T23:59:59-08:00",
  closedMessage: [
    "Thank you to everyone who responded. We'll share the anonymized results soon.",
    'Email <a href="mailto:contact@sandiegosirens.com">contact@sandiegosirens.com</a> with questions or late feedback.',
  ],
  gate: {
    question: "A1",
    allow: ["Yes", "Not sure"],
    message: [
      "This survey is for 2026 Sirens members only. Consider joining us in 2027.",
      'Sign up for the newsletter <a href="https://sandiegosirens.us5.list-manage.com/subscribe?u=f67432ccb805163e0383c7726&amp;id=b6dcf05d3b">here</a>.',
    ],
  },
  intro: [
    "We invite our 2026 Sirens members to fill out this survey. Your feedback helps us plan next season and advocate for supporters with Wave FC.",
    "Anonymized responses will be published publicly with names and identifying details removed. Complete responses are shared with the Sirens Officer Group.",
    'Email <a href="mailto:contact@sandiegosirens.com">contact@sandiegosirens.com</a> with questions or concerns.',
  ],
  sections: [
    {
      id: "A",
      title: "About you",
      questions: [
        {
          id: "A1",
          type: "single",
          required: true,
          label: "Did you have a 2026 Sirens membership?",
          options: ["Yes", "No", "Not sure"],
        },
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
      id: "B",
      title: "Wave front office",
      questions: [
        {
          id: "B1",
          type: "single",
          label: "How satisfied were you with your ticket rep(s) this year?",
          options: [...SATISFACTION, "I didn't interact with a rep"],
        },
        {
          id: "B2",
          type: "text",
          label: "What else would you like to share about your experience with the Wave front office this year?",
        },
      ],
    },
    {
      id: "C",
      title: "Stadium experience",
      showIf: (a) => a.A2 !== "None",
      questions: [
        {
          id: "C1",
          type: "multi",
          label: "Which stadium accessibility features have you or someone you know used?",
          options: [
            "Accessible/ADA seating",
            "Accessible/ADA parking",
            "Shuttle service",
            "Closed captioning",
            "Quiet room",
            "None",
          ],
          other: true,
          exclusive: ["None"],
        },
        {
          id: "C2",
          type: "text",
          label: "What accessibility accommodations would improve game day?",
        },
        {
          id: "C3",
          type: "text",
          label: "What else would you like to share about your experience in the stadium this year?",
        },
      ],
    },
    {
      id: "D",
      title: "Sirens activities",
      questions: [
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
          id: "D4",
          type: "multi",
          label: "What kinds of Sirens events would you like more of in 2027?",
          options: [
            "Social events",
            "Volunteer events",
            "Donation drives",
            "Social justice and activism",
            "Watch parties for other soccer leagues",
            "Other San Diego sports events",
            "Drum and chant practice",
            "Q&As with players or staff",
          ],
          other: true,
        },
        {
          id: "D5",
          type: "multi",
          label: "How do you find out about Sirens news and events?",
          options: ["Sirens newsletter", "Discord", "Social media", "Word of mouth"],
          other: true,
        },
        {
          id: "D6",
          type: "text",
          label: "What else would you like to share about your experience with Sirens activities this year?",
        },
      ],
    },
    {
      id: "E",
      title: "Membership and community",
      questions: [
        {
          id: "E1",
          type: "single",
          label: "How likely are you to renew your Sirens membership for 2027?",
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
          label: "What factors go into your decision whether to renew?",
        },
        {
          id: "E4",
          type: "text",
          label: "Are there organizations the Sirens should support?",
        },
        {
          id: "E5",
          type: "text",
          label: "What Sirens merchandise or designs would you like to see?",
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
