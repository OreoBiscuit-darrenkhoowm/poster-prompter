import { ControlPanel } from "@/components/ControlPanel/ControlPanel";
import { PromptOutput } from "@/components/PromptOutput/PromptOutput";
import { InstallButton } from "@/components/InstallButton";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100 md:grid md:h-screen md:grid-cols-[360px_1fr]">
      <aside className="flex flex-col border-b border-zinc-800 bg-zinc-950 md:border-b-0 md:border-r">
        <header className="flex items-start justify-between gap-3 border-b border-zinc-800 px-5 py-4">
          <div>
            <h1 className="text-lg font-semibold">Poster Prompter</h1>
            <p className="text-xs text-zinc-400">
              Fill in the event, copy the prompt, paste into Gemini.
            </p>
          </div>
          <InstallButton className="mt-0.5 shrink-0" />
        </header>
        <ControlPanel />
      </aside>
      <main className="relative flex-1 min-h-[60vh] md:min-h-0">
        <PromptOutput />
      </main>
    </div>
  );
}
