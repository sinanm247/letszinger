import banner from "../../../Assets/Hero/Banner.webp";
import bannerMobile from "../../../Assets/Hero/Banner-Mobile.webp";
import { aggregators } from "../../../App.util";
import "./Aggregators.scss";

export default function Aggregators() {
  return (
    <section
      className="aggregators"
      style={{
        "--banner-desktop": `url(${banner})`,
        "--banner-mobile": `url(${bannerMobile})`,
      }}
      aria-labelledby="aggregators-title"
    >
      <div className="aggregators__overlay" />

      <div className="aggregators__content">
        <h1 id="aggregators-title" className="aggregators__title">
          Choose Your Aggregators
        </h1>
        <p className="aggregators__subtitle">
          Order now through Talabat, noon, or Keeta
        </p>

        <div className="aggregators__grid">
          {aggregators.map((item) => (
            <article key={item.id} className="aggregator-card">
              <div className="aggregator-card__brand">
                <img
                  src={item.icon}
                  alt=""
                  className="aggregator-card__icon"
                  aria-hidden="true"
                />
                <img
                  src={item.logo}
                  alt={item.name}
                  className="aggregator-card__logo"
                />
              </div>

              <p className="aggregator-card__description">{item.description}</p>

              <a
                href={item.url}
                className="aggregator-card__btn"
                target={item.url.startsWith("http") ? "_blank" : undefined}
                rel={item.url.startsWith("http") ? "noopener noreferrer" : undefined}
              >
                Order Now
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
