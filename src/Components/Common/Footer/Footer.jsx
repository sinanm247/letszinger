import logo from "../../../Assets/Logo/LetsZinger-Logo.png";
import { aggregators, footerLinks } from "../../../App.util";
import "./Footer.scss";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="lz-footer">
      <div className="lz-footer__inner">
        <div className="lz-footer__top">
          <a href="/" className="lz-footer__logo" aria-label="Let's Zinger Home">
            <img src={logo} alt="Let's Zinger" width={160} />
          </a>

          <div className="lz-footer__aggregators" aria-label="Order through aggregators">
            {aggregators.map((item) => (
              <a
                key={item.id}
                href={item.url}
                className="lz-footer__aggregator"
                target={item.url.startsWith("http") ? "_blank" : undefined}
                rel={item.url.startsWith("http") ? "noopener noreferrer" : undefined}
                aria-label={`Order on ${item.name}`}
              >
                <img src={item.icon} alt={item.name} />
              </a>
            ))}
          </div>
        </div>

        <div className="lz-footer__bottom">
          <nav className="lz-footer__links" aria-label="Footer">
            {footerLinks.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>

          <p className="lz-footer__copy">
            © {year} Let&apos;s Zinger — All Rights Reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
