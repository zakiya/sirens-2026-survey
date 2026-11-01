// Survey definition. Edit questions here; app.js renders whatever is in this list.
//
// Question types:
//   single   – radio buttons
//   multi    – checkboxes (select all that apply)
//   text     – free-text textarea
//   grid     – one single-choice row per item, shared answer scale
//
// `showIf(answers)` on a section or question hides it until it returns true.
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
            "Another 100-level section (101–123, 133–141)",
            "Club seats (Spectrum Business, Dos Equis or SDZWA Club)",
            "Loge box or suite",
            "Pitchside Club or field seats",
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
            "Watch parties",
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
