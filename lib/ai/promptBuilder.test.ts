import { describe, expect, it } from "vitest";
import { buildPrompt } from "./promptBuilder";
import { EventDetailsPayload, PromptInput } from "./types";

function makeInput(overrides: Partial<PromptInput> = {}): PromptInput {
  return {
    events: [{ title: "Jazz Night" }],
    stylePrompt: "",
    sizeName: "A4",
    orientation: "portrait",
    widthMm: 210,
    heightMm: 297,
    logoSlots: 0,
    logoAreaStyle: "auto",
    includeQr: false,
    includePhotoSpace: false,
    photoSpaceBorder: false,
    ...overrides,
  };
}

const jazz: EventDetailsPayload = {
  title: "Jazz Night",
  date: "2026-11-14",
  time: "19:30",
  venue: "  Esplanade Concert Hall  ",
  price: "25",
  tnc: "Strictly 18+",
  highlights: "Live quartet, candlelit tables",
};

const market: EventDetailsPayload = {
  title: "Farmers Market",
  date: "2026-11-15",
  time: "08:00",
  venue: "Town Square",
  price: "free",
};

/** The text between `start` and `end` (or the end of the prompt). */
function section(prompt: string, start: string, end?: string): string {
  const from = prompt.indexOf(start);
  expect(from, `missing "${start}"`).toBeGreaterThanOrEqual(0);
  const to = end ? prompt.indexOf(end, from) : prompt.length;
  expect(to, `missing "${end}"`).toBeGreaterThan(from);
  return prompt.slice(from, to);
}

describe("buildPrompt with one event", () => {
  it("renders every filled detail with friendly formatting", () => {
    const prompt = buildPrompt(makeInput({ events: [jazz] }));

    expect(prompt).toContain(
      "Design a complete, finished A4 event poster in portrait orientation.",
    );
    expect(prompt).toContain('  • Title: "Jazz Night"');
    expect(prompt).toContain("  • Date: Saturday, 14 November 2026");
    expect(prompt).toContain("  • Time: 7:30 PM");
    expect(prompt).toContain("  • Venue: Esplanade Concert Hall");
    expect(prompt).toContain("  • Ticket Price: $25");
    expect(prompt).toContain("  • Fine print (T&C): Strictly 18+");
    expect(prompt).toContain(
      "<creative_brief>\nLive quartet, candlelit tables\n</creative_brief>",
    );
  });

  it("does not use multi-event wording", () => {
    const prompt = buildPrompt(makeInput({ events: [jazz] }));

    expect(prompt).not.toContain("SEPARATE");
    expect(prompt).not.toMatch(/EVENT \d/);
    expect(prompt).toContain("Infer the visual theme from the title");
  });

  it("ignores the poster headline", () => {
    const prompt = buildPrompt(
      makeInput({ events: [jazz], posterHeadline: "Weekend Highlights" }),
    );

    expect(prompt).not.toContain("Weekend Highlights");
  });

  it("includes the canvas size and print target", () => {
    const prompt = buildPrompt(makeInput());

    expect(prompt).toContain("exactly 210 mm wide × 297 mm high");
    expect(prompt).toContain("2480 × 3508 pixels (width × height) at 300 DPI");
  });

  it.each([
    ["00:05", "12:05 AM"],
    ["09:00", "9:00 AM"],
    ["12:00", "12:00 PM"],
    ["23:59", "11:59 PM"],
  ])("formats time %s as %s", (time, expected) => {
    const prompt = buildPrompt(makeInput({ events: [{ title: "T", time }] }));

    expect(prompt).toContain(`  • Time: ${expected}`);
  });

  it.each([
    ["15", "$15"],
    ["$15", "$15"],
    ["$$15", "$15"],
    ["FREE", "Free"],
    [" 10 - 20 ", "$10 - 20"],
  ])("formats price %j as %s", (price, expected) => {
    const prompt = buildPrompt(makeInput({ events: [{ title: "T", price }] }));

    expect(prompt).toContain(`  • Ticket Price: ${expected}`);
  });

  it("passes through dates and times it cannot parse", () => {
    const prompt = buildPrompt(
      makeInput({
        events: [{ title: "T", date: "Every Friday", time: "7pm till late" }],
      }),
    );

    expect(prompt).toContain("  • Date: Every Friday");
    expect(prompt).toContain("  • Time: 7pm till late");
  });
});

describe("buildPrompt with two events", () => {
  const twoEvents = () =>
    buildPrompt(
      makeInput({
        events: [jazz, market],
        posterHeadline: "  Weekend Highlights  ",
      }),
    );

  it("announces two separate events", () => {
    const prompt = twoEvents();

    expect(prompt).toContain(
      "event poster in portrait orientation that promotes 2 separate events on the same poster.",
    );
    expect(prompt).toContain("This poster promotes 2 SEPARATE events.");
  });

  it("puts each event's details only in its own section", () => {
    const prompt = twoEvents();
    const first = section(prompt, "EVENT 1 —", "EVENT 2 —");
    const second = section(prompt, "EVENT 2 —", "Spell every visible word");

    expect(first).toContain('Title: "Jazz Night"');
    expect(first).toContain("Date: Saturday, 14 November 2026");
    expect(first).toContain("Venue: Esplanade Concert Hall");
    expect(first).toContain("Ticket Price: $25");
    expect(first).not.toContain("Farmers Market");
    expect(first).not.toContain("Town Square");

    expect(second).toContain('Title: "Farmers Market"');
    expect(second).toContain("Date: Sunday, 15 November 2026");
    expect(second).toContain("Time: 8:00 AM");
    expect(second).toContain("Ticket Price: Free");
    expect(second).not.toContain("Jazz Night");
    expect(second).not.toContain("Esplanade");
  });

  it("adds a numbered brief only for the event that has one", () => {
    const prompt = twoEvents();

    expect(prompt).toContain(
      '<creative_brief event="1">\nLive quartet, candlelit tables\n</creative_brief>',
    );
    expect(prompt).not.toContain('<creative_brief event="2">');
    expect(prompt).not.toContain("<creative_brief>\n");
    expect(prompt).not.toContain("Event 2 creative brief");
  });

  it("includes the trimmed headline before the event sections", () => {
    const prompt = twoEvents();
    const headline = prompt.indexOf(
      'Overall poster headline, displayed prominently above or across the event sections: "Weekend Highlights"',
    );

    expect(headline).toBeGreaterThan(-1);
    expect(headline).toBeLessThan(prompt.indexOf("EVENT 1 —"));
  });

  it("infers the theme from the headline and both titles", () => {
    const prompt = twoEvents();

    expect(prompt).toContain(
      "Infer the visual theme from the headline and event titles",
    );
  });

  it("leaves the headline out when it is blank", () => {
    const prompt = buildPrompt(
      makeInput({ events: [jazz, market], posterHeadline: "   " }),
    );

    expect(prompt).not.toContain("Overall poster headline");
    expect(prompt).toContain("Infer the visual theme from the event titles");
  });

  it("uses the style prompt instead of theme inference when given", () => {
    const prompt = buildPrompt(
      makeInput({ events: [jazz, market], stylePrompt: " Art deco " }),
    );

    expect(prompt).toContain("Style: Art deco.");
    expect(prompt).not.toContain("Infer the visual theme");
  });
});

describe("buildPrompt with empty fields", () => {
  it("uses a placeholder title and skips blank details", () => {
    const prompt = buildPrompt(
      makeInput({
        events: [
          {
            title: "",
            date: " ",
            time: "",
            venue: "\t",
            price: "  ",
            tnc: "",
            highlights: "   ",
          },
        ],
      }),
    );

    expect(prompt).toContain('  • Title: "(your title)"');
    expect(prompt).not.toMatch(/Date:|Time:|Venue:|Ticket Price:|Fine print/);
    expect(prompt).not.toContain("creative_brief");
    expect(prompt).not.toContain("Creative brief");
  });

  it("treats an empty events list as one untitled event", () => {
    const prompt = buildPrompt(makeInput({ events: [] }));

    expect(prompt).toContain(
      "Design a complete, finished A4 event poster in portrait orientation.",
    );
    expect(prompt).toContain('  • Title: "(your title)"');
  });

  it("gives an empty second event its own placeholder section", () => {
    const prompt = buildPrompt(makeInput({ events: [jazz, { title: "" }] }));
    const second = section(prompt, "EVENT 2 —", "Spell every visible word");

    expect(second).toContain('Title: "(your title)"');
    expect(second).not.toMatch(/Date:|Time:|Venue:|Ticket Price:/);
  });

  it("leaves no blank lines where optional parts are skipped", () => {
    const prompts = [
      buildPrompt(makeInput({ events: [{ title: "" }] })),
      buildPrompt(makeInput({ events: [{ title: "" }, { title: "" }] })),
    ];

    for (const prompt of prompts) {
      expect(prompt).not.toMatch(/\n\s*\n/);
      expect(prompt).not.toContain("Reserve clean blank space");
    }
  });
});

describe("buildPrompt with long text", () => {
  const longBrief = Array.from(
    { length: 400 },
    (_, i) => `Note ${i + 1}: bring friends.`,
  ).join("\n");
  const longTitle = "The Annual ".repeat(40).trim() + " Gala";
  const longTnc = "No refunds. ".repeat(200).trim();

  it("keeps a long single-event brief, title and fine print intact", () => {
    const prompt = buildPrompt(
      makeInput({
        events: [{ title: longTitle, tnc: longTnc, highlights: longBrief }],
      }),
    );

    expect(longBrief.length).toBeGreaterThan(5000);
    expect(prompt).toContain(`  • Title: "${longTitle}"`);
    expect(prompt).toContain(`  • Fine print (T&C): ${longTnc}`);
    expect(prompt).toContain(
      `<creative_brief>\n${longBrief}\n</creative_brief>`,
    );
  });

  it("keeps long briefs for both events in their own sections", () => {
    const otherBrief = longBrief.replaceAll("bring friends", "dress warmly");
    const prompt = buildPrompt(
      makeInput({
        events: [
          { title: "A", highlights: longBrief },
          { title: "B", highlights: otherBrief },
        ],
      }),
    );
    const first = section(prompt, "EVENT 1 —", "EVENT 2 —");
    const second = section(prompt, "EVENT 2 —", "Spell every visible word");

    expect(first).toContain(
      `<creative_brief event="1">\n${longBrief}\n</creative_brief>`,
    );
    expect(first).not.toContain("dress warmly");
    expect(second).toContain(
      `<creative_brief event="2">\n${otherBrief}\n</creative_brief>`,
    );
    expect(second).not.toContain("bring friends");
  });
});
