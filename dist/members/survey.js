// Survey definition. Edit questions here; app.js renders whatever is in this list.
//
// Question types:
//   single   – radio buttons
//   multi    – checkboxes (select all that apply; `max: n` caps it at n, "Select up to n.")
//   text     – free-text textarea (`rows` sets its height, default 4)
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
  // The date is shown in the intro automatically. Leave empty to keep the survey open. Add ?closed to the URL to preview the closed page.
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
            "Not sure",
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
          label: "What would you most like the Wave to improve about the fan experience?",
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
          label: "Which of the following stadium accessibility features have you, or someone attending with you, used?",
          options: [
            "Accessible/ADA seating",
            "Accessible/ADA parking",
            "Shuttle service",
            "Closed captioning",
            "Quiet room or sensory space",
            "Other accessibility feature or accommodation",
            "None of the above",
            "I was unaware of these options",
          ],
          exclusive: ["None of the above", "I was unaware of these options"],
        },
        {
          id: "C4",
          type: "multi",
          label: "Were there any accessibility features or services you or someone attending with you wanted to use but were unable to access or use successfully?",
          options: [
            "Accessible/ADA seating",
            "Accessible/ADA parking",
            "Shuttle service",
            "Closed captioning",
            "Quiet room or sensory space",
            "No, we were able to access the services we needed",
            "Not applicable / We did not need accessibility services",
          ],
          other: true,
          exclusive: [
            "No, we were able to access the services we needed",
            "Not applicable / We did not need accessibility services",
          ],
        },
        {
          id: "C5",
          type: "multi",
          label: "What made the service difficult to access or use?",
          // Only when C4 names a service (or an "Other" one), not one of its "no" answers.
          showIf: (a) =>
            (a.C4 || []).some((o) => !o.startsWith("No,") && !o.startsWith("Not applicable")) ||
            !!(a.C4_other || "").trim(),
          options: [
            "I did not know where to find it",
            "I did not know how to request or arrange it",
            "It was unavailable or at capacity",
            "The wait was too long",
            "It was difficult to physically access",
            "Staff were unable to assist",
            "The service did not meet our needs",
          ],
          other: true,
        },
        {
          id: "C2",
          type: "text",
          label: "Are there other accessibility features or accommodations that would make the game day experience easier or more enjoyable for you or someone attending with you? Please share any suggestions.",
        },
        {
          id: "C6",
          type: "multi",
          label: "Which aspects of the stadium experience would you most like to see improved in 2027?",
          // PLACEHOLDER options until Tali sends the final list.
          max: 3,
          options: [
            "Entry and security lines",
            "Concessions",
            "Restrooms",
            "Parking",
            "Public transit and shuttles",
            "Seating and sightlines",
            "Sound and announcements",
            "Game day atmosphere",
          ],
          other: true,
        },
        {
          id: "C3",
          type: "text",
          label: "Of the areas you selected, what specific change would most improve your game day experience?",
          // Refers back to C6, so only shown once an area is picked there.
          showIf: (a) => (a.C6 || []).length > 0 || !!(a.C6_other || "").trim(),
        },
      ],
    },
    {
      id: "D",
      title: "Sirens activities",
      questions: [
        {
          id: "D4",
          type: "multi",
          label: "Which types of Sirens activities are you most interested in participating in during 2027?",
          options: [
            "Social events",
            "Volunteer events",
            "Donation drives",
            "Social justice and advocacy activities",
            "Wave watch parties",
            "Watch parties or outings for other women’s sports",
            "Tifo painting",
            "Drum and chant practice",
            "None of these right now",
          ],
          other: true,
          exclusive: ["None of these right now"],
        },
        {
          id: "D7",
          type: "multi",
          label: "Which Sirens activities have you not participated in, but would be interested in trying?",
          options: [
            "Watch parties",
            "Tailgates",
            "Tifo painting",
            "Drumming",
            "Chant leading",
            "Volunteer events",
            "Donation drives",
            "Social justice or advocacy activities",
            "Social events",
            "None right now",
          ],
          other: true,
          exclusive: ["None right now"],
        },
        {
          id: "D8",
          type: "multi",
          label: "What, if anything, has made it harder for you to participate in Sirens activities?",
          options: [
            "I haven't known when or where activities were happening",
            "Scheduling/timing",
            "Transportation or location",
            "I don't usually know anyone there",
            "I wasn't sure what to expect",
            "I wasn't sure whether beginners/new participants were welcome",
            "I was interested but hadn't gotten around to participating",
            "Accessibility needs",
            "Cost",
            "Nothing has prevented me from participating",
          ],
          other: true,
          exclusive: ["Nothing has prevented me from participating"],
        },
        {
          id: "D5",
          type: "multi",
          label: "How do you find out about Sirens news and events?",
          options: ["Sirens newsletter", "Discord", "Social media", "Word of mouth"],
          other: true,
        },
        {
          id: "D9",
          type: "multi",
          label: "How would you prefer to hear about upcoming Sirens activities?",
          options: ["Newsletter", "Discord", "Social media", "At games/tailgates"],
          other: true,
        },
        {
          id: "D6",
          type: "text",
          label: "What else would you like to share about your experience with Sirens activities this year (such as watch parties, gameday atmosphere, Discord community, newsletter, etc.)?",
        },
      ],
    },
    {
      id: "E",
      title: "Membership and community",
      questions: [
        {
          id: "E0",
          type: "text",
          label: "Why did you join the Sirens?",
        },
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
