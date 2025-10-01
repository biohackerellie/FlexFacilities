export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-secondary/90 bottom-0 left-0 right-0 mt-5 hidden max-h-10 w-full flex-row items-center justify-around border-t border-t-gray-300 bg-opacity-90 p-2 text-secondary-foreground backdrop-blur-md sm:flex">
      <div className="flex items-center text-center">
        © {year} FlexFacilities
        <a
          href="https://github.com/biohakerellie/flexfacilities/LICENSE"
          target="_blank"
        >
          License AGPL-3
        </a>
      </div>
      <div className="flex items-center text-center"></div>
      <div className="right-0 text-center">
        Made with {`❤`} by
        <a href="https://github.com/biohackerellie" target="_blank">
          Ellie K
        </a>
      </div>
    </footer>
  );
}
