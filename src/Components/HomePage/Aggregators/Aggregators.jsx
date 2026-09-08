import banner from "../../../Assets/Hero/Banner.webp";
import bannerMobile from "../../../Assets/Hero/Banner-Mobile.webp";
import { aggregators } from "../../../App.util";
import "./Aggregators.scss";

function CardActions({ item }) {
  if (item.stores?.length) {
    return (
      <div className="aggregator-card__stores">
        {item.stores.map((store) => (
          <a
            key={store.id}
            href={store.url}
            className="aggregator-card__store"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Download ${item.name} on ${store.name}`}
          >
            <img src={store.icon} alt="" aria-hidden="true" />
          </a>
        ))}
      </div>
    );
  }

  return (
    <a
      href={item.url}
      className="aggregator-card__btn"
      target="_blank"
      rel="noopener noreferrer"
    >
      Order Now
    </a>
  );
}

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
          Order now through Talabat, noon, Deliveroo, Careem, Keeta, or Smiles
        </p>

        <div className="aggregators__grid">
          {aggregators.map((item) => (
            <article key={item.id} className="aggregator-card">
              {item.offer ? (
                <span className="aggregator-card__offer">{item.offer}</span>
              ) : null}

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

              <CardActions item={item} />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
