import { createHighlighterCore } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';
import json from 'shiki/langs/json.mjs';
import shellscript from 'shiki/langs/shellscript.mjs';
import typescript from 'shiki/langs/typescript.mjs';
import githubDark from 'shiki/themes/github-dark.mjs';
import githubLight from 'shiki/themes/github-light.mjs';

export type CodeLanguage = 'json' | 'shellscript' | 'typescript';

const highlighterPromise = createHighlighterCore({
  langs: [json, shellscript, typescript],
  themes: [githubLight, githubDark],
  engine: createJavaScriptRegexEngine(),
});

export async function highlightCode(code: string, language: CodeLanguage) {
  const highlighter = await highlighterPromise;

  return highlighter.codeToHtml(code, {
    lang: language,
    themes: {
      light: 'github-light',
      dark: 'github-dark',
    },
    defaultColor: false,
  });
}
