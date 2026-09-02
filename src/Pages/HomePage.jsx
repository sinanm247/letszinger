import { Fragment } from "react";
import Aggregators from "../Components/HomePage/Aggregators/Aggregators";
import Helmet from "../General/Helmet";

export default function HomePage() {
  return (
    <Fragment>
      <Helmet title="Let's Zinger | Order Online" />
      <Aggregators />
    </Fragment>
  );
}
