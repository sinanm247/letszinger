import { Fragment } from "react";
import { Route, Routes } from "react-router-dom";
import Header from "./Components/Common/Header/Header";
import Footer from "./Components/Common/Footer/Footer";
import HomePage from "./Pages/HomePage";
import PageNotFound from "./Components/PageNotFound/PageNotFound";

export default function App() {
  return (
    <Fragment>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </main>
      <Footer />
    </Fragment>
  );
}
