import { access, readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const EXPECTED_SKILLS = [
  'address-review',
  'implementation-loop',
  'review-implementation',
  'review-loop',
  'review-plans',
  'socratic-review',
].sort();

const rootDir = path.resolve(process.argv[2] ?? process.cwd());
const skillsDir = path.join(rootDir, 'skills');
const errors = [];
const extraSkills = [];

async function fileExists(filePath) {
  try {
    const info = await stat(filePath);
    return info.isFile();
  } catch {
    return false;
  }
}

async function dirExists(dirPath) {
  try {
    const info = await stat(dirPath);
    return info.isDirectory();
  } catch {
    return false;
  }
}

function parseFrontmatter(skillName, text) {
  const lines = text.split(/\r?\n/);

  if (lines[0] !== '---') {
    errors.push(`${skillName}: SKILL.md must start with frontmatter delimiter --- on line 1`);
    return null;
  }

  const closingIndex = lines.findIndex((line, index) => index > 0 && line === '---');
  if (closingIndex === -1) {
    errors.push(`${skillName}: SKILL.md is missing closing frontmatter delimiter ---`);
    return null;
  }

  return lines.slice(1, closingIndex);
}

function validateFrontmatter(skillName, frontmatterLines) {
  if (!frontmatterLines.includes(`name: ${skillName}`)) {
    const actual = frontmatterLines.find((line) => line.startsWith('name:')) ?? 'missing';
    errors.push(`${skillName}: name mismatch, expected "name: ${skillName}" but found "${actual}"`);
  }

  const descriptionIndex = frontmatterLines.findIndex((line) => line.startsWith('description:'));
  if (descriptionIndex === -1) {
    errors.push(`${skillName}: missing non-empty description`);
    return;
  }

  const descriptionLine = frontmatterLines[descriptionIndex];
  const descriptionValue = descriptionLine.slice('description:'.length).trim();
  const blockScalars = new Set(['>-', '>', '|', '|-']);

  if (blockScalars.has(descriptionValue)) {
    const hasIndentedContent = frontmatterLines
      .slice(descriptionIndex + 1)
      .some((line) => /^\s+\S/.test(line));

    if (!hasIndentedContent) {
      errors.push(`${skillName}: empty description block scalar`);
    }
    return;
  }

  if (descriptionValue.length === 0) {
    errors.push(`${skillName}: empty description`);
  }
}

function markdownReferenceTargets(text) {
  const targets = [];
  const linkPattern = /\[[^\]\n]*\]\(([^)\s]+)(?:\s+[^)]*)?\)/g;
  for (const match of text.matchAll(linkPattern)) {
    const target = match[1].split('#', 1)[0];
    if (target.startsWith('references/')) {
      targets.push(target);
    }
  }
  return [...new Set(targets)].sort();
}

function skillPathReferences(text) {
  const targets = [];
  const skillPathPattern = /skills\/([a-z0-9-]+)\/SKILL\.md/g;
  for (const match of text.matchAll(skillPathPattern)) {
    targets.push({ target: match[0], skillName: match[1] });
  }
  return [...new Map(targets.map((item) => [item.target, item])).values()].sort((a, b) => a.target.localeCompare(b.target));
}

async function validateReferences(skillName, skillDir, text) {
  for (const target of markdownReferenceTargets(text)) {
    const targetPath = path.join(skillDir, target);
    if (!(await fileExists(targetPath))) {
      errors.push(`${skillName}: broken references/ Markdown link ${target}`);
    }
  }

  for (const { target, skillName: referencedSkill } of skillPathReferences(text)) {
    const referencedPath = path.join(skillsDir, referencedSkill, 'SKILL.md');
    if (!(await fileExists(referencedPath))) {
      errors.push(`${skillName}: broken local skill path ${target}`);
    }
  }
}

async function main() {
  try {
    await access(skillsDir);
  } catch {
    errors.push(`skills directory missing: ${skillsDir}`);
    return finish(0);
  }

  const entries = await readdir(skillsDir, { withFileTypes: true });
  const skillNames = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  const skillNameSet = new Set(skillNames);

  for (const expectedSkill of EXPECTED_SKILLS) {
    if (!skillNameSet.has(expectedSkill)) {
      errors.push(`${expectedSkill}: missing expected skill directory`);
    }
  }

  for (const skillName of skillNames) {
    const skillDir = path.join(skillsDir, skillName);
    const skillFile = path.join(skillDir, 'SKILL.md');

    if (!(await fileExists(skillFile))) {
      errors.push(`${skillName}: missing SKILL.md`);
      continue;
    }

    const text = await readFile(skillFile, 'utf8');
    const frontmatterLines = parseFrontmatter(skillName, text);
    if (frontmatterLines) {
      validateFrontmatter(skillName, frontmatterLines);
    }
    await validateReferences(skillName, skillDir, text);

    if (!EXPECTED_SKILLS.includes(skillName)) {
      extraSkills.push(skillName);
    }
  }

  finish(skillNames.length);
}

function finish(validatedCount) {
  if (errors.length > 0) {
    for (const error of [...new Set(errors)].sort()) {
      console.error(`ERROR: ${error}`);
    }
    process.exit(1);
  }

  const extraCount = extraSkills.length;
  if (extraCount === 0) {
    console.log(`Validated ${validatedCount} skills`);
  } else {
    console.log(`Validated ${validatedCount} skills (${EXPECTED_SKILLS.length} expected, ${extraCount} extra)`);
    for (const skillName of extraSkills.sort()) {
      console.log(`extra valid skill: ${skillName}`);
    }
  }
}

await main();
