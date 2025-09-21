import { useState } from "react";

interface NavBarProps {
  brandName: string;
  imageSrcPath: string;
}

function NavBar({ brandName, imageSrcPath }: NavBarProps) {
  const [selectedIndex, setSelectedIndex] = useState(0); // default first item selected
  const navItems = ["Network", "Discover", "Settings"]; // fixed items

  return (
    <nav className="flex-row flex  navbar navbar-expand-md" style={{ backgroundColor: "#5f4130" }}>
      <div className="flex justify-between items-center w-full">
  {/* Brand/logo on the left */}
  <a
    className="flex items-center"
    href="#"
    style={{
      color: "#d5b893",
      fontFamily: "'Inter', sans-serif",
      fontWeight: 700,
      fontSize: "40px",
      textDecoration: "none",
    }}
  >
    {brandName}
    <img
      src={imageSrcPath}
      width="60"
      height="60"
      className="ml-2"
      alt="Brand Logo"
    />
  </a>

  {/* Nav items on the right */}
  <ul className="flex flex-row">
    {navItems.map((item, index) => (
      <li
        key={item}
        className="ml-6"
        onClick={() => setSelectedIndex(index)}
      >
        <a
          className="font-bold"
          style={{
            color: selectedIndex === index ? "#d5b893" : "#d5b893",
            fontFamily: "'Inter', sans-serif",
            fontWeight: 700,
            fontSize: "40px",
            textDecoration: "none",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#e3c7a0")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#d5b893")}
          href="#"
        >
          {item}
        </a>
      </li>
    ))}
  </ul>
</div>

    </nav>
  );
}

export {NavBar};