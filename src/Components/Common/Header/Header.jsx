import logo from "../../../Assets/Logo/LetsZinger-Logo.png";
import "./Header.scss";

export default function Header() {
  return (
    <header className="lz-header">
      <div className="lz-header__inner">
        <a href="/" className="lz-header__logo" aria-label="Let's Zinger Home">
          <img src={logo} alt="Let's Zinger" width={180} />
        </a>
      </div>
    </header>
  );
}
