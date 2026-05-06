import * as fs from "node:fs";
import * as path from "node:path";
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

// Track files modified during the current agent run and across the session
const currentRunModifications = new Set<string>();
const sessionModifications = new Set<string>();
const pendingSimplificationPrompts = new Set<string>();
let autoSimplify = false;
let isSimplificationTurn = false;

function getSkillContent(): string {
	const skillPath = path.join(__dirname, "..", "skills", "code-simplifier", "SKILL.md");
	try {
		return fs.readFileSync(skillPath, "utf-8");
	} catch {
		return "";
	}
}

function extractPathFromToolInput(toolName: string, input: Record<string, unknown>): string | undefined {
	if (toolName === "edit" || toolName === "write" || toolName === "read") {
		return (input.path as string) || (input.file_path as string);
	}
	return undefined;
}

function getSimplificationSystemPrompt(): string {
	const skillContent = getSkillContent();
	if (!skillContent) return "";
	// Strip frontmatter and return the instruction body
	return skillContent.replace(/^---[\s\S]*?---\s*/, "").trim();
}

export default function (pi: ExtensionAPI) {
	// Reset per-run tracking at the start of each user prompt
	pi.on("agent_start", async (_event, _ctx) => {
		currentRunModifications.clear();
	});

	// Track file modifications via tool results
	pi.on("tool_result", async (event, _ctx) => {
		if (event.toolName === "edit" || event.toolName === "write") {
			const filePath = extractPathFromToolInput(event.toolName, event.input);
			if (filePath) {
				currentRunModifications.add(filePath);
				sessionModifications.add(filePath);
			}
		}
	});

	// Auto-trigger simplification after the agent finishes its work
	pi.on("agent_end", async (_event, _ctx) => {
		// Prevent infinite loops: don't auto-trigger on simplification turns
		if (isSimplificationTurn) {
			isSimplificationTurn = false;
			return;
		}

		if (autoSimplify && currentRunModifications.size > 0) {
			const files = Array.from(currentRunModifications).join(", ");
			currentRunModifications.clear();

			const promptText =
				`Please review and simplify the recently modified code for clarity, consistency, and maintainability while preserving all functionality.\n\n` +
				`Recently modified files: ${files}`;

			pendingSimplificationPrompts.add(promptText);
			pi.sendUserMessage(promptText, { deliverAs: "followUp" });
		}
	});

	// Inject simplification instructions into the system prompt for simplification turns
	pi.on("before_agent_start", async (event, _ctx) => {
		if (pendingSimplificationPrompts.has(event.prompt)) {
			pendingSimplificationPrompts.delete(event.prompt);
			isSimplificationTurn = true;
			const instructions = getSimplificationSystemPrompt();
			if (instructions) {
				return {
					systemPrompt: event.systemPrompt + "\n\n" + instructions,
				};
			}
		}
	});

	// Manual command: /simplify — run simplification on tracked files
	pi.registerCommand("simplify", {
		description: "Simplify recently modified code",
		handler: async (_args, ctx) => {
			const files =
				sessionModifications.size > 0 ? sessionModifications : currentRunModifications;

			if (files.size === 0) {
				ctx.ui.notify("No recently modified files to simplify.", "warning");
				return;
			}

			const fileList = Array.from(files).join(", ");
			sessionModifications.clear();
			currentRunModifications.clear();

			const promptText =
				`Please review and simplify the recently modified code for clarity, consistency, and maintainability while preserving all functionality.\n\n` +
				`Recently modified files: ${fileList}`;

			pendingSimplificationPrompts.add(promptText);
			pi.sendUserMessage(promptText);
		},
	});

	// Toggle auto-simplify: /simplify-auto on|off|status
	pi.registerCommand("simplify-auto", {
		description: "Toggle automatic code simplification after edits (on/off/status)",
		handler: async (args, ctx) => {
			const arg = args.trim().toLowerCase();
			if (arg === "on") {
				autoSimplify = true;
				ctx.ui.notify("Auto-simplify enabled.", "success");
			} else if (arg === "off") {
				autoSimplify = false;
				ctx.ui.notify("Auto-simplify disabled.", "success");
			} else {
				ctx.ui.notify(
					`Auto-simplify is ${autoSimplify ? "enabled" : "disabled"}. Usage: /simplify-auto on|off`,
					"info",
				);
			}
		},
	});

	// Show tracked files: /simplify-status
	pi.registerCommand("simplify-status", {
		description: "Show files tracked for simplification",
		handler: async (_args, ctx) => {
			const allFiles = new Set([...sessionModifications, ...currentRunModifications]);
			if (allFiles.size === 0) {
				ctx.ui.notify("No files currently tracked for simplification.", "info");
			} else {
				const files = Array.from(allFiles).join("\n");
				ctx.ui.notify(`Tracked files:\n${files}`, "info");
			}
		},
	});
}
