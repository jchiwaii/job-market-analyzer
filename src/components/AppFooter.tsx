export default function AppFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-8 border-t border-[#E4E8E6] pt-4 pb-2">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
          <p className="font-medium text-[#24302C]">Copyright © {year} John Chiwai</p>
          <a
            href="https://medium.com/@chiwai.kiriba"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#1E4841] underline-offset-2 transition-colors hover:text-[#173832] hover:underline"
          >
            Read Full Report
          </a>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <a
            href="https://www.linkedin.com/in/john-chiwai/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-[#E4E8E6] bg-[#F1F0F0] px-3 py-1 font-semibold text-[#36514B] transition-colors hover:bg-[#ECF4E9]"
          >
            LinkedIn
          </a>
          <a
            href="https://medium.com/@chiwai.kiriba"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-[#E4E8E6] bg-[#F1F0F0] px-3 py-1 font-semibold text-[#36514B] transition-colors hover:bg-[#ECF4E9]"
          >
            Medium
          </a>
          <a
            href="https://github.com/jchiwaii"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-[#E4E8E6] bg-[#F1F0F0] px-3 py-1 font-semibold text-[#36514B] transition-colors hover:bg-[#ECF4E9]"
          >
            GitHub
          </a>
          <a
            href="mailto:chiwai.kiriba@gmail.com"
            className="rounded-full border border-[#E4E8E6] bg-[#F1F0F0] px-3 py-1 font-semibold text-[#36514B] transition-colors hover:bg-[#ECF4E9]"
          >
            Mail
          </a>
        </div>
      </div>
    </footer>
  );
}
