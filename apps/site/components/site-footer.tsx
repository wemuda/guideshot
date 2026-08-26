export function SiteFooter() {
  return (
    <footer className="mx-auto mt-auto w-full max-w-[1536px] px-5 pb-8 pt-6 sm:px-8 lg:px-16">
      <div className="flex flex-col gap-5 border-t border-separator pt-6 text-caption text-text-meta sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 GuideShot</p>
        <nav className="flex items-center gap-5" aria-label="Footer navigation">
          <a
            className="transition-colors duration-150 hover:text-foreground motion-reduce:transition-none"
            href="https://github.com/wemuda/guideshot/blob/main/LICENSE"
            rel="noreferrer"
            target="_blank"
          >
            MIT
          </a>
          <a
            className="transition-colors duration-150 hover:text-foreground motion-reduce:transition-none"
            href="https://www.npmjs.com/org/guideshot"
            rel="noreferrer"
            target="_blank"
          >
            npm
          </a>
          <a
            className="transition-colors duration-150 hover:text-foreground motion-reduce:transition-none"
            href="https://github.com/wemuda/guideshot"
            rel="noreferrer"
            target="_blank"
          >
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
}
