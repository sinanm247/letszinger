import "./AppLoader.scss";
import logo from "../../Assets/Logo/LetsZinger-Logo.png";

export default function AppLoader({ isVisible }) {
  if (!isVisible) return null;

  return (
    <div className="app-loader">
      <img src={logo} alt="Loading" />
    </div>
  );
}
