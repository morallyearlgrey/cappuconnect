import { useState } from "react";
import "../App.css";

interface NavBarProps {
  brandName: string;
  imageSrcPath: string;
}

function NavBar({ brandName, imageSrcPath }: NavBarProps) {
  const [selectedIndex, setSelectedIndex] = useState(0); // default first item selected
  const navItems = ["Network", "Discover", "Settings"]; // fixed items

  return (
    <nav className="navbar navbar-expand-md" style={{ backgroundColor: "#5f4130" }}>
      <div className="container-fluid d-flex justify-content-between align-items-center">
        {/* Nav items on the left */}
        <ul className="navbar-nav d-flex flex-row">
          {navItems.map((item, index) => (
            <li
              key={item}
              className="nav-item me-4"
              onClick={() => setSelectedIndex(index)}
            >
              <a
                className={`nav-link`}
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

        {/* Brand/logo on the right */}
        <a
          className="navbar-brand d-flex align-items-center"
          href="#"
          style={{ color: "#d5b893", fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: "40px", textDecoration: "none" }}
        >
          <img
            src={imageSrcPath}
            width="60"
            height="60"
            className="d-inline-block align-center me-2"
            alt="Brand Logo"
          />
          {brandName}
        </a>
      </div>
    </nav>
  );
}

export default NavBar;