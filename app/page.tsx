import { ControlPanel } from "@/components/ControlPanel/ControlPanel";
import { PromptOutput } from "@/components/PromptOutput/PromptOutput";

export default function Home() {
  return (
    <div className="grid h-screen grid-cols-[360px_1fr] bg-zinc-950 text-zinc-100">
      <aside className="flex flex-col border-r border-zinc-800 bg-zinc-950">
        <header className="border-b border-zinc-800 px-5 py-4">
          <h1 className="text-lg font-semibold">Poster Prompter</h1>
          <p className="text-xs text-zinc-400">
            Fill in the event, copy the prompt, paste into Gemini.
          </p>
        </header>
        <ControlPanel />
      </aside>
      <main className="relative">
        <PromptOutput />
      </main>
    </div>
  );
}
